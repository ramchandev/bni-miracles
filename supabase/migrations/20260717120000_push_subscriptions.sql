-- Web Push subscriptions (one row per device/browser per member)

create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references public.members(id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  user_agent text,
  created_at timestamptz not null default now()
);

create index if not exists push_subscriptions_member_id_idx
  on public.push_subscriptions (member_id);

-- Service-role access only (all reads/writes go through server actions)
alter table public.push_subscriptions enable row level security;
