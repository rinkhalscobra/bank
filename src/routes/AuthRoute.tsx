import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoadingScreen from '../components/ui/LoadingScreen';

export default function AuthRoute({ children }: { children: React.ReactNode }) {
  const { user, loading, kycStatus } = useAuth();

  if (loading) return <LoadingScreen />;
  if (user) {
    if (kycStatus === 'approved') return <Navigate to="/dashboard" replace />;
    return <Navigate to="/kyc-status" replace />;
  }

  return <>{children}</>;
}
