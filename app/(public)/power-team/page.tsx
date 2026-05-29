import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import PowerTeamOverviewCard from "@/components/power-team/PowerTeamOverviewCard";
import { POWER_TEAM_PROGRAM } from "@/lib/power-teams-content";
import { countTeamMembers, fetchPowerTeamsWithMembers } from "@/lib/power-teams-server";
import { breadcrumbJsonLd, createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: `${POWER_TEAM_PROGRAM.englishName} — ${POWER_TEAM_PROGRAM.tamilName}`,
  description: POWER_TEAM_PROGRAM.tagline,
  path: "/power-team",
  keywords: ["BNI Power Team", "referral synergy", "BNI Miracles Chennai"],
});

export default async function PowerTeamOverviewPage() {
  const teams = await fetchPowerTeamsWithMembers();
  const totalMembers = teams.reduce((sum, t) => sum + countTeamMembers(t), 0);

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Power Team", path: "/power-team" },
        ])}
      />

      <div className="pt-24 pb-4 px-6" style={{ background: "var(--color-dark)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <nav className="flex items-center gap-2 text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <span>/</span>
            <span style={{ color: "white" }}>Power Team</span>
          </nav>
        </div>
      </div>

      <section className="pb-16 pt-8 px-6 text-center" style={{ background: "var(--color-dark)" }}>
        <div className="text-6xl mb-4">{POWER_TEAM_PROGRAM.icon}</div>
        <h1
          className="text-3xl md:text-5xl font-extrabold text-white mb-3"
          style={{ fontFamily: "Noto Sans Tamil, sans-serif" }}
        >
          {POWER_TEAM_PROGRAM.tamilName}
        </h1>
        <p className="text-lg font-semibold mb-4" style={{ color: "var(--color-accent)" }}>
          {POWER_TEAM_PROGRAM.englishName}
        </p>
        <p className="text-white/60 text-base max-w-xl mx-auto leading-relaxed">
          {teams.length > 0
            ? `${totalMembers} professionals across ${teams.length} teams — each group sharing the same customer, creating a natural referral chain.`
            : "Power Teams are being set up — check back soon."}
        </p>
      </section>

      <section className="py-12 px-6" style={{ background: "white" }}>
        <div style={{ maxWidth: 820, margin: "0 auto" }}>
          <h2 className="text-2xl font-extrabold mb-4" style={{ color: "var(--color-dark)" }}>
            What is a Power Team?
          </h2>
          <div className="flex flex-col gap-4">
            {POWER_TEAM_PROGRAM.introParagraphs.map((para, i) => (
              <p key={i} className="text-base" style={{ color: "var(--color-gray)", lineHeight: 1.9 }}>
                {para}
              </p>
            ))}
          </div>
          <p className="mt-6">
            <Link href="/initiatives" className="text-sm font-semibold" style={{ color: "var(--color-primary)" }}>
              See all chapter initiatives →
            </Link>
          </p>
        </div>
      </section>

      {teams.length > 0 && (
        <>
          <section className="py-12 px-6" style={{ background: "var(--color-bg)" }}>
            <div style={{ maxWidth: 1200, margin: "0 auto" }}>
              <h2 className="section-title mb-2 text-center">Our Power Teams</h2>
              <p className="text-center text-sm mb-10" style={{ color: "var(--color-gray)" }}>
                Select a team to meet the members and learn why they work together.
              </p>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {teams.map((team, i) => (
                  <PowerTeamOverviewCard key={team.id} team={team} teamIndex={i} teamTotal={teams.length} />
                ))}
              </div>
            </div>
          </section>

          <section className="py-12 px-6" style={{ background: "var(--color-dark)" }}>
            <div style={{ maxWidth: 900, margin: "0 auto" }}>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                {[
                  { label: "Power Teams", value: teams.length, emoji: "⚡" },
                  { label: "Total Members", value: totalMembers, emoji: "👥" },
                  {
                    label: "Avg per Team",
                    value: teams.length ? Math.round(totalMembers / teams.length) : 0,
                    emoji: "📊",
                  },
                  { label: "Referral Opportunities", value: "∞", emoji: "🔁" },
                ].map(({ label, value, emoji }) => (
                  <div key={label} className="flex flex-col items-center">
                    <div className="text-3xl mb-2">{emoji}</div>
                    <div className="text-3xl font-extrabold text-white">{value}</div>
                    <div
                      className="text-xs font-semibold uppercase tracking-wider mt-1"
                      style={{ color: "rgba(255,255,255,0.45)" }}
                    >
                      {label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </>
      )}

      <section className="py-10 px-6" style={{ background: "var(--color-bg)" }}>
        <div
          style={{ maxWidth: 820, margin: "0 auto" }}
          className="flex flex-col sm:flex-row gap-4 justify-between items-center"
        >
          <Link href="/members" className="flex items-center gap-2 text-sm font-semibold" style={{ color: "var(--color-primary)" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
            Meet All Members
          </Link>
          <Link href="/attend-meeting" className="btn-primary text-sm">
            Attend a Meeting
          </Link>
        </div>
      </section>
    </>
  );
}
