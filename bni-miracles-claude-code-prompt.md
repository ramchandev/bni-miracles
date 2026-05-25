# BNI Miracles — Full Website Build Prompt for Claude Code

## Project Overview

Build a complete, production-ready website for **BNI Miracles**, a hybrid BNI chapter (physical + online) that meets every Thursday in Chennai, India. The website is an **online member roster and lead-generation tool** — its primary goal is to make visiting business owners feel the real value of joining and compel them to attend a meeting.

---

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Styling**: Tailwind CSS + custom CSS variables
- **Database**: Supabase (PostgreSQL) — for member roster with full CRUD via Supabase dashboard as the "backend"
- **Image Storage**: Supabase Storage (for member profile pictures)
- **Forms**: React Hook Form + Supabase insert
- **SEO**: Next.js Metadata API, sitemap.xml, robots.txt, Open Graph tags
- **Fonts**: Plus Jakarta Sans (Google Fonts) — for all headings and body
- **Deployment**: Vercel

---

## Design System

### Colors — Derive from BNI Miracles reference site: https://bvd.bnimiracles.in/

Inspect that site and extract its exact brand colors. The BNI brand typically uses:
- Primary Red: `#C8102E` (BNI red)
- Gold/Accent: `#F5A623` or similar warm gold
- Dark Navy/Black: `#1A1A2E` or deep charcoal
- White: `#FFFFFF`
- Light background: `#F9F6F1` or warm off-white

Replicate these as CSS variables:
```css
:root {
  --color-primary: /* extracted red */;
  --color-accent: /* extracted gold */;
  --color-dark: /* extracted dark */;
  --color-bg: /* warm off-white */;
  --color-text: /* dark text */;
}
```

### Typography
- **All text**: Plus Jakarta Sans (Google Fonts)
- Weights: 400, 500, 600, 700, 800
- Import via `next/font/google`

### Logo
- Use the uploaded logo file (attach `logo.png` when running this prompt)
- Place in `/public/logo.png`
- Use in header and footer

### Design Aesthetic
- Professional, confident, warm — feels like a real premium business network
- NOT generic SaaS — feels like a proud local business community
- Use high-quality stock images from Unsplash (business meetings, handshakes, Chennai skyline, entrepreneurs) via `https://source.unsplash.com` or hardcoded Unsplash URLs
- Generous white space, bold section headings, card-based member grid
- Micro-animations on scroll (use Framer Motion or CSS animations)
- Mobile-first, fully responsive

---

## Site Structure & Pages

### 1. `/` — Home Page

**Hero Section**
- Full-width hero with a background image of business professionals in a meeting
- Overlay with chapter name: **BNI Miracles**
- Tamil brand tagline: **ஆஹா ஆற்புதங்கள்!**
- Subtext: "A hybrid BNI chapter — meeting every Thursday in Chennai"
- CTA buttons: `[Attend a Meeting]` → `/attend-meeting` | `[Meet Our Members]` → `/members`

**BNI Global Impact Section**
- Title: "BNI — Building Business Globally"
- Display as animated stat counters (count up on scroll):

| Stat | Value |
|------|-------|
| Chapters Worldwide | 11,728 |
| Countries | 76 |
| Members | 3,55,582 |
| Referrals (Apr 25–Mar 26) | 1.79 Crore |
| Business Value | $26.09 Billion |

**BNI India Impact Section**
- Title: "BNI India — A Powerhouse Network"
- Animated stat counters:

| Stat | Value |
|------|-------|
| Chapters in India | 1,498 |
| Cities | 143 |
| Members | 72,364 |
| Referrals Passed | 49,31,926 |
| Business Generated | ₹55,770 Crores |
| Avg Seat Value | ₹79.96 Lakhs/year |

**About BNI Miracles** (short version)
- 2–3 paragraphs about the chapter
- Link to `/about`

**Business Categories Preview**
- Show all 36 business categories as a tag cloud or grid
- Title: "36 Business Categories Under One Roof"
- CTA: `[Meet the Members]`

**Initiatives Section — ஆஹா ஆற்புதங்கள்!**
- Section title with Tamil brand name
- 10 initiative cards in a responsive grid (3 cols desktop, 2 tablet, 1 mobile)
- Each card has: initiative name (Tamil + English subtitle), short description, and a `[Learn More]` link to its dedicated page
- Use distinct colored icons or emoji for each initiative

