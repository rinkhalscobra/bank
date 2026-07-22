import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import CookieConsent from './components/CookieConsent';
import { CookieConsentProvider } from './contexts/CookieConsentContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { BrandingProvider } from './contexts/BrandingContext';
import ScrollToTop from './components/ScrollToTop';
import SeoMetadata from './components/SeoMetadata';
import PublicLayout from './components/layout/PublicLayout';
import ProtectedRoute from './routes/ProtectedRoute';
import AdminRoute from './routes/AdminRoute';
import KycRoute from './routes/KycRoute';
import KycStatusRoute from './routes/KycStatusRoute';
import KycVerification from './pages/KycVerification';
import KycStatus from './pages/KycStatus';
import DashboardOverview from './pages/dashboard/DashboardOverview';
import DashboardTransactions from './pages/dashboard/DashboardTransactions';
import DashboardTransfers from './pages/dashboard/DashboardTransfers';
import DashboardProfile from './pages/dashboard/DashboardProfile';
import DashboardCards from './pages/dashboard/DashboardCards';
import DashboardBillPay from './pages/dashboard/DashboardBillPay';
import DashboardFixedDeposits from './pages/dashboard/DashboardFixedDeposits';
import DashboardCurrencyExchange from './pages/dashboard/DashboardCurrencyExchange';
import DashboardLoans from './pages/dashboard/DashboardLoans';
import DashboardAnalytics from './pages/dashboard/DashboardAnalytics';
import DashboardTaxes from './pages/dashboard/DashboardTaxes';
import CrmAdmin from './pages/admin/CrmAdmin';

function AppRoutes() {
  const location = useLocation();
  const isDashboard = location.pathname.startsWith('/dashboard');
  const isAdmin = location.pathname.startsWith('/crm-admin');
  const isKyc = location.pathname === '/kyc';
  const isKycStatus = location.pathname === '/kyc-status';

  if (isDashboard) {
    return (
      <Routes>
        <Route path="/dashboard" element={<ProtectedRoute><DashboardOverview /></ProtectedRoute>} />
        <Route path="/dashboard/cards" element={<ProtectedRoute><DashboardCards /></ProtectedRoute>} />
        <Route path="/dashboard/transactions" element={<ProtectedRoute><DashboardTransactions /></ProtectedRoute>} />
        <Route path="/dashboard/transfers" element={<ProtectedRoute><DashboardTransfers /></ProtectedRoute>} />
        <Route path="/dashboard/bill-pay" element={<ProtectedRoute><DashboardBillPay /></ProtectedRoute>} />
        <Route path="/dashboard/fixed-deposits" element={<ProtectedRoute><DashboardFixedDeposits /></ProtectedRoute>} />
        <Route path="/dashboard/currency-exchange" element={<ProtectedRoute><DashboardCurrencyExchange /></ProtectedRoute>} />
        <Route path="/dashboard/loans" element={<ProtectedRoute><DashboardLoans /></ProtectedRoute>} />
        <Route path="/dashboard/taxes" element={<ProtectedRoute><DashboardTaxes /></ProtectedRoute>} />
        <Route path="/dashboard/analytics" element={<ProtectedRoute><DashboardAnalytics /></ProtectedRoute>} />
        <Route path="/dashboard/profile" element={<ProtectedRoute><DashboardProfile /></ProtectedRoute>} />
      </Routes>
    );
  }

  if (isAdmin) {
    return (
      <Routes>
        <Route path="/crm-admin" element={<AdminRoute><CrmAdmin /></AdminRoute>} />
      </Routes>
    );
  }

  if (isKyc) {
    return (
      <Routes>
        <Route path="/kyc" element={<KycRoute><KycVerification /></KycRoute>} />
      </Routes>
    );
  }

  if (isKycStatus) {
    return (
      <Routes>
        <Route path="/kyc-status" element={<KycStatusRoute><KycStatus /></KycStatusRoute>} />
      </Routes>
    );
  }

  return <PublicLayout />;
}

export default function App() {
  return (
    <Router>
      <SeoMetadata />
      <BrandingProvider>
        <LanguageProvider>
          <CookieConsentProvider>
            <AuthProvider>
              <ScrollToTop />
              <AppRoutes />
              <CookieConsent />
            </AuthProvider>
          </CookieConsentProvider>
        </LanguageProvider>
      </BrandingProvider>
    </Router>
  );
}
