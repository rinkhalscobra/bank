import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export interface Loan {
  id: string;
  user_id: string;
  loan_type: 'personal' | 'mortgage' | 'auto' | 'education' | 'business';
  principal: number;
  interest_rate: number;
  term_months: number;
  monthly_payment: number;
  remaining_balance: number;
  total_paid: number;
  next_payment_date: string | null;
  status: 'active' | 'paid_off' | 'defaulted' | 'pending_approval';
  created_at: string;
}

export const LOAN_TYPES = [
  { key: 'personal', label: 'Personal Loan', minRate: 7.5, maxRate: 15.0, maxTerm: 60, maxAmount: 50000 },
  { key: 'mortgage', label: 'Mortgage', minRate: 3.5, maxRate: 7.0, maxTerm: 360, maxAmount: 1000000 },
  { key: 'auto', label: 'Auto Loan', minRate: 4.5, maxRate: 10.0, maxTerm: 84, maxAmount: 75000 },
  { key: 'education', label: 'Education Loan', minRate: 3.0, maxRate: 8.0, maxTerm: 120, maxAmount: 150000 },
  { key: 'business', label: 'Business Loan', minRate: 6.0, maxRate: 18.0, maxTerm: 60, maxAmount: 250000 },
];

export function calculateMonthlyPayment(principal: number, annualRate: number, termMonths: number) {
  const monthlyRate = annualRate / 100 / 12;
  if (monthlyRate === 0) return principal / termMonths;
  return (principal * monthlyRate * Math.pow(1 + monthlyRate, termMonths)) /
    (Math.pow(1 + monthlyRate, termMonths) - 1);
}

export function useLoans() {
  const { user } = useAuth();
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLoans = async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from('loans')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    setLoans((data as Loan[]) || []);
    setLoading(false);
  };

  const applyForLoan = async (params: {
    loanType: string;
    principal: number;
    interestRate: number;
    termMonths: number;
  }) => {
    if (!user) return { error: 'Not authenticated' };
    const monthlyPayment = calculateMonthlyPayment(params.principal, params.interestRate, params.termMonths);
    const nextPayment = new Date();
    nextPayment.setMonth(nextPayment.getMonth() + 1);

    const { error } = await supabase.from('loans').insert({
      user_id: user.id,
      loan_type: params.loanType,
      principal: params.principal,
      interest_rate: params.interestRate,
      term_months: params.termMonths,
      monthly_payment: Math.round(monthlyPayment * 100) / 100,
      remaining_balance: params.principal,
      total_paid: 0,
      next_payment_date: nextPayment.toISOString().split('T')[0],
      status: 'pending_approval',
    });
    if (!error) await fetchLoans();
    return { error: error?.message || null };
  };

  const makePayment = async (loanId: string) => {
    if (!user) return { error: 'Not authenticated' };
    const loan = loans.find((l) => l.id === loanId);
    if (!loan) return { error: 'Loan not found' };

    const payment = Math.min(loan.monthly_payment, loan.remaining_balance);
    const newRemaining = Math.max(0, loan.remaining_balance - payment);
    const nextDate = new Date();
    nextDate.setMonth(nextDate.getMonth() + 1);

    const { error } = await supabase
      .from('loans')
      .update({
        remaining_balance: Math.round(newRemaining * 100) / 100,
        total_paid: Math.round((loan.total_paid + payment) * 100) / 100,
        next_payment_date: newRemaining > 0 ? nextDate.toISOString().split('T')[0] : null,
        status: newRemaining <= 0 ? 'paid_off' : 'active',
      })
      .eq('id', loanId)
      .eq('user_id', user.id);
    if (!error) await fetchLoans();
    return { error: error?.message || null };
  };

  useEffect(() => {
    fetchLoans();
  }, [user]);

  return { loans, loading, refetch: fetchLoans, applyForLoan, makePayment };
}
