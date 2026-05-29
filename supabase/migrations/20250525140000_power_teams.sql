-- Power Teams initiative: teams and member assignments (one member → one team max)

create table if not exists power_teams (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text,
  focus_area text,
  description text,
  emoji text not null default '⚡',
  color text not null default '#C8102E',
  sort_order integer not null default 0,
  captain_member_id uuid references members(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists power_team_members (
  id uuid primary key default gen_random_uuid(),
  power_team_id uuid not null references power_teams(id) on delete cascade,
  member_id uuid not null references members(id) on delete cascade,
  role_notes text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  constraint power_team_members_member_id_unique unique (member_id)
);

create index if not exists power_team_members_team_id_idx on power_team_members(power_team_id);

alter table power_teams enable row level security;
alter table power_team_members enable row level security;

-- Public read (initiative page)
create policy "power_teams_public_select"
  on power_teams for select
  using (true);

create policy "power_team_members_public_select"
  on power_team_members for select
  using (true);

-- Authenticated admin write
create policy "power_teams_authenticated_all"
  on power_teams for all
  to authenticated
  using (true)
  with check (true);

create policy "power_team_members_authenticated_all"
  on power_team_members for all
  to authenticated
  using (true)
  with check (true);
