"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import MemberAssignPicker, { type MemberOption } from "@/components/admin/MemberAssignPicker";

export type GiveAskRow = {
  member_id: string;
  member_name: string;
  member_slug: string;
  member_category: string;
  member_photo: string | null;
  type: "give" | "ask";
  item: string;
  category_id: string | null;
  category_name: string | null;
};

export type ReferralMatch = {
  score: number;
  give: GiveAskRow;
  ask: GiveAskRow;
};

function scoreLabel(s: number): { label: string; bg: string; color: string } {
  if (s >= 0.55) return { label: "Strong", bg: "#DCFCE7", color: "#166534" };
  if (s >= 0.35) return { label: "Good", bg: "#FEF9C3", color: "#854D0E" };
  return { label: "Possible", bg: "#EFF6FF", color: "#1E40AF" };
}

function Avatar({ name, photo, size = 36 }: { name: string; photo: string | null; size?: number }) {
  if (photo) {
    return (
      <Image
        src={photo}
        alt={name}
        width={size}
        height={size}
        className="rounded-full object-cover shrink-0"
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <div
      className="flex items-center justify-center rounded-full shrink-0 text-white font-bold"
      style={{ width: size, height: size, background: "var(--color-primary)", fontSize: size * 0.35 }}
    >
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

function MemberChip({ row, side, highlight }: { row: GiveAskRow; side: "give" | "ask"; highlight?: boolean }) {
  const color = side === "give" ? "#16A34A" : "#DC2626";
  return (
    <div
      className="flex items-start gap-3 p-3 rounded-xl flex-1 min-w-0"
      style={{
        background: color + "0C",
        border: highlight ? `2px solid ${color}` : `1px solid ${color}25`,
      }}
    >
      <Avatar name={row.member_name} photo={row.member_photo} size={36} />
      <div className="min-w-0">
        <p className="text-xs font-bold truncate" style={{ color: "var(--color-dark)" }}>
          {row.member_name}
        </p>
        <p className="text-xs truncate" style={{ color }}>
          {row.member_category}
        </p>
        <p className="text-xs mt-1 leading-relaxed line-clamp-2" style={{ color: "var(--color-gray)" }}>
          {side === "give" ? "✅" : "🙏"} {row.item}
          {row.category_name && (
            <span className="ml-1 font-semibold" style={{ color }}>
              · {row.category_name}
            </span>
          )}
        </p>
      </div>
      <Link
        href={`/members/${row.member_slug}`}
        className="shrink-0 text-xs px-2 py-1 rounded font-semibold"
        style={{ background: color + "20", color }}
      >
        →
      </Link>
    </div>
  );
}

type Props = {
  matches: ReferralMatch[];
  members: MemberOption[];
};

export default function ReferralPairsSection({ matches, members }: Props) {
  const [memberId, setMemberId] = useState<string | null>(null);

  const selectedMember = useMemo(
    () => members.find((m) => m.id === memberId) ?? null,
    [members, memberId]
  );

  const filteredMatches = useMemo(() => {
    if (!memberId) return matches;
    return matches.filter((m) => m.give.member_id === memberId || m.ask.member_id === memberId);
  }, [matches, memberId]);

  const giveMatchCount = useMemo(
    () => (memberId ? filteredMatches.filter((m) => m.give.member_id === memberId).length : 0),
    [filteredMatches, memberId]
  );

  const askMatchCount = useMemo(
    () => (memberId ? filteredMatches.filter((m) => m.ask.member_id === memberId).length : 0),
    [filteredMatches, memberId]
  );

  return (
    <section id="matches" className="mb-14">
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <h2 className="text-lg font-extrabold" style={{ color: "var(--color-dark)" }}>
          🎯 Potential Referral Pairs
        </h2>
        <span
          className="text-xs font-semibold px-2.5 py-1 rounded-full"
          style={{ background: "#EDE9FE", color: "#7C3AED" }}
        >
          {filteredMatches.length} pair{filteredMatches.length === 1 ? "" : "s"}
          {memberId ? " for filter" : ""}
        </span>
      </div>

      <p className="text-sm mb-4" style={{ color: "var(--color-gray)" }}>
        Member A&apos;s <strong>give</strong> closely matches Member B&apos;s <strong>ask</strong>.
        Connect them — this is where referrals happen.
      </p>

      <div className="mb-5 p-4 rounded-xl" style={{ background: "#F9FAFB", border: "1px solid #E5E7EB" }}>
        <label className="text-xs font-bold uppercase tracking-wide block mb-2" style={{ color: "var(--color-gray)" }}>
          Filter by member
        </label>
        <MemberAssignPicker
          members={members}
          value={memberId}
          onChange={setMemberId}
          placeholder="Search member…"
          clearLabel="All members"
          emptyButtonLabel="Filter by member…"
        />
        {selectedMember && (
          <p className="text-xs mt-3" style={{ color: "var(--color-gray)" }}>
            Showing matches for <strong style={{ color: "var(--color-dark)" }}>{selectedMember.name}</strong>
            {giveMatchCount > 0 && (
              <>
                {" "}
                · <span style={{ color: "#16A34A" }}>{giveMatchCount} give→ask</span>
              </>
            )}
            {askMatchCount > 0 && (
              <>
                {" "}
                · <span style={{ color: "#DC2626" }}>{askMatchCount} ask←give</span>
              </>
            )}
          </p>
        )}
      </div>

      {filteredMatches.length === 0 ? (
        <div
          className="text-center py-12 rounded-xl"
          style={{ background: "#F9FAFB", border: "1px dashed #E5E7EB" }}
        >
          <p className="text-4xl mb-3">🔍</p>
          <p className="text-sm font-semibold" style={{ color: "var(--color-gray)" }}>
            {memberId
              ? `No referral pairs found for ${selectedMember?.name ?? "this member"}.`
              : "No strong matches yet — encourage members to add more specific gives & asks."}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {filteredMatches.map((m, i) => {
            const { label: sl, bg, color } = scoreLabel(m.score);
            const giveHighlight = memberId === m.give.member_id;
            const askHighlight = memberId === m.ask.member_id;
            return (
              <div
                key={`${m.give.member_id}:${m.give.item}|${m.ask.member_id}:${m.ask.item}:${i}`}
                className="rounded-2xl overflow-hidden"
                style={{ border: `1.5px solid ${color}30`, background: "white" }}
              >
                <div
                  className="flex items-center gap-3 px-5 py-3"
                  style={{ background: bg, borderBottom: `1px solid ${color}25` }}
                >
                  <span
                    className="text-xs font-extrabold px-2.5 py-1 rounded-full"
                    style={{ background: color + "20", color }}
                  >
                    {sl} — {Math.round(m.score * 100)}% match
                  </span>
                  <span className="text-xs" style={{ color }}>
                    {m.give.member_name.split(" ")[0]} can refer to {m.ask.member_name.split(" ")[0]}
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 p-4 items-stretch">
                  <MemberChip row={m.give} side="give" highlight={giveHighlight} />
                  <div className="flex items-center justify-center text-lg shrink-0">⟷</div>
                  <MemberChip row={m.ask} side="ask" highlight={askHighlight} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
