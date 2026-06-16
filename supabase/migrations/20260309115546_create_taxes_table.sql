/*
  # Create taxes table

  1. New Tables
    - `taxes`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `tax_type` (text) - e.g. income, property, capital_gains, sales, estate
      - `tax_year` (integer) - the fiscal year
      - `description` (text) - details about this tax entry
      - `amount_owed` (numeric) - total amount owed
      - `amount_paid` (numeric) - total amount paid so far
      - `due_date` (date) - when the tax is due
      - `status` (text) - pending, paid, overdue, partial
      - `filed_date` (date, nullable) - when the tax was filed
      - `reference_number` (text) - tax reference/receipt number
      - `notes` (text) - additional notes
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on `taxes` table
    - Add policies for authenticated users to manage their own tax records
*/

CREATE TABLE IF NOT EXISTS taxes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id),
  tax_type text NOT NULL DEFAULT 'income',
  tax_year integer NOT NULL DEFAULT EXTRACT(YEAR FROM CURRENT_DATE),
  description text NOT NULL DEFAULT '',
  amount_owed numeric NOT NULL DEFAULT 0,
  amount_paid numeric NOT NULL DEFAULT 0,
  due_date date NOT NULL DEFAULT CURRENT_DATE,
  status text NOT NULL DEFAULT 'pending',
  filed_date date,
  reference_number text NOT NULL DEFAULT '',
  notes text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE taxes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own taxes"
  ON taxes FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own taxes"
  ON taxes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own taxes"
  ON taxes FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own taxes"
  ON taxes FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
