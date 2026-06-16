/*
  # Remove Crypto Tables

  1. Removed Tables
    - `staking_positions` - stored user staking positions
    - `crypto_transactions` - stored crypto buy/sell/swap transactions
    - `crypto_balances` - stored user cryptocurrency balances

  2. Security
    - All associated RLS policies are removed with the tables

  3. Notes
    - Foreign key constraints referencing these tables are dropped automatically
    - No other tables depend on these three tables
*/

DROP TABLE IF EXISTS staking_positions;
DROP TABLE IF EXISTS crypto_transactions;
DROP TABLE IF EXISTS crypto_balances;
