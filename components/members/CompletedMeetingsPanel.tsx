"use client";

import {
  buildMeetingRows,
  CounterpartyAvatar,
  sortMeetingRows,
} from "@/components/members/meeting-list-utils";
import type { OneOnOneRequest } from "@/lib/supabase";

type Props = {
  asHost: OneOnOneRequest[];
  asRequester: OneOnOneRequest[];
};

export default function CompletedMeetingsPanel({ asHost, asRequester }: Props) {
  const rows = sortMeetingRows(
    buildMeetingRows(asHost, asRequester, { statuses: ["met"] }),
    "desc"
  );

  return (
    <div
      className="rounded-2xl p-4 flex flex-col"
      style={{ background: "white", border: "1.5px solid #E5E7EB" }}
    >
      <h3 className="font-bold text-sm mb-1" style={{ color: "var(--color-dark)" }}>
        Completed meetings
        {rows.length > 0 && (
          <span className="font-normal text-gray-500 ml-1">({rows.length})</span>
        )}
      </h3>
      <p className="text-xs text-gray-500 mb-3">1-2-1s you marked as met.</p>

      {rows.length === 0 ? (
        <p className="text-xs text-gray-500 flex-1">No completed 1-2-1s yet.</p>
      ) : (
        <ul className="space-y-2">
          {rows.map((row) => (
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
      )}
    </div>
  );
}
