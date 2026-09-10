import { useCallback, useEffect, useState } from 'react';
import { AlertTriangle, LogOut, RefreshCw, ShieldX } from 'lucide-react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoadingScreen from '../components/ui/LoadingScreen';
import DashboardLayout from '../components/layout/DashboardLayout';
import { checkCrmIpAccess } from '../lib/ipAllowlist';

type IpAccessState = 'idle' | 'checking' | 'allowed' | 'blocked' | 'error';

export default function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, loading, isCrmStaff, signOut } = useAuth();
  const [ipAccessState, setIpAccessState] = useState<IpAccessState>('idle');
  const [currentIp, setCurrentIp] = useState<string | null>(null);
  const [accessError, setAccessError] = useState<string | null>(null);

  const verifyIpAccess = useCallback(async () => {
    if (!user || !isCrmStaff) return;

    setIpAccessState('checking');
    setAccessError(null);

    try {
      const result = await checkCrmIpAccess();
      setCurrentIp(result.currentIp);
      setIpAccessState(result.allowed ? 'allowed' : 'blocked');
    } catch (error) {
      setAccessError(error instanceof Error ? error.message : 'The network policy could not be verified.');
      setIpAccessState('error');
    }
  }, [isCrmStaff, user]);

  useEffect(() => {
    if (loading || !user || !isCrmStaff) {
      setIpAccessState('idle');
      return;
    }

    void verifyIpAccess();
  }, [isCrmStaff, loading, user, verifyIpAccess]);

  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/online-banking" replace />;
  if (!isCrmStaff) return <Navigate to="/dashboard" replace />;
  if (ipAccessState === 'idle' || ipAccessState === 'checking') return <LoadingScreen />;

  if (ipAccessState === 'blocked' || ipAccessState === 'error') {
    const isBlocked = ipAccessState === 'blocked';

    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-5 py-12">
        <section className="w-full max-w-lg overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_28px_80px_-42px_rgba(15,23,42,0.4)]">
          <div className={`flex items-center gap-4 border-b px-6 py-5 ${isBlocked ? 'border-red-100 bg-red-50/70' : 'border-amber-100 bg-amber-50/70'}`}>
            <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl ${isBlocked ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
              {isBlocked ? <ShieldX className="h-6 w-6" /> : <AlertTriangle className="h-6 w-6" />}
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Network security</p>
              <h1 className="mt-1 text-xl font-semibold text-slate-950">{isBlocked ? 'CRM access blocked' : 'Unable to verify network access'}</h1>
            </div>
          </div>
          <div className="space-y-5 px-6 py-6">
            <p className="text-sm leading-6 text-slate-600">
              {isBlocked
                ? 'This network is not included in the CRM IP allowlist. Connect from an approved network or ask an administrator to add your address.'
                : 'The CRM stays closed when its network policy cannot be checked. Try again, or contact an administrator if the problem continues.'}
            </p>
            {currentIp ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                Current IP: <span className="font-mono font-semibold text-slate-900">{currentIp}</span>
              </div>
            ) : null}
            {accessError ? <p className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800">{accessError}</p> : null}
            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => void verifyIpAccess()}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
              >
                <RefreshCw className="h-4 w-4" />
                Try again
              </button>
              <button
                type="button"
                onClick={() => void signOut()}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </div>
          </div>
        </section>
      </main>
    );
  }

  return <DashboardLayout>{children}</DashboardLayout>;
}
