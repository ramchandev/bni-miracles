-- In-app member notifications (121, BizRox, etc.)

create table if not exists member_notifications (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references members(id) on delete cascade,
  type text not null check (type in ('121_request', '121_accepted', '121_declined', 'bizrox_comment')),
  title text not null,
  body text not null,
  href text,
  source_id text,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists member_notifications_member_idx
  on member_notifications(member_id, is_read, created_at desc);

create unique index if not exists member_notifications_source_unique
  on member_notifications(member_id, type, source_id)
  where source_id is not null;

alter table member_notifications enable row level security;

create policy "member_notifications_authenticated_all"
  on member_notifications for all to authenticated using (true) with check (true);
