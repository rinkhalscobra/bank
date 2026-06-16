import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export interface TaxWallet {
  id: string;
  user_id: string;
  wallet_address: string;
  label: string;
  created_at: string;
}

export function useTaxWallet() {
  const { user } = useAuth();
  const [wallet, setWallet] = useState<TaxWallet | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchWallet = async () => {
    if (!user) return;
    setLoading(true);

    const { data } = await supabase
      .from('tax_wallet_addresses')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (data) {
      setWallet(data as TaxWallet);
    } else {
      const { data: newData } = await supabase
        .from('tax_wallet_addresses')
        .insert({ user_id: user.id })
        .select()
        .maybeSingle();
      setWallet((newData as TaxWallet) || null);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchWallet();
  }, [user]);

  return { wallet, loading };
}
