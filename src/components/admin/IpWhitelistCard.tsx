import { Info, ShieldCheck } from 'lucide-react';

export default function IpWhitelistCard() {
  return (
    <section className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_18px_45px_-40px_rgba(15,23,42,0.35)]">
      <div className="flex items-start gap-3 border-b border-slate-200 bg-slate-50/80 px-5 py-4">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-white">
          <ShieldCheck className="h-4 w-4" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Network security</p>
          <h2 className="mt-1 text-lg font-semibold text-slate-950">IP allowlist</h2>
        </div>
      </div>

      <div className="flex items-start gap-3 px-5 py-5 text-sm text-slate-600">
        <Info className="mt-0.5 h-4 w-4 flex-shrink-0 text-slate-500" />
        <div>
          <p className="font-semibold text-slate-900">No application-level allowlist is configured.</p>
          <p className="mt-1 leading-6">
            Configure IP restrictions at the hosting, identity-provider, or edge-firewall layer so requests are blocked before the CRM loads.
          </p>
        </div>
      </div>
    </section>
  );
}
