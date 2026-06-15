-- Email notification settings (single-row config)
create table if not exists public.email_settings (
  id          int primary key default 1 check (id = 1),
  smtp_host   text,
  smtp_port   int not null default 465,
  smtp_user   text,
  smtp_pass   text,
  admin_emails text,
  updated_at  timestamptz default now()
);

insert into public.email_settings (id)
values (1)
on conflict (id) do nothing;

alter table public.email_settings enable row level security;

-- Admins (authenticated) can read/update settings via the admin panel
drop policy if exists "Admins manage email_settings" on public.email_settings;
create policy "Admins manage email_settings"
  on public.email_settings
  for all
  to authenticated
  using (true)
  with check (true);
