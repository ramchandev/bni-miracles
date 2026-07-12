"use client";

import { useState } from "react";
import { useMemberSession } from "@/components/MemberSessionContext";
import { togglePowerTeamLogReactionAction } from "@/app/actions/power-team-logs";
import type { ReactionSummary } from "@/lib/supabase";

export const LOG_REACTION_OPTIONS = [
  { key: "like", emoji: "👍", label: "Like" },
  { key: "love", emoji: "❤️", label: "Love" },
  { key: "thanks", emoji: "🙏", label: "Thanks" },
  { key: "fire", emoji: "🔥", label: "Fire" },
  { key: "idea", emoji: "💡", label: "Great idea" },
  { key: "good", emoji: "👏", label: "Clap" },
  { key: "celebrate", emoji: "🎉", label: "Celebrate" },
  { key: "clap", emoji: "😊", label: "Smile" },
] as const;

type Props = {
  logId: string;
  teamSlug: string;
  initialReactions: ReactionSummary[];
};

export default function PowerTeamLogReactionBar({
  logId,
  teamSlug,
  initialReactions,
}: Props) {
  const { member } = useMemberSession();
  const [pending, setPending] = useState<string | null>(null);
  const [reactionState, setReactionState] = useState<
    Record<string, { count: number; mine: boolean }>
  >(() => {
    const state: Record<string, { count: number; mine: boolean }> = {};
    for (const r of LOG_REACTION_OPTIONS) {
      const summary = initialReactions.find((x) => x.reaction === r.key);
      state[r.key] = {
        count: summary?.count ?? 0,
        mine: summary?.memberIds.includes(member?.id ?? "__none") ?? false,
      };
    }
    return state;
  });

  async function handleReact(key: string) {
    if (!member) {
      document.dispatchEvent(new CustomEvent("open-login"));
      return;
    }
    if (pending) return;
    setPending(key);

    setReactionState((prev) => {
      const cur = prev[key];
      return {
        ...prev,
        [key]: {
          count: cur.mine ? cur.count - 1 : cur.count + 1,
          mine: !cur.mine,
        },
      };
    });

    const result = await togglePowerTeamLogReactionAction(logId, key, teamSlug);
    if (result.error) {
      setReactionState((prev) => {
        const cur = prev[key];
        return {
          ...prev,
          [key]: {
            count: cur.mine ? cur.count - 1 : cur.count + 1,
            mine: !cur.mine,
          },
        };
      });
    }
    setPending(null);
  }

  const hasAny = Object.values(reactionState).some((r) => r.count > 0);

  return (
    <div className="flex flex-wrap gap-1.5 pt-3" style={{ borderTop: "1px solid #F3F4F6" }}>
      {!member && !hasAny && (
        <button
          type="button"
          onClick={() => document.dispatchEvent(new CustomEvent("open-login"))}
          className="text-xs font-semibold px-3 py-1.5 rounded-full"
          style={{ background: "#F3F4F6", color: "var(--color-gray)" }}
        >
          Log in to react
        </button>
      )}
      {LOG_REACTION_OPTIONS.map((r) => {
        const state = reactionState[r.key];
        if (!member && state.count === 0) return null;
        const active = state.mine;
        return (
          <button
            key={r.key}
            type="button"
            onClick={() => handleReact(r.key)}
            disabled={pending === r.key}
            title={r.label}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-semibold transition-all"
            style={{
              background: active ? "#FEF9C3" : "#F3F4F6",
              border: `1.5px solid ${active ? "#FDE047" : "transparent"}`,
              opacity: pending && pending !== r.key ? 0.6 : 1,
            }}
          >
            <span className="text-sm leading-none">{r.emoji}</span>
            {state.count > 0 && (
              <span style={{ color: active ? "#92400E" : "#6B7280" }}>{state.count}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
