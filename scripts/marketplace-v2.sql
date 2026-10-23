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
