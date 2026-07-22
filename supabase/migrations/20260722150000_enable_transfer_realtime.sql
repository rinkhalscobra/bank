/*
  Publish transfer lifecycle changes so CRM status updates appear immediately
  on open customer dashboards.
*/

ALTER TABLE public.bank_transfers REPLICA IDENTITY FULL;
ALTER TABLE public.crypto_transfers REPLICA IDENTITY FULL;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    IF NOT EXISTS (
      SELECT 1
      FROM pg_publication_tables
      WHERE pubname = 'supabase_realtime'
        AND schemaname = 'public'
        AND tablename = 'bank_transfers'
    ) THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.bank_transfers;
    END IF;

    IF NOT EXISTS (
      SELECT 1
      FROM pg_publication_tables
      WHERE pubname = 'supabase_realtime'
        AND schemaname = 'public'
        AND tablename = 'crypto_transfers'
    ) THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.crypto_transfers;
    END IF;
  END IF;
END $$;

