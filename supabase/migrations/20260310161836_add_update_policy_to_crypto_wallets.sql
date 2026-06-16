/*
  # Add UPDATE policy to crypto_wallets

  1. Security Changes
    - Add RLS policy allowing authenticated users to update their own wallet addresses
    - Users can only update rows where user_id matches their auth.uid()

  2. Notes
    - Needed so users can set/edit their own wallet receiving addresses
    - Only the wallet_address column is expected to change; user_id and symbol remain fixed
*/

CREATE POLICY "Users can update own wallets"
  ON crypto_wallets
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
