import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

type AppSurface = 'crm_admin' | 'customer_dashboard' | 'authentication' | 'public_site';

function getRequestOrigin(): { surface: AppSurface; path: string } {
  const path = typeof window === 'undefined' ? '/' : window.location.pathname || '/';

  if (path.startsWith('/crm-admin')) return { surface: 'crm_admin', path };
  if (path.startsWith('/dashboard') || path === '/kyc' || path === '/kyc-status') {
    return { surface: 'customer_dashboard', path };
  }
  if (path === '/online-banking') return { surface: 'authentication', path };
  return { surface: 'public_site', path };
}

const fetchWithAuditOrigin: typeof fetch = (input, init) => {
  const headers = new Headers(input instanceof Request ? input.headers : undefined);
  new Headers(init?.headers).forEach((value, key) => headers.set(key, value));
  const { surface, path } = getRequestOrigin();
  const clientInfo = headers.get('x-client-info');
  const safePath = path.replace(/[^a-zA-Z0-9/_-]/g, '').slice(0, 300) || '/';
  const auditContext = `bank-surface=${surface};bank-path=${safePath}`;

  headers.set('x-client-info', clientInfo ? `${clientInfo};${auditContext}` : auditContext);
  return fetch(input, { ...init, headers });
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  global: { fetch: fetchWithAuditOrigin },
});
