import { useMemo, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  LockKeyhole,
  Send,
  ShieldCheck,
} from 'lucide-react';
import type { FiatBalance } from '../../hooks/useFiatBalances';
import type { InteracTransferPayload } from '../../hooks/useTransfers';
import { useLanguage } from '../../contexts/LanguageContext';
import { isBalanceAvailable } from '../../lib/balanceStatus';
import '../../i18n/interac-transfer-panel/translations';

function formatCad(amount: number) {
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
    minimumFractionDigits: 2,
  }).format(amount);
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isValidCanadianPhone(value: string) {
  const digits = value.replace(/\D/g, '');
  const nationalNumber = digits.length === 11 && digits.startsWith('1') ? digits.slice(1) : digits;
  return /^[2-9]\d{2}[2-9]\d{6}$/.test(nationalNumber);
}

interface InteracTransferPanelProps {
  fiatBalances: FiatBalance[];
  submitting: boolean;
  onSubmit: (payload: InteracTransferPayload) => Promise<{ error: string | null }>;
  onSuccess: () => void;
}

export default function InteracTransferPanel({
  fiatBalances,
  submitting,
  onSubmit,
  onSuccess,
}: InteracTransferPanelProps) {
  const { t } = useLanguage();
  const cadBalance = useMemo(
    () => fiatBalances.find((balance) => balance.currency === 'CAD' && isBalanceAvailable(balance.status)),
    [fiatBalances],
  );
  const [amount, setAmount] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [notificationMethod, setNotificationMethod] = useState<'email' | 'mobile'>('email');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [securityQuestion, setSecurityQuestion] = useState('');
  const [securityAnswer, setSecurityAnswer] = useState('');
  const [message, setMessage] = useState('');
  const [detailsConfirmed, setDetailsConfirmed] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const clearForm = () => {
    setAmount('');
    setRecipientName('');
    setRecipientEmail('');
    setRecipientPhone('');
    setSecurityQuestion('');
    setSecurityAnswer('');
    setMessage('');
    setDetailsConfirmed(false);
    setShowAnswer(false);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setSuccess(false);

    const numericAmount = Number(amount);
    if (!cadBalance) {
      setError(t('interacTransfer.errors.cadUnavailable'));
      return;
    }
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      setError(t('interacTransfer.errors.invalidAmount'));
      return;
    }
    if (numericAmount > Number(cadBalance.balance)) {
      setError(t('interacTransfer.errors.insufficientBalance'));
      return;
    }
    if (!recipientName.trim()) {
      setError(t('interacTransfer.errors.recipientRequired'));
      return;
    }
    if (notificationMethod === 'email' && !isValidEmail(recipientEmail.trim())) {
      setError(t('interacTransfer.errors.invalidEmail'));
      return;
    }
    if (notificationMethod === 'mobile' && !isValidCanadianPhone(recipientPhone)) {
      setError(t('interacTransfer.errors.invalidPhone'));
      return;
    }
    if (securityQuestion.trim().length < 6) {
      setError(t('interacTransfer.errors.questionRequired'));
      return;
    }
    if (securityAnswer.trim().length < 3 || !/^[A-Za-z0-9 ]+$/.test(securityAnswer.trim())) {
      setError(t('interacTransfer.errors.answerInvalid'));
      return;
    }
    if (!detailsConfirmed) {
      setError(t('interacTransfer.errors.confirmRequired'));
      return;
    }

    const result = await onSubmit({
      amount: numericAmount,
      recipient_name: recipientName.trim(),
      notification_method: notificationMethod,
      recipient_email: notificationMethod === 'email' ? recipientEmail.trim().toLowerCase() : '',
      recipient_phone: notificationMethod === 'mobile' ? recipientPhone.trim() : '',
      security_question: securityQuestion.trim(),
      security_answer: securityAnswer.trim(),
      description: message.trim(),
    });

    if (result.error) {
      setError(result.error);
      return;
    }

    clearForm();
    setSuccess(true);
    onSuccess();
    window.setTimeout(() => setSuccess(false), 5000);
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-[#006446]/14 bg-white shadow-[0_24px_60px_-48px_rgba(0,100,70,0.45)]">
      <div className="border-b border-[#006446]/10 bg-gradient-to-r from-[#006446]/[0.07] to-white px-6 pb-5 pt-6">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-[#006446] text-white shadow-[0_12px_26px_-16px_rgba(0,100,70,0.9)]">
            <Send className="h-5 w-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-semibold text-slate-900">{t('interacTransfer.title')}</h2>
              <span className="rounded-full border border-[#006446]/15 bg-white px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.16em] text-[#006446]">
                CAD
              </span>
            </div>
            <p className="mt-0.5 text-sm text-slate-500">{t('interacTransfer.subtitle')}</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 p-6">
        {error ? (
          <div role="alert" className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        ) : null}

        {success ? (
          <div role="status" className="flex items-start gap-2 rounded-xl border border-[#006446]/15 bg-[#006446]/[0.05] px-4 py-3 text-sm text-[#006446]">
            <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0" />
            <span>{t('interacTransfer.success')}</span>
          </div>
        ) : null}

        <section>
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
            {t('interacTransfer.sections.transfer')}
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                {t('interacTransfer.fields.fromAccount')}
              </label>
              <div className={`rounded-xl border px-4 py-3 ${cadBalance ? 'border-[#006446]/14 bg-white' : 'border-slate-200 bg-slate-50'}`}>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-semibold text-slate-900">{t('interacTransfer.fields.cadAccount')}</span>
                  <span className="text-xs font-medium text-[#006446]">
                    {cadBalance ? formatCad(Number(cadBalance.balance)) : t('interacTransfer.unavailable')}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="interac-amount" className="mb-1.5 block text-sm font-medium text-slate-700">
                {t('interacTransfer.fields.amount')}
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400">CAD</span>
                <input
                  id="interac-amount"
                  type="number"
                  inputMode="decimal"
                  min="0.01"
                  step="0.01"
                  max={cadBalance ? Number(cadBalance.balance) : undefined}
                  value={amount}
                  onChange={(event) => setAmount(event.target.value)}
                  placeholder="0.00"
                  className="w-full rounded-xl border border-[#006446]/14 py-3 pl-14 pr-4 text-sm tabular-nums focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#006446]/20"
                />
              </div>
            </div>
          </div>
        </section>

        <section>
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
            {t('interacTransfer.sections.recipient')}
          </p>
          <div className="space-y-4">
            <div>
              <label htmlFor="interac-recipient" className="mb-1.5 block text-sm font-medium text-slate-700">
                {t('interacTransfer.fields.recipientName')}
              </label>
              <input
                id="interac-recipient"
                type="text"
                autoComplete="name"
                value={recipientName}
                onChange={(event) => setRecipientName(event.target.value)}
                placeholder={t('interacTransfer.placeholders.recipientName')}
                className="w-full rounded-xl border border-[#006446]/14 px-4 py-3 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#006446]/20"
              />
            </div>

            <fieldset>
              <legend className="mb-2 block text-sm font-medium text-slate-700">
                {t('interacTransfer.fields.notifyBy')}
              </legend>
              <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1">
                {(['email', 'mobile'] as const).map((method) => (
                  <button
                    key={method}
                    type="button"
                    aria-pressed={notificationMethod === method}
                    onClick={() => setNotificationMethod(method)}
                    className={`rounded-lg px-3 py-2.5 text-sm font-semibold transition-all ${
                      notificationMethod === method
                        ? 'bg-white text-[#006446] shadow-sm'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    {t(`interacTransfer.methods.${method}`)}
                  </button>
                ))}
              </div>
            </fieldset>

            {notificationMethod === 'email' ? (
              <div>
                <label htmlFor="interac-email" className="mb-1.5 block text-sm font-medium text-slate-700">
                  {t('interacTransfer.fields.email')}
                </label>
                <input
                  id="interac-email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  value={recipientEmail}
                  onChange={(event) => setRecipientEmail(event.target.value)}
                  placeholder={t('interacTransfer.placeholders.email')}
                  className="w-full rounded-xl border border-[#006446]/14 px-4 py-3 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#006446]/20"
                />
              </div>
            ) : (
              <div>
                <label htmlFor="interac-phone" className="mb-1.5 block text-sm font-medium text-slate-700">
                  {t('interacTransfer.fields.mobile')}
                </label>
                <input
                  id="interac-phone"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  value={recipientPhone}
                  onChange={(event) => setRecipientPhone(event.target.value)}
                  placeholder={t('interacTransfer.placeholders.mobile')}
                  className="w-full rounded-xl border border-[#006446]/14 px-4 py-3 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#006446]/20"
                />
              </div>
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-[#006446]/12 bg-[#006446]/[0.025] p-4">
          <div className="mb-4 flex items-start gap-3">
            <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#006446]/10 text-[#006446]">
              <LockKeyhole className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">{t('interacTransfer.sections.security')}</p>
              <p className="mt-0.5 text-xs leading-5 text-slate-500">{t('interacTransfer.securityHelp')}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="interac-question" className="mb-1.5 block text-sm font-medium text-slate-700">
                {t('interacTransfer.fields.securityQuestion')}
              </label>
              <input
                id="interac-question"
                type="text"
                value={securityQuestion}
                onChange={(event) => setSecurityQuestion(event.target.value)}
                placeholder={t('interacTransfer.placeholders.securityQuestion')}
                className="w-full rounded-xl border border-[#006446]/14 bg-white px-4 py-3 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#006446]/20"
              />
            </div>

            <div>
              <label htmlFor="interac-answer" className="mb-1.5 block text-sm font-medium text-slate-700">
                {t('interacTransfer.fields.securityAnswer')}
              </label>
              <div className="relative">
                <input
                  id="interac-answer"
                  type={showAnswer ? 'text' : 'password'}
                  autoComplete="off"
                  value={securityAnswer}
                  onChange={(event) => setSecurityAnswer(event.target.value)}
                  placeholder={t('interacTransfer.placeholders.securityAnswer')}
                  className="w-full rounded-xl border border-[#006446]/14 bg-white px-4 py-3 pr-12 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#006446]/20"
                />
                <button
                  type="button"
                  onClick={() => setShowAnswer((current) => !current)}
                  aria-label={showAnswer ? t('interacTransfer.actions.hideAnswer') : t('interacTransfer.actions.showAnswer')}
                  className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-[#006446]"
                >
                  {showAnswer ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <p className="mt-1.5 text-xs text-slate-500">{t('interacTransfer.answerHelp')}</p>
            </div>
          </div>
        </section>

        <div>
          <label htmlFor="interac-message" className="mb-1.5 block text-sm font-medium text-slate-700">
            {t('interacTransfer.fields.message')}{' '}
            <span className="font-normal text-slate-400">({t('interacTransfer.optional')})</span>
          </label>
          <textarea
            id="interac-message"
            rows={3}
            maxLength={400}
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder={t('interacTransfer.placeholders.message')}
            className="w-full resize-none rounded-xl border border-[#006446]/14 px-4 py-3 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#006446]/20"
          />
          <p className="mt-1 text-right text-[11px] text-slate-400">{message.length}/400</p>
        </div>

        <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
          <input
            type="checkbox"
            checked={detailsConfirmed}
            onChange={(event) => setDetailsConfirmed(event.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-slate-300 accent-[#006446]"
          />
          <span className="text-xs leading-5 text-slate-600">{t('interacTransfer.confirmation')}</span>
        </label>

        <button
          type="submit"
          disabled={submitting || !cadBalance || !detailsConfirmed}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#006446] py-3.5 font-semibold text-white transition-colors hover:bg-[#00523a] disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {submitting ? (
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          ) : (
            <>
              <ShieldCheck className="h-4 w-4" />
              {t('interacTransfer.actions.reviewSend')}
            </>
          )}
        </button>
      </form>
    </div>
  );
}
