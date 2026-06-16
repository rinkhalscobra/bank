/*
  # Drop beneficiaries table and remove references

  1. Changes
    - Removes `beneficiary_id` column from `scheduled_transfers` table
      (this also drops the foreign key constraint automatically)
    - Drops the `beneficiaries` table entirely
  2. Notes
    - The beneficiaries feature is being fully removed from the application
    - The `beneficiary_id` column in `scheduled_transfers` had only 0 rows of data
    - The `beneficiaries` table had 1 row of data which will be lost
*/

ALTER TABLE IF EXISTS scheduled_transfers
  DROP COLUMN IF EXISTS beneficiary_id;

DROP TABLE IF EXISTS beneficiaries;
