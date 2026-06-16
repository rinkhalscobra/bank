/*
  # Drop savings_goals table

  1. Changes
    - Drops the `savings_goals` table entirely as the Savings feature is being removed
  2. Notes
    - Table has 0 rows so no data loss
    - No other tables have foreign key references to savings_goals
    - RLS policies on the table are automatically removed with the table
*/

DROP TABLE IF EXISTS savings_goals;
