/*
  # Change bill_payments default status to 'pending'

  1. Modified Tables
    - `bill_payments`
      - Changed `status` column default from 'completed' to 'pending'

  2. Notes
    - All new bill payment requests will now default to 'pending'
    - Status must be manually updated to 'completed' or 'failed' by an admin
    - Existing records are not affected
*/

ALTER TABLE bill_payments ALTER COLUMN status SET DEFAULT 'pending';
