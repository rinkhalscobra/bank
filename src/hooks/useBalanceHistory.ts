import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export interface BalanceSnapshot {
  id: string;
  user_id: string;
  asset_type: 'fiat' | 'crypto';
  symbol: string;
  balance: number;
  balance_usd: number;
  snapshot_date: string;
  created_at: string;
}

export interface AssetTimePoint {
  date: string;
  balance: number;
  balanceUsd: number;
}

export interface AssetSeries {
  symbol: string;
  assetType: 'fiat' | 'crypto';
  points: AssetTimePoint[];
}

export interface DailyTotal {
  date: string;
  totalUsd: number;
  fiatUsd: number;
  cryptoUsd: number;
}

export function useBalanceHistory() {
  const { user } = useAuth();
  const [snapshots, setSnapshots] = useState<BalanceSnapshot[]>([]);
  const [dailyTotals, setDailyTotals] = useState<DailyTotal[]>([]);
  const [assetSeries, setAssetSeries] = useState<AssetSeries[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSnapshots = async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from('balance_snapshots')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true });

    const rows = (data as BalanceSnapshot[]) || [];
    setSnapshots(rows);

    const tsGroups = new Map<string, BalanceSnapshot[]>();
    const allAssetKeys = new Set<string>();
    const assetMeta = new Map<string, 'fiat' | 'crypto'>();

    for (const s of rows) {
      if (!tsGroups.has(s.created_at)) tsGroups.set(s.created_at, []);
      tsGroups.get(s.created_at)!.push(s);
      allAssetKeys.add(s.symbol);
      assetMeta.set(s.symbol, s.asset_type);
    }

    const sortedTimestamps = [...tsGroups.keys()].sort();
    const latestByAsset = new Map<string, { balance: number; balanceUsd: number; type: 'fiat' | 'crypto' }>();
    const totals: DailyTotal[] = [];
    const assetPointsMap = new Map<string, AssetTimePoint[]>();

    for (const sym of allAssetKeys) {
      assetPointsMap.set(sym, []);
    }

    for (const ts of sortedTimestamps) {
      const group = tsGroups.get(ts)!;

      for (const s of group) {
        latestByAsset.set(s.symbol, {
          balance: s.balance,
          balanceUsd: s.balance_usd,
          type: s.asset_type,
        });
      }

      let fiatUsd = 0;
      let cryptoUsd = 0;

      for (const sym of allAssetKeys) {
        const val = latestByAsset.get(sym);
        if (!val) continue;

        assetPointsMap.get(sym)!.push({
          date: ts,
          balance: val.balance,
          balanceUsd: val.balanceUsd,
        });

        if (val.type === 'fiat') fiatUsd += val.balanceUsd;
        else cryptoUsd += val.balanceUsd;
      }

      totals.push({ date: ts, totalUsd: fiatUsd + cryptoUsd, fiatUsd, cryptoUsd });
    }

    const series: AssetSeries[] = [];
    for (const [symbol, points] of assetPointsMap) {
      if (points.length > 0) {
        series.push({ symbol, assetType: assetMeta.get(symbol)!, points });
      }
    }

    setDailyTotals(totals);
    setAssetSeries(series);
    setLoading(false);
  };

  useEffect(() => {
    fetchSnapshots();
  }, [user]);

  return { snapshots, dailyTotals, assetSeries, loading, refetch: fetchSnapshots };
}