The 10 initiatives (card content):

1. **Data என்ன சொல்லுது** — *System Transparency* — Track and celebrate chapter performance with full data visibility. Every referral, every rupee — measured and shared.

2. **Phone-a எடு Referral-a பிடி** — *Referral Drive* — Pick up the phone, pass a referral. A focused drive to multiply referrals within and beyond the chapter.

3. **Vanakam தல! (Meet your Head Table)** — *Leadership Connect* — Open, informal sessions where members connect with chapter leadership. No agenda, just conversation.

4. **கொஞ்சம் Relax Mame!** — *Socials & Offsite* — Unofficial member meetups at beach resorts, cafés, and fun venues. Business relationships built over relaxed moments.

5. **கலப்பு 121 படலம்** — *Cross-Chapter 121 Conclave* — A conclave where members from multiple BNI chapters meet for one-to-ones, expanding referral networks across chapters.

6. **கல்லா கட்டுமா?** — *Business Building* — Structured sessions and workshops to help members actively grow their businesses using BNI tools and strategies.

7. **சக்தி கொடு** — *Power Team* — Form powerful business synergy groups within the chapter — members who refer each other naturally and consistently.

8. **யாரு சாமி அது?** — *Know Your Member* — Deep-dive spotlights where members truly get to know each other's businesses, strengths, and ideal referrals.

9. **ஒரு ஆள் ஒரு Referral** — *One Person One Referral* — A chapter-wide commitment: every single member passes at least one referral this week.

10. **கற்போம் வெல்வோம்** — *CEUs (Continuing Education)* — Learning sessions, BNI education slots, and external training to sharpen every member's business skills.

**Attend a Meeting CTA Banner**
- Full-width colored banner
- "Ready to grow your business? Attend a Thursday meeting."
- Button: `[Book Your Seat]` → `/attend-meeting`
- WhatsApp link: `https://wa.me/919841767641`

**Footer**
- Logo, chapter name, tagline
- Quick links: Home, About, Members, Attend a Meeting, Initiatives, Contact
- WhatsApp: +91 98417 67641
- "Meetings every Thursday — Hybrid (Physical + Online)"
- © BNI Miracles

---

### 2. `/about` — About BNI Miracles

- Hero with chapter photo/image
- What is BNI?
- About BNI Miracles chapter specifically
- Why hybrid meetings?
- Meeting format overview
- Leadership team placeholder section
- CTA to attend meeting

---

### 3. `/members` — Meet Business Entrepreneurs (List Page)

**Features:**
- Page title: "Meet Our Business Entrepreneurs"
- Filter by category (dropdown or tag buttons) — all 36 categories listed below
- Search bar (filter by name or business name — client-side)
- Member cards grid (3 cols desktop, 2 tablet, 1 mobile)

**Member Card shows:**
- Profile picture (circular, with fallback initials avatar)
- Name
- Business Name
- Category (colored badge)
- Business Location
- `[View Profile]` button → `/members/[slug]`

**Data source:** Supabase `members` table

**All 36 Business Categories (use exactly these):**
```
Printing, T-Shirt Manufacturing, Designer Boutique (Fashion), Graphic Design,
Photography & Videography, Art Therapy, Idols Manufacturing, Furniture Manufacturing,
Solar Panels, Agri Products, Pharma Distributor, Water & Waste Water Treatment,
Birds Net, Makeup Artist, Pet Industry, Tours & Travels, Business & Finance,
Loans, GST Consultant, HR Process Audit & Compliance, Wealth Management,
Insurance, Business Consultant, Custom Software Development, Software Training,
Digital Marketing, AV & Media Consultancy, IT Hardware, Residential Interiors,
Residential Architect, Commercial Real Estate, Logistics, CCTV,
Legal & Professional, Legal (Intellectual Property), Advocate (Money Recovery),
Specialist Dentist
```

---

### 4. `/members/[slug]` — Member Detail Page

**Dynamic route** based on member slug (generated from name).

