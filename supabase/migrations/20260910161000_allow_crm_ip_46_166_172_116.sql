/* Add 46.166.172.116 as an allowed single IPv4 address without changing enforcement. */

UPDATE public.crm_ip_allowlist_settings AS settings
SET
  allowed_cidrs = CASE
    WHEN '46.166.172.116'::inet <<= ANY(settings.allowed_cidrs)
      THEN settings.allowed_cidrs
    ELSE array_append(settings.allowed_cidrs, '46.166.172.116/32'::cidr)
  END,
  updated_at = now()
WHERE settings.id = 'default';
