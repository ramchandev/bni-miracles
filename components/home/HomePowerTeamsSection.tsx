import Link from "next/link";
import HomePowerTeamCard from "@/components/home/HomePowerTeamCard";
import { POWER_TEAM_PROGRAM } from "@/lib/power-teams-content";
import { countTeamMembers } from "@/lib/power-teams-server";
import type { PowerTeamWithMembers } from "@/lib/supabase";

type Props = {
  teams: PowerTeamWithMembers[];
};

export default function HomePowerTeamsSection({ teams }: Props) {
  if (teams.length === 0) return null;

  const totalMembers = teams.reduce((sum, t) => sum + countTeamMembers(t), 0);

  return (
    <section className="py-20 px-6 relative overflow-hidden" style={{ background: "var(--color-dark)" }}>
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 20% 0%, rgba(200,16,46,0.25) 0%, transparent 55%), radial-gradient(ellipse 60% 40% at 90% 100%, rgba(251,191,36,0.12) 0%, transparent 50%)",
        }}
      />
      <div
        className="absolute -top-24 -right-24 w-80 h-80 rounded-full opacity-[0.07]"
        style={{ background: "var(--color-accent)", filter: "blur(60px)" }}
        aria-hidden
      />

      <div className="relative z-10" style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div className="text-center mb-14">
          <p
            className="text-sm font-semibold tracking-widest uppercase mb-3"
            style={{ color: "var(--color-accent)" }}
          >
            {POWER_TEAM_PROGRAM.englishName}
          </p>
          <h2
            className="text-3xl md:text-4xl font-extrabold text-white mb-3"
            style={{ fontFamily: "Noto Sans Tamil, sans-serif" }}
          >
            {POWER_TEAM_PROGRAM.tamilName}
          </h2>
          <p className="text-base max-w-2xl mx-auto mb-6" style={{ color: "rgba(255,255,255,0.65)", lineHeight: 1.75 }}>
            {POWER_TEAM_PROGRAM.tagline}
          </p>
          <div className="inline-flex flex-wrap items-center justify-center gap-3">
            <span
              className="text-xs font-bold px-4 py-2 rounded-full"
              style={{ background: "rgba(255,255,255,0.1)", color: "white", border: "1px solid rgba(255,255,255,0.15)" }}
            >
              {teams.length} Power Teams
            </span>
            <span
              className="text-xs font-bold px-4 py-2 rounded-full"
              style={{ background: "var(--color-primary)", color: "white" }}
            >
              {totalMembers} Members in Synergy
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 mb-12">
          {teams.map((team) => (
            <HomePowerTeamCard key={team.id} team={team} />
          ))}
        </div>

        <div className="text-center">
          <Link
            href="/power-team"
            className="btn-secondary text-base inline-flex items-center gap-2"
            style={{ padding: "0.875rem 2rem" }}
          >
            <span aria-hidden>{POWER_TEAM_PROGRAM.icon}</span>
            Explore All Power Teams
          </Link>
        </div>
      </div>
    </section>
  );
}
