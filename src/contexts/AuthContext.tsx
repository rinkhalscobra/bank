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
      const nextRole = normalizeCrmRole(data.crm_role, data.is_admin ? 'admin' : 'customer');
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
    let active = true;
    let authEventVersion = 0;

    const clearAuthState = () => {
      if (!active) return;

      setSession(null);
      setUser(null);
      setProfile(null);
      setKycStatus(null);
      setIsAdmin(false);
      setIsCrmStaff(false);
      setCrmRole('customer');
      setLoading(false);
    };

    const applySession = (nextSession: Session) => {
      if (!active) return;

      setSession(nextSession);
      setUser(nextSession.user);

      const existingUser = userRef.current;
      const existingProfile = profileRef.current;
      const shouldBlockForProfile =
        !existingUser || existingUser.id !== nextSession.user.id || !existingProfile;

      if (shouldBlockForProfile) {
        setLoading(true);
      }

      void fetchProfileState(nextSession.user.id).finally(() => {
        if (active) setLoading(false);
      });
    };

    const initialAuthVersion = authEventVersion;
    void supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      if (!active || initialAuthVersion !== authEventVersion) return;

      if (initialSession) {
        applySession(initialSession);
      } else {
        clearAuthState();
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, nextSession) => {
      const eventVersion = ++authEventVersion;

      if (nextSession) {
        applySession(nextSession);
        return;
      }

      if (event === 'SIGNED_OUT') {
        // A remote admin operation can briefly emit a null auth event even though the
        // current browser session is still stored and valid. Verify it before allowing
        // route guards to send the CRM administrator back to the login page.
        window.setTimeout(() => {
          void supabase.auth.getSession().then(({ data: { session: persistedSession } }) => {
            if (!active || eventVersion !== authEventVersion) return;

            if (persistedSession) {
              applySession(persistedSession);
            } else {
              clearAuthState();
            }
          });
        }, 100);
        return;
      }

      clearAuthState();
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
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
