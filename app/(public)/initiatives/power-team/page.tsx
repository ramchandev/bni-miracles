import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { initiatives } from "@/lib/initiatives";

const init = initiatives.find((i) => i.slug === "power-team")!;

export const metadata: Metadata = {
  title: `${init.englishName} — ${init.tamilName} | BNI Miracles`,
  description:
    "Meet BNI Miracles' 5 Power Teams — 37 business professionals grouped by shared client base for maximum referral synergy.",
};

/* ── Static Power Team data (sourced from BNI_Power_Teams.xlsx) ─────────── */

type TeamMember = {
  excelName: string;      // Name as it appears in the Excel
  slug: string;           // DB slug for photo / profile link lookup
  role: string;           // Classification / Role
  referralNotes: string;  // Referral Notes column
};

type PowerTeam = {
  name: string;
  emoji: string;
  focusArea: string;
  whyItWorks: string;
  color: string;          // CSS colour for accents
  lightBg: string;        // Light tint for card background
  members: TeamMember[];
};

const POWER_TEAMS: PowerTeam[] = [
  {
    name: "Build & Beautify",
    emoji: "🏗️",
    focusArea: "Serving home owners, developers & property buyers",
    whyItWorks:
      "All members serve the same core customer: someone building, buying, decorating, or securing a home or commercial property. When the architect lands a project, the interior designer, solar installer, furniture maker, CCTV installer, and water systems supplier all get warm referral opportunities.",
    color: "#F97316",
    lightBg: "#FFF7ED",
    members: [
      { excelName: "Ajeeth Elancheziyan", slug: "ajeeth-elancheziyan", role: "Architect", referralNotes: "Design + build clients need all others in team" },
      { excelName: "Jalagandeshwar PS", slug: "jalagandeshwar", role: "Interior Design – Residential", referralNotes: "Post-purchase home owners → furniture, solar, CCTV" },
      { excelName: "Narendrabalaji G", slug: "narendra-balaji", role: "Commercial Real Estate", referralNotes: "Feeds all members with new property buyers" },
      { excelName: "Harikumar M", slug: "harikumar", role: "Solar Installation", referralNotes: "New construction & renovation projects" },
      { excelName: "Jayaprakash S", slug: "jayaprakash", role: "Furniture Manufacture", referralNotes: "Interior design clients, new home owners" },
      { excelName: "Naresh Kumar", slug: "naresh-kumar-s", role: "Idols, Mementos & Decorative Metal Works", referralNotes: "Interior designers, corporates, events" },
      { excelName: "Hari Saikrishna T", slug: "hari-saikrishna-", role: "CCTV", referralNotes: "Home/office construction completions" },
      { excelName: "Vadivelan Vadamadurai", slug: "vadivelan-vadamadurai", role: "Water Systems", referralNotes: "New constructions, renovations" },
      { excelName: "Umashankar Shankar", slug: "uma-shankar", role: "Birds Net", referralNotes: "Apartment / home protection needs" },
    ],
  },
  {
    name: "Brand & Grow",
    emoji: "🚀",
    focusArea: "Serving businesses that need visibility & sales growth",
    whyItWorks:
      "These members primarily serve businesses (SMEs, startups, entrepreneurs) trying to establish and grow their brand presence. A company needing a logo also needs photography, digital marketing, print collateral, and A/V for events — strong internal referral loop.",
    color: "#8B5CF6",
    lightBg: "#F5F3FF",
    members: [
      { excelName: "Naushad Ahmed", slug: "naushad-ahmed", role: "Graphic Designer", referralNotes: "Brand identity for all new businesses" },
      { excelName: "Swaminathan Chandrasekaran", slug: "swaminathan", role: "Digital Marketing", referralNotes: "Every SME needing online presence" },
      { excelName: "Karthikeyan D", slug: "karthikeyan", role: "Photographer", referralNotes: "Product, event & personal branding shoots" },
      { excelName: "Kamal R", slug: "kamal-r", role: "Printer", referralNotes: "Brochures, business cards, banners for SMEs" },
      { excelName: "Rajendran K", slug: "rajendran", role: "Technicians – Audio, Video", referralNotes: "Corporate events, product launches" },
      { excelName: "Ramachandran Subramaniyan", slug: "ram", role: "Artist", referralNotes: "Murals, branding art, personal commissions" },
      { excelName: "Yashmin J", slug: "yashmin", role: "Makeup Artist", referralNotes: "Photo shoots, events, personal branding" },
      { excelName: "Yuvaraj T", slug: "yuvaraj", role: "Software Training – Full Stack & Python", referralNotes: "Upskilling teams at growing companies" },
    ],
  },
  {
    name: "Money & Mind",
    emoji: "💰",
    focusArea: "Serving individuals & businesses managing wealth & risk",
    whyItWorks:
      "This team orbits the financial and operational health of individuals and businesses. An SME owner needing a commercial loan also needs GST compliance, insurance, wealth planning, and HR support — they all talk to the same decision-maker (business owner or CFO).",
    color: "#10B981",
    lightBg: "#ECFDF5",
    members: [
      { excelName: "Auxilia Christy Jesu", slug: "auxilia-christy-", role: "Life & Disability Insurance", referralNotes: "Every earning professional & business owner" },
      { excelName: "Parasuraman V", slug: "parasuraman", role: "Life & General Insurance", referralNotes: "Complements loans, wealth & HR services" },
      { excelName: "Elavazhagan D", slug: "elavazhagan", role: "Commercial Loans", referralNotes: "Businesses expanding, needing capital" },
      { excelName: "Job Peter John", slug: "job-peter", role: "Wealth Management", referralNotes: "HNI clients, insurance cross-sell" },
      { excelName: "Narendran Govindaraj", slug: "narendran", role: "GST Consulting", referralNotes: "Every registered business in the team" },
      { excelName: "Vedharaman Srinivasan", slug: "vedharaman", role: "CFO Services", referralNotes: "SMEs needing financial structure" },
      { excelName: "Pingnagan Pranavam", slug: "pingnagan", role: "Business Consultant", referralNotes: "Strategy for all growing businesses" },
      { excelName: "Ramesh Ravindranath", slug: "ramesh-ravindranath", role: "Human Resources", referralNotes: "All companies with hiring needs" },
    ],
  },
  {
    name: "Health & Life",
    emoji: "🌿",
    focusArea: "Serving individuals seeking health, wellness & lifestyle",
    whyItWorks:
      "This team serves the individual consumer's personal life and wellbeing journey. Health-conscious customers who visit the dentist also care about clean nutrition, wellness products, and pet care. Travel and legal services overlap with personal life milestones.",
    color: "#0EA5E9",
    lightBg: "#F0F9FF",
    members: [
      { excelName: "Gokul Dass Sridhar", slug: "gokul-dass-sridhar", role: "Dentist", referralNotes: "Every family — cross-refer wellness products" },
      { excelName: "Parikshit Surana", slug: "parikshit-surana", role: "Health & Wellness Products", referralNotes: "Complements nutrition, pet & dental care" },
      { excelName: "Hema E", slug: "hema", role: "Agri Products – Native Rices, Dhall & Millets", referralNotes: "Health-conscious families & corporates" },
      { excelName: "Sudharson P", slug: "sudharson", role: "Pet Shop", referralNotes: "Urban families — vet, grooming, food" },
      { excelName: "Manikandan M", slug: "manikandan", role: "Travel Agent", referralNotes: "Leisure & corporate travel needs" },
      { excelName: "Diwakar S", slug: "diwakar", role: "Lawyer", referralNotes: "Property, business & personal legal matters" },
      { excelName: "Niranjana Sambandam", slug: "niranjana", role: "Lawyer", referralNotes: "Property, business & personal legal matters" },
    ],
  },
  {
    name: "Tech & Trade",
    emoji: "💻",
    focusArea: "Serving businesses that run on technology & operations",
    whyItWorks:
      "These members serve businesses in the B2B and trade space. Software development and IT infrastructure are essential to logistics, manufacturing, and textile businesses. The CHA/freight forwarder shares clients with textile exporters — a tight supply-chain and tech-enablement cluster.",
    color: "#3B82F6",
    lightBg: "#EFF6FF",
    members: [
      { excelName: "Kirubakar N", slug: "kirubakar", role: "Custom Software Development (Web & Mobile)", referralNotes: "Tech for manufacturers, exporters, logistics" },
      { excelName: "Tamilarasan P", slug: "tamilarasan", role: "IT & Networks", referralNotes: "Infrastructure for all B2B clients" },
      { excelName: "Balasundaram N", slug: "balasundaram", role: "Transport, Shipping & Forwarding (CHA)", referralNotes: "Exporters, importers, manufacturers" },
      { excelName: "Nithya Kumaran", slug: "nithya-kumaran", role: "Textiles", referralNotes: "Export clients needing CHA + tech support" },
      { excelName: "Subha Selvam Samsu", slug: "subha-selvam", role: "Textiles", referralNotes: "Export clients needing CHA + tech support" },
    ],
  },
];

