/*
  # Fix handle_new_user trigger function

  1. Changes
    - Recreate the `handle_new_user` function with explicit `search_path` set
    - Use fully-qualified table names (public.profiles, public.accounts, public.transactions)
    - This fixes "Database error saving new user" caused by SECURITY DEFINER
      functions not resolving table names correctly without a search_path

  2. Important Notes
    - No data changes, only function definition update
    - The trigger binding remains unchanged
*/

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  checking_id uuid := gen_random_uuid();
  savings_id uuid := gen_random_uuid();
  checking_num text;
  savings_num text;
BEGIN
  checking_num := '4821' || lpad(floor(random() * 100000000)::text, 8, '0');
  savings_num := '7392' || lpad(floor(random() * 100000000)::text, 8, '0');

  INSERT INTO public.profiles (id, full_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.email, '')
  );

  INSERT INTO public.accounts (id, user_id, account_name, account_type, account_number, balance)
  VALUES
    (checking_id, NEW.id, 'Primary Checking', 'checking', checking_num, 5240.75),
    (savings_id, NEW.id, 'Savings Account', 'savings', savings_num, 12850.00);

  INSERT INTO public.transactions (account_id, user_id, type, category, description, amount, balance_after, reference_number, created_at)
  VALUES
    (checking_id, NEW.id, 'credit', 'deposit', 'Initial Deposit', 5000.00, 5000.00, 'TXN' || lpad(floor(random() * 1000000)::text, 6, '0'), now() - interval '30 days'),
    (checking_id, NEW.id, 'debit', 'utilities', 'Electric Company Payment', 145.50, 4854.50, 'TXN' || lpad(floor(random() * 1000000)::text, 6, '0'), now() - interval '25 days'),
    (checking_id, NEW.id, 'debit', 'dining', 'Restaurant - The Italian Place', 67.80, 4786.70, 'TXN' || lpad(floor(random() * 1000000)::text, 6, '0'), now() - interval '20 days'),
    (checking_id, NEW.id, 'credit', 'income', 'Payroll Deposit', 3200.00, 7986.70, 'TXN' || lpad(floor(random() * 1000000)::text, 6, '0'), now() - interval '15 days'),
    (checking_id, NEW.id, 'debit', 'shopping', 'Online Shopping - Electronics', 299.95, 7686.75, 'TXN' || lpad(floor(random() * 1000000)::text, 6, '0'), now() - interval '10 days'),
    (checking_id, NEW.id, 'debit', 'groceries', 'Grocery Store', 156.00, 7530.75, 'TXN' || lpad(floor(random() * 1000000)::text, 6, '0'), now() - interval '7 days'),
    (checking_id, NEW.id, 'debit', 'transport', 'Gas Station', 45.00, 7485.75, 'TXN' || lpad(floor(random() * 1000000)::text, 6, '0'), now() - interval '5 days'),
    (checking_id, NEW.id, 'debit', 'subscription', 'Streaming Service', 15.99, 7469.76, 'TXN' || lpad(floor(random() * 1000000)::text, 6, '0'), now() - interval '3 days'),
    (checking_id, NEW.id, 'credit', 'transfer', 'Transfer from Savings', 1200.00, 8669.76, 'TXN' || lpad(floor(random() * 1000000)::text, 6, '0'), now() - interval '2 days'),
    (checking_id, NEW.id, 'debit', 'bills', 'Insurance Premium', 3429.01, 5240.75, 'TXN' || lpad(floor(random() * 1000000)::text, 6, '0'), now() - interval '1 day'),
    (savings_id, NEW.id, 'credit', 'deposit', 'Initial Savings Deposit', 15000.00, 15000.00, 'TXN' || lpad(floor(random() * 1000000)::text, 6, '0'), now() - interval '30 days'),
    (savings_id, NEW.id, 'credit', 'interest', 'Monthly Interest', 50.00, 15050.00, 'TXN' || lpad(floor(random() * 1000000)::text, 6, '0'), now() - interval '15 days'),
    (savings_id, NEW.id, 'debit', 'transfer', 'Transfer to Checking', 1200.00, 13850.00, 'TXN' || lpad(floor(random() * 1000000)::text, 6, '0'), now() - interval '2 days'),
    (savings_id, NEW.id, 'debit', 'withdrawal', 'ATM Withdrawal', 1000.00, 12850.00, 'TXN' || lpad(floor(random() * 1000000)::text, 6, '0'), now() - interval '1 day');

  RETURN NEW;
END;
$$;