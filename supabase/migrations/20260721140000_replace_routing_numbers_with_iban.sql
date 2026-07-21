/*
  # Replace routing number fields with IBAN

  Renames the existing columns so deployed environments keep their transfer and
  bill-payment data while the application moves to IBAN terminology.
*/

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'bank_transfers'
      AND column_name = 'routing_number'
  ) AND NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'bank_transfers'
      AND column_name = 'iban'
  ) THEN
    ALTER TABLE public.bank_transfers RENAME COLUMN routing_number TO iban;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'bill_payments'
      AND column_name = 'bank_routing_number'
  ) AND NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'bill_payments'
      AND column_name = 'bank_iban'
  ) THEN
    ALTER TABLE public.bill_payments RENAME COLUMN bank_routing_number TO bank_iban;
  END IF;
END $$;

COMMENT ON COLUMN public.bank_transfers.iban IS
  'Recipient IBAN for external bank transfers.';

COMMENT ON COLUMN public.bill_payments.bank_iban IS
  'Recipient IBAN for bank bill payments.';
