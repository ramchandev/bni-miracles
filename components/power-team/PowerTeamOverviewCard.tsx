import Link from "next/link";
import PowerTeamMemberIconGrid from "@/components/power-team/PowerTeamMemberIconGrid";
import { teamLightBg } from "@/lib/power-teams";
import { countTeamMembers } from "@/lib/power-teams-server";
import type { PowerTeamWithMembers } from "@/lib/supabase";

type Props = {
  team: PowerTeamWithMembers;
  teamIndex: number;
  teamTotal: number;
};

export default function PowerTeamOverviewCard({ team, teamIndex, teamTotal }: Props) {
  const memberCount = countTeamMembers(team);
  const lightBg = teamLightBg(team.color);

  return (
    <article
      className="card p-6 flex flex-col h-full"
      style={{ border: `1.5px solid ${team.color}33` }}
    >
      <div className="flex items-start gap-4 mb-5">
        <div
          className="w-14 h-14 rounded-xl flex items-center justify-center text-3xl shrink-0"
          style={{ background: lightBg }}
        >
          {team.emoji}
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-extrabold mb-1" style={{ color: "var(--color-dark)" }}>
            {team.name}
          </h2>
          {team.focus_area && (
            <p className="text-sm line-clamp-2" style={{ color: team.color }}>
              {team.focus_area}
            </p>
          )}
          <div className="flex flex-wrap gap-2 mt-3">
            <span
              className="text-xs font-bold px-2.5 py-1 rounded-full"
              style={{ background: team.color, color: "white" }}
            >
              {memberCount} members
            </span>
            <span
              className="text-xs font-bold px-2.5 py-1 rounded-full"
              style={{ background: "#F3F4F6", color: "var(--color-gray)" }}
            >
              Team {teamIndex + 1} of {teamTotal}
            </span>
          </div>
        </div>
      </div>

      <PowerTeamMemberIconGrid team={team} />

      <Link
        href={`/power-team/${team.slug}`}
        className="mt-6 inline-flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-bold text-white transition-opacity hover:opacity-90"
        style={{ background: team.color }}
      >
        View Team Details
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </Link>
    </article>
  );
}
