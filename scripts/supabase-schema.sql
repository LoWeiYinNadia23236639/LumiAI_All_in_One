-- LumiAI schema — run once in Supabase Dashboard → SQL Editor
-- Creates: profiles, campaigns, applications, generations, waitlist
-- Plus a trigger that auto-creates a profile on signup.

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role text not null check (role in ('creator', 'brand')),
  name text not null default '',
  follower_count integer not null default 0,
  niche text not null default '',
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.campaigns (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  description text not null default '',
  budget numeric not null default 0,
  status text not null default 'active' check (status in ('draft', 'active', 'paused', 'completed')),
  created_at timestamptz not null default now()
);

create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns (id) on delete cascade,
  creator_id uuid not null references public.profiles (id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'rejected', 'withdrawn')),
  created_at timestamptz not null default now(),
  unique (campaign_id, creator_id)
);

create table if not exists public.generations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  type text not null,
  prompt text not null default '',
  result text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists public.waitlist (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  created_at timestamptz not null default now()
);

-- Auto-create profile on signup (role/name come from signup metadata)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, role, name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'role', 'creator'),
    coalesce(new.raw_user_meta_data ->> 'name', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- RLS
alter table public.profiles enable row level security;
alter table public.campaigns enable row level security;
alter table public.applications enable row level security;
alter table public.generations enable row level security;
alter table public.waitlist enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
security definer set search_path = public
stable
as $$
  select coalesce((select is_admin from public.profiles where id = auth.uid()), false);
$$;

-- profiles: users read their own row; admins read all; users update their own row
create policy "profiles_select_own" on public.profiles
  for select to authenticated using (id = auth.uid() or public.is_admin());
create policy "profiles_update_own" on public.profiles
  for update to authenticated using (id = auth.uid()) with check (id = auth.uid() and is_admin = false);

-- campaigns: anyone authenticated can read (marketplace listing); brand manages own
create policy "campaigns_select" on public.campaigns
  for select to authenticated using (true);
create policy "campaigns_insert_own" on public.campaigns
  for insert to authenticated with check (brand_id = auth.uid());
create policy "campaigns_update_own" on public.campaigns
  for update to authenticated using (brand_id = auth.uid() or public.is_admin());

-- applications: creator sees own, brand sees applications to own campaigns
create policy "applications_select" on public.applications
  for select to authenticated using (
    creator_id = auth.uid()
    or exists (select 1 from public.campaigns c where c.id = campaign_id and c.brand_id = auth.uid())
    or public.is_admin()
  );
create policy "applications_insert_own" on public.applications
  for insert to authenticated with check (creator_id = auth.uid());
create policy "applications_update" on public.applications
  for update to authenticated using (
    creator_id = auth.uid()
    or exists (select 1 from public.campaigns c where c.id = campaign_id and c.brand_id = auth.uid())
    or public.is_admin()
  );

-- generations: users manage their own
create policy "generations_select_own" on public.generations
  for select to authenticated using (user_id = auth.uid() or public.is_admin());
create policy "generations_insert_own" on public.generations
  for insert to authenticated with check (user_id = auth.uid());

-- waitlist: anyone (even logged out) can join; only admins can read
create policy "waitlist_insert" on public.waitlist
  for insert to anon, authenticated with check (true);
create policy "waitlist_select_admin" on public.waitlist
  for select to authenticated using (public.is_admin());
