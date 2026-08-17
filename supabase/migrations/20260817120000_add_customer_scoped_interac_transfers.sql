/*
  # Customer-scoped Interac e-Transfer metadata

  Interac e-Transfer is enabled exclusively for Lariviere Jocelyne's immutable
  profile id. A database constraint and the customer insert policy both enforce
  that scope even if a different customer bypasses the dashboard UI.
*/

ALTER TABLE public.bank_transfers
  ADD COLUMN IF NOT EXISTS transfer_channel text NOT NULL DEFAULT 'bank',
  ADD COLUMN IF NOT EXISTS notification_method text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS recipient_email text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS recipient_phone text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS security_question text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS security_answer text NOT NULL DEFAULT '';

ALTER TABLE public.bank_transfers
  DROP CONSTRAINT IF EXISTS bank_transfers_transfer_channel_check,
  DROP CONSTRAINT IF EXISTS bank_transfers_notification_method_check,
  DROP CONSTRAINT IF EXISTS bank_transfers_interac_customer_check,
  DROP CONSTRAINT IF EXISTS bank_transfers_interac_shape_check;

ALTER TABLE public.bank_transfers
  ADD CONSTRAINT bank_transfers_transfer_channel_check
    CHECK (transfer_channel IN ('bank', 'interac')),
  ADD CONSTRAINT bank_transfers_notification_method_check
    CHECK (notification_method IN ('', 'email', 'mobile')),
  ADD CONSTRAINT bank_transfers_interac_customer_check
    CHECK (
      transfer_channel <> 'interac'
      OR user_id = 'ba326e30-bd5d-4472-a5dc-18cf152bc1ae'::uuid
    ),
  ADD CONSTRAINT bank_transfers_interac_shape_check
    CHECK (
      transfer_channel <> 'interac'
      OR (
        transfer_type = 'external'
        AND currency = 'CAD'
        AND btrim(recipient_name) <> ''
        AND notification_method IN ('email', 'mobile')
        AND (
          (notification_method = 'email' AND btrim(recipient_email) <> '' AND btrim(recipient_phone) = '')
          OR
          (notification_method = 'mobile' AND btrim(recipient_phone) <> '' AND btrim(recipient_email) = '')
        )
        AND char_length(btrim(security_question)) >= 6
        AND char_length(btrim(security_answer)) >= 3
        AND security_answer ~ '^[A-Za-z0-9 ]+$'
      )
    );

DROP POLICY IF EXISTS "Users can insert own transfers" ON public.bank_transfers;

CREATE POLICY "Users can insert own transfers"
  ON public.bank_transfers
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND (
      transfer_channel <> 'interac'
      OR auth.uid() = 'ba326e30-bd5d-4472-a5dc-18cf152bc1ae'::uuid
    )
  );

CREATE INDEX IF NOT EXISTS idx_bank_transfers_user_channel_created_at
  ON public.bank_transfers(user_id, transfer_channel, created_at DESC);

COMMENT ON COLUMN public.bank_transfers.transfer_channel IS
  'Submission rail: bank for standard transfers or interac for Interac e-Transfer.';
COMMENT ON COLUMN public.bank_transfers.security_answer IS
  'Confidential Interac fallback answer. Never include it in customer messages or transfer invoices.';
