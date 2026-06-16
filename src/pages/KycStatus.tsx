import { useNavigate } from 'react-router-dom';
import { Building2, Clock, Shield, CheckCircle, XCircle, LogOut, RefreshCw } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useBranding } from '../contexts/BrandingContext';

export default function KycStatus() {
  const { kycStatus, signOut, refreshKycStatus, user } = useAuth();
  const { branding } = useBranding();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleRefresh = async () => {
    await refreshKycStatus();
  };

  const statusConfig = {
    pending: {
      icon: Clock,
      iconBg: 'bg-[#006446]/10',
      iconColor: 'text-[#006446]',
      title: 'Verification Required',
      description: 'Please complete the identity verification process to activate your banking account.',
      showKycButton: true,
    },
    submitted: {
      icon: Shield,
      iconBg: 'bg-[#006446]/10',
      iconColor: 'text-[#006446]',
      title: 'Verification Under Review',
      description: 'Your identity documents have been submitted and are currently being reviewed by our compliance team. This typically takes 1-2 business days.',
      showKycButton: false,
    },
    approved: {
      icon: CheckCircle,
      iconBg: 'bg-[#006446]/10',
      iconColor: 'text-[#006446]',
      title: 'Verification Approved',
      description: 'Your identity has been verified. You can now access your banking dashboard.',
      showKycButton: false,
    },
    rejected: {
      icon: XCircle,
      iconBg: 'bg-[#006446]/10',
      iconColor: 'text-[#006446]',
      title: 'Verification Declined',
      description: 'Unfortunately, we were unable to verify your identity. Please resubmit your documents or contact our support team for assistance.',
      showKycButton: true,
    },
  };

  const config = statusConfig[kycStatus || 'pending'];
  const Icon = config.icon;

  return (
    <div className="min-h-screen bg-[#006446]/[0.04]">
      <div className="bg-[#006446] px-4 py-6">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Building2 className="w-8 h-8 text-white" strokeWidth={1.5} />
            <div>
              <h1 className="text-lg font-serif font-bold text-white">{branding.brandName}</h1>
              <p className="text-[10px] tracking-widest text-white/65">ACCOUNT STATUS</p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 text-sm text-white/75 transition-colors hover:text-white"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-16">
        <div className="rounded-2xl border border-[#006446]/14 bg-white p-8 text-center shadow-[0_24px_60px_-48px_rgba(0,100,70,0.45)]">
          <div className={`mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full ${config.iconBg}`}>
            <Icon className={`h-10 w-10 ${config.iconColor}`} />
          </div>

          <h2 className="text-2xl font-serif font-bold text-slate-900 mb-3">{config.title}</h2>
          <p className="mb-8 leading-relaxed text-[#006446]/80">{config.description}</p>

          {user && (
            <div className="mb-8 rounded-2xl border border-[#006446]/14 bg-[#006446]/[0.04] p-4 text-left">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-[#006446]/70">Account</span>
                  <p className="font-medium text-slate-800">{user.user_metadata?.full_name || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-[#006446]/70">Email</span>
                  <p className="truncate font-medium text-slate-800">{user.email}</p>
                </div>
                <div>
                  <span className="text-[#006446]/70">Status</span>
                  <p className="font-medium capitalize">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-[#006446]/14 bg-[#006446]/10 px-2 py-0.5 text-xs font-semibold text-[#006446]">
                      {kycStatus || 'pending'}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {config.showKycButton && (
              <button
                onClick={() => navigate('/kyc')}
                className="w-full rounded-xl bg-[#006446] py-3 font-semibold text-white transition-colors hover:bg-[#00523a]"
              >
                {kycStatus === 'rejected' ? 'Resubmit Verification' : 'Start Verification'}
              </button>
            )}

            {kycStatus === 'submitted' && (
              <button
                onClick={handleRefresh}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#006446]/14 py-3 font-medium text-[#006446] transition-colors hover:bg-[#006446]/[0.04]"
              >
                <RefreshCw className="w-4 h-4" />
                Check Status
              </button>
            )}

            {kycStatus === 'approved' && (
              <button
                onClick={() => navigate('/dashboard')}
                className="w-full rounded-xl bg-[#006446] py-3 font-semibold text-white transition-colors hover:bg-[#00523a]"
              >
                Go to Dashboard
              </button>
            )}
          </div>
        </div>

        {kycStatus === 'submitted' && (
          <div className="mt-6 rounded-2xl border border-[#006446]/14 bg-[#006446]/10 p-4 text-sm text-[#006446]">
            <p className="font-medium mb-1">What happens next?</p>
            <ul className="list-inside list-disc space-y-1 text-[#006446]/85">
              <li>Our compliance team reviews your submitted documents</li>
              <li>You will be notified once the review is complete</li>
              <li>Upon approval, you will have full access to all banking services</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
