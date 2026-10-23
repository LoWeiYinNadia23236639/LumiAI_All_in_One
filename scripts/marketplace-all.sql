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

-- Marketplace v2 — contracts, submissions, notifications, direct messages
-- Run once in Supabase Dashboard → SQL Editor (after marketplace-v1.sql).
-- Write model: all status transitions happen via server routes (service role);
-- clients read through RLS and only insert plain content (messages, reviews in v3).

create table if not exists public.contracts (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns (id) on delete cascade,
  creator_id uuid not null references public.profiles (id) on delete cascade,
  brand_id uuid not null references public.profiles (id) on delete cascade,
  terms text not null default '',
  status text not null default 'draft' check (status in ('draft', 'agreed', 'completed', 'cancelled')),
  brand_agreed_at timestamptz,
  creator_agreed_at timestamptz,
  created_at timestamptz not null default now(),
  unique (campaign_id, creator_id)
);

create table if not exists public.submissions (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns (id) on delete cascade,
  creator_id uuid not null references public.profiles (id) on delete cascade,
  post_url text not null,
  note text not null default '',
  status text not null default 'submitted' check (status in ('submitted', 'approved', 'revision')),
  brand_feedback text,
  created_at timestamptz not null default now()
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  type text not null,
  payload jsonb not null default '{}'::jsonb,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns (id) on delete cascade,
  brand_id uuid not null references public.profiles (id) on delete cascade,
  creator_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (campaign_id, creator_id)
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  sender_id uuid not null references public.profiles (id) on delete cascade,
  body text not null,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

-- RLS
alter table public.contracts enable row level security;
alter table public.submissions enable row level security;
alter table public.notifications enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;

-- contracts: participants read; writes via server routes only
drop policy if exists "contracts_select" on public.contracts;
create policy "contracts_select" on public.contracts
  for select to authenticated using (
    creator_id = auth.uid() or brand_id = auth.uid() or public.is_admin()
  );

-- submissions: participants read; writes via server routes only
drop policy if exists "submissions_select" on public.submissions;
create policy "submissions_select" on public.submissions
  for select to authenticated using (
    creator_id = auth.uid()
    or exists (select 1 from public.campaigns c where c.id = campaign_id and c.brand_id = auth.uid())
    or public.is_admin()
  );

-- notifications: owner reads; writes via server routes only
drop policy if exists "notifications_select_own" on public.notifications;
create policy "notifications_select_own" on public.notifications
  for select to authenticated using (user_id = auth.uid() or public.is_admin());

-- conversations: participants read; creation via server route
drop policy if exists "conversations_select" on public.conversations;
create policy "conversations_select" on public.conversations
  for select to authenticated using (
    creator_id = auth.uid() or brand_id = auth.uid() or public.is_admin()
  );

-- messages: participants read and send
drop policy if exists "messages_select" on public.messages;
create policy "messages_select" on public.messages
  for select to authenticated using (
    exists (
      select 1 from public.conversations cv
      where cv.id = conversation_id
        and (cv.creator_id = auth.uid() or cv.brand_id = auth.uid())
    )
    or public.is_admin()
  );
drop policy if exists "messages_insert" on public.messages;
create policy "messages_insert" on public.messages
  for insert to authenticated with check (
    sender_id = auth.uid()
    and exists (
      select 1 from public.conversations cv
      where cv.id = conversation_id
        and (cv.creator_id = auth.uid() or cv.brand_id = auth.uid())
    )
  );

-- Marketplace v3 — payment ledger, affiliate sales, reviews
-- Run once in Supabase Dashboard → SQL Editor (after marketplace-v2.sql).
-- Payments are record-tracking only (no real money movement):
-- pending → brand marks paid → creator confirms received.

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns (id) on delete cascade,
  creator_id uuid not null references public.profiles (id) on delete cascade,
  amount numeric not null default 0,
  kind text not null check (kind in ('campaign_fee', 'retainer', 'commission', 'barter_value')),
  status text not null default 'pending' check (status in ('pending', 'paid', 'confirmed')),
  paid_at timestamptz,
  confirmed_at timestamptz,
  note text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists public.affiliate_sales (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns (id) on delete cascade,
  creator_id uuid not null references public.profiles (id) on delete cascade,
  period text not null, -- 'YYYY-MM'
  units integer not null default 0,
  revenue numeric not null default 0,
  created_at timestamptz not null default now(),
  unique (campaign_id, creator_id, period)
);

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns (id) on delete cascade,
  reviewer_id uuid not null references public.profiles (id) on delete cascade,
  reviewee_id uuid not null references public.profiles (id) on delete cascade,
  rating integer not null check (rating between 1 and 5),
  comment text not null default '',
  created_at timestamptz not null default now(),
  unique (campaign_id, reviewer_id)
);

-- RLS
alter table public.payments enable row level security;
alter table public.affiliate_sales enable row level security;
alter table public.reviews enable row level security;

-- payments: creator sees own, brand sees payments for own campaigns; transitions via server routes
drop policy if exists "payments_select" on public.payments;
create policy "payments_select" on public.payments
  for select to authenticated using (
    creator_id = auth.uid()
    or exists (select 1 from public.campaigns c where c.id = campaign_id and c.brand_id = auth.uid())
    or public.is_admin()
  );

-- affiliate_sales: brand reports, both sides read
drop policy if exists "affiliate_sales_select" on public.affiliate_sales;
create policy "affiliate_sales_select" on public.affiliate_sales
  for select to authenticated using (
    creator_id = auth.uid()
    or exists (select 1 from public.campaigns c where c.id = campaign_id and c.brand_id = auth.uid())
    or public.is_admin()
  );
drop policy if exists "affiliate_sales_insert_brand" on public.affiliate_sales;
create policy "affiliate_sales_insert_brand" on public.affiliate_sales
  for insert to authenticated with check (
    exists (select 1 from public.campaigns c where c.id = campaign_id and c.brand_id = auth.uid())
    or public.is_admin()
  );
drop policy if exists "affiliate_sales_update_brand" on public.affiliate_sales;
create policy "affiliate_sales_update_brand" on public.affiliate_sales
  for update to authenticated using (
    exists (select 1 from public.campaigns c where c.id = campaign_id and c.brand_id = auth.uid())
    or public.is_admin()
  ) with check (
    exists (select 1 from public.campaigns c where c.id = campaign_id and c.brand_id = auth.uid())
    or public.is_admin()
  );

-- reviews: public read; any participant writes (reviewer enforced), one per campaign
drop policy if exists "reviews_select" on public.reviews;
create policy "reviews_select" on public.reviews
  for select to authenticated using (true);
drop policy if exists "reviews_insert" on public.reviews;
create policy "reviews_insert" on public.reviews
  for insert to authenticated with check (
    reviewer_id = auth.uid()
    and (
      public.is_admin()
      or exists (select 1 from public.applications a where a.campaign_id = campaign_id and a.creator_id = auth.uid() and a.status = 'accepted')
      or exists (select 1 from public.campaigns c where c.id = campaign_id and c.brand_id = auth.uid())
    )
  );

-- Helpful indexes
create index if not exists idx_payments_creator on public.payments (creator_id);
create index if not exists idx_payments_campaign on public.payments (campaign_id);
create index if not exists idx_notifications_user on public.notifications (user_id, read);
create index if not exists idx_messages_conversation on public.messages (conversation_id, created_at);
create index if not exists idx_applications_creator on public.applications (creator_id);
create index if not exists idx_submissions_campaign on public.submissions (campaign_id);
