-- Attendance per meeting log (who was present / absent)

create table if not exists power_team_log_attendance (
  id uuid primary key default gen_random_uuid(),
  log_id uuid not null references power_team_meeting_logs(id) on delete cascade,
  member_id uuid not null references members(id) on delete cascade,
  present boolean not null default true,
  unique (log_id, member_id)
);

create index if not exists power_team_log_attendance_log_idx
  on power_team_log_attendance(log_id);

create index if not exists power_team_log_attendance_member_present_idx
  on power_team_log_attendance(member_id, present);

alter table power_team_log_attendance enable row level security;

create policy "power_team_log_attendance_public_select"
  on power_team_log_attendance for select
  to anon, authenticated
  using (true);

create policy "power_team_log_attendance_authenticated_all"
  on power_team_log_attendance for all
  to authenticated
  using (true)
  with check (true);
