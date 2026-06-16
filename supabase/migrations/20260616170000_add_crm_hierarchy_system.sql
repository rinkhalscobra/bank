/*
  # Add CRM hierarchy system

  1. Profiles
    - Adds `crm_role`
    - Adds `assigned_manager_id`
    - Adds `assigned_agent_id`
    - Keeps legacy `is_admin` synced with `crm_role = 'admin'`

  2. Access helpers
    - `current_crm_role()`
    - `is_crm_staff()`
    - `can_manage_profile()`
    - `can_manage_user_scope()`

  3. Policies
    - Lets staff users manage only their visible hierarchy scope
    - Keeps admin users as full-access staff

  4. Trigger protections
    - Only admins can change hierarchy roles and manager assignment
    - Superior managers can assign their own customers to their own agents
    - Agents can manage assigned customers without changing hierarchy

  5. RPC updates
    - Exchange and swap functions accept assigned staff, not only admins
*/

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS crm_role text,
  ADD COLUMN IF NOT EXISTS assigned_manager_id uuid,
  ADD COLUMN IF NOT EXISTS assigned_agent_id uuid;

UPDATE public.profiles
SET crm_role = CASE
  WHEN lower(btrim(COALESCE(crm_role, ''))) IN ('customer', 'agent', 'superior_manager', 'admin') THEN lower(btrim(crm_role))
  WHEN is_admin THEN 'admin'
  ELSE 'customer'
END;

ALTER TABLE public.profiles
  ALTER COLUMN crm_role SET DEFAULT 'customer',
  ALTER COLUMN crm_role SET NOT NULL;

ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_crm_role_check;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_crm_role_check
  CHECK (crm_role IN ('customer', 'agent', 'superior_manager', 'admin'));

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'profiles_assigned_manager_id_fkey'
      AND conrelid = 'public.profiles'::regclass
  ) THEN
    ALTER TABLE public.profiles
      ADD CONSTRAINT profiles_assigned_manager_id_fkey
      FOREIGN KEY (assigned_manager_id)
      REFERENCES public.profiles(id)
      ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'profiles_assigned_agent_id_fkey'
      AND conrelid = 'public.profiles'::regclass
  ) THEN
    ALTER TABLE public.profiles
      ADD CONSTRAINT profiles_assigned_agent_id_fkey
      FOREIGN KEY (assigned_agent_id)
      REFERENCES public.profiles(id)
      ON DELETE SET NULL;
  END IF;
END $$;

UPDATE public.profiles
SET is_admin = (crm_role = 'admin')
WHERE is_admin IS DISTINCT FROM (crm_role = 'admin');

CREATE INDEX IF NOT EXISTS idx_profiles_crm_role ON public.profiles (crm_role);
CREATE INDEX IF NOT EXISTS idx_profiles_assigned_manager_id ON public.profiles (assigned_manager_id);
CREATE INDEX IF NOT EXISTS idx_profiles_assigned_agent_id ON public.profiles (assigned_agent_id);

CREATE OR REPLACE FUNCTION public.get_crm_role(p_user_id uuid)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (
      SELECT CASE
        WHEN lower(btrim(COALESCE(crm_role, ''))) IN ('customer', 'agent', 'superior_manager', 'admin') THEN lower(btrim(crm_role))
        WHEN is_admin THEN 'admin'
        ELSE 'customer'
      END
      FROM public.profiles
      WHERE id = p_user_id
    ),
    'customer'
  );
$$;

CREATE OR REPLACE FUNCTION public.current_crm_role()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.get_crm_role(auth.uid());
$$;

CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.current_crm_role() = 'admin';
$$;

CREATE OR REPLACE FUNCTION public.is_crm_staff()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.current_crm_role() IN ('admin', 'superior_manager', 'agent');
$$;

