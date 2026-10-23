-- Marketplace v1 — four collaboration models + profile enrichment + RLS fixes
-- Run once in Supabase Dashboard → SQL Editor (after supabase-schema.sql).

-- ============ 1. Backfill columns missing from the repo schema ============
alter table public.campaigns add column if not exists requirements text;
alter table public.campaigns add column if not exists deliverables text;
alter table public.campaigns add column if not exists deadline date;
alter table public.campaigns add column if not exists niche text;
alter table public.applications add column if not exists message text;

-- ============ 2. campaigns: collaboration type + per-type fields ============
alter table public.campaigns add column if not exists campaign_type text not null default 'paid';
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'campaigns_campaign_type_check') then
    alter table public.campaigns
      add constraint campaigns_campaign_type_check
      check (campaign_type in ('paid', 'barter', 'affiliate', 'ambassador'));
  end if;
end $$;

-- barter (product seeding)
alter table public.campaigns add column if not exists product_name text;
alter table public.campaigns add column if not exists product_value numeric not null default 0;
-- affiliate
alter table public.campaigns add column if not exists commission_rate numeric;
alter table public.campaigns add column if not exists discount_code text;
alter table public.campaigns add column if not exists shop_url text;
-- ambassador
alter table public.campaigns add column if not exists contract_months integer;
alter table public.campaigns add column if not exists retainer_fee numeric;
alter table public.campaigns add column if not exists exclusivity boolean not null default false;
alter table public.campaigns add column if not exists starts_on date;
alter table public.campaigns add column if not exists ends_on date;
-- shared contract knobs
alter table public.campaigns add column if not exists terms text;
alter table public.campaigns add column if not exists usage_rights_months integer not null default 3;
alter table public.campaigns add column if not exists review_rounds integer not null default 2;

-- ============ 3. applications: offers + barter shipping ============
alter table public.applications add column if not exists offer boolean not null default false;
alter table public.applications add column if not exists offered_price numeric;
alter table public.applications add column if not exists shipping_address text;
alter table public.applications add column if not exists tracking_number text;
alter table public.applications add column if not exists shipping_status text not null default 'pending';
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'applications_shipping_status_check') then
    alter table public.applications
      add constraint applications_shipping_status_check
      check (shipping_status in ('pending', 'shipped', 'received'));
  end if;
end $$;

-- ============ 4. profiles: creator enrichment ============
alter table public.profiles add column if not exists bio text;
alter table public.profiles add column if not exists avatar_url text;
alter table public.profiles add column if not exists location text;
alter table public.profiles add column if not exists rate_min numeric;
alter table public.profiles add column if not exists rate_max numeric;
alter table public.profiles add column if not exists platforms jsonb not null default '[]'::jsonb;
alter table public.profiles add column if not exists portfolio_urls jsonb not null default '[]'::jsonb;

-- ============ 5. RLS fixes ============
-- 5a. applications: split brand/creator update policies (fixes creator self-accept)
drop policy if exists "applications_update" on public.applications;
create policy "applications_update_brand" on public.applications
  for update to authenticated using (
    exists (select 1 from public.campaigns c where c.id = campaign_id and c.brand_id = auth.uid())
    or public.is_admin()
  ) with check (
    exists (select 1 from public.campaigns c where c.id = campaign_id and c.brand_id = auth.uid())
    or public.is_admin()
  );
-- creator may only withdraw (status = 'withdrawn'); everything else goes through server routes
create policy "applications_update_creator" on public.applications
  for update to authenticated using (creator_id = auth.uid())
  with check (creator_id = auth.uid() and status = 'withdrawn');

-- 5b. campaigns: only brands can create campaigns
drop policy if exists "campaigns_insert_own" on public.campaigns;
create policy "campaigns_insert_own" on public.campaigns
  for insert to authenticated with check (
    brand_id = auth.uid()
    and exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'brand')
  );

-- 5c. profiles: public read (talent marketplace); profiles holds no email/PII beyond name
drop policy if exists "profiles_select_public" on public.profiles;
create policy "profiles_select_public" on public.profiles
  for select to authenticated using (true);
