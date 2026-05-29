-- One optional team captain per Power Team (must be a member of that team; enforced in app)

alter table power_teams
  add column if not exists captain_member_id uuid references members(id) on delete set null;

create index if not exists power_teams_captain_member_id_idx on power_teams(captain_member_id);
