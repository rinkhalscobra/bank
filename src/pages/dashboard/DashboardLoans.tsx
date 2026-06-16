import { useState } from 'react';
import {
  Banknote,
  Plus,
  Clock,
  CheckCircle,
  AlertCircle,
  FileText,
  Calendar,
} from 'lucide-react';
import { useLoans, LOAN_TYPES, calculateMonthlyPayment } from '../../hooks/useLoans';
import Dropdown from '../../components/ui/Dropdown';
import { useLanguage } from '../../contexts/LanguageContext';
import '../../i18n/dashboard-loans/translations';

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}

const STATUS_STYLES: Record<string, string> = {
  active: 'rounded-full border border-[#006446]/14 bg-[#006446]/10 text-[#006446]',
  paid_off: 'rounded-full border border-[#006446]/14 bg-[#006446]/10 text-[#006446]',
  pending_approval: 'rounded-full border border-[#006446]/14 bg-[#006446]/10 text-[#006446]',
  defaulted: 'rounded-full border border-[#006446]/14 bg-[#006446]/10 text-[#006446]',
};

export default function DashboardLoans() {
  const { t, language } = useLanguage();
  const { loans, loading, applyForLoan, makePayment } = useLoans();

  const [showApply, setShowApply] = useState(false);
  const [loanType, setLoanType] = useState('personal');
  const [principal, setPrincipal] = useState('');
  const [termMonths, setTermMonths] = useState(12);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const selectedLoanType = LOAN_TYPES.find((t) => t.key === loanType);
  const numPrincipal = parseFloat(principal) || 0;
  const interestRate = selectedLoanType ? (selectedLoanType.minRate + selectedLoanType.maxRate) / 2 : 0;
  const monthlyPayment = numPrincipal > 0 ? calculateMonthlyPayment(numPrincipal, interestRate, termMonths) : 0;
  const totalPayable = monthlyPayment * termMonths;
  const totalInterest = totalPayable - numPrincipal;
  const termOptions = [
    ...[6, 12, 24, 36, 48, 60]
      .filter((m) => m <= (selectedLoanType?.maxTerm || 60))
      .map((m) => ({
        value: String(m),
        label: `${m} ${t('dashboardLoans.application.months')} (${(m / 12).toFixed(1)} ${t('dashboardLoans.application.yearsShort')})`,
      })),
    ...((selectedLoanType?.maxTerm || 0) > 60
      ? [84, 120, 180, 240, 360]
          .filter((m) => m <= (selectedLoanType?.maxTerm || 0))
          .map((m) => ({
            value: String(m),
            label: `${m} ${t('dashboardLoans.application.months')} (${(m / 12).toFixed(0)} ${t('dashboardLoans.application.yearsShort')})`,
          }))
      : []),
  ];

  const activeLoans = loans.filter((l) => l.status === 'active');
  const pendingLoans = loans.filter((l) => l.status === 'pending_approval');
  const totalOutstanding = activeLoans.reduce((s, l) => s + l.remaining_balance, 0);

  const formatDate = (dateStr: string) => {
    const localeMap: Record<string, string> = {
      en: 'en-US',
      fr: 'fr-FR',
      de: 'de-DE',
      es: 'es-ES',
      it: 'it-IT',
      el: 'el-GR',
    };

    return new Date(dateStr).toLocaleDateString(localeMap[language] || 'en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const statusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return t('dashboardLoans.status.active');
      case 'paid_off':
        return t('dashboardLoans.status.paidOff');
      case 'pending_approval':
        return t('dashboardLoans.status.pendingApproval');
      case 'defaulted':
        return t('dashboardLoans.status.defaulted');
      default:
        return status;
    }
  };

  const loanTypeLabel = (key: string, fallback?: string) => {
    switch (key) {
      case 'personal':
        return t('dashboardLoans.loanTypes.personal');
      case 'mortgage':
        return t('dashboardLoans.loanTypes.mortgage');
      case 'auto':
        return t('dashboardLoans.loanTypes.auto');
      case 'education':
        return t('dashboardLoans.loanTypes.education');
      case 'business':
        return t('dashboardLoans.loanTypes.business');
      default:
        return fallback || key;
    }
  };

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (numPrincipal <= 0 || !selectedLoanType) return;

    setSubmitting(true);
    setResult(null);

    const res = await applyForLoan({
      loanType,
      principal: numPrincipal,
      interestRate,
      termMonths,
    });

    if (res?.error) {
      setResult({ success: false, message: res.error });
    } else {
      setResult({ success: true, message: t('dashboardLoans.messages.applicationSubmitted') });
      setPrincipal('');
      setShowApply(false);
    }

    setSubmitting(false);
  };

  const handlePayment = async (loanId: string) => {
    setResult(null);
    const res = await makePayment(loanId);

    if (res?.error) {
      setResult({ success: false, message: res.error });
    } else {
      setResult({ success: true, message: t('dashboardLoans.messages.paymentSuccess') });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 rounded-full border-2 border-[#006446]/20 border-t-[#006446] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-slate-900">
            {t('dashboardLoans.title')}
          </h1>
          <p className="mt-1 text-sm text-[#006446]">
            {t('dashboardLoans.subtitle')}
          </p>
        </div>

        <button
          onClick={() => setShowApply(!showApply)}
          className="flex self-start items-center gap-2 rounded-xl bg-[#006446] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#00523a]"
        >
          <Plus className="w-4 h-4" />
          {t('dashboardLoans.actions.applyForLoan')}
        </button>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-[#006446]/14 bg-white p-5 shadow-[0_24px_60px_-48px_rgba(0,100,70,0.45)]">
          <div className="flex items-center gap-2 mb-2">
            <Banknote className="h-5 w-5 text-[#006446]" />
            <p className="text-xs font-semibold uppercase tracking-wider text-[#006446]/70">
              {t('dashboardLoans.summary.outstanding')}
            </p>
          </div>
          <p className="text-2xl font-bold text-slate-900">{formatCurrency(totalOutstanding)}</p>
        </div>

        <div className="rounded-2xl border border-[#006446]/14 bg-white p-5 shadow-[0_24px_60px_-48px_rgba(0,100,70,0.45)]">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="h-5 w-5 text-[#006446]" />
            <p className="text-xs font-semibold uppercase tracking-wider text-[#006446]/70">
              {t('dashboardLoans.summary.activeLoans')}
            </p>
          </div>
          <p className="text-2xl font-bold text-[#006446]">{activeLoans.length}</p>
        </div>

        <div className="rounded-2xl border border-[#006446]/14 bg-white p-5 shadow-[0_24px_60px_-48px_rgba(0,100,70,0.45)]">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-5 w-5 text-[#006446]" />
            <p className="text-xs font-semibold uppercase tracking-wider text-[#006446]/70">
              {t('dashboardLoans.summary.pending')}
            </p>
          </div>
          <p className="text-2xl font-bold text-[#006446]">{pendingLoans.length}</p>
        </div>
      </div>

      {result && (
        <div className="flex items-center gap-3 rounded-2xl border border-[#006446]/14 bg-[#006446]/[0.04] px-4 py-3 text-sm text-[#006446]">
          {result.success ? <CheckCircle className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
          {result.message}
        </div>
      )}

      {showApply && (
        <div className="rounded-2xl border border-[#006446]/14 bg-white p-6 shadow-[0_24px_60px_-48px_rgba(0,100,70,0.45)]">
          <h2 className="mb-4 font-semibold text-slate-900">
            {t('dashboardLoans.application.title')}
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-6">
            {LOAN_TYPES.map((tpe) => (
              <button
                key={tpe.key}
                type="button"
                onClick={() => setLoanType(tpe.key)}
                className={`rounded-2xl border p-3 text-center transition-all ${
                  loanType === tpe.key
                    ? 'border-[#006446] bg-[#006446]/[0.04] shadow-[0_24px_60px_-48px_rgba(0,100,70,0.45)]'
                    : 'border-[#006446]/14 bg-white hover:border-[#006446]/25'
                }`}
              >
                <p className="text-xs font-bold text-slate-900">{loanTypeLabel(tpe.key, tpe.label)}</p>
                <p className="mt-0.5 text-[10px] text-[#006446]/70">{tpe.minRate}-{tpe.maxRate}%</p>
              </button>
            ))}
          </div>

          <form onSubmit={handleApply} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-800">
                  {t('dashboardLoans.application.amount')} ({t('dashboardLoans.application.max')} {formatCurrency(selectedLoanType?.maxAmount || 0)})
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#006446] text-sm">$</span>
                  <input
                    type="number"
                    step="100"
                    min="1000"
                    max={selectedLoanType?.maxAmount}
                    value={principal}
                    onChange={(e) => setPrincipal(e.target.value)}
                    placeholder={t('dashboardLoans.placeholders.amount')}
                    className="w-full rounded-xl border border-[#006446]/14 bg-[#006446]/[0.03] py-2.5 pl-8 pr-4 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#006446]/20"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-800">
                  {t('dashboardLoans.application.term')}
                </label>
                <Dropdown
                  value={String(termMonths)}
                  options={termOptions}
                  onChange={(value) => setTermMonths(parseInt(value, 10))}
                  className="w-full"
                />
              </div>
            </div>

            {numPrincipal >= 1000 && (
              <div className="grid gap-4 rounded-2xl border border-[#006446]/14 bg-[#006446]/[0.04] p-4 text-sm sm:grid-cols-4">
                <div>
                  <p className="mb-0.5 text-xs text-[#006446]/70">{t('dashboardLoans.calculator.interestRate')}</p>
                  <p className="font-bold text-slate-900">{interestRate.toFixed(1)}% {t('dashboardLoans.calculator.perYear')}</p>
                </div>
                <div>
                  <p className="mb-0.5 text-xs text-[#006446]/70">{t('dashboardLoans.calculator.monthlyPayment')}</p>
                  <p className="font-bold text-slate-900">{formatCurrency(monthlyPayment)}</p>
                </div>
                <div>
                  <p className="mb-0.5 text-xs text-[#006446]/70">{t('dashboardLoans.calculator.totalInterest')}</p>
                  <p className="font-bold text-[#006446]">{formatCurrency(totalInterest)}</p>
                </div>
                <div>
                  <p className="mb-0.5 text-xs text-[#006446]/70">{t('dashboardLoans.calculator.totalPayable')}</p>
                  <p className="font-bold text-slate-900">{formatCurrency(totalPayable)}</p>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={submitting || numPrincipal < 1000}
                className="rounded-xl bg-[#006446] px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#00523a] disabled:bg-slate-300 disabled:text-slate-500"
              >
                {submitting ? t('dashboardLoans.actions.submitting') : t('dashboardLoans.actions.submitApplication')}
              </button>
              <button
                type="button"
                onClick={() => setShowApply(false)}
                className="rounded-xl border border-[#006446]/14 px-6 py-2.5 text-sm font-medium text-[#006446] transition-colors hover:bg-[#006446]/[0.04]"
              >
                {t('dashboardLoans.actions.cancel')}
              </button>
            </div>
          </form>
        </div>
      )}

      {loans.length > 0 && (
        <div className="rounded-2xl border border-[#006446]/14 bg-white shadow-[0_24px_60px_-48px_rgba(0,100,70,0.45)]">
          <div className="border-b border-[#006446]/10 px-6 py-4">
            <h2 className="font-semibold text-slate-900">{t('dashboardLoans.yourLoans')}</h2>
          </div>
          <div className="divide-y divide-[#006446]/10">
            {loans.map((loan) => {
              const paid = loan.principal > 0 ? ((loan.total_paid / (loan.monthly_payment * loan.term_months)) * 100) : 0;
              const loanInfo = LOAN_TYPES.find((tpe) => tpe.key === loan.loan_type);

              return (
                <div key={loan.id} className="space-y-3 px-6 py-5 transition-colors hover:bg-[#006446]/[0.03]">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-[#006446]/10">
                        <Banknote className="h-5 w-5 text-[#006446]" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold text-slate-900">
                            {loanTypeLabel(loan.loan_type, loanInfo?.label || loan.loan_type)}
                          </p>
                          <span className={`px-2 py-0.5 text-[10px] font-medium ${STATUS_STYLES[loan.status]}`}>
                            {statusLabel(loan.status)}
                          </span>
                        </div>
                        <p className="text-xs text-[#006446]/70">
                          {formatCurrency(loan.principal)} {t('dashboardLoans.loanCard.at')} {loan.interest_rate}% {t('dashboardLoans.loanCard.for')} {loan.term_months} {t('dashboardLoans.application.months')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-slate-900">{formatCurrency(loan.remaining_balance)}</p>
                      <p className="text-xs text-[#006446]/70">{t('dashboardLoans.loanCard.remaining')}</p>
                    </div>
                  </div>

                  {loan.status === 'active' && (
                    <>
                      <div className="flex items-center gap-3">
                        <div className="flex-1">
                          <div className="h-2 overflow-hidden rounded-full bg-[#006446]/10">
                            <div
                              className="h-full rounded-full bg-[#006446] transition-all duration-500"
                              style={{ width: `${Math.min(100, paid)}%` }}
                            />
                          </div>
                        </div>
                        <span className="flex-shrink-0 text-xs text-[#006446]/70">{paid.toFixed(0)}% {t('dashboardLoans.loanCard.paid')}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-xs text-[#006446]/70">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            {t('dashboardLoans.loanCard.next')}: {loan.next_payment_date ? formatDate(loan.next_payment_date) : t('dashboardLoans.loanCard.na')}
                          </span>
                          <span>{t('dashboardLoans.loanCard.monthly')}: {formatCurrency(loan.monthly_payment)}</span>
                        </div>
                        <button
                          onClick={() => handlePayment(loan.id)}
                          className="rounded-lg bg-[#006446] px-4 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[#00523a]"
                        >
                          {t('dashboardLoans.actions.makePayment')}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {loans.length === 0 && !showApply && (
        <div className="rounded-2xl border border-[#006446]/14 bg-white p-16 text-center shadow-[0_24px_60px_-48px_rgba(0,100,70,0.45)]">
          <Banknote className="mx-auto mb-4 h-12 w-12 text-[#006446]/30" />
          <h3 className="mb-2 text-lg font-semibold text-slate-900">{t('dashboardLoans.empty.title')}</h3>
          <p className="mb-6 text-sm text-[#006446]/70">{t('dashboardLoans.empty.subtitle')}</p>
          <button
            onClick={() => setShowApply(true)}
            className="rounded-xl bg-[#006446] px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#00523a]"
          >
            {t('dashboardLoans.empty.cta')}
          </button>
        </div>
      )}
    </div>
  );
}
