import Image from "next/image";
import Link from "next/link";
import PowerTeamInitials from "@/components/power-team/PowerTeamInitials";
import type { PowerTeamWithMembers } from "@/lib/supabase";
import { sortTeamMembers } from "@/lib/power-teams-server";

type Props = {
  team: PowerTeamWithMembers;
  avatarSize?: number;
};

export default function PowerTeamMemberIconGrid({ team, avatarSize = 64 }: Props) {
  const members = sortTeamMembers(team);

  if (members.length === 0) {
    return (
      <p className="text-sm py-4 text-center" style={{ color: "var(--color-gray)" }}>
        Members coming soon.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
      {members.map((row) => {
        const member = row.members!;
        const isCaptain = member.id === team.captain_member_id;

        return (
          <Link
            key={row.id}
            href={`/members/${member.slug}`}
            className="group flex flex-col items-center text-center"
            title={isCaptain ? `${member.name} — Team Captain` : member.name}
          >
            <div className="relative mb-2">
              <div
                className="rounded-full p-0.5 transition-transform group-hover:scale-105"
                style={{
                  background: isCaptain
                    ? "linear-gradient(135deg, #FBBF24, #F59E0B)"
                    : `linear-gradient(135deg, ${team.color}, ${team.color}99)`,
                }}
              >
                {member.profile_picture_url ? (
                  <Image
                    src={member.profile_picture_url}
                    alt={member.name}
                    width={avatarSize}
                    height={avatarSize}
                    className="rounded-full object-cover bg-white"
                    style={{ width: avatarSize, height: avatarSize }}
                  />
                ) : (
                  <PowerTeamInitials name={member.name} size={avatarSize} />
                )}
              </div>
              {isCaptain && (
                <span
                  className="absolute -top-1 -right-1 flex items-center justify-center w-6 h-6 rounded-full shadow-md text-sm leading-none"
                  style={{ background: "#FBBF24", color: "#78350F" }}
                  aria-label="Team Captain"
                >
                  ★
                </span>
              )}
            </div>
            <p
              className="text-xs font-semibold leading-tight line-clamp-2 group-hover:underline"
              style={{ color: "var(--color-dark)" }}
            >
              {member.name}
            </p>
            <p className="text-[10px] mt-0.5 line-clamp-1" style={{ color: team.color }}>
              {member.category}
            </p>
          </Link>
        );
      })}
    </div>
  );
}
