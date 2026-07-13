-- Big Visitor Day (BVD) settings + registrations

create table if not exists public.bvd_settings (
  id int primary key default 1 check (id = 1),
  event_date date not null default '2026-08-13',
  breakfast_amount numeric(10, 2) not null default 500,
  payment_qr_url text,
  chairman_member_id uuid references public.members(id) on delete set null,
  co_chairman_member_id uuid references public.members(id) on delete set null,
  notification_emails text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.bvd_settings (id, event_date, breakfast_amount)
values (1, '2026-08-13', 500)
on conflict (id) do nothing;

create table if not exists public.bvd_registrations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  business_name text not null,
  business_category text not null,
  invited_by text not null,
  phone text not null,
  email text not null,
  wants_breakfast boolean not null default false,
  status text not null default 'payment_pending'
    check (status in ('payment_pending', 'paid')),
  payment_screenshot_url text,
  created_at timestamptz not null default now()
);

create index if not exists bvd_registrations_created_at_idx
  on public.bvd_registrations (created_at desc);

create index if not exists bvd_registrations_status_idx
  on public.bvd_registrations (status);

alter table public.bvd_settings enable row level security;
alter table public.bvd_registrations enable row level security;

-- Public can read settings (event page)
drop policy if exists "bvd_settings_public_select" on public.bvd_settings;
create policy "bvd_settings_public_select"
  on public.bvd_settings for select using (true);

drop policy if exists "bvd_settings_authenticated_all" on public.bvd_settings;
create policy "bvd_settings_authenticated_all"
  on public.bvd_settings for all to authenticated
  using (true) with check (true);

-- Anyone can register (insert); reads/updates go through service role in actions
drop policy if exists "bvd_registrations_public_insert" on public.bvd_registrations;
create policy "bvd_registrations_public_insert"
  on public.bvd_registrations for insert with check (true);

drop policy if exists "bvd_registrations_authenticated_all" on public.bvd_registrations;
create policy "bvd_registrations_authenticated_all"
  on public.bvd_registrations for all to authenticated
  using (true) with check (true);

-- Storage for QR codes and payment screenshots
insert into storage.buckets (id, name, public)
values ('bvd-media', 'bvd-media', true)
on conflict (id) do nothing;
