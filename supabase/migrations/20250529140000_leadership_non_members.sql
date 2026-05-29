-- Non-member leadership groups: external people who hold chapter roles

alter table leadership_groups
  add column if not exists non_members boolean not null default false;

alter table leadership_assignments
  alter column member_id drop not null;

alter table leadership_assignments
  add column if not exists assignee_name text,
  add column if not exists assignee_profile_picture_url text;
