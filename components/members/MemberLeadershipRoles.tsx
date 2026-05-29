import Link from "next/link";
import { groupLightBg } from "@/lib/leadership-colors";
import type { MemberLeadershipRole } from "@/lib/leadership-server";

type Props = {
  roles: MemberLeadershipRole[];
};

export default function MemberLeadershipRoles({ roles }: Props) {
  if (roles.length === 0) return null;

  const byGroup = roles.reduce(
    (acc, item) => {
      if (!acc[item.groupId]) {
        acc[item.groupId] = {
          groupName: item.groupName,
          groupSubtitle: item.groupSubtitle,
          groupColor: item.groupColor,
          roles: [],
        };
      }
      acc[item.groupId].roles.push(item);
      return acc;
    },
    {} as Record<
      string,
      {
        groupName: string;
        groupSubtitle: string | null;
        groupColor: string;
        roles: MemberLeadershipRole[];
      }
    >
  );

  return (
    <div
      className="rounded-2xl p-6"
      style={{ border: "1.5px solid #E5E7EB", background: "#FAFAFA" }}
    >
      <div className="flex items-center gap-3 mb-5">
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-lg shrink-0"
          style={{ background: "#F3F4F6" }}
        >
          👔
        </div>
        <div>
          <h2 className="font-bold text-base" style={{ color: "var(--color-dark)" }}>
            Chapter Leadership Roles
          </h2>
          <p className="text-xs" style={{ color: "var(--color-gray)" }}>
            Positions held at BNI Miracles
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {Object.entries(byGroup).map(([groupId, group]) => (
          <div key={groupId}>
            <p
              className="text-xs font-bold uppercase tracking-wide mb-2 pl-2"
              style={{ color: group.groupColor, borderLeft: `3px solid ${group.groupColor}` }}
            >
              {group.groupName}
              {group.groupSubtitle && (
                <span className="font-normal normal-case tracking-normal ml-1" style={{ color: "var(--color-gray)" }}>
                  · {group.groupSubtitle}
                </span>
              )}
            </p>
            <ul className="flex flex-col gap-2">
              {group.roles.map((role) => (
                <li
                  key={role.roleId}
                  className="px-3 py-2.5 rounded-lg"
                  style={{
                    background: groupLightBg(group.groupColor),
                    border: `1px solid ${group.groupColor}33`,
                    borderLeft: `4px solid ${group.groupColor}`,
                  }}
                >
                  <p className="text-sm font-semibold" style={{ color: group.groupColor }}>
                    {role.roleName}
                  </p>
                  {role.roleDescription && (
                    <p className="text-xs mt-0.5 leading-snug" style={{ color: "var(--color-gray)" }}>
                      {role.roleDescription}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <p className="mt-4 text-xs">
        <Link href="/about" className="font-semibold hover:underline" style={{ color: "var(--color-primary)" }}>
          View full leadership team →
        </Link>
      </p>
    </div>
  );
}
