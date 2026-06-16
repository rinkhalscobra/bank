import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export interface Card {
  id: string;
  user_id: string;
  card_type: string;
  card_brand: 'visa' | 'mastercard';
  card_number: string;
  cardholder_name: string;
  expiry_date: string;
  cvv: string;
  status: 'active' | 'approved' | 'pending_approval' | 'frozen' | 'cancelled';
  daily_limit: number;
  monthly_limit: number;
  billing_address: string;
  city: string;
  state_province: string;
  postal_code: string;
  country: string;
  phone_number: string;
  employment_status: string;
  annual_income: number;
  currency: string;
  purpose: string;
  created_at: string;
}

export interface CardApplication {
  cardholderName: string;
  billingAddress: string;
  city: string;
  stateProvince: string;
  postalCode: string;
  country: string;
  phoneNumber: string;
  employmentStatus: string;
  annualIncome: number;
  currency: string;
  purpose: string;
  dailyLimit: number;
  monthlyLimit: number;
}

export function useCards() {
  const { user } = useAuth();
  const [cards, setCards] = useState<Card[]>([]);
  const [pendingApplications, setPendingApplications] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCards = async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from('cards')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    const allCards = (data as Card[]) || [];
    setPendingApplications(allCards.filter((card) => card.status === 'pending_approval'));
    setCards(allCards.filter((card) => card.status !== 'pending_approval'));
    setLoading(false);
  };

  const toggleFreeze = async (cardId: string, currentStatus: string) => {
    if (!user) return;
    if (!['active', 'approved', 'frozen'].includes(currentStatus)) {
      return { error: 'Only approved cards can be frozen or unfrozen.' };
    }

    const newStatus = currentStatus === 'frozen' ? 'approved' : 'frozen';
    const { error } = await supabase
      .from('cards')
      .update({ status: newStatus })
      .eq('id', cardId)
      .eq('user_id', user.id);
    if (!error) await fetchCards();
    return { error: error?.message || null };
  };

  const createCard = async (application: CardApplication) => {
    if (!user) return { error: 'Not authenticated' };
    const prefix = Math.random() > 0.5 ? '4' : '5';
    const cardNumber = `${prefix}${Array.from({ length: 15 }, () => Math.floor(Math.random() * 10)).join('')}`;
    const month = String(Math.floor(1 + Math.random() * 12)).padStart(2, '0');
    const year = String(new Date().getFullYear() + 3 + Math.floor(Math.random() * 3)).slice(-2);
    const cvv = String(Math.floor(100 + Math.random() * 900));

    const { error } = await supabase.from('cards').insert({
      user_id: user.id,
      card_type: 'debit',
      card_brand: prefix === '4' ? 'visa' : 'mastercard',
      card_number: cardNumber,
      cardholder_name: application.cardholderName,
      expiry_date: `${month}/${year}`,
      cvv,
      status: 'pending_approval',
      daily_limit: application.dailyLimit,
      monthly_limit: application.monthlyLimit,
      billing_address: application.billingAddress,
      city: application.city,
      state_province: application.stateProvince,
      postal_code: application.postalCode,
      country: application.country,
      phone_number: application.phoneNumber,
      employment_status: application.employmentStatus,
      annual_income: application.annualIncome,
      currency: application.currency,
      purpose: application.purpose,
    });

    if (!error) await fetchCards();
    return { error: error?.message || null };
  };

  useEffect(() => {
    fetchCards();
  }, [user]);

  return { cards, pendingApplications, loading, refetch: fetchCards, toggleFreeze, createCard };
}
