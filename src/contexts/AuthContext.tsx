import { createContext, useContext, useEffect, useRef, useState, useCallback, type ReactNode } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { isStaffCrmRole, normalizeCrmRole, type CrmRole } from '../lib/crmRoles';

type KycStatus = 'pending' | 'submitted' | 'approved' | 'rejected';

interface AuthProfile {
  full_name: string;
  email: string;
  account_iban: string;
  kyc_status: KycStatus;
  crm_role: CrmRole;
  is_admin: boolean;
  assigned_manager_id: string | null;
  assigned_agent_id: string | null;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  kycStatus: KycStatus | null;
  isAdmin: boolean;
  isCrmStaff: boolean;
  crmRole: CrmRole;
  profile: AuthProfile | null;
  refreshKycStatus: () => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [kycStatus, setKycStatus] = useState<KycStatus | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isCrmStaff, setIsCrmStaff] = useState(false);
  const [crmRole, setCrmRole] = useState<CrmRole>('customer');
  const [profile, setProfile] = useState<AuthProfile | null>(null);
  const userRef = useRef<User | null>(null);
  const profileRef = useRef<AuthProfile | null>(null);

  useEffect(() => {
    userRef.current = user;
  }, [user]);

  useEffect(() => {
    profileRef.current = profile;
  }, [profile]);

  const fetchProfileState = useCallback(async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('full_name, email, account_iban, kyc_status, crm_role, is_admin, assigned_manager_id, assigned_agent_id')
      .eq('id', userId)
      .maybeSingle();

    if (data) {
      const nextRole = normalizeCrmRole(data.crm_role, Boolean(data.is_admin) ? 'admin' : 'customer');
      setProfile({
        full_name: data.full_name || '',
        email: data.email || '',
        account_iban: data.account_iban || '',
        kyc_status: data.kyc_status as KycStatus,
        crm_role: nextRole,
        is_admin: nextRole === 'admin',
        assigned_manager_id: data.assigned_manager_id || null,
        assigned_agent_id: data.assigned_agent_id || null,
      });
      setKycStatus(data.kyc_status as KycStatus);
      setCrmRole(nextRole);
      setIsAdmin(nextRole === 'admin');
      setIsCrmStaff(isStaffCrmRole(nextRole));
    } else {
      setProfile(null);
      setKycStatus(null);
      setIsAdmin(false);
      setIsCrmStaff(false);
      setCrmRole('customer');
    }
  }, []);

  const refreshKycStatus = useCallback(async () => {
    if (user) {
      await fetchProfileState(user.id);
    }
  }, [user, fetchProfileState]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfileState(session.user.id).then(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        const existingUser = userRef.current;
        const existingProfile = profileRef.current;
        const shouldBlockForProfile =
          !existingUser || existingUser.id !== session.user.id || !existingProfile;

        if (shouldBlockForProfile) {
          setLoading(true);
        }

        (async () => {
          await fetchProfileState(session.user.id);
          setLoading(false);
        })();
      } else {
        setProfile(null);
        setKycStatus(null);
        setIsAdmin(false);
        setIsCrmStaff(false);
        setCrmRole('customer');
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchProfileState]);

  const signUp = async (email: string, password: string, fullName: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    if (error) return { error: error.message };
    return { error: null };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    return { error: null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, kycStatus, isAdmin, isCrmStaff, crmRole, profile, refreshKycStatus, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
