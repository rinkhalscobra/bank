/*
  # Ensure IBAN columns exist and refresh the PostgREST schema cache

  Handles databases where the earlier rename migration was not applied or
  where both the legacy and current columns temporarily coexist.
*/

DO $$
BEGIN
  IF to_regclass('public.bank_transfers') IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'bank_transfers'
        AND column_name = 'iban'
    ) THEN
      ALTER TABLE public.bank_transfers
        ADD COLUMN iban text DEFAULT '';
    END IF;

    IF EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'bank_transfers'
        AND column_name = 'routing_number'
    ) THEN
      UPDATE public.bank_transfers
      SET iban = routing_number
      WHERE COALESCE(iban, '') = ''
        AND COALESCE(routing_number, '') <> '';
    END IF;
  END IF;

  IF to_regclass('public.bill_payments') IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'bill_payments'
        AND column_name = 'bank_iban'
    ) THEN
      ALTER TABLE public.bill_payments
        ADD COLUMN bank_iban text DEFAULT '';
    END IF;

    IF EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'bill_payments'
        AND column_name = 'bank_routing_number'
    ) THEN
      UPDATE public.bill_payments
      SET bank_iban = bank_routing_number
      WHERE COALESCE(bank_iban, '') = ''
        AND COALESCE(bank_routing_number, '') <> '';
    END IF;
  END IF;
END $$;

COMMENT ON COLUMN public.bank_transfers.iban IS
  'Recipient IBAN for external bank transfers.';

COMMENT ON COLUMN public.bill_payments.bank_iban IS
  'Recipient IBAN for bank bill payments.';

NOTIFY pgrst, 'reload schema';
