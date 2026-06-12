"use client";

import { useState } from "react";
import {
  accept121RequestAction,
  decline121RequestAction,
  getRequestDanceCardLinksAction,
} from "@/app/actions/one-on-one";
import { formatSlotSummary } from "@/lib/one-on-one";
import {
  EVENT_STYLES,
  eventTimeLabel,
  type My121CalendarEvent,
} from "@/lib/my-121-calendar";

type Props = {
  event: My121CalendarEvent | null;
  onUpdate: () => void | Promise<void>;
  onRemoveSlot?: (slotId: string) => void | Promise<void>;
  removingSlotId?: string | null;
};

export default function My121EventDetail({
  event,
  onUpdate,
  onRemoveSlot,
  removingSlotId,
}: Props) {
  const [busy, setBusy] = useState<"accept" | "decline" | null>(null);
  const [error, setError] = useState("");
  const [links, setLinks] = useState<{
    hostHasCard: boolean;
    requesterHasCard: boolean;
    requesterUploadUrl: string | null;
  } | null>(null);

  if (!event) {
    return (
      <div
        className="rounded-2xl p-6 text-center"
        style={{ background: "white", border: "1.5px solid #E5E7EB" }}
      >
        <p className="text-sm text-gray-500">
          Select a slot on the calendar to view details and take action.
        </p>
      </div>
    );
  }

  const style = EVENT_STYLES[event.kind];
  const req = event.request;

  const act = async (action: "accept" | "decline") => {
    if (!req) return;
    setBusy(action);
    setError("");
    try {
      const res =
        action === "accept"
          ? await accept121RequestAction(req.id)
          : await decline121RequestAction(req.id);
      if (res.error) {
        setError(res.error);
        return;
      }
      await onUpdate();
    } finally {
      setBusy(null);
    }
  };

  const loadLinks = async () => {
    if (!req) return;
    const res = await getRequestDanceCardLinksAction(req.id);
    if (!res.error) {
      setLinks({
        hostHasCard: res.hostHasCard,
        requesterHasCard: res.requesterHasCard,
        requesterUploadUrl: res.requesterUploadUrl,
      });
    }
  };

  const kindLabel =
    event.kind === "open"
      ? "Open slot"
      : event.kind === "pending_host"
        ? "Pending request"
        : event.kind === "confirmed_host"
          ? "Confirmed · You host"
          : event.kind === "pending_guest"
            ? "Pending · You attend"
            : "Confirmed · You attend";

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: "white", border: "1.5px solid #E5E7EB" }}>
      <div className="px-4 py-3 border-b border-gray-100" style={{ background: style.bg }}>
        <p className="text-[10px] font-bold uppercase tracking-wide" style={{ color: style.text }}>
          {kindLabel}
        </p>
        <h3 className="font-bold text-lg mt-0.5" style={{ color: "var(--color-dark)" }}>
          {event.title}
        </h3>
        <p className="text-xs mt-1" style={{ color: style.text }}>
          {eventTimeLabel(event.startHour)} IST · {event.subtitle}
        </p>
      </div>

      <div className="p-4 space-y-3 text-sm">
        <p className="text-gray-600 text-xs leading-relaxed">{formatSlotSummary(event.slot)}</p>

        {req && (
          <div className="rounded-lg p-3 text-xs space-y-1" style={{ background: "#F9FAFB" }}>
            <p>
              <span className="text-gray-500">Requester:</span>{" "}
              <span className="font-semibold">{req.requester_name}</span>
            </p>
            <p>
              <span className="text-gray-500">Chapter:</span> {req.requester_chapter}
            </p>
            <p>
              <span className="text-gray-500">Email:</span>{" "}
              <a href={`mailto:${req.requester_email}`} className="text-blue-600 hover:underline">
                {req.requester_email}
              </a>
            </p>
          </div>
        )}

        {event.role === "guest" && req && (
          <p className="text-xs text-gray-500">
            You requested this 1-2-1 as a guest. The host will accept or decline from their calendar.
          </p>
        )}

        {error && <p className="text-xs text-red-600">{error}</p>}

        <div className="flex flex-wrap gap-2 pt-1">
          {event.kind === "pending_host" && req && (
            <>
              <button
                type="button"
                disabled={!!busy}
                {...(busy === "accept" ? { "aria-busy": true as const } : {})}
                onClick={() => act("accept")}
                className="text-xs font-semibold px-4 py-2 rounded-lg text-white min-w-[6.5rem] disabled:opacity-90 disabled:cursor-wait"
                style={{ background: "#16A34A" }}
              >
                {busy === "accept" ? "Accepting…" : "Accept"}
              </button>
              <button
                type="button"
                disabled={!!busy}
                {...(busy === "decline" ? { "aria-busy": true as const } : {})}
                onClick={() => act("decline")}
                className="text-xs font-semibold px-4 py-2 rounded-lg border border-gray-200 min-w-[6.5rem] disabled:opacity-70 disabled:cursor-wait"
              >
                {busy === "decline" ? "Declining…" : "Decline"}
              </button>
            </>
          )}

          {event.kind === "open" && onRemoveSlot && (
            <button
              type="button"
              disabled={removingSlotId === event.slot.id}
              onClick={() => onRemoveSlot(event.slot.id)}
              className="text-xs font-semibold px-4 py-2 rounded-lg text-red-600 border border-red-200 hover:bg-red-50"
            >
              {removingSlotId === event.slot.id ? "Removing…" : "Remove slot"}
            </button>
          )}

          {req && (event.kind === "confirmed_host" || event.kind === "confirmed_guest") && (
            <>
              <a
                href={`/api/121-ics/${req.id}`}
                className="text-xs font-semibold px-3 py-2 rounded-lg"
                style={{ background: "#FEE2E2", color: "var(--color-primary)" }}
              >
                Download .ics
              </a>
              <button
                type="button"
                onClick={loadLinks}
                className="text-xs font-semibold px-3 py-2 rounded-lg border border-gray-200"
              >
                Dance cards
              </button>
            </>
          )}
        </div>

        {links && (
          <div className="flex flex-wrap gap-2 pt-1 border-t border-gray-100">
            {links.hostHasCard && event.role === "host" && (
              <a
                href="/api/dance-card-pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-semibold text-gray-700 hover:underline"
              >
                Your dance card
              </a>
            )}
            {links.requesterUploadUrl && (
              <a
                href={links.requesterUploadUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-semibold text-gray-700 hover:underline"
              >
                Requester PDF
              </a>
            )}
            {links.requesterHasCard && !links.requesterUploadUrl && (
              <span className="text-xs text-gray-500">Requester has dance card on file</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
