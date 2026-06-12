"use client";

import { useState } from "react";
import {
  cancel121MeetingAction,
  delete121MeetingAction,
  mark121MeetingMetAction,
} from "@/app/actions/one-on-one";
import {
  buildMeetingRows,
  CounterpartyAvatar,
  sortMeetingRows,
  type MeetingRow,
} from "@/components/members/meeting-list-utils";
import type { OneOnOneRequest } from "@/lib/supabase";

type Props = {
  asHost: OneOnOneRequest[];
  asRequester: OneOnOneRequest[];
  onUpdate: () => void | Promise<void>;
};

function MeetingCard({
  row,
  onUpdate,
}: {
  row: MeetingRow;
  onUpdate: () => void | Promise<void>;
}) {
  const [busy, setBusy] = useState<"met" | "cancel" | "delete" | null>(null);
  const [error, setError] = useState("");

  const act = async (action: "met" | "cancel" | "delete") => {
    if (action === "delete" && !window.confirm("Delete this meeting? This cannot be undone.")) {
      return;
    }

    setBusy(action);
    setError("");
    try {
      const res =
        action === "met"
          ? await mark121MeetingMetAction(row.id)
          : action === "cancel"
            ? await cancel121MeetingAction(row.id)
            : await delete121MeetingAction(row.id);
      if (res.error) {
        setError(res.error);
        return;
      }
      await onUpdate();
    } finally {
      setBusy(null);
    }
  };

  return (
    <li
      className="rounded-xl p-3"
      style={{ background: "#F0FDF4", border: "1px solid #BBF7D0" }}
    >
      <div className="flex items-start gap-3">
        <CounterpartyAvatar person={row.counterparty} />
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-sm leading-snug truncate" style={{ color: "var(--color-dark)" }}>
            {row.counterparty.name}
          </p>
          <p className="text-[11px] text-gray-500 mt-0.5">
            {row.dateLabel} · {row.timeLabel} IST
            <span className="text-gray-400"> · {row.roleLabel}</span>
            {row.counterparty.isGuest && (
              <span className="text-gray-400"> · Guest</span>
            )}
          </p>
          {error && <p className="text-[11px] text-red-600 mt-1">{error}</p>}
        </div>
        <a
          href={`/api/121-ics/${row.id}`}
          className="shrink-0 text-[10px] font-semibold px-2 py-1 rounded"
          style={{ color: "var(--color-primary)", background: "#FEE2E2" }}
          title="Download calendar file"
        >
          .ics
        </a>
      </div>

      <div className="flex items-center justify-between mt-2.5">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            disabled={!!busy}
            onClick={() => act("met")}
            title="Mark as met"
            aria-label={busy === "met" ? "Saving…" : "Mark as met"}
            className="h-8 rounded-md flex items-center gap-1.5 px-2.5 text-[11px] font-semibold text-white disabled:opacity-70 disabled:cursor-wait"
            style={{ background: "#16A34A" }}
          >
            {busy === "met" ? (
              <span>Saving…</span>
            ) : (
              <>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                  className="shrink-0"
                >
                  <path d="m11 17 2 2a1 1 0 1 0 3-3" />
                  <path d="m14 14 2.5 2.5a1 1 0 1 0 3-3l-3.88-3.88a3 3 0 0 0-4.24 0l-.88.88a1 1 0 1 1-3-3l2.81-2.81a5.79 5.79 0 0 1 7.06-.87l.47.28a2 2 0 0 0 1.42.25L21 4" />
                  <path d="m21 3 1 1h-3v3" />
                  <path d="M3 7V5a2 2 0 0 1 2-2h2" />
                  <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
                </svg>
                <span>Met</span>
              </>
            )}
          </button>
          <button
            type="button"
            disabled={!!busy}
            onClick={() => act("cancel")}
            title="Mark as cancelled"
            aria-label={busy === "cancel" ? "Cancelling…" : "Mark as cancelled"}
            className="h-8 rounded-md flex items-center gap-1.5 px-2.5 text-[11px] font-semibold border border-amber-200 bg-amber-50 text-amber-900 disabled:opacity-70 disabled:cursor-wait"
          >
            {busy === "cancel" ? (
              <span>Cancelling…</span>
            ) : (
              <>
                <span aria-hidden className="text-sm leading-none">😢</span>
                <span>Cancelled</span>
              </>
            )}
          </button>
        </div>
        <button
          type="button"
          disabled={!!busy}
          onClick={() => act("delete")}
          title="Delete meeting"
          aria-label={busy === "delete" ? "Deleting…" : "Delete meeting"}
          className="w-8 h-8 rounded-md flex items-center justify-center border border-red-200 bg-red-50 text-red-600 disabled:opacity-70 disabled:cursor-wait"
        >
          {busy === "delete" ? (
            <span className="text-[10px] font-bold">…</span>
          ) : (
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M3 6h18" />
              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
              <line x1="10" x2="10" y1="11" y2="17" />
              <line x1="14" x2="14" y1="11" y2="17" />
            </svg>
          )}
        </button>
      </div>
    </li>
  );
}

export default function UpcomingMeetingsPanel({ asHost, asRequester, onUpdate }: Props) {
  const rows = sortMeetingRows(
    buildMeetingRows(asHost, asRequester, { statuses: ["accepted"], upcomingOnly: true }),
    "asc"
  );

  return (
    <div
      className="rounded-2xl p-4 flex flex-col"
      style={{ background: "white", border: "1.5px solid #E5E7EB" }}
    >
      <h3 className="font-bold text-sm mb-1" style={{ color: "var(--color-dark)" }}>
        Upcoming meetings
        {rows.length > 0 && (
          <span className="font-normal text-gray-500 ml-1">({rows.length})</span>
        )}
      </h3>
      <p className="text-xs text-gray-500 mb-3">Sorted by date and time (IST).</p>

      {rows.length === 0 ? (
        <p className="text-xs text-gray-500 flex-1">No upcoming 1-2-1s scheduled.</p>
      ) : (
        <ul className="space-y-2">
          {rows.map((row) => (
            <MeetingCard key={row.id} row={row} onUpdate={onUpdate} />
          ))}
        </ul>
      )}
    </div>
  );
}
