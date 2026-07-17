"use client";

import { useMemo, useState } from "react";
import {
  mark121MeetingCancelledAction,
  mark121MeetingMetAction,
} from "@/app/actions/one-on-one";
import {
  buildMeetingRows,
  CounterpartyAvatar,
  sortMeetingRows,
  type MeetingRow,
} from "@/components/members/meeting-list-utils";
import type { OneOnOneRequest } from "@/lib/supabase";

const PAGE_SIZE = 6;

type Props = {
  asHost: OneOnOneRequest[];
  asRequester: OneOnOneRequest[];
  onUpdate?: () => void | Promise<void>;
};

function PastMeetingCard({
  row,
  onUpdate,
}: {
  row: MeetingRow;
  onUpdate?: () => void | Promise<void>;
}) {
  const [busy, setBusy] = useState<"met" | "cancel" | null>(null);
  const [error, setError] = useState("");

  const act = async (action: "met" | "cancel") => {
    setBusy(action);
    setError("");
    try {
      const res =
        action === "met"
          ? await mark121MeetingMetAction(row.id)
          : await mark121MeetingCancelledAction(row.id);
      if (res.error) {
        setError(res.error);
        return;
      }
      await onUpdate?.();
    } finally {
      setBusy(null);
    }
  };

  return (
    <li
      className="rounded-xl p-3"
      style={{ background: "#FFFBEB", border: "1px solid #FDE68A" }}
    >
      <div className="flex items-start gap-3">
        <CounterpartyAvatar person={row.counterparty} />
        <div className="min-w-0 flex-1">
          <p
            className="font-semibold text-sm leading-snug truncate"
            style={{ color: "var(--color-dark)" }}
          >
            {row.counterparty.name}
          </p>
          <p className="text-[11px] text-gray-500 mt-0.5">
            {row.dateLabel} · {row.timeLabel} IST
            <span className="text-gray-400"> · {row.roleLabel}</span>
            {row.counterparty.isGuest && <span className="text-gray-400"> · Guest</span>}
          </p>
          {error && <p className="text-[11px] text-red-600 mt-1">{error}</p>}
        </div>
      </div>
      <div className="flex items-center gap-1.5 mt-2.5">
        <button
          type="button"
          disabled={!!busy}
          onClick={() => act("met")}
          className="h-8 rounded-md px-2.5 text-[11px] font-semibold text-white disabled:opacity-70 disabled:cursor-wait"
          style={{ background: "#16A34A" }}
        >
          {busy === "met" ? "Saving…" : "We met"}
        </button>
        <button
          type="button"
          disabled={!!busy}
          onClick={() => act("cancel")}
          className="h-8 rounded-md px-2.5 text-[11px] font-semibold border border-amber-200 bg-amber-50 text-amber-900 disabled:opacity-70 disabled:cursor-wait"
        >
          {busy === "cancel" ? "Saving…" : "Didn't happen"}
        </button>
      </div>
    </li>
  );
}

export default function CompletedMeetingsPanel({ asHost, asRequester, onUpdate }: Props) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const metRows = useMemo(
    () =>
      sortMeetingRows(
        buildMeetingRows(asHost, asRequester, { statuses: ["met"] }),
        "desc"
      ),
    [asHost, asRequester]
  );

  // Accepted meetings whose time has passed but no one has marked them yet
  const pastRows = useMemo(
    () =>
      sortMeetingRows(
        buildMeetingRows(asHost, asRequester, { statuses: ["accepted"], pastOnly: true }),
        "desc"
      ),
    [asHost, asRequester]
  );

  const q = search.trim().toLowerCase();
  const matches = (row: MeetingRow) =>
    !q ||
    row.counterparty.name.toLowerCase().includes(q) ||
    row.dateLabel.toLowerCase().includes(q);

  const filteredMet = metRows.filter(matches);
  const filteredPast = pastRows.filter(matches);

  const pageCount = Math.max(1, Math.ceil(filteredMet.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const pageRows = filteredMet.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  return (
    <div
      className="rounded-2xl p-4 flex flex-col"
      style={{ background: "white", border: "1.5px solid #E5E7EB" }}
    >
      <h3 className="font-bold text-sm mb-1" style={{ color: "var(--color-dark)" }}>
        Completed meetings
        {metRows.length > 0 && (
          <span className="font-normal text-gray-500 ml-1">({metRows.length})</span>
        )}
      </h3>
      <p className="text-xs text-gray-500 mb-3">
        1-2-1s marked as met by you or the other member.
      </p>

      {(metRows.length > 0 || pastRows.length > 0) && (
        <input
          type="search"
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search by member or date…"
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs mb-3"
        />
      )}

      {filteredPast.length > 0 && (
        <div className="mb-3">
          <p className="text-[11px] font-semibold text-amber-700 mb-2">
            These 1-2-1s were not marked. Did they happen?
          </p>
          <ul className="space-y-2">
            {filteredPast.map((row) => (
              <PastMeetingCard key={row.id} row={row} onUpdate={onUpdate} />
            ))}
          </ul>
        </div>
      )}

      {filteredMet.length === 0 && filteredPast.length === 0 ? (
        <p className="text-xs text-gray-500 flex-1">
          {q ? "No meetings match your search." : "No completed 1-2-1s yet."}
        </p>
      ) : (
        <>
          <ul className="space-y-2">
            {pageRows.map((row) => (
              <li
                key={row.id}
                className="rounded-xl p-3"
                style={{ background: "#F3F4F6", border: "1px solid #D1D5DB" }}
              >
                <div className="flex items-start gap-3">
                  <CounterpartyAvatar person={row.counterparty} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p
                        className="font-semibold text-sm leading-snug truncate"
                        style={{ color: "var(--color-dark)" }}
                      >
                        {row.counterparty.name}
                      </p>
                      <span
                        className="shrink-0 text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded"
                        style={{ background: "#D1D5DB", color: "#374151" }}
                      >
                        Met
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      {row.dateLabel} · {row.timeLabel} IST
                      <span className="text-gray-400"> · {row.roleLabel}</span>
                      {row.counterparty.isGuest && (
                        <span className="text-gray-400"> · Guest</span>
                      )}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          {pageCount > 1 && (
            <div className="flex items-center justify-between mt-3">
              <button
                type="button"
                disabled={safePage <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="text-[11px] font-semibold px-2.5 py-1.5 rounded-md border border-gray-200 disabled:opacity-40"
                style={{ color: "var(--color-dark)" }}
              >
                ← Prev
              </button>
              <span className="text-[11px] text-gray-500">
                Page {safePage} of {pageCount}
              </span>
              <button
                type="button"
                disabled={safePage >= pageCount}
                onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
                className="text-[11px] font-semibold px-2.5 py-1.5 rounded-md border border-gray-200 disabled:opacity-40"
                style={{ color: "var(--color-dark)" }}
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
