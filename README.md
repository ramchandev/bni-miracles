# BNI Miracles — Website

A production-ready website for **BNI Miracles**, a hybrid BNI chapter in Chennai, India.  
Built with Next.js 14+, Tailwind CSS, and Supabase.

## Quick Start

```bash
cp .env.local.example .env.local   # add your Supabase keys
npm install
npm run dev
```

---

## Environment Variables

Create `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

---

## Supabase Setup

### 1. Create Tables

Run in Supabase SQL editor:

```sql
create table members (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  slug text unique not null,
  business_name text not null,
  category text not null,
  business_location text,
  website text,
  services text,
  why_choose_us text,
  success_stories text,
  profile_picture_url text,
  is_active boolean default true,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create table meeting_registrations (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  phone text not null,
  meeting_date date not null,
  created_at timestamp with time zone default now()
);

create table contacts (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  email text not null,
  phone text,
  message text not null,
  created_at timestamp with time zone default now()
);
```

### 2. Row Level Security

```sql
alter table members enable row level security;
create policy "Public read members" on members for select using (true);
create policy "Auth write members" on members for all using (auth.role() = 'authenticated');

alter table meeting_registrations enable row level security;
create policy "Public insert" on meeting_registrations for insert with check (true);
create policy "Auth read" on meeting_registrations for select using (auth.role() = 'authenticated');

alter table contacts enable row level security;
create policy "Public insert contacts" on contacts for insert with check (true);
create policy "Auth read contacts" on contacts for select using (auth.role() = 'authenticated');
```

### 3. Storage Bucket

Supabase → Storage → Create bucket `member-avatars` → set Public.

---

## Adding / Editing Members

Use the **Supabase Table Editor** — no custom admin needed.

| Field | Notes |
|-------|-------|
| `slug` | URL slug — `john-doe` format. Formula: `name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')` |
| `profile_picture_url` | Upload to `member-avatars` bucket, get public URL |
| `is_active` | Set `false` to hide without deleting |

### Upload a Profile Photo

1. Supabase → Storage → `member-avatars` → Upload
2. Click image → Get URL → paste into `profile_picture_url`

---

## Viewing Registrations & Contacts

Supabase → Table Editor → `meeting_registrations` or `contacts`

---

## Deployment (Vercel)

1. Push to GitHub
2. Import to [vercel.com](https://vercel.com)
3. Add env vars: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy

---

## Pages

| Page | URL |
|------|-----|
| Home | `/` |
| About | `/about` |
| Members List | `/members` |
| Member Profile | `/members/[slug]` |
| Attend a Meeting | `/attend-meeting` |
| Initiatives | `/initiatives` |
| 10 Initiative pages | `/initiatives/[slug]` |
| Contact | `/contact` |
