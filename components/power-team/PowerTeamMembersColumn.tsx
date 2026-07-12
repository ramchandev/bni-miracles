"use client";

import { useState } from "react";
import Link from "next/link";
import type { GivesAsksByMemberId } from "@/lib/power-teams-server";
import type { PowerTeamMemberWithMember } from "@/lib/supabase";
import PowerTeamInitials from "@/components/power-team/PowerTeamInitials";

type Props = {
  members: PowerTeamMemberWithMember[];
  captainMemberId: string | null;
  teamColor: string;
  categoryIcons: Map<string, string> | Record<string, string>;
  givesAsksByMemberId: GivesAsksByMemberId | Record<string, { gives: string[]; asks: string[] }>;
  attendanceCounts?: Record<string, number>;
};

function iconFor(
  category: string,
  icons: Map<string, string> | Record<string, string>
): string | undefined {
  if (icons instanceof Map) return icons.get(category);
  return icons[category];
}

function gaFor(
  memberId: string,
  source: GivesAsksByMemberId | Record<string, { gives: string[]; asks: string[] }>
): { gives: string[]; asks: string[] } | undefined {
  if (source instanceof Map) return source.get(memberId);
  return source[memberId];
}

export default function PowerTeamMembersColumn({
  members,
  captainMemberId,
  teamColor,
  categoryIcons,
  givesAsksByMemberId,
  attendanceCounts = {},
}: Props) {
  const [openId, setOpenId] = useState<string | null>(members[0]?.id ?? null);

  if (members.length === 0) {
    return (
      <div>
        <h2 className="text-xl font-extrabold mb-4" style={{ color: "var(--color-dark)" }}>
          Team Members
        </h2>
        <p className="text-sm text-center py-8" style={{ color: "var(--color-gray)" }}>
          Team members coming soon.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-extrabold mb-4" style={{ color: "var(--color-dark)" }}>
        Team Members
      </h2>
      <div className="flex flex-col gap-2">
        {members.map((row) => {
          if (!row.members) return null;
          const m = row.members;
          const isCaptain = m.id === captainMemberId;
          const isOpen = openId === row.id;
          const ga = gaFor(m.id, givesAsksByMemberId);
          const catIcon = iconFor(m.category, categoryIcons);
          const attended = attendanceCounts[m.id] ?? 0;

          return (
            <div
              key={row.id}
              className="rounded-xl overflow-hidden"
              style={{ background: "white", border: "1px solid #E5E7EB" }}
            >
              <button
                type="button"
                className="w-full text-left px-3 py-3 flex items-center gap-3"
                onClick={() => setOpenId(isOpen ? null : row.id)}
                aria-expanded={isOpen}
              >
                <span className="text-xs font-bold shrink-0" style={{ color: teamColor }}>
                  {isOpen ? "▾" : "▸"}
                </span>
                {m.profile_picture_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={m.profile_picture_url}
                    alt={m.name}
                    className="w-10 h-10 rounded-full object-cover shrink-0"
                  />
                ) : (
                  <PowerTeamInitials name={m.name} size={40} />
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span
                      className="text-sm font-extrabold truncate"
                      style={{ color: "var(--color-dark)" }}
                    >
                      {m.name}
                    </span>
                    {isCaptain && (
                      <span
                        className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                        style={{ background: "#FEF3C7", color: "#92400E" }}
                      >
                        Captain
                      </span>
                    )}
                  </div>
                  <p className="text-xs truncate" style={{ color: "var(--color-gray)" }}>
                    {catIcon ? `${catIcon} ` : ""}
                    {m.category}
                  </p>
                </div>
                <span
                  className="text-[10px] font-bold px-2 py-1 rounded-full shrink-0"
                  style={{ background: teamColor + "18", color: teamColor }}
                  title="Meetings attended"
                >
                  {attended} attended
                </span>
              </button>

              {isOpen && (
                <div className="px-3 pb-3 pt-0" style={{ borderTop: "1px solid #F3F4F6" }}>
                  <p className="text-xs mt-2 font-semibold" style={{ color: "var(--color-dark)" }}>
                    {m.business_name}
                  </p>
                  {m.business_location && (
                    <p className="text-xs mt-0.5" style={{ color: "var(--color-gray)" }}>
                      {m.business_location}
                    </p>
                  )}
                  {ga && (ga.gives.length > 0 || ga.asks.length > 0) && (
                    <div className="mt-2 space-y-1">
                      {ga.gives.slice(0, 2).map((g) => (
                        <p key={g} className="text-[11px]" style={{ color: "#166534" }}>
                          ✅ {g}
                        </p>
                      ))}
                      {ga.asks.slice(0, 2).map((a) => (
                        <p key={a} className="text-[11px]" style={{ color: "#9A3412" }}>
                          🙏 {a}
                        </p>
                      ))}
                    </div>
                  )}
                  <Link
                    href={`/members/${m.slug}`}
                    className="inline-block mt-2 text-xs font-bold"
                    style={{ color: teamColor }}
                  >
                    View profile →
                  </Link>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
