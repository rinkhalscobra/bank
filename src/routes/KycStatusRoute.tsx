import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoadingScreen from '../components/ui/LoadingScreen';

export default function KycStatusRoute({ children }: { children: React.ReactNode }) {
  const { user, loading, kycStatus } = useAuth();

  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/online-banking" replace />;
  if (kycStatus === 'approved') return <Navigate to="/dashboard" replace />;

  return <>{children}</>;
}
