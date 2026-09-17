-- LumiAI Phase 4 — Gear Renting schema
-- Creates: gears, rental_requests + RLS policies
-- Run once in Supabase Dashboard → SQL Editor

create table if not exists public.gears (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  category text not null default 'camera' check (category in ('camera', 'lighting', 'audio', 'drone', 'accessory')),
  price_per_day numeric not null default 0 check (price_per_day >= 0),
  deposit numeric check (deposit >= 0),
  description text not null default '',
  location text not null default '',
  includes text[] not null default '{}',
  condition text not null default '',
  status text not null default 'available' check (status in ('available', 'rented', 'unlisted')),
  created_at timestamptz not null default now()
);

create table if not exists public.rental_requests (
  id uuid primary key default gen_random_uuid(),
  gear_id uuid not null references public.gears (id) on delete cascade,
  renter_id uuid not null references public.profiles (id) on delete cascade,
  owner_id uuid not null references public.profiles (id) on delete cascade,
  start_date date not null,
  end_date date not null,
  message text,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'rejected', 'completed', 'returned')),
  created_at timestamptz not null default now(),
  check (end_date >= start_date)
);

-- Indexes
create index if not exists gears_owner_idx on public.gears (owner_id);
create index if not exists gears_status_idx on public.gears (status);
create index if not exists rental_requests_gear_idx on public.rental_requests (gear_id);
create index if not exists rental_requests_renter_idx on public.rental_requests (renter_id);
create index if not exists rental_requests_owner_idx on public.rental_requests (owner_id);

-- RLS
alter table public.gears enable row level security;
alter table public.rental_requests enable row level security;

-- gears: everyone can read listed gears (owner sees own regardless)
create policy gears_select_all
  on public.gears for select
  using (true);

-- gears: any logged-in user can list gear (owner_id enforced by WITH CHECK)
create policy gears_insert_own
  on public.gears for insert
  with check (owner_id = auth.uid());

-- gears: only owner updates own gear
create policy gears_update_own
  on public.gears for update
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

-- gears: only owner deletes own gear
create policy gears_delete_own
  on public.gears for delete
  using (owner_id = auth.uid());

-- rental_requests: renter and owner can read their own records
create policy rentals_select_own
  on public.rental_requests for select
  using (renter_id = auth.uid() or owner_id = auth.uid());

-- rental_requests: logged-in user inserts as themselves (owner_id must match the gear's real owner)
create policy rentals_insert_renter
  on public.rental_requests for insert
  with check (
    renter_id = auth.uid()
    and owner_id = (select owner_id from public.gears where id = gear_id)
  );

-- rental_requests: only owner can update status
create policy rentals_update_owner
  on public.rental_requests for update
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());
