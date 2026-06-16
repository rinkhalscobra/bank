import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoadingScreen from '../components/ui/LoadingScreen';
import DashboardLayout from '../components/layout/DashboardLayout';

export default function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, loading, isAdmin } = useAuth();

  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/online-banking" replace />;
  if (!isAdmin) return <Navigate to="/dashboard" replace />;

  return <DashboardLayout>{children}</DashboardLayout>;
}
