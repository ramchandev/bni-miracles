-- Alter bvd_registrations table to add attendance column
alter table public.bvd_registrations
  add column if not exists attendance text not null default 'pending'
  check (attendance in ('pending', 'present', 'absent'));
