import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import {
  Activity,
  AlertCircle,
  ArrowLeftRight,
  Boxes,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Globe2,
  HandCoins,
  KeyRound,
  Landmark,
  LayoutDashboard,
  Loader2,
  ReceiptText,
  RefreshCw,
  Search,
  Settings2,
  UserRound,
  UsersRound,
  type LucideIcon,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

type AuditCategory = 'all' | 'auth' | 'users' | 'balances' | 'transactions' | 'transfers' | 'payments' | 'loans' | 'settings' | 'other';
type AuditSource = 'all' | 'customer_dashboard' | 'crm_admin' | 'authentication' | 'public_site' | 'system' | 'unknown';

type AuditLogEntry = {
  id: number;
  occurred_at: string;
  event_type: string;
  category: Exclude<AuditCategory, 'all'>;
  table_name: string;
  record_id: string | null;
  subject_user_id: string | null;
  subject_name: string | null;
  subject_email: string | null;
  actor_user_id: string | null;
  actor_name: string | null;
  actor_email: string | null;
  actor_role: string | null;
  actor_ip: string | null;
  summary: string;
  changed_fields: string[] | null;
  old_data: Record<string, unknown> | null;
  new_data: Record<string, unknown> | null;
  metadata: Record<string, unknown> | null;
  source_surface: Exclude<AuditSource, 'all'>;
  source_path: string | null;
};

type CategoryOption = {
  value: AuditCategory;
  label: string;
  icon: LucideIcon;
};

const PAGE_SIZE = 30;

const CATEGORIES: CategoryOption[] = [
  { value: 'all', label: 'All activity', icon: Activity },
  { value: 'auth', label: 'Login & security', icon: KeyRound },
  { value: 'users', label: 'Users', icon: UsersRound },
  { value: 'balances', label: 'Balance history', icon: Landmark },
  { value: 'transactions', label: 'Transactions', icon: ReceiptText },
  { value: 'transfers', label: 'Transfers', icon: ArrowLeftRight },
  { value: 'payments', label: 'Cards & payments', icon: CreditCard },
  { value: 'loans', label: 'Loans & deposits', icon: HandCoins },
  { value: 'settings', label: 'Settings', icon: Settings2 },
  { value: 'other', label: 'Other', icon: Boxes },
];

const CATEGORY_STYLES: Record<Exclude<AuditCategory, 'all'>, string> = {
  auth: 'border-violet-200 bg-violet-50 text-violet-700',
  users: 'border-blue-200 bg-blue-50 text-blue-700',
  balances: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  transactions: 'border-cyan-200 bg-cyan-50 text-cyan-700',
  transfers: 'border-indigo-200 bg-indigo-50 text-indigo-700',
  payments: 'border-amber-200 bg-amber-50 text-amber-700',
  loans: 'border-orange-200 bg-orange-50 text-orange-700',
  settings: 'border-slate-200 bg-slate-100 text-slate-700',
  other: 'border-slate-200 bg-white text-slate-600',
};

const SOURCES: Array<{ value: AuditSource; label: string }> = [
  { value: 'all', label: 'All sources' },
  { value: 'customer_dashboard', label: 'Customer dashboard' },
  { value: 'crm_admin', label: 'CRM Admin' },
  { value: 'authentication', label: 'Online banking' },
  { value: 'public_site', label: 'Public website' },
  { value: 'system', label: 'Automated system' },
  { value: 'unknown', label: 'Unknown source' },
];

function humanize(value: string) {
  return value.replace(/[_.]/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function eventClasses(eventType: string) {
  if (eventType.includes('failed') || eventType === 'delete') return 'bg-red-50 text-red-700 ring-red-200';
  if (eventType.includes('succeeded') || eventType === 'insert') return 'bg-emerald-50 text-emerald-700 ring-emerald-200';
  if (eventType === 'update') return 'bg-blue-50 text-blue-700 ring-blue-200';
  return 'bg-slate-50 text-slate-700 ring-slate-200';
}

function displayActor(entry: AuditLogEntry) {
  if (entry.actor_name) return entry.actor_name;
  if (entry.actor_email) return entry.actor_email;
  if (entry.actor_role === 'system') return 'Automated system';
  return 'Anonymous visitor';
}

function sourceLabel(value: AuditLogEntry['source_surface']) {
  return SOURCES.find((source) => source.value === value)?.label ?? 'Unknown source';
}

function JsonDetails({ label, value }: { label: string; value: Record<string, unknown> | null }) {
  if (!value || Object.keys(value).length === 0) return null;

  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">{label}</p>
      <pre className="mt-2 max-h-72 overflow-auto rounded-xl bg-slate-950 p-3 text-xs leading-5 text-slate-100">
        {JSON.stringify(value, null, 2)}
      </pre>
    </div>
  );
}

export default function AuditLogPanel() {
  const [category, setCategory] = useState<AuditCategory>('all');
  const [source, setSource] = useState<AuditSource>('all');
  const [entries, setEntries] = useState<AuditLogEntry[]>([]);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadEntries = useCallback(async () => {
    setLoading(true);
    setError(null);

    let query = supabase
      .from('audit_logs')
      .select('*', { count: 'exact' })
      .order('occurred_at', { ascending: false })
      .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);

    if (category !== 'all') query = query.eq('category', category);
    if (source !== 'all') query = query.eq('source_surface', source);

    const safeSearch = search.trim().replace(/[,()%]/g, ' ');
    if (safeSearch) {
      const pattern = `%${safeSearch}%`;
      query = query.or([
        `actor_name.ilike.${pattern}`,
        `actor_email.ilike.${pattern}`,
        `actor_ip.ilike.${pattern}`,
        `summary.ilike.${pattern}`,
        `table_name.ilike.${pattern}`,
        `record_id.ilike.${pattern}`,
        `source_surface.ilike.${pattern}`,
        `source_path.ilike.${pattern}`,
      ].join(','));
    }

    const { data, error: queryError, count } = await query;

    if (queryError) {
      setEntries([]);
      setTotal(0);
      setError(queryError.message);
    } else {
      setEntries((data ?? []) as AuditLogEntry[]);
      setTotal(count ?? 0);
    }

    setLoading(false);
  }, [category, page, search, source]);

  useEffect(() => {
    void loadEntries();
  }, [loadEntries]);

  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const activeCategory = useMemo(
    () => CATEGORIES.find((option) => option.value === category) ?? CATEGORIES[0],
    [category],
  );

  function handleSearch(event: FormEvent) {
    event.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  }

  return (
    <section className="overflow-hidden rounded-[32px] border border-[#006446]/14 bg-white shadow-[0_24px_60px_-48px_rgba(0,100,70,0.45)]">
      <div className="border-b border-[#006446]/10 px-5 py-6 sm:px-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-white">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#006446]">Security & accountability</p>
              <h2 className="mt-1 text-2xl font-serif font-bold text-slate-950">Audit log</h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
                Review who changed what, when it happened, which record was affected, and the originating IP address.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => void loadEntries()}
            disabled={loading}
            className="inline-flex w-fit items-center justify-center gap-2 rounded-full border border-[#006446]/14 px-4 py-2.5 text-sm font-semibold text-[#006446] hover:bg-[#006446]/[0.05] disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh log
          </button>
        </div>

        <form onSubmit={handleSearch} className="mt-5 flex max-w-3xl flex-col gap-2 sm:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Search person, email, IP, record, or action"
              className="w-full rounded-2xl border border-slate-200 py-3 pl-11 pr-4 text-sm text-slate-900 outline-none focus:border-[#006446]/40 focus:ring-2 focus:ring-[#006446]/10"
            />
          </div>
          <button type="submit" className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800">
            Search
          </button>
        </form>
      </div>

      <div className="border-b border-slate-200 bg-slate-50/80 px-4 py-4 sm:px-5">
        <div role="tablist" aria-label="Audit log categories" className="flex gap-2 overflow-x-auto pb-1">
          {CATEGORIES.map((option) => {
            const Icon = option.icon;
            const active = option.value === category;

            return (
              <button
                key={option.value}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => {
                  setCategory(option.value);
                  setPage(1);
                }}
                className={`inline-flex flex-shrink-0 items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-semibold transition-colors ${
                  active
                    ? 'border-[#006446] bg-[#006446] text-white'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-[#006446]/25 hover:text-[#006446]'
                }`}
              >
                <Icon className="h-4 w-4" />
                {option.label}
              </button>
            );
          })}
        </div>
        <div className="mt-3 flex items-center gap-2 overflow-x-auto border-t border-slate-200/80 pt-3">
          <span className="flex-shrink-0 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Made from</span>
          {SOURCES.map((option) => {
            const active = option.value === source;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  setSource(option.value);
                  setPage(1);
                }}
                aria-pressed={active}
                className={`flex-shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                  active ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:text-slate-900'
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="bg-[#f7fbf8] p-4 sm:p-6">
        <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="font-semibold text-slate-900">{activeCategory.label}</h3>
            <p className="mt-1 text-xs text-slate-500">{total} recorded {total === 1 ? 'event' : 'events'}</p>
          </div>
          {search ? <p className="text-xs text-slate-500">Filtered by “{search}”</p> : null}
        </div>

        {error ? (
          <div role="alert" className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-800">
            <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
            <div>
              <p className="font-semibold">Audit records could not be loaded.</p>
              <p className="mt-1">{error}</p>
            </div>
          </div>
        ) : loading ? (
          <div className="flex min-h-52 items-center justify-center gap-3 rounded-[24px] border border-slate-200 bg-white text-sm text-slate-500">
            <Loader2 className="h-5 w-5 animate-spin text-[#006446]" />
            Loading audit records…
          </div>
        ) : entries.length === 0 ? (
          <div className="rounded-[24px] border border-dashed border-slate-200 bg-white px-6 py-16 text-center">
            <Activity className="mx-auto h-8 w-8 text-slate-300" />
            <p className="mt-4 font-semibold text-slate-800">No activity in this section</p>
            <p className="mt-1 text-sm text-slate-500">New matching events will appear here automatically.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {entries.map((entry) => {
              const changedFields = entry.changed_fields ?? [];
              const CategoryIcon = CATEGORIES.find((option) => option.value === entry.category)?.icon ?? Boxes;

              return (
                <article key={entry.id} className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-[0_18px_45px_-42px_rgba(15,23,42,0.28)] sm:p-5">
                  <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                    <div className="flex min-w-0 items-start gap-3">
                      <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl border ${CATEGORY_STYLES[entry.category]}`}>
                        <CategoryIcon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="font-semibold text-slate-950">{entry.summary}</h4>
                          <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] ring-1 ring-inset ${eventClasses(entry.event_type)}`}>
                            {humanize(entry.event_type)}
                          </span>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                          <span className="inline-flex items-center gap-1.5"><UserRound className="h-3.5 w-3.5" />{displayActor(entry)}</span>
                          <span className="inline-flex items-center gap-1.5"><Globe2 className="h-3.5 w-3.5" /><span className="font-mono">{entry.actor_ip ?? 'IP unavailable'}</span></span>
                          <span className="inline-flex items-center gap-1.5 font-semibold text-slate-700">
                            <LayoutDashboard className="h-3.5 w-3.5" />
                            {sourceLabel(entry.source_surface)}{entry.source_path ? ` · ${entry.source_path}` : ''}
                          </span>
                          <span>{new Date(entry.occurred_at).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid flex-shrink-0 gap-2 text-xs sm:grid-cols-3 xl:w-[560px]">
                      <div className="rounded-xl bg-slate-50 px-3 py-2">
                        <span className="text-slate-500">Area</span>
                        <p className="mt-0.5 truncate font-semibold text-slate-800">{humanize(entry.table_name)}</p>
                      </div>
                      <div className="rounded-xl bg-slate-50 px-3 py-2">
                        <span className="text-slate-500">Made from</span>
                        <p className="mt-0.5 truncate font-semibold text-slate-800" title={entry.source_path ?? undefined}>
                          {sourceLabel(entry.source_surface)}
                        </p>
                      </div>
                      <div className="rounded-xl bg-slate-50 px-3 py-2">
                        <span className="text-slate-500">Record</span>
                        <p className="mt-0.5 truncate font-mono font-semibold text-slate-800" title={entry.record_id ?? undefined}>{entry.record_id ?? 'Not available'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-3 border-t border-slate-100 pt-4 md:grid-cols-2">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Actor</p>
                      <p className="mt-1 break-all text-sm text-slate-700">{entry.actor_email ?? 'No email available'} · {humanize(entry.actor_role ?? 'unknown')}</p>
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Affected user</p>
                      <p className="mt-1 break-all text-sm font-semibold text-slate-700">
                        {entry.subject_name || entry.subject_email || (entry.subject_user_id ? 'User record' : 'Not user-specific')}
                      </p>
                      {entry.subject_user_id ? <p className="mt-0.5 break-all font-mono text-[11px] text-slate-400">{entry.subject_user_id}</p> : null}
                    </div>
                  </div>

                  {changedFields.length > 0 ? (
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {changedFields.slice(0, 10).map((field) => (
                        <span key={field} className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-medium text-slate-600">{humanize(field)}</span>
                      ))}
                      {changedFields.length > 10 ? <span className="px-2 py-1 text-[10px] text-slate-500">+{changedFields.length - 10} more</span> : null}
                    </div>
                  ) : null}

                  {entry.old_data || entry.new_data || (entry.metadata && Object.keys(entry.metadata).length > 0) ? (
                    <details className="mt-4 rounded-2xl border border-slate-200 bg-slate-50/60 px-4 py-3">
                      <summary className="cursor-pointer text-sm font-semibold text-slate-700">View event details</summary>
                      <div className="mt-4 grid gap-4 lg:grid-cols-2">
                        <JsonDetails label="Before" value={entry.old_data} />
                        <JsonDetails label="After" value={entry.new_data} />
                        <JsonDetails label="Metadata" value={entry.metadata} />
                      </div>
                    </details>
                  ) : null}
                </article>
              );
            })}
          </div>
        )}

        {!loading && !error && total > PAGE_SIZE ? (
          <div className="mt-5 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-semibold text-slate-700">Page {page} of {pageCount}</p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                disabled={page <= 1}
                className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" /> Previous
              </button>
              <button
                type="button"
                onClick={() => setPage((current) => Math.min(pageCount, current + 1))}
                disabled={page >= pageCount}
                className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 disabled:opacity-40"
              >
                Next <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
