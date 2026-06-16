/*
  # Default dashboard card applications to pending approval

  1. Changes
    - Update `public.cards.status` default from `active` to `pending_approval`

  2. Safety
    - Existing rows are left unchanged
    - No columns, policies, or triggers are removed
*/

ALTER TABLE public.cards
  ALTER COLUMN status SET DEFAULT 'pending_approval';
