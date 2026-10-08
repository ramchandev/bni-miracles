-- Specific Ask tracking (Referral Coordinator + Head Table)

create table if not exists public.specific_ask_meetings (
  id uuid primary key default gen_random_uuid(),
  meeting_date date not null unique,
  created_by uuid references public.members(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.specific_asks (
  id uuid primary key default gen_random_uuid(),
  seeker_member_id uuid not null references public.members(id) on delete cascade,
  ask_text text not null,
  first_asked_on date not null,
  status text not null default 'not_yet_connected'
    check (status in ('not_yet_connected', 'contacted', 'connected')),
  connected_at timestamptz,
  notes text,
  seeker_notes text,
  bizrox_post_id uuid references public.bizrox_posts(id) on delete set null,
  created_by uuid references public.members(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists specific_asks_seeker_idx
  on public.specific_asks (seeker_member_id);

create index if not exists specific_asks_status_idx
  on public.specific_asks (status);

create table if not exists public.specific_ask_meeting_links (
  ask_id uuid not null references public.specific_asks(id) on delete cascade,
  meeting_id uuid not null references public.specific_ask_meetings(id) on delete cascade,
  position int not null default 0,
  created_at timestamptz not null default now(),
  primary key (ask_id, meeting_id)
);

create table if not exists public.specific_ask_connectors (
  id uuid primary key default gen_random_uuid(),
  ask_id uuid not null references public.specific_asks(id) on delete cascade,
  member_id uuid references public.members(id) on delete set null,
  display_name text not null,
  created_at timestamptz not null default now()
);

create unique index if not exists specific_ask_connectors_member_uidx
  on public.specific_ask_connectors (ask_id, member_id)
  where member_id is not null;

create unique index if not exists specific_ask_connectors_name_uidx
  on public.specific_ask_connectors (ask_id, lower(display_name));

alter table public.specific_ask_meetings enable row level security;
alter table public.specific_asks enable row level security;
alter table public.specific_ask_meeting_links enable row level security;
alter table public.specific_ask_connectors enable row level security;