**Display:**
- Large profile picture
- Name (H1)
- Business Name
- Category badge
- Business Location
- Website (clickable link)
- Services / Products Offered (rich text or bullet list)
- Why Choose Us (paragraph)
- Success Stories (paragraph or list)
- WhatsApp contact button: `https://wa.me/919841767641` (chapter inquiry)
- "Back to Members" link

**SEO:** Each member page gets unique meta title, description, and Open Graph image using member data.

---

### 5. Supabase Database Schema

Create this exact schema in Supabase:

```sql
-- Members table
create table members (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  slug text unique not null, -- URL-safe version of name
  business_name text not null,
  category text not null,
  business_location text,
  website text,
  services text, -- markdown or plain text
  why_choose_us text,
  success_stories text,
  profile_picture_url text, -- Supabase Storage URL
  is_active boolean default true,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Meeting registrations table
create table meeting_registrations (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  phone text not null,
  meeting_date date not null,
  created_at timestamp with time zone default now()
);
```

Enable Row Level Security (RLS):
- `members`: SELECT is public; INSERT/UPDATE/DELETE require auth
- `meeting_registrations`: INSERT is public; SELECT requires auth

Create a Supabase Storage bucket called `member-avatars` with public read access.

---

### 6. `/attend-meeting` — Attend a Meeting (Schedule Page)

**Page Title:** "Attend a BNI Miracles Meeting"

**Info section:**
- Meeting: Every Thursday (Hybrid — Physical + Online)
- Location: [Add Chennai venue address]
- Time: [Add meeting time]
- What to expect: brief bullet list

**Booking Form:**
Fields:
- Full Name (required)
- Phone Number (required, Indian format validation)
- Select a Thursday (date picker — only Thursdays selectable, next 8 Thursdays shown)
- Submit button: "Book My Seat"

On submit:
- Insert into Supabase `meeting_registrations` table
- Show success message: "You're registered! We'll WhatsApp you the details."
- Show WhatsApp link: `https://wa.me/919841767641`

**Logic for Thursday dates:**
Generate the next 8 upcoming Thursdays from today's date dynamically in JavaScript. Only allow selection of those dates.

---

### 7. `/initiatives` — Initiatives Overview Page

- Title: "ஆஹா ஆற்புதங்கள்! — Our Chapter Initiatives"
- Grid of all 10 initiative cards (same as homepage)
- Each links to its dedicated page

---

### 8–17. Individual Initiative Pages

Create one page per initiative with SEO-friendly URLs:

| Initiative | URL Slug |
|-----------|---------|
| Data என்ன சொல்லுது | `/initiatives/data-transparency` |
| Phone-a எடு Referral-a பிடி | `/initiatives/referral-drive` |
| Vanakam தல! | `/initiatives/meet-head-table` |
| கொஞ்சம் Relax Mame! | `/initiatives/socials` |
| கலப்பு 121 படலம் | `/initiatives/cross-chapter-121` |
| கல்லா கட்டுமா? | `/initiatives/business-building` |
| சக்தி கொடு | `/initiatives/power-team` |
| யாரு சாமி அது? | `/initiatives/know-your-member` |
| ஒரு ஆள் ஒரு Referral | `/initiatives/one-referral` |
| கற்போம் வெல்வோம் | `/initiatives/ceus` |

**Each initiative page includes:**
- Hero with initiative name (Tamil + English)
- Full description/purpose (3–4 paragraphs expanding on the concept)
- "Activity Logs" section — currently shows "Coming Soon — Logs will be posted here" placeholder
- Breadcrumb: Home > Initiatives > [Initiative Name]
- Back to Initiatives link
- CTA to attend a meeting

---

### 18. `/contact` — Contact Us

**Content:**
- Contact form: Name, Email, Phone, Message → insert into Supabase `contacts` table
- WhatsApp prominent CTA: "Chat with us on WhatsApp" → `https://wa.me/919841767641`
- Display WhatsApp number: +91 98417 67641
- Chapter meeting info
- Google Maps embed placeholder (add later)

---

## SEO Requirements

Apply to every page:

