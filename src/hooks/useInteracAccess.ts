import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { fetchInteracAccess } from '../lib/interacAccess';
import { supabase } from '../lib/supabase';

export function useInteracAccess() {
  const { user } = useAuth();
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) {
      setEnabled(false);
      setLoading(false);
      return;
    }

    setLoading(true);
    setEnabled(await fetchInteracAccess(user.id));
    setLoading(false);
  }, [user]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(`interac-access-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'interac_access_settings',
          filter: `user_id=eq.${user.id}`,
        },
        () => void refresh(),
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [refresh, user]);

  return { enabled, loading, refresh };
}
