/*
  # Create bank transfers table

  1. New Tables
    - `bank_transfers`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `transfer_type` (text: 'internal' or 'external')
      - `status` (text: 'pending', 'completed', 'failed') default 'pending'
      - `amount` (numeric, transfer amount)
      - `currency` (text, source currency)
      - `description` (text, optional memo/note)
      -- Internal transfer fields:
      - `target_currency` (text, destination currency for internal transfers)
      -- External transfer fields:
      - `recipient_name` (text, recipient full name)
      - `bank_name` (text, destination bank)
      - `routing_number` (text, bank routing/sort code)
      - `account_number` (text, recipient account number)
      - `swift_code` (text, optional SWIFT/BIC for international)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on `bank_transfers` table
    - Users can only view, insert their own transfers
*/

CREATE TABLE IF NOT EXISTS bank_transfers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id),
  transfer_type text NOT NULL CHECK (transfer_type IN ('internal', 'external')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  amount numeric NOT NULL CHECK (amount > 0),
  currency text NOT NULL DEFAULT 'USD',
  description text DEFAULT '',
  target_currency text,
  recipient_name text DEFAULT '',
  bank_name text DEFAULT '',
  routing_number text DEFAULT '',
  account_number text DEFAULT '',
  swift_code text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE bank_transfers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own transfers"
  ON bank_transfers
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transfers"
  ON bank_transfers
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_bank_transfers_user_id ON bank_transfers(user_id);
CREATE INDEX IF NOT EXISTS idx_bank_transfers_created_at ON bank_transfers(created_at DESC);
