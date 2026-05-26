-- Add optional email to member profiles (run in Supabase SQL Editor if not using CLI migrations)
alter table members
  add column if not exists email text;

comment on column members.email is 'Public contact email shown on member profile';
