-- Dance cards (if missing in production), 121 scheduler tables, storage bucket

-- ── dance_cards ─────────────────────────────────────────────────────────────

create table if not exists dance_cards (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references members(id) on delete cascade,
  bio_profession text,
  bio_location text,
  bio_years integer,
  bio_previous_jobs text,
  bio_spouse text,
  bio_children text,
  bio_animals text,
  bio_hobbies text,
  bio_activities text,
  bio_city text,
  bio_city_duration text,
  bio_burning_desire text,
  bio_secret text,
  bio_key_to_success text,
  gains_goals text,
  gains_accomplishments text,
  gains_interests text,
  gains_networks text,
  gains_skills text,
  contact_sphere jsonb not null default '[]'::jsonb,
  top_3_professions jsonb not null default '[]'::jsonb,
  last_customers jsonb not null default '[]'::jsonb,
  referral_sources text,
  good_referrals text,
  bad_referrals text,
  pdf_generated_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint dance_cards_member_id_unique unique (member_id)
);

create index if not exists dance_cards_member_id_idx on dance_cards(member_id);

alter table dance_cards enable row level security;

create policy "dance_cards_public_select"
  on dance_cards for select using (true);

create policy "dance_cards_authenticated_all"
  on dance_cards for all to authenticated using (true) with check (true);

-- ── bizrox_sessions (if missing) ────────────────────────────────────────────

create table if not exists bizrox_sessions (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references members(id) on delete cascade,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index if not exists bizrox_sessions_member_id_idx on bizrox_sessions(member_id);

alter table bizrox_sessions enable row level security;

create policy "bizrox_sessions_authenticated_all"
  on bizrox_sessions for all to authenticated using (true) with check (true);

-- ── one_on_one_slots ─────────────────────────────────────────────────────────

create table if not exists one_on_one_slots (
  id uuid primary key default gen_random_uuid(),
  host_member_id uuid not null references members(id) on delete cascade,
  slot_date date not null,
  start_time time not null,
  meeting_type text not null check (meeting_type in ('online', 'in_person')),
  location text,
  meeting_url text,
  status text not null default 'open' check (status in ('open', 'booked', 'cancelled')),
  created_at timestamptz not null default now(),
  constraint one_on_one_slots_unique_slot unique (host_member_id, slot_date, start_time)
);

create index if not exists one_on_one_slots_host_member_id_idx on one_on_one_slots(host_member_id);
create index if not exists one_on_one_slots_date_idx on one_on_one_slots(slot_date);

alter table one_on_one_slots enable row level security;

create policy "one_on_one_slots_public_open_select"
  on one_on_one_slots for select using (status = 'open');

create policy "one_on_one_slots_authenticated_all"
  on one_on_one_slots for all to authenticated using (true) with check (true);

-- ── one_on_one_requests ──────────────────────────────────────────────────────

create table if not exists one_on_one_requests (
  id uuid primary key default gen_random_uuid(),
  slot_id uuid not null references one_on_one_slots(id) on delete cascade,
  host_member_id uuid not null references members(id) on delete cascade,
  requester_member_id uuid references members(id) on delete set null,
  requester_name text not null,
  requester_chapter text not null,
  requester_email text not null,
  guest_dance_card_url text,
  host_dance_card_id uuid references dance_cards(id) on delete set null,
  requester_dance_card_id uuid references dance_cards(id) on delete set null,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'declined', 'cancelled')),
  host_action_token text not null unique,
  confirmed_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists one_on_one_requests_slot_id_idx on one_on_one_requests(slot_id);
create index if not exists one_on_one_requests_host_member_id_idx on one_on_one_requests(host_member_id);
create index if not exists one_on_one_requests_requester_member_id_idx on one_on_one_requests(requester_member_id);
create index if not exists one_on_one_requests_token_idx on one_on_one_requests(host_action_token);

alter table one_on_one_requests enable row level security;

create policy "one_on_one_requests_authenticated_all"
  on one_on_one_requests for all to authenticated using (true) with check (true);

-- ── storage: guest dance card PDFs ───────────────────────────────────────────

insert into storage.buckets (id, name, public)
values ('121-dance-cards', '121-dance-cards', false)
on conflict (id) do nothing;
