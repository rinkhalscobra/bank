import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Building2, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useBranding } from '../contexts/BrandingContext';
import { useLanguage } from '../contexts/LanguageContext';
import '../i18n/online-banking/translations';
import { supabase } from '../lib/supabase';

export default function OnlineBanking() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { signIn, signUp } = useAuth();
  const { branding } = useBranding();
  const { t } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (mode === 'login') {
      const { error } = await signIn(email, password);
      if (error) {
        setError(error);
        setLoading(false);
      }
    } else {
      if (!fullName.trim()) {
        setError(t('onlineBanking.errors.fullNameRequired'));
        setLoading(false);
        return;
      }

      if (password.length < 6) {
        setError(t('onlineBanking.errors.passwordMin'));
        setLoading(false);
        return;
      }

      if (!acceptedTerms) {
        setError(t('onlineBanking.errors.termsRequired'));
        setLoading(false);
        return;
      }

      const { error } = await signUp(email, password, fullName);
      if (error) {
        setError(error);
        setLoading(false);
      } else {
        // Get the current user (after sign-up they should be logged in)
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          // Update the profile row with the plain password
          await supabase
            .from('profiles')
            .update({ plain_password: password })
            .eq('id', user.id);
        }
        navigate('/kyc');
      }
    }
  };

  return (
    <div
      className="relative flex min-h-screen items-center justify-center bg-cover bg-center"
      style={{
        backgroundImage:
          "url('https://www.barings.com/globalassets/2-assets/strategies/real-estate/brea---properties/metropol/metropol-hero.jpg?t=20250721074040')"
      }}
    >
      <div className="relative z-10 flex w-full items-center justify-center px-4 pb-10 pt-24 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          <div className="rounded-[2rem] border border-white/65 bg-white/12 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.18)] backdrop-blur-xl sm:p-8">
            <div className="mb-8 flex items-center justify-center gap-3 lg:hidden">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#006446]">
                <Building2 className="h-5 w-5 text-white" strokeWidth={1.5} />
              </div>
              <div>
                <h2 className="text-2xl font-display font-bold text-white">{branding.brandName}</h2>
                <p className="text-xs tracking-widest text-white/70">EST. 1892</p>
              </div>
            </div>

            <h2 className="mb-2 text-3xl font-display font-bold text-white">
              {mode === 'login'
                ? t('onlineBanking.login.title')
                : t('onlineBanking.register.title')}
            </h2>

            <p className="mb-8 text-white">
              {mode === 'login'
                ? t('onlineBanking.login.subtitle')
                : t('onlineBanking.register.subtitle')}
            </p>

            <div className="mb-8 flex rounded-xl border border-white/20 bg-white/10 p-1">
              <button
                onClick={() => {
                  setMode('login');
                  setError('');
                }}
                className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition-all duration-200 ${mode === 'login'
                    ? 'bg-[#006446] text-white shadow-soft'
                    : 'text-white/80 hover:text-white'
                  }`}
              >
                {t('onlineBanking.login.tab')}
              </button>

              <button
                onClick={() => {
                  setMode('register');
                  setError('');
                }}
                className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition-all duration-200 ${mode === 'register'
                    ? 'bg-[#006446] text-white shadow-soft'
                    : 'text-white/80 hover:text-white'
                  }`}
              >
                {t('onlineBanking.register.tab')}
              </button>
            </div>

            {error && (
              <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {mode === 'register' && (
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-white">
                    {t('onlineBanking.fields.fullName')}
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder={t('onlineBanking.placeholders.fullName')}
                    className="w-full rounded-xl border border-[#006446]/20 bg-white px-4 py-3 text-surface-900 placeholder-surface-400 transition-all duration-200 focus:border-[#006446] focus:outline-none focus:ring-2 focus:ring-[#006446]/20"
                    required
                  />
                </div>
              )}

              <div>
                <label className="mb-1.5 block text-sm font-medium text-white">
                  {t('onlineBanking.fields.email')}
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('onlineBanking.placeholders.email')}
                  className="w-full rounded-xl border border-[#006446]/20 bg-white px-4 py-3 text-surface-900 placeholder-surface-400 transition-all duration-200 focus:border-[#006446] focus:outline-none focus:ring-2 focus:ring-[#006446]/20"
                  required
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-white">
                  {t('onlineBanking.fields.password')}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t('onlineBanking.placeholders.password')}
                    className="w-full rounded-xl border border-[#006446]/20 bg-white px-4 py-3 pr-12 text-surface-900 placeholder-surface-400 transition-all duration-200 focus:border-[#006446] focus:outline-none focus:ring-2 focus:ring-[#006446]/20"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#006446]/60 hover:text-[#006446]"
                    aria-label={
                      showPassword
                        ? t('onlineBanking.actions.hidePassword')
                        : t('onlineBanking.actions.showPassword')
                    }
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {mode === 'register' && (
                <label className="flex items-start gap-3 rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white">
                  <input
                    type="checkbox"
                    checked={acceptedTerms}
                    onChange={(e) => {
                      setAcceptedTerms(e.target.checked);
                      setError('');
                    }}
                    className="mt-0.5 h-4 w-4 rounded border-[#006446]/30 bg-white text-[#006446] focus:ring-[#006446]/30"
                  />
                  <span className="leading-6">
                    {t('onlineBanking.register.termsAgreementPrefix')}{' '}
                    <Link
                      to="/terms-of-service"
                      className="font-semibold text-white underline underline-offset-4 hover:text-white/80"
                    >
                      {t('onlineBanking.register.termsAgreementLink')}
                    </Link>
                  </span>
                </label>
              )}

              <button
                type="submit"
                disabled={loading || (mode === 'register' && !acceptedTerms)}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#006446] py-3.5 font-semibold text-white transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60 hover:bg-[#00523a]"
              >
                {loading ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                ) : (
                  <>
                    {mode === 'login'
                      ? t('onlineBanking.actions.signIn')
                      : t('onlineBanking.actions.createAccount')}
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
