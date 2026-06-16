/*
  # Remove biller_category and biller_account columns

  1. Modified Tables
    - `bill_payments`
      - Removed `biller_category` column
      - Removed `biller_account` column

  2. Notes
    - These fields are no longer used in the bill pay form
    - Existing data in these columns will be lost
*/

ALTER TABLE bill_payments DROP COLUMN IF EXISTS biller_category;
ALTER TABLE bill_payments DROP COLUMN IF EXISTS biller_account;
