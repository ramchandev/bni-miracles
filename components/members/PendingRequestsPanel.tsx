"use client";

import { useState } from "react";
import { accept121RequestAction, decline121RequestAction } from "@/app/actions/one-on-one";
import {
  formatHourLabel,
  formatProfileDate,
  parseStartTime,
} from "@/lib/one-on-one";
import type { OneOnOneRequest } from "@/lib/supabase";

type Props = {
  requests: OneOnOneRequest[];
  onUpdate: () => void | Promise<void>;
};

function slotFromRequest(req: OneOnOneRequest) {
  const s = req.one_on_one_slots;
  if (!s || Array.isArray(s)) return null;
  return s;
}

function PendingRequestCard({
  request,
  onUpdate,
}: {
  request: OneOnOneRequest;
  onUpdate: () => void | Promise<void>;
}) {
  const [busy, setBusy] = useState<"accept" | "decline" | null>(null);
  const [error, setError] = useState("");
  const slot = slotFromRequest(request);

  const act = async (action: "accept" | "decline") => {
    setBusy(action);
    setError("");
    try {
      const res =
        action === "accept"
          ? await accept121RequestAction(request.id)
          : await decline121RequestAction(request.id);
      if (res.error) {
        setError(res.error);
        return;
      }
      await onUpdate();
    } finally {
      setBusy(null);
    }
  };

  const when =
    slot &&
    `${formatProfileDate(slot.slot_date)} · ${formatHourLabel(parseStartTime(slot.start_time))} – ${formatHourLabel(parseStartTime(slot.start_time) + 1)}`;

  return (
    <div className="rounded-xl p-3" style={{ background: "#FFFBEB", border: "1.5px solid #FDE68A" }}>
      <p className="font-semibold text-sm leading-snug" style={{ color: "var(--color-dark)" }}>
        {request.requester_name}
      </p>
      <p className="text-[11px] text-gray-500 mt-0.5">
        {request.requester_chapter} · {request.requester_email}
      </p>
      {when && <p className="text-[11px] text-gray-600 mt-1.5">{when}</p>}
      {error && <p className="text-[11px] text-red-600 mt-1.5">{error}</p>}
      <div className="flex gap-2 mt-2.5">
        <button
          type="button"
          disabled={!!busy}
          {...(busy === "accept" ? { "aria-busy": true as const } : {})}
          onClick={() => act("accept")}
          className="text-xs font-semibold px-3 py-1.5 rounded-lg text-white flex-1 disabled:opacity-90 disabled:cursor-wait"
          style={{ background: "#16A34A" }}
        >
          {busy === "accept" ? "Accepting…" : "Accept"}
        </button>
        <button
          type="button"
          disabled={!!busy}
          {...(busy === "decline" ? { "aria-busy": true as const } : {})}
          onClick={() => act("decline")}
          className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-gray-200 flex-1 disabled:opacity-70 disabled:cursor-wait"
        >
          {busy === "decline" ? "Declining…" : "Decline"}
        </button>
      </div>
    </div>
  );
}

export default function PendingRequestsPanel({ requests, onUpdate }: Props) {
  const pending = requests.filter((r) => r.status === "pending");

  return (
    <div
      className="rounded-2xl p-4"
      style={{ background: "white", border: "1.5px solid #E5E7EB" }}
    >
      <h3 className="font-bold text-sm mb-1" style={{ color: "var(--color-dark)" }}>
        Pending requests
        {pending.length > 0 && (
          <span className="font-normal text-amber-700 ml-1">({pending.length})</span>
        )}
      </h3>
      <p className="text-xs text-gray-500 mb-3">Review and respond to incoming 1-2-1 requests.</p>

      {pending.length === 0 ? (
        <p className="text-xs text-gray-400 text-center py-6 rounded-lg" style={{ background: "#F9FAFB" }}>
          No pending requests
        </p>
      ) : (
        <div className="flex flex-col gap-2.5">
          {pending.map((req) => (
            <PendingRequestCard key={req.id} request={req} onUpdate={onUpdate} />
          ))}
        </div>
      )}
    </div>
  );
}
