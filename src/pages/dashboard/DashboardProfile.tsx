import { useState, useEffect } from 'react';
import { User, CheckCircle, AlertCircle } from 'lucide-react';
import { useProfile } from '../../hooks/useBankingData';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage, type Language } from '../../contexts/LanguageContext';
import '../../i18n/dashboardprofile/translations';

const LOCALE_MAP: Record<Language, string> = {
  en: 'en-GB',
  fr: 'fr-FR',
  de: 'de-DE',
  es: 'es-ES',
  it: 'it-IT',
  el: 'el-GR',
};

function interpolate(template: string, vars: Record<string, string | number>) {
  return template.replace(/\{(\w+)\}/g, (_, key) => String(vars[key] ?? `{${key}}`));
}

export default function DashboardProfile() {
  const { user } = useAuth();
  const { profile, loading, updateProfile } = useProfile();
  const { language, t } = useLanguage();

  const [fullName, setFullName] = useState('');
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name);
    }
  }, [profile]);

  const formatMemberSince = (date: string) => {
    return new Date(date).toLocaleDateString(LOCALE_MAP[language], {
      month: 'long',
      year: 'numeric',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setResult(null);

    const res = await updateProfile({
      full_name: fullName,
    });

    if (res?.error) {
      setResult({ success: false, message: res.error });
    } else {
      setResult({ success: true, message: t('dashboardProfile.success') });
    }

    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 rounded-full border-2 border-[#006446]/20 border-t-[#006446] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 min-w-0">
      <div>
        <h1 className="text-2xl font-serif font-bold text-slate-900">
          {t('dashboardProfile.title')}
        </h1>
        <p className="mt-1 text-sm text-[#006446]">
          {t('dashboardProfile.subtitle')}
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="rounded-2xl border border-[#006446]/14 bg-white p-6 shadow-[0_24px_60px_-48px_rgba(0,100,70,0.45)] sm:p-8">
            {result && (
              <div
                className="mb-6 flex items-center gap-3 rounded-2xl border border-[#006446]/14 bg-[#006446]/[0.04] px-4 py-3 text-sm text-[#006446]"
              >
                {result.success ? (
                  <CheckCircle className="w-5 h-5 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                )}
                {result.message}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-800">
                  {t('dashboardProfile.fullName')}
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full rounded-xl border border-[#006446]/14 bg-[#006446]/[0.03] px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#006446]/20"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-800">
                  {t('dashboardProfile.emailAddress')}
                </label>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="w-full rounded-xl border border-[#006446]/10 bg-[#006446]/[0.04] px-4 py-3 text-sm text-slate-600"
                />
                <p className="mt-1 text-xs text-[#006446]/70">
                  {t('dashboardProfile.emailCannotChange')}
                </p>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="flex items-center justify-center gap-2 rounded-xl bg-[#006446] px-8 py-3 font-semibold text-white transition-colors hover:bg-[#00523a] disabled:bg-slate-300 disabled:text-slate-500"
              >
                {saving ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  t('dashboardProfile.saveChanges')
                )}
              </button>
            </form>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-[#006446]/14 bg-white p-6 text-center shadow-[0_24px_60px_-48px_rgba(0,100,70,0.45)]">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-[#006446]/10">
              <User className="h-10 w-10 text-[#006446]" />
            </div>
            <h3 className="font-semibold text-slate-900">
              {profile?.full_name || t('dashboardProfile.userFallback')}
            </h3>
            <p className="mt-1 text-sm text-[#006446]/70">{user?.email}</p>
            <p className="mt-3 text-xs text-[#006446]/70">
              {profile?.created_at
                ? interpolate(t('dashboardProfile.memberSince'), {
                    date: formatMemberSince(profile.created_at),
                  })
                : interpolate(t('dashboardProfile.memberSince'), {
                    date: t('dashboardProfile.notAvailable'),
                  })}
            </p>
          </div>

          <div className="rounded-2xl border border-[#006446]/14 bg-[#006446] p-6 text-white shadow-[0_24px_60px_-48px_rgba(0,100,70,0.55)]">
            <h3 className="mb-3 font-semibold">{t('dashboardProfile.security')}</h3>
            <ul className="space-y-2 text-sm text-white/85">
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-white" />
                {t('dashboardProfile.emailVerified')}
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-white" />
                {t('dashboardProfile.encryption')}
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-white" />
                {t('dashboardProfile.secureSession')}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
