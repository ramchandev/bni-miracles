import Image from "next/image";
import Link from "next/link";
import PowerTeamInitials from "@/components/power-team/PowerTeamInitials";
import { teamLightBg } from "@/lib/power-teams";
import { sortTeamMembers } from "@/lib/power-teams-server";
import type { PowerTeamWithMembers } from "@/lib/supabase";

type Props = {
  team: PowerTeamWithMembers;
};

function AvatarStack({
  members,
  teamColor,
}: {
  members: { id: string; name: string; profile_picture_url: string | null }[];
  teamColor: string;
}) {
  const visible = members.slice(0, 6);
  const overflow = members.length - visible.length;

  return (
    <div className="flex items-center justify-center py-4">
      <div className="flex items-center">
        {visible.map((member, index) => (
          <div
            key={member.id}
            className="relative rounded-full ring-[3px] ring-white shadow-md transition-transform hover:z-10 hover:scale-110"
            style={{
              marginLeft: index === 0 ? 0 : -14,
              zIndex: visible.length - index,
            }}
          >
            {member.profile_picture_url ? (
              <Image
                src={member.profile_picture_url}
                alt=""
                width={48}
                height={48}
                className="rounded-full object-cover bg-white"
                style={{ width: 48, height: 48 }}
              />
            ) : (
              <PowerTeamInitials name={member.name} size={48} />
            )}
          </div>
        ))}
        {overflow > 0 && (
          <div
            className="flex items-center justify-center rounded-full ring-[3px] ring-white shadow-md text-xs font-bold text-white"
            style={{
              width: 48,
              height: 48,
              marginLeft: -14,
              zIndex: 0,
              background: teamColor,
            }}
          >
            +{overflow}
          </div>
        )}
      </div>
    </div>
  );
}

export default function HomePowerTeamCard({ team }: Props) {
  const members = sortTeamMembers(team).map((row) => row.members!);
  const lightBg = teamLightBg(team.color);

  return (
    <article
      className="group flex flex-col h-full rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-2"
      style={{
        background: "white",
        boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
      }}
    >
      <div
        className="h-1.5 w-full shrink-0"
        style={{ background: `linear-gradient(90deg, ${team.color}, ${team.color}88)` }}
      />

      <div className="p-6 flex flex-col flex-1 text-center">
        <Link href={`/power-team/${team.slug}`} className="block mb-2">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-4xl mx-auto mb-3 shadow-sm"
            style={{ background: lightBg }}
          >
            {team.emoji}
          </div>
          {team.focus_area && (
            <p className="text-sm font-medium leading-snug px-2 mb-3" style={{ color: team.color }}>
              {team.focus_area}
            </p>
          )}
          <h3
            className="text-lg font-extrabold leading-tight group-hover:underline"
            style={{ color: "var(--color-dark)" }}
          >
            {team.name}
          </h3>
        </Link>

        {members.length > 0 ? (
          <AvatarStack
            members={members.map((m) => ({
              id: m.id,
              name: m.name,
              profile_picture_url: m.profile_picture_url,
            }))}
            teamColor={team.color}
          />
        ) : (
          <p className="text-sm py-6 flex-1" style={{ color: "var(--color-gray)" }}>
            Team members coming soon.
          </p>
        )}

        <Link
          href={`/power-team/${team.slug}`}
          className="mt-auto inline-flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-bold text-white transition-opacity hover:opacity-90"
          style={{ background: team.color }}
        >
          View {team.name}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </article>
  );
}
