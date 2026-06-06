"use client";

import { useState } from "react";
import { toggleReactionAction } from "@/app/actions/bizrox";
import { useMemberSession } from "@/components/MemberSessionContext";
import type { ReactionSummary } from "@/lib/supabase";

export const REACTIONS = [
  { key: "connect",  emoji: "🤝", label: "I Can Connect" },
  { key: "love",     emoji: "❤️", label: "Love It!"      },
  { key: "thanks",   emoji: "🙏", label: "Thanks!"       },
  { key: "thinking", emoji: "🤔", label: "Thinking…"     },
  { key: "fire",     emoji: "🔥", label: "Hot Deal!"     },
  { key: "idea",     emoji: "💡", label: "Great Idea!"   },
  { key: "spread",   emoji: "📢", label: "I'll Spread!"  },
  { key: "good",     emoji: "👍", label: "Good One!"     },
] as const;

type ReactionKey = (typeof REACTIONS)[number]["key"];

export default function ReactionBar({
  postId,
  initialReactions,
}: {
  postId: string;
  initialReactions: ReactionSummary[];
}) {
  const { member } = useMemberSession();

  // Local state: map reaction key → { count, myReaction }
  const [reactionState, setReactionState] = useState<
    Record<string, { count: number; mine: boolean }>
  >(() => {
    const state: Record<string, { count: number; mine: boolean }> = {};
    for (const r of REACTIONS) {
      const summary = initialReactions.find((x) => x.reaction === r.key);
      state[r.key] = {
        count: summary?.count ?? 0,
        mine:  summary?.memberIds.includes(member?.id ?? "__none") ?? false,
      };
    }
    return state;
  });

  const [pending, setPending] = useState<string | null>(null);

  const handleReact = async (key: ReactionKey) => {
    if (!member) {
      // Trigger login modal via custom event (Header listens)
      document.dispatchEvent(new CustomEvent("open-login"));
      return;
    }
    if (pending) return;
    setPending(key);

    // Optimistic update
    setReactionState((prev) => {
      const cur = prev[key];
      return {
        ...prev,
        [key]: {
          count: cur.mine ? cur.count - 1 : cur.count + 1,
          mine:  !cur.mine,
        },
      };
    });

    await toggleReactionAction(postId, key);
    setPending(null);
  };

  // Only show reaction bar if there are reactions OR the user is logged in
  const hasAny = Object.values(reactionState).some((r) => r.count > 0);
  if (!hasAny && !member) return null;

  return (
    <div className="flex flex-wrap gap-1.5 px-5 py-3" style={{ borderTop: "1px solid #F3F4F6" }}>
      {REACTIONS.map((r) => {
        const state = reactionState[r.key];
        const active = state.mine;
        return (
          <button
            key={r.key}
            onClick={() => handleReact(r.key as ReactionKey)}
            disabled={pending === r.key}
            title={r.label}
            className="group relative flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-semibold transition-all"
            style={{
              background: active ? "#FEF9C3" : "#F3F4F6",
              border: `1.5px solid ${active ? "#FDE047" : "transparent"}`,
              transform: pending === r.key ? "scale(1.1)" : "scale(1)",
              opacity: pending && pending !== r.key ? 0.6 : 1,
            }}
          >
            <span className="text-sm leading-none">{r.emoji}</span>
            {state.count > 0 && (
              <span style={{ color: active ? "#92400E" : "#6B7280" }}>
                {state.count}
              </span>
            )}
            {/* Tooltip */}
            <span
              className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 rounded-lg text-xs font-medium text-white whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10"
              style={{ background: "rgba(26,26,46,0.92)" }}
            >
              {r.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
