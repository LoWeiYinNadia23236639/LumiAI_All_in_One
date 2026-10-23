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
