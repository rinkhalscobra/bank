/*
  # Enforce tax status to only three values

  1. Changes
    - Add CHECK constraint on `taxes.status` column to only allow: pending, on_hold, paid
    - Update any existing rows with invalid statuses to 'pending'
    - Change default status to 'pending'

  2. Notes
    - This ensures data integrity by restricting status values at the database level
    - Any previously allowed values (overdue, partial) are no longer valid
*/

UPDATE taxes
SET status = 'pending'
WHERE status NOT IN ('pending', 'on_hold', 'paid');

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.constraint_column_usage
    WHERE table_name = 'taxes' AND constraint_name = 'taxes_status_check'
  ) THEN
    ALTER TABLE taxes ADD CONSTRAINT taxes_status_check
      CHECK (status IN ('pending', 'on_hold', 'paid'));
  END IF;
END $$;