/* ── Helpers ─────────────────────────────────────────────────────────────── */

function Initials({ name, size = 72 }: { name: string; size?: number }) {
  const parts = name.trim().split(" ");
  const initials =
    parts.length >= 2
      ? `${parts[0][0]}${parts[parts.length - 1][0]}`
      : parts[0].slice(0, 2);
  return (
    <div
      className="flex items-center justify-center rounded-full text-white font-bold shrink-0"
      style={{
        width: size,
        height: size,
        background: "var(--color-primary)",
        fontSize: size * 0.3,
      }}
    >
      {initials.toUpperCase()}
    </div>
  );
}

/* ── Page ─────────────────────────────────────────────────────────────────── */

export default async function PowerTeamPage() {
  // Fetch all members so we can resolve photos by slug
  const { data: membersData } = await supabase
    .from("members")
    .select("slug, name, profile_picture_url")
    .eq("is_active", true);

  const photoBySlug = new Map<string, string | null>(
    (membersData ?? []).map((m) => [m.slug, m.profile_picture_url])
  );
  const nameBySlug = new Map<string, string>(
    (membersData ?? []).map((m) => [m.slug, m.name])
  );

  const totalMembers = POWER_TEAMS.reduce((s, t) => s + t.members.length, 0);

  return (
    <>
      {/* ── Breadcrumb ────────────────────────────────────────────────── */}
      <div className="pt-24 pb-4 px-6" style={{ background: "var(--color-dark)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <nav className="flex items-center gap-2 text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <span>/</span>
            <Link href="/initiatives" className="hover:text-white transition-colors">Initiatives</Link>
            <span>/</span>
            <span style={{ color: "white" }}>Power Team</span>
          </nav>
        </div>
      </div>

      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <section className="pb-16 pt-8 px-6 text-center" style={{ background: "var(--color-dark)" }}>
        <div className="text-6xl mb-4">{init.icon}</div>
        <h1
          className="text-3xl md:text-5xl font-extrabold text-white mb-3"
          style={{ fontFamily: "Noto Sans Tamil, sans-serif" }}
        >
          {init.tamilName}
        </h1>
        <p className="text-lg font-semibold mb-4" style={{ color: "var(--color-accent)" }}>
          {init.englishName}
        </p>
        <p className="text-white/60 text-base max-w-xl mx-auto leading-relaxed">
          {totalMembers} professionals across {POWER_TEAMS.length} teams — each group sharing the same customer, creating a natural referral chain.
        </p>

        {/* Team quick-nav pills */}
        <div className="flex flex-wrap justify-center gap-3 mt-8">
          {POWER_TEAMS.map((team) => (
            <a
              key={team.name}
              href={`#${team.name.toLowerCase().replace(/\s+/g, "-")}`}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-opacity hover:opacity-80"
              style={{ background: team.color + "22", color: team.color, border: `1.5px solid ${team.color}55` }}
            >
              <span>{team.emoji}</span>
              {team.name}
              <span
                className="text-xs font-bold px-1.5 py-0.5 rounded-full"
                style={{ background: team.color, color: "white" }}
              >
                {team.members.length}
              </span>
            </a>
          ))}
        </div>
      </section>

      {/* ── What is a Power Team ──────────────────────────────────────── */}
      <section className="py-12 px-6" style={{ background: "white" }}>
        <div style={{ maxWidth: 820, margin: "0 auto" }}>
          <h2 className="text-2xl font-extrabold mb-4" style={{ color: "var(--color-dark)" }}>
            What is a Power Team?
          </h2>
          <div className="flex flex-col gap-4">
            {init.fullDescription.map((para, i) => (
              <p key={i} className="text-base" style={{ color: "var(--color-gray)", lineHeight: 1.9 }}>
                {para}
              </p>
            ))}
          </div>
        </div>
      </section>

      {/* ── Team sections ─────────────────────────────────────────────── */}
      <section className="py-6 px-6" style={{ background: "var(--color-bg)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }} className="flex flex-col gap-12">
          {POWER_TEAMS.map((team, teamIdx) => (
            <div
              key={team.name}
              id={team.name.toLowerCase().replace(/\s+/g, "-")}
              className="rounded-2xl overflow-hidden"
              style={{ border: `1.5px solid ${team.color}33`, background: "white" }}
            >
              {/* Team header strip */}
              <div
                className="px-8 py-5 flex flex-wrap items-center gap-4"
                style={{ background: `linear-gradient(135deg, ${team.color}18 0%, ${team.color}08 100%)`, borderBottom: `2px solid ${team.color}33` }}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0"
                    style={{ background: team.color + "20" }}
                  >
                    {team.emoji}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h2 className="text-xl font-extrabold" style={{ color: "var(--color-dark)" }}>
                        {team.name}
                      </h2>
                      <span
                        className="text-xs font-bold px-2.5 py-1 rounded-full shrink-0"
                        style={{ background: team.color, color: "white" }}
                      >
                        {team.members.length} members
                      </span>
                      <span
                        className="text-xs font-bold px-2.5 py-1 rounded-full shrink-0"
                        style={{ background: "#F3F4F6", color: "var(--color-gray)" }}
                      >
                        Team {teamIdx + 1} of {POWER_TEAMS.length}
                      </span>
                    </div>
                    <p className="text-sm mt-0.5" style={{ color: team.color }}>
                      {team.focusArea}
                    </p>
                  </div>
                </div>
              </div>

              {/* Why it works */}
              <div className="px-8 py-5" style={{ background: team.lightBg, borderBottom: `1px solid ${team.color}20` }}>
                <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: team.color }}>
                  💡 Why This Team Works
                </p>
                <p className="text-sm leading-relaxed" style={{ color: "var(--color-gray)" }}>
                  {team.whyItWorks}
                </p>
              </div>

              {/* Member grid */}
              <div className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {team.members.map((member) => {
                    const photo    = photoBySlug.get(member.slug);
                    const dbName   = nameBySlug.get(member.slug) ?? member.excelName;
                    return (
                      <Link
                        key={member.slug}
                        href={`/members/${member.slug}`}
                        className="flex items-start gap-4 p-4 rounded-xl transition-all hover:shadow-md group"
                        style={{
                          background: "var(--color-bg)",
                          border: `1px solid ${team.color}22`,
                        }}
                      >
                        {/* Avatar */}
                        <div className="shrink-0">
                          {photo ? (
                            <Image
                              src={photo}
                              alt={dbName}
                              width={60}
                              height={60}
                              className="rounded-full object-cover"
                              style={{ width: 60, height: 60 }}
                            />
                          ) : (
                            <Initials name={dbName} size={60} />
                          )}
                        </div>

                        {/* Info */}
                        <div className="min-w-0 flex-1">
                          <p
                            className="font-bold text-sm leading-tight group-hover:underline"
                            style={{ color: "var(--color-dark)" }}
                          >
                            {dbName}
                          </p>
                          <p
                            className="text-xs mt-0.5 font-medium"
                            style={{ color: team.color }}
                          >
                            {member.role}
                          </p>
                          <p
                            className="text-xs mt-1.5 leading-relaxed line-clamp-2"
                            style={{ color: "var(--color-gray)" }}
                          >
                            🔗 {member.referralNotes}
                          </p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Stats strip ───────────────────────────────────────────────── */}
      <section className="py-12 px-6" style={{ background: "var(--color-dark)" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { label: "Power Teams", value: POWER_TEAMS.length, emoji: "⚡" },
              { label: "Total Members", value: totalMembers, emoji: "👥" },
              { label: "Shared Client Types", value: "5", emoji: "🎯" },
              { label: "Referral Opportunities", value: "∞", emoji: "🔁" },
            ].map(({ label, value, emoji }) => (
              <div key={label} className="flex flex-col items-center">
                <div className="text-3xl mb-2">{emoji}</div>
                <div className="text-3xl font-extrabold text-white">{value}</div>
                <div className="text-xs font-semibold uppercase tracking-wider mt-1" style={{ color: "rgba(255,255,255,0.45)" }}>
                  {label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Navigation ────────────────────────────────────────────────── */}
      <section className="py-10 px-6" style={{ background: "var(--color-bg)" }}>
        <div
          style={{ maxWidth: 820, margin: "0 auto" }}
          className="flex flex-col sm:flex-row gap-4 justify-between items-center"
        >
          <Link
            href="/initiatives"
            className="flex items-center gap-2 text-sm font-semibold"
            style={{ color: "var(--color-primary)" }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
            Back to Initiatives
          </Link>
          <Link href="/attend-meeting" className="btn-primary text-sm">
            Attend a Meeting
          </Link>
        </div>
      </section>
    </>
  );
}