CREATE OR REPLACE FUNCTION public.can_manage_profile(p_profile_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_actor_id uuid := auth.uid();
  v_actor_role text := public.current_crm_role();
  v_target_role text;
  v_target_manager_id uuid;
  v_target_agent_id uuid;
BEGIN
  IF v_actor_id IS NULL OR p_profile_id IS NULL THEN
    RETURN false;
  END IF;

  IF v_actor_role = 'admin' THEN
    RETURN true;
  END IF;

  IF v_actor_id = p_profile_id THEN
    RETURN v_actor_role IN ('superior_manager', 'agent');
  END IF;

  SELECT
    public.get_crm_role(id),
    assigned_manager_id,
    assigned_agent_id
  INTO
    v_target_role,
    v_target_manager_id,
    v_target_agent_id
  FROM public.profiles
  WHERE id = p_profile_id;

  IF NOT FOUND THEN
    RETURN false;
  END IF;

  IF v_actor_role = 'superior_manager' THEN
    IF v_target_role = 'agent' AND v_target_manager_id = v_actor_id THEN
      RETURN true;
    END IF;

    IF v_target_role = 'customer' THEN
      IF v_target_manager_id = v_actor_id THEN
        RETURN true;
      END IF;

      IF v_target_agent_id IS NOT NULL AND EXISTS (
        SELECT 1
        FROM public.profiles AS agent_profile
        WHERE agent_profile.id = v_target_agent_id
          AND public.get_crm_role(agent_profile.id) = 'agent'
          AND agent_profile.assigned_manager_id = v_actor_id
      ) THEN
        RETURN true;
      END IF;
    END IF;

    RETURN false;
  END IF;

  IF v_actor_role = 'agent' THEN
    RETURN v_target_role = 'customer' AND v_target_agent_id = v_actor_id;
  END IF;

  RETURN false;
END;
$$;

CREATE OR REPLACE FUNCTION public.can_manage_user_scope(p_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE
    WHEN auth.uid() IS NULL OR p_user_id IS NULL THEN false
    WHEN auth.uid() = p_user_id THEN true
    ELSE public.can_manage_profile(p_user_id)
  END;
$$;

GRANT EXECUTE ON FUNCTION public.get_crm_role(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.current_crm_role() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin_user() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_crm_staff() TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_manage_profile(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_manage_user_scope(uuid) TO authenticated;

CREATE OR REPLACE FUNCTION public.secure_profile_privileged_fields()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_actor_role text := public.current_crm_role();
  v_assigned_agent_manager_id uuid;
BEGIN
  NEW.crm_role := CASE
    WHEN lower(btrim(COALESCE(NEW.crm_role, ''))) IN ('customer', 'agent', 'superior_manager', 'admin') THEN lower(btrim(NEW.crm_role))
    WHEN COALESCE(NEW.is_admin, false) THEN 'admin'
    ELSE 'customer'
  END;

  IF auth.role() IS NULL OR auth.role() = 'service_role' THEN
    NULL;
  ELSIF TG_OP = 'INSERT' THEN
    IF v_actor_role <> 'admin' THEN
      NEW.crm_role := 'customer';
      NEW.is_admin := false;
      NEW.kyc_status := 'pending';
      NEW.account_iban := '';
      NEW.assigned_manager_id := null;
      NEW.assigned_agent_id := null;
    END IF;
  ELSIF v_actor_role = 'admin' THEN
    NULL;
  ELSIF v_actor_role = 'superior_manager' THEN
    NEW.id := OLD.id;
    NEW.created_at := OLD.created_at;
    NEW.crm_role := OLD.crm_role;
    NEW.is_admin := OLD.is_admin;
    NEW.assigned_manager_id := OLD.assigned_manager_id;

    IF OLD.crm_role <> 'customer' THEN
      NEW.assigned_agent_id := OLD.assigned_agent_id;
    ELSIF NEW.assigned_agent_id IS DISTINCT FROM OLD.assigned_agent_id AND NEW.assigned_agent_id IS NOT NULL THEN
      IF NOT EXISTS (
        SELECT 1
        FROM public.profiles AS agent_profile
        WHERE agent_profile.id = NEW.assigned_agent_id
          AND public.get_crm_role(agent_profile.id) = 'agent'
          AND agent_profile.assigned_manager_id = auth.uid()
      ) THEN
        RAISE EXCEPTION 'Superior managers can assign only their own agents';
      END IF;
    END IF;
  ELSIF v_actor_role = 'agent' THEN
    NEW.id := OLD.id;
    NEW.created_at := OLD.created_at;
    NEW.crm_role := OLD.crm_role;
    NEW.is_admin := OLD.is_admin;
    NEW.assigned_manager_id := OLD.assigned_manager_id;
    NEW.assigned_agent_id := OLD.assigned_agent_id;
  ELSE
    NEW.id := OLD.id;
    NEW.created_at := OLD.created_at;
    NEW.crm_role := OLD.crm_role;
    NEW.is_admin := OLD.is_admin;
    NEW.kyc_status := OLD.kyc_status;
    NEW.account_iban := OLD.account_iban;
    NEW.assigned_manager_id := OLD.assigned_manager_id;
    NEW.assigned_agent_id := OLD.assigned_agent_id;
  END IF;

  IF NEW.id = NEW.assigned_manager_id OR NEW.id = NEW.assigned_agent_id THEN
    RAISE EXCEPTION 'Profiles cannot be assigned to themselves';
  END IF;

  IF NEW.crm_role IN ('admin', 'superior_manager') THEN
    NEW.assigned_manager_id := null;
    NEW.assigned_agent_id := null;
  ELSIF NEW.crm_role = 'agent' THEN
    NEW.assigned_agent_id := null;

    IF NEW.assigned_manager_id IS NOT NULL
      AND public.get_crm_role(NEW.assigned_manager_id) <> 'superior_manager' THEN
      RAISE EXCEPTION 'Agents can be assigned only to superior managers';
    END IF;
  ELSE
    IF NEW.assigned_manager_id IS NOT NULL
      AND public.get_crm_role(NEW.assigned_manager_id) <> 'superior_manager' THEN
      RAISE EXCEPTION 'Customers can be assigned only to superior managers';
    END IF;

    IF NEW.assigned_agent_id IS NOT NULL THEN
      SELECT assigned_manager_id
      INTO v_assigned_agent_manager_id
      FROM public.profiles
      WHERE id = NEW.assigned_agent_id
        AND public.get_crm_role(id) = 'agent';

      IF NOT FOUND THEN
        RAISE EXCEPTION 'Assigned agent must have the agent role';
      END IF;

      IF NEW.assigned_manager_id IS NULL THEN
        NEW.assigned_manager_id := v_assigned_agent_manager_id;
      ELSIF v_assigned_agent_manager_id IS NOT NULL
        AND NEW.assigned_manager_id <> v_assigned_agent_manager_id THEN
        RAISE EXCEPTION 'Assigned agent belongs to a different superior manager';
      END IF;
    END IF;
  END IF;

  NEW.is_admin := (NEW.crm_role = 'admin');
  NEW.updated_at := now();

  RETURN NEW;
END;
$$;

DO $$
DECLARE
  scoped_table text;
  scoped_tables text[] := ARRAY[
    'accounts',
    'transactions',
    'transfers',
    'beneficiaries',
    'kyc_submissions',
    'crypto_balances',
    'cards',
    'bill_payments',
    'fixed_deposits',
    'currency_exchanges',
    'loans',
    'scheduled_transfers',
    'fiat_balances',
    'crypto_transactions',
    'crypto_wallets',
    'crypto_transfers',
    'taxes',
    'tax_wallet_addresses',
    'bank_transfers',
    'crypto_deposits',
    'balance_snapshots',
    'tax_summary_cards',
    'savings_goals',
    'staking_positions'
  ];
BEGIN
  EXECUTE 'DROP POLICY IF EXISTS "Staff can view managed profiles" ON public.profiles';
  EXECUTE 'DROP POLICY IF EXISTS "Staff can update managed profiles" ON public.profiles';

  EXECUTE '
    CREATE POLICY "Staff can view managed profiles"
    ON public.profiles
    FOR SELECT
    TO authenticated
    USING (public.is_crm_staff() AND public.can_manage_profile(id))
  ';

  EXECUTE '
    CREATE POLICY "Staff can update managed profiles"
    ON public.profiles
    FOR UPDATE
    TO authenticated
    USING (public.is_crm_staff() AND public.can_manage_profile(id))
    WITH CHECK (public.is_crm_staff() AND public.can_manage_profile(id))
  ';

  FOREACH scoped_table IN ARRAY scoped_tables LOOP
    IF EXISTS (
      SELECT 1
      FROM pg_tables
      WHERE schemaname = 'public'
        AND tablename = scoped_table
    ) THEN
      EXECUTE format('DROP POLICY IF EXISTS "Staff can view managed rows" ON public.%I', scoped_table);
      EXECUTE format('DROP POLICY IF EXISTS "Staff can update managed rows" ON public.%I', scoped_table);
      EXECUTE format('DROP POLICY IF EXISTS "Staff can insert managed rows" ON public.%I', scoped_table);
      EXECUTE format('DROP POLICY IF EXISTS "Staff can delete managed rows" ON public.%I', scoped_table);

      EXECUTE format(
        'CREATE POLICY "Staff can view managed rows" ON public.%I FOR SELECT TO authenticated USING (public.is_crm_staff() AND public.can_manage_user_scope(user_id))',
        scoped_table
      );

      EXECUTE format(
        'CREATE POLICY "Staff can update managed rows" ON public.%I FOR UPDATE TO authenticated USING (public.is_crm_staff() AND public.can_manage_user_scope(user_id)) WITH CHECK (public.is_crm_staff() AND public.can_manage_user_scope(user_id))',
        scoped_table
      );

      EXECUTE format(
        'CREATE POLICY "Staff can insert managed rows" ON public.%I FOR INSERT TO authenticated WITH CHECK (public.is_crm_staff() AND public.can_manage_user_scope(user_id))',
        scoped_table
      );

      EXECUTE format(
        'CREATE POLICY "Staff can delete managed rows" ON public.%I FOR DELETE TO authenticated USING (public.is_crm_staff() AND public.can_manage_user_scope(user_id))',
        scoped_table
      );
    END IF;
  END LOOP;
END $$;

CREATE OR REPLACE FUNCTION public.execute_currency_exchange(
  p_user_id uuid,
  p_from_currency text,
  p_to_currency text,
  p_from_amount numeric,
  p_to_amount numeric,
  p_exchange_rate numeric,
  p_fee numeric
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current_balance numeric;
  v_source_status text;
  v_target_status text;
  v_exchange_id uuid;
BEGIN
  IF NOT public.can_manage_user_scope(p_user_id) THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  IF p_from_currency = p_to_currency THEN
    RAISE EXCEPTION 'Source and destination currencies must differ';
  END IF;

  IF p_from_amount <= 0 THEN
    RAISE EXCEPTION 'Amount must be positive';
  END IF;

  SELECT balance, status
  INTO v_current_balance, v_source_status
  FROM public.fiat_balances
  WHERE user_id = p_user_id AND currency = p_from_currency
  FOR UPDATE;

  IF v_current_balance IS NULL THEN
    RAISE EXCEPTION 'Source currency balance not found';
  END IF;

  IF COALESCE(v_source_status, 'available') <> 'available' THEN
    RAISE EXCEPTION 'Source currency balance is % and cannot be exchanged', v_source_status;
  END IF;

  SELECT status
  INTO v_target_status
  FROM public.fiat_balances
  WHERE user_id = p_user_id AND currency = p_to_currency
  FOR UPDATE;

  IF v_target_status IS NOT NULL AND v_target_status <> 'available' THEN
    RAISE EXCEPTION 'Destination currency balance is % and cannot receive exchanged funds', v_target_status;
  END IF;

  IF v_current_balance < p_from_amount THEN
    RAISE EXCEPTION 'Insufficient balance. Available: %', v_current_balance;
  END IF;

  UPDATE public.fiat_balances
  SET balance = balance - p_from_amount
  WHERE user_id = p_user_id AND currency = p_from_currency;

  UPDATE public.fiat_balances
  SET balance = balance + p_to_amount
  WHERE user_id = p_user_id AND currency = p_to_currency;

  IF NOT FOUND THEN
    INSERT INTO public.fiat_balances (user_id, currency, balance, status)
    VALUES (p_user_id, p_to_currency, p_to_amount, 'available');
  END IF;

  INSERT INTO public.currency_exchanges (user_id, from_currency, to_currency, from_amount, to_amount, exchange_rate, fee, status)
  VALUES (p_user_id, p_from_currency, p_to_currency, p_from_amount, p_to_amount, p_exchange_rate, p_fee, 'completed')
  RETURNING id INTO v_exchange_id;

  RETURN v_exchange_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.execute_crypto_swap(
  p_user_id uuid,
  p_from_symbol text,
  p_to_symbol text,
  p_from_amount numeric,
  p_to_amount numeric,
  p_from_price_usd numeric,
  p_to_price_usd numeric,
  p_fee_usd numeric
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current_balance numeric;
  v_source_status text;
  v_target_status text;
  v_tx_id uuid;
  v_from_name text;
  v_to_name text;
  v_total_value numeric;
BEGIN
  IF NOT public.can_manage_user_scope(p_user_id) THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  IF p_from_symbol = p_to_symbol THEN
    RAISE EXCEPTION 'Source and destination must differ';
  END IF;

  IF p_from_amount <= 0 THEN
    RAISE EXCEPTION 'Amount must be positive';
  END IF;

  SELECT balance, name, status
  INTO v_current_balance, v_from_name, v_source_status
  FROM public.crypto_balances
  WHERE user_id = p_user_id AND symbol = p_from_symbol
  FOR UPDATE;

  IF v_current_balance IS NULL THEN
    RAISE EXCEPTION 'Source crypto balance not found';
  END IF;

  IF COALESCE(v_source_status, 'available') <> 'available' THEN
    RAISE EXCEPTION 'Source crypto balance is % and cannot be swapped', v_source_status;
  END IF;

  SELECT name, status
  INTO v_to_name, v_target_status
  FROM public.crypto_balances
  WHERE user_id = p_user_id AND symbol = p_to_symbol
  FOR UPDATE;

  IF v_target_status IS NOT NULL AND v_target_status <> 'available' THEN
    RAISE EXCEPTION 'Destination crypto balance is % and cannot receive swapped funds', v_target_status;
  END IF;

  IF v_current_balance < p_from_amount THEN
    RAISE EXCEPTION 'Insufficient balance. Available: %', v_current_balance;
  END IF;

  v_total_value := p_from_amount * p_from_price_usd;

  UPDATE public.crypto_balances
  SET balance = balance - p_from_amount
  WHERE user_id = p_user_id AND symbol = p_from_symbol;

  UPDATE public.crypto_balances
  SET balance = balance + p_to_amount
  WHERE user_id = p_user_id AND symbol = p_to_symbol;

  IF NOT FOUND THEN
    INSERT INTO public.crypto_balances (user_id, symbol, name, balance, status)
    VALUES (p_user_id, p_to_symbol, COALESCE(v_to_name, p_to_symbol), p_to_amount, 'available');
  END IF;

  INSERT INTO public.crypto_transactions (
    user_id, type, symbol, name, amount, price_per_unit,
    total_value, fee, from_symbol, to_symbol, status, description
  )
  VALUES (
    p_user_id, 'swap', p_from_symbol, v_from_name, p_from_amount, p_from_price_usd,
    v_total_value, p_fee_usd, p_from_symbol, p_to_symbol, 'completed',
    'Swap ' || p_from_amount || ' ' || p_from_symbol || ' to ' || round(p_to_amount, 8) || ' ' || p_to_symbol
  )
  RETURNING id INTO v_tx_id;

  RETURN v_tx_id;
END;
$$;
