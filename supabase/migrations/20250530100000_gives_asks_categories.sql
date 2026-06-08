-- Gives & Asks referral categories + link member selections

create table if not exists gives_asks_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text not null default 'both' check (type in ('give', 'ask', 'both')),
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint gives_asks_categories_name_unique unique (name)
);

create table if not exists member_gives_asks (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references members(id) on delete cascade,
  type text not null check (type in ('give', 'ask')),
  item text not null,
  category_id uuid references gives_asks_categories(id) on delete set null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

alter table member_gives_asks
  add column if not exists category_id uuid references gives_asks_categories(id) on delete set null;

create index if not exists member_gives_asks_member_id_idx on member_gives_asks(member_id);
create index if not exists member_gives_asks_category_id_idx on member_gives_asks(category_id);
create index if not exists gives_asks_categories_type_idx on gives_asks_categories(type);

alter table gives_asks_categories enable row level security;
alter table member_gives_asks enable row level security;

create policy "gives_asks_categories_public_select"
  on gives_asks_categories for select using (is_active = true);

create policy "gives_asks_categories_authenticated_all"
  on gives_asks_categories for all to authenticated using (true) with check (true);

create policy "member_gives_asks_public_select"
  on member_gives_asks for select using (true);

create policy "member_gives_asks_authenticated_all"
  on member_gives_asks for all to authenticated using (true) with check (true);

-- Starter categories (idempotent)
insert into gives_asks_categories (name, type, sort_order)
select v.name, v.type, v.sort_order
from (values
  ('Home / Property Buyers', 'both', 1),
  ('Home / Property Sellers', 'both', 2),
  ('Commercial Property', 'both', 3),
  ('Interior Design Projects', 'both', 4),
  ('Construction / Renovation', 'both', 5),
  ('Legal Services', 'both', 6),
  ('Tax / GST / Accounting', 'both', 7),
  ('Insurance Leads', 'both', 8),
  ('Loans & Finance', 'both', 9),
  ('IT / Software Projects', 'both', 10),
  ('Digital Marketing', 'both', 11),
  ('HR / Recruitment', 'both', 12),
  ('Travel & Tourism', 'both', 13),
  ('Weddings & Events', 'both', 14),
  ('Healthcare & Wellness', 'both', 15),
  ('Education & Training', 'both', 16),
  ('Manufacturing / B2B Supply', 'both', 17),
  ('Export / Import', 'both', 18),
  ('New Business Startups', 'both', 19),
  ('SME / Corporate Offices', 'both', 20)
) as v(name, type, sort_order)
where not exists (
  select 1 from gives_asks_categories c where c.name = v.name
);
