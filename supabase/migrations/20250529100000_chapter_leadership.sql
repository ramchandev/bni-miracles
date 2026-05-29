-- Chapter leadership: groups, roles, and member assignments

create table if not exists leadership_groups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  subtitle text,
  color text not null default '#C8102E',
  non_members boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists leadership_roles (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references leadership_groups(id) on delete cascade,
  name text not null,
  description text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists leadership_assignments (
  id uuid primary key default gen_random_uuid(),
  role_id uuid not null references leadership_roles(id) on delete cascade,
  member_id uuid references members(id) on delete cascade,
  assignee_name text,
  assignee_profile_picture_url text,
  created_at timestamptz not null default now(),
  constraint leadership_assignments_role_id_unique unique (role_id)
);

create index if not exists leadership_roles_group_id_idx on leadership_roles(group_id);
create index if not exists leadership_assignments_member_id_idx on leadership_assignments(member_id);

alter table leadership_groups enable row level security;
alter table leadership_roles enable row level security;
alter table leadership_assignments enable row level security;

create policy "leadership_groups_public_select"
  on leadership_groups for select using (true);

create policy "leadership_roles_public_select"
  on leadership_roles for select using (true);

create policy "leadership_assignments_public_select"
  on leadership_assignments for select using (true);

create policy "leadership_groups_authenticated_all"
  on leadership_groups for all to authenticated using (true) with check (true);

create policy "leadership_roles_authenticated_all"
  on leadership_roles for all to authenticated using (true) with check (true);

create policy "leadership_assignments_authenticated_all"
  on leadership_assignments for all to authenticated using (true) with check (true);

-- Seed groups and roles (idempotent)
insert into leadership_groups (name, subtitle, color, sort_order)
select v.name, v.subtitle, v.color, v.sort_order
from (values
  ('Head Table', null::text, '#C8102E', 1),
  ('Membership Committee', 'Vice President''s Team', '#8B5CF6', 2),
  ('Visitors Host Team', 'Secretary & Treasurer''s Team', '#0EA5E9', 3),
  ('Coordinators', 'President''s Team', '#F97316', 4)
) as v(name, subtitle, color, sort_order)
where not exists (select 1 from leadership_groups g where g.name = v.name);

-- Head Table
insert into leadership_roles (group_id, name, sort_order)
select g.id, r.name, r.sort_order
from leadership_groups g
cross join (values
  ('Vice President', 1),
  ('President', 2),
  ('Secretary & Treasurer', 3)
) as r(name, sort_order)
where g.name = 'Head Table'
  and not exists (
    select 1 from leadership_roles lr
    where lr.group_id = g.id and lr.name = r.name
  );

-- Membership Committee
insert into leadership_roles (group_id, name, sort_order)
select g.id, r.name, r.sort_order
from leadership_groups g
cross join (values
  ('Chapter Growth Coordinator', 1),
  ('Attendance Coordinator', 2),
  ('Referral Coordinator', 3),
  ('Application Review', 4),
  ('Retention Coordinator', 5),
  ('Mentor Coordinator', 6)
) as r(name, sort_order)
where g.name = 'Membership Committee'
  and not exists (
    select 1 from leadership_roles lr
    where lr.group_id = g.id and lr.name = r.name
  );

-- Visitors Host Team
insert into leadership_roles (group_id, name, sort_order)
select g.id, r.name, r.sort_order
from leadership_groups g
cross join (values
  ('Lead Visitor Host', 1),
  ('Visitor Host 1', 2),
  ('Visitor Host 2', 3),
  ('Visitor Host 3', 4),
  ('Visitor Host 4', 5)
) as r(name, sort_order)
where g.name = 'Visitors Host Team'
  and not exists (
    select 1 from leadership_roles lr
    where lr.group_id = g.id and lr.name = r.name
  );

-- Coordinators
insert into leadership_roles (group_id, name, sort_order)
select g.id, r.name, r.sort_order
from leadership_groups g
cross join (values
  ('GO Green', 1),
  ('Training Coordinator', 2),
  ('Education Coordinator', 3),
  ('FP Coordinator', 4),
  ('Testimonials Coordinator', 5),
  ('Social Media & Poster Coordinator', 6),
  ('Power Team Coordinator', 7),
  ('30 Sec Coordinator', 8),
  ('BNI Connect & University Coordinator', 9),
  ('Roster Book & Socials Coordinator', 10),
  ('Weekly Presentation', 11),
  ('Attire Coordinator', 12),
  ('Whatsapp Engagement Coordinator', 13),
  ('Sports Coordinator', 14),
  ('121 Coordinator', 15)
) as r(name, sort_order)
where g.name = 'Coordinators'
  and not exists (
    select 1 from leadership_roles lr
    where lr.group_id = g.id and lr.name = r.name
  );
