/*
  Include the complete previous balance row in realtime update/delete events so
  user-scoped subscriptions can refresh after CRM edits and removals.
*/

ALTER TABLE public.fiat_balances REPLICA IDENTITY FULL;
ALTER TABLE public.crypto_balances REPLICA IDENTITY FULL;