```tsx
// Example for Home
export const metadata: Metadata = {
  title: 'BNI Miracles — Hybrid Business Networking Chapter | Chennai',
  description: 'BNI Miracles is a hybrid BNI chapter meeting every Thursday in Chennai. Connect with 36+ business categories, pass referrals, and grow your business.',
  keywords: ['BNI Miracles', 'BNI Chennai', 'business networking Chennai', 'BNI chapter Tamil Nadu'],
  openGraph: {
    title: 'BNI Miracles — Business Networking Chennai',
    description: '...',
    url: 'https://bnimiracles.in',
    siteName: 'BNI Miracles',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630 }],
    locale: 'en_IN',
    type: 'website',
  },
};
```

- Each member detail page: unique OG title with member name + business
- Each initiative page: unique meta description about the initiative
- Generate `/sitemap.xml` dynamically including all member slugs and initiative pages
- Add `/robots.txt`
- Use semantic HTML: `<h1>`, `<h2>`, `<article>`, `<section>`, `<nav>`, `<main>`
- Alt text on all images

---

## Environment Variables

Create `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

---

## Navigation Header

Sticky header with:
- Logo (left)
- Nav links: Home | About | Members | Initiatives | Attend a Meeting | Contact
- Mobile: hamburger menu
- WhatsApp icon button (top right) → `https://wa.me/919841767641`
- "Attend a Meeting" as a filled button (CTA style)

---

## Floating WhatsApp Button

Add a floating WhatsApp button (bottom-right, fixed position) on all pages:
- Green WhatsApp icon
- Links to: `https://wa.me/919841767641`
- Tooltip: "Chat with us"

---

## Additional Notes

1. **Member slugs**: Auto-generate from name using `name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')`

2. **Images**: Use Unsplash for placeholders:
   - Business meeting: `https://images.unsplash.com/photo-1556761175-4b46a572b786`
   - Handshake: `https://images.unsplash.com/photo-1600880292203-757bb62b4baf`
   - Chennai/India business: appropriate searches

3. **Tamil text**: Use UTF-8 encoding. Tamil characters will render correctly with Plus Jakarta Sans. For better Tamil rendering, also load `Noto Sans Tamil` as a fallback for Tamil text specifically.

4. **Stat counters**: Use Intersection Observer API to trigger count-up animation when stats scroll into view.

5. **Admin**: The Supabase dashboard itself serves as the admin backend. No custom admin panel needed — editors log into Supabase to add/edit members. Document this in a `README.md`.

6. **README.md**: Create a clear README explaining:
   - How to add/edit members in Supabase
   - How to upload profile pictures to Supabase Storage
   - How to view meeting registrations
   - Environment setup

---

## File Structure

```
/
├── app/
│   ├── page.tsx                          # Home
│   ├── about/page.tsx
│   ├── members/
│   │   ├── page.tsx                      # Members list
│   │   └── [slug]/page.tsx              # Member detail
│   ├── attend-meeting/page.tsx
│   ├── initiatives/
│   │   ├── page.tsx                      # Initiatives overview
│   │   ├── data-transparency/page.tsx
│   │   ├── referral-drive/page.tsx
│   │   ├── meet-head-table/page.tsx
│   │   ├── socials/page.tsx
│   │   ├── cross-chapter-121/page.tsx
│   │   ├── business-building/page.tsx
│   │   ├── power-team/page.tsx
│   │   ├── know-your-member/page.tsx
│   │   ├── one-referral/page.tsx
│   │   └── ceus/page.tsx
│   ├── contact/page.tsx
│   ├── sitemap.ts
│   ├── robots.ts
│   └── layout.tsx                        # Root layout with fonts, nav, footer
├── components/
│   ├── Header.tsx
│   ├── Footer.tsx
│   ├── StatCounter.tsx
│   ├── MemberCard.tsx
│   ├── InitiativeCard.tsx
│   ├── MeetingForm.tsx
│   ├── WhatsAppButton.tsx
│   └── CategoryFilter.tsx
├── lib/
│   └── supabase.ts
├── public/
│   ├── logo.png
│   └── og-image.jpg
├── .env.local
└── README.md
```

---

## Start Command

```bash
npx create-next-app@latest bni-miracles --typescript --tailwind --app --src-dir=false
cd bni-miracles
npm install @supabase/supabase-js react-hook-form framer-motion
```

Then build all pages, components, and database integration as described above.
