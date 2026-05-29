-- URL slug for /power-team/[slug] pages

alter table power_teams
  add column if not exists slug text;

-- Backfill from team name (run once; adjust duplicates manually in admin if needed)
update power_teams
set slug = trim(both '-' from lower(regexp_replace(regexp_replace(name, '[^a-zA-Z0-9]+', '-', 'g'), '-+', '-', 'g')))
where slug is null or slug = '';

create unique index if not exists power_teams_slug_unique on power_teams(slug);
