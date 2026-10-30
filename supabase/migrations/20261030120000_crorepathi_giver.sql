-- Crorepathi Giver club flag on member profiles
alter table public.members
  add column if not exists crorepathi_giver boolean not null default false;

comment on column public.members.crorepathi_giver is
  'When true, member is shown as a Crorepathi Club Member on the public profile.';
