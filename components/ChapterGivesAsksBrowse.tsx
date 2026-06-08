"use client";

import Image from "next/image";
import Link from "next/link";
import type { ChapterCategoryGroup } from "@/lib/gives-asks-chapter";

function Avatar({
  name,
  photo,
  size = 28,
}: {
  name: string;
  photo: string | null;
  size?: number;
}) {
  if (photo) {
    return (
      <Image
        src={photo}
        alt=""
        width={size}
        height={size}
        className="rounded-full object-cover shrink-0"
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <div
      className="rounded-full flex items-center justify-center shrink-0 text-white font-bold"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.35,
        background: "var(--color-primary)",
      }}
    >
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

type Props = {
  kind: "give" | "ask";
  groups: ChapterCategoryGroup[];
};

export default function ChapterGivesAsksBrowse({ kind, groups }: Props) {
  const isGive = kind === "give";
  const accentColor = isGive ? "#16A34A" : "var(--color-primary)";
  const borderColor = isGive ? "#D1FAE5" : "#FECACA";
  const headerBg = isGive ? "#ECFDF5" : "#FEF2F2";
  const headerText = isGive ? "#065F46" : "#991B1B";
  const badgeBg = isGive ? "#16A34A" : "#DC2626";
  const emoji = isGive ? "✅" : "🙏";

  if (groups.length === 0) {
    return (
      <p className="text-sm text-center py-12" style={{ color: "var(--color-gray)" }}>
        No {isGive ? "gives" : "asks"} recorded in the chapter yet.
      </p>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-lg font-extrabold mb-1" style={{ color: "var(--color-dark)" }}>
          {isGive ? "✅ Gives" : "🙏 Asks"} — Grouped by Category
        </h2>
        <p className="text-sm" style={{ color: "var(--color-gray)" }}>
          {isGive
            ? "Everything chapter members can refer — organised by referral type."
            : "What chapter members are looking for — organised by referral type."}
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {groups.map((group) => (
          <div
            key={group.label}
            className="rounded-xl overflow-hidden"
            style={{ border: `1px solid ${borderColor}`, background: "white" }}
          >
            <div
              className="px-4 py-3 flex items-center gap-2"
              style={{ background: headerBg, borderBottom: `1px solid ${borderColor}` }}
            >
              <p className="text-sm font-extrabold truncate flex-1" style={{ color: headerText }}>
                {group.label}
              </p>
              <span
                className="shrink-0 text-xs font-bold px-2 py-0.5 rounded-full text-white"
                style={{ background: badgeBg }}
              >
                {group.items.length}
              </span>
            </div>
            <div className="p-3 flex flex-col gap-2">
              {group.items.map((row) => (
                <div key={row.id} className="flex items-center gap-2.5">
                  <Avatar name={row.member_name} photo={row.member_photo} size={28} />
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/members/${row.member_slug}`}
                      className="text-xs font-semibold truncate block hover:underline"
                      style={{ color: "var(--color-dark)" }}
                    >
                      {row.member_name}
                    </Link>
                    <p className="text-xs truncate" style={{ color: "var(--color-gray)" }}>
                      {emoji} {row.item}
                    </p>
                  </div>
                  <Link
                    href={`/members/${row.member_slug}`}
                    className="text-xs shrink-0 font-semibold"
                    style={{ color: accentColor }}
                  >
                    ↗
                  </Link>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
