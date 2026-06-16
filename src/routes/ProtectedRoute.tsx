import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoadingScreen from '../components/ui/LoadingScreen';
import DashboardLayout from '../components/layout/DashboardLayout';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading, kycStatus } = useAuth();

  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/online-banking" replace />;
  if (kycStatus !== 'approved') return <Navigate to="/kyc-status" replace />;

  return <DashboardLayout>{children}</DashboardLayout>;
}
