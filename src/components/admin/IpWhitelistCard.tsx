import { useCallback, useEffect, useMemo, useState } from 'react';
import { AlertCircle, CheckCircle2, Info, Loader2, Plus, RefreshCw, Save, ShieldCheck } from 'lucide-react';
import {
  getIpAllowlistConfig,
  saveIpAllowlistConfig,
  type IpAllowlistConfig,
} from '../../lib/ipAllowlist';

function parseEntries(value: string) {
  return [...new Set(value.split(/[\n,]+/).map((entry) => entry.trim()).filter(Boolean))];
}

export default function IpWhitelistCard() {
  const [config, setConfig] = useState<IpAllowlistConfig | null>(null);
  const [enabled, setEnabled] = useState(false);
  const [entries, setEntries] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const loadConfig = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const nextConfig = await getIpAllowlistConfig();
      setConfig(nextConfig);
      setEnabled(nextConfig.enabled);
      setEntries(nextConfig.allowedCidrs.join('\n'));
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Could not load the IP allowlist.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadConfig();
  }, [loadConfig]);

  const parsedEntries = useMemo(() => parseEntries(entries), [entries]);
  const hasChanges = config !== null && (
    enabled !== config.enabled
    || parsedEntries.join('\n') !== config.allowedCidrs.join('\n')
  );

  function addCurrentIp() {
    if (!config?.currentIp) return;
    const nextEntries = parseEntries(`${entries}\n${config.currentIp}`);
    setEntries(nextEntries.join('\n'));
    setError(null);
    setSuccess(null);
  }

  function resetForm() {
    if (!config) return;
    setEnabled(config.enabled);
    setEntries(config.allowedCidrs.join('\n'));
    setError(null);
    setSuccess(null);
  }

  async function handleSave() {
    if (enabled && parsedEntries.length === 0) {
      setError('Add at least one IP address or CIDR range before enabling the allowlist.');
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const nextConfig = await saveIpAllowlistConfig(enabled, parsedEntries);
      setConfig(nextConfig);
      setEnabled(nextConfig.enabled);
      setEntries(nextConfig.allowedCidrs.join('\n'));
      setSuccess(nextConfig.enabled ? 'IP allowlist enabled and saved.' : 'IP allowlist saved. CRM access is unrestricted.');
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Could not save the IP allowlist.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_18px_45px_-40px_rgba(15,23,42,0.35)]">
      <div className="flex flex-col gap-4 border-b border-slate-200 bg-slate-50/80 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-white">
            <ShieldCheck className="h-4 w-4" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Network security</p>
            <h2 className="mt-1 text-lg font-semibold text-slate-950">IP allowlist</h2>
          </div>
        </div>
        {!loading && config ? (
          <span className={`inline-flex w-fit items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold ${
            config.enabled
              ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
              : 'border-slate-200 bg-white text-slate-600'
          }`}>
            <span className={`h-2 w-2 rounded-full ${config.enabled ? 'bg-emerald-500' : 'bg-slate-400'}`} />
            {config.enabled ? 'Enforced' : 'Not enforced'}
          </span>
        ) : null}
      </div>

      {loading ? (
        <div className="flex min-h-40 items-center justify-center gap-3 px-5 py-8 text-sm text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading network settings…
        </div>
      ) : config ? (
        <div className="space-y-5 px-5 py-5">
          <div className="flex items-start justify-between gap-5 rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
            <div>
              <label htmlFor="ip-allowlist-enabled" className="font-semibold text-slate-900">Restrict CRM access</label>
              <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-600">
                When enabled, admins, managers, and agents can open the CRM only from an allowed address.
              </p>
            </div>
            <label className="relative mt-0.5 inline-flex flex-shrink-0 cursor-pointer items-center">
              <input
                id="ip-allowlist-enabled"
                type="checkbox"
                checked={enabled}
                onChange={(event) => {
                  setEnabled(event.target.checked);
                  setSuccess(null);
                }}
                className="peer sr-only"
              />
              <span className="h-7 w-12 rounded-full bg-slate-300 transition-colors after:absolute after:left-1 after:top-1 after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow-sm after:transition-transform peer-checked:bg-[#006446] peer-checked:after:translate-x-5 peer-focus-visible:ring-2 peer-focus-visible:ring-[#006446] peer-focus-visible:ring-offset-2" />
              <span className="sr-only">Enable IP allowlist</span>
            </label>
          </div>

          <div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <label htmlFor="ip-allowlist-entries" className="text-sm font-semibold text-slate-900">Allowed addresses and networks</label>
                <p className="mt-1 text-xs leading-5 text-slate-500">Enter one IPv4, IPv6, or CIDR range per line. Commas are also accepted.</p>
              </div>
              <button
                type="button"
                onClick={addCurrentIp}
                disabled={!config.currentIp || parsedEntries.includes(config.currentIp)}
                className="inline-flex w-fit items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Plus className="h-3.5 w-3.5" />
                Add my current IP
              </button>
            </div>
            <textarea
              id="ip-allowlist-entries"
              value={entries}
              onChange={(event) => {
                setEntries(event.target.value);
                setSuccess(null);
              }}
              rows={5}
              spellCheck={false}
              placeholder={'203.0.113.42\n198.51.100.0/24\n2001:db8::/32'}
              className="mt-3 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 font-mono text-sm leading-6 text-slate-900 outline-none transition focus:border-[#006446] focus:ring-2 focus:ring-[#006446]/10"
            />
            <div className="mt-2 flex flex-col gap-1 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
              <span>{parsedEntries.length} {parsedEntries.length === 1 ? 'entry' : 'entries'}</span>
              <span>Your current IP: <span className="font-mono font-semibold text-slate-700">{config.currentIp ?? 'Unavailable'}</span></span>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-2xl border border-blue-100 bg-blue-50/70 px-4 py-3 text-sm text-blue-900">
            <Info className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-600" />
            <p className="leading-6">To prevent lockout, enabling or changing an active allowlist requires your current IP to be covered by one of the saved entries.</p>
          </div>

          {error ? (
            <div role="alert" className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          ) : null}

          {success ? (
            <div role="status" className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
              <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0" />
              <span>{success}</span>
            </div>
          ) : null}

          <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={() => void loadConfig()}
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-100 disabled:opacity-50"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
            <div className="flex flex-col-reverse gap-3 sm:flex-row">
              <button
                type="button"
                onClick={resetForm}
                disabled={!hasChanges || saving}
                className="rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void handleSave()}
                disabled={!hasChanges || saving}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#006446] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#004d36] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {saving ? 'Saving…' : 'Save allowlist'}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4 px-5 py-5">
          <div role="alert" className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
            <div>
              <p className="font-semibold">IP allowlist settings are unavailable.</p>
              <p className="mt-1">{error ?? 'Apply the latest database migration, then try again.'}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => void loadConfig()}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            <RefreshCw className="h-4 w-4" />
            Try again
          </button>
        </div>
      )}
    </section>
  );
}
