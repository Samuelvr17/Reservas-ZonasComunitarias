-- Ensure spaces can require payment and store methods
alter table public.spaces
  add column if not exists requires_payment boolean not null default false,
  add column if not exists payment_methods jsonb not null default '[]'::jsonb;

-- Extend reservations with payment tracking fields
alter table public.reservations
  add column if not exists requires_payment boolean not null default false,
  add column if not exists payment_status text not null default 'not_required',
  add column if not exists payment_proof_url text,
  add column if not exists payment_verified_at timestamptz,
  add column if not exists payment_verified_by uuid references public.profiles(id);

-- Backfill payment status based on existing data
update public.reservations
set payment_status = case
  when coalesce(requires_payment, false) then 'pending'
  else 'not_required'
end
where payment_status is null;

-- Create storage bucket for payment proofs if it does not exist
insert into storage.buckets (id, name, public)
values ('payment-proofs', 'payment-proofs', true)
on conflict (id) do nothing;
