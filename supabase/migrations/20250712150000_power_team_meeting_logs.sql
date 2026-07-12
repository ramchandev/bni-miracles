-- Power Team meeting logs + emoji reactions

create table if not exists power_team_meeting_logs (
  id uuid primary key default gen_random_uuid(),
  power_team_id uuid not null references power_teams(id) on delete cascade,
  created_by_member_id uuid not null references members(id) on delete cascade,
  meeting_date date not null,
  venue text,
  comments text not null,
  referrals_exchanged integer,
  business_value numeric,
  image_url text,
  created_at timestamptz not null default now()
);

create index if not exists power_team_meeting_logs_team_date_idx
  on power_team_meeting_logs(power_team_id, meeting_date desc, created_at desc);

create table if not exists power_team_log_reactions (
  id uuid primary key default gen_random_uuid(),
  log_id uuid not null references power_team_meeting_logs(id) on delete cascade,
  member_id uuid not null references members(id) on delete cascade,
  reaction text not null,
  created_at timestamptz not null default now(),
  unique (log_id, member_id, reaction)
);

create index if not exists power_team_log_reactions_log_idx
  on power_team_log_reactions(log_id);

alter table power_team_meeting_logs enable row level security;
alter table power_team_log_reactions enable row level security;

create policy "power_team_meeting_logs_public_select"
  on power_team_meeting_logs for select
  to anon, authenticated
  using (true);

create policy "power_team_log_reactions_public_select"
  on power_team_log_reactions for select
  to anon, authenticated
  using (true);

create policy "power_team_meeting_logs_authenticated_all"
  on power_team_meeting_logs for all
  to authenticated
  using (true)
  with check (true);

create policy "power_team_log_reactions_authenticated_all"
  on power_team_log_reactions for all
  to authenticated
  using (true)
  with check (true);
