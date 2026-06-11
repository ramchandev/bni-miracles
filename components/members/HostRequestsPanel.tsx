"use client";

import { useState } from "react";
import {
  accept121RequestAction,
  decline121RequestAction,
  getRequestDanceCardLinksAction,
} from "@/app/actions/one-on-one";
import { formatSlotSummary } from "@/lib/one-on-one";
import type { OneOnOneRequest } from "@/lib/supabase";

type Props = {
  requests: OneOnOneRequest[];
  onUpdate: () => void;
};

function slotFromRequest(req: OneOnOneRequest) {
  const s = req.one_on_one_slots;
  if (!s || Array.isArray(s)) return null;
  return s;
}

export default function HostRequestsPanel({ requests, onUpdate }: Props) {
  const pending = requests.filter((r) => r.status === "pending");
  const accepted = requests.filter((r) => r.status === "accepted");

  if (pending.length === 0 && accepted.length === 0) return null;

  return (
    <div className="space-y-4">
      {pending.length > 0 && (
        <div>
          <h3 className="font-bold text-sm mb-3" style={{ color: "var(--color-dark)" }}>
            Pending requests ({pending.length})
          </h3>
          <div className="flex flex-col gap-3">
            {pending.map((req) => (
              <PendingRequestCard key={req.id} request={req} onUpdate={onUpdate} />
            ))}
          </div>
        </div>
      )}

      {accepted.length > 0 && (
        <div>
          <h3 className="font-bold text-sm mb-3" style={{ color: "var(--color-dark)" }}>
            Confirmed meetings
          </h3>
          <div className="flex flex-col gap-3">
            {accepted.map((req) => (
              <ConfirmedRequestCard key={req.id} request={req} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function PendingRequestCard({
  request,
  onUpdate,
}: {
  request: OneOnOneRequest;
  onUpdate: () => void;
}) {
  const [busy, setBusy] = useState<"accept" | "decline" | null>(null);
  const [error, setError] = useState("");
  const slot = slotFromRequest(request);

  const act = async (action: "accept" | "decline") => {
    setBusy(action);
    setError("");
    const res =
      action === "accept"
        ? await accept121RequestAction(request.id)
        : await decline121RequestAction(request.id);
    setBusy(null);
    if (res.error) setError(res.error);
    else onUpdate();
  };

  return (
    <div className="rounded-xl p-4" style={{ background: "#FFFBEB", border: "1.5px solid #FDE68A" }}>
      <p className="font-semibold text-sm" style={{ color: "var(--color-dark)" }}>
        {request.requester_name}
        <span className="font-normal text-gray-500"> · {request.requester_chapter}</span>
      </p>
      <p className="text-xs text-gray-500 mt-1">{request.requester_email}</p>
      {slot && <p className="text-xs mt-2 text-gray-600">{formatSlotSummary(slot)}</p>}
      {error && <p className="text-xs text-red-600 mt-2">{error}</p>}
      <div className="flex gap-2 mt-3">
        <button
          type="button"
          disabled={!!busy}
          onClick={() => act("accept")}
          className="text-xs font-semibold px-4 py-2 rounded-lg text-white"
          style={{ background: "#16A34A" }}
        >
          {busy === "accept" ? "…" : "Accept"}
        </button>
        <button
          type="button"
          disabled={!!busy}
          onClick={() => act("decline")}
          className="text-xs font-semibold px-4 py-2 rounded-lg border border-gray-200"
        >
          {busy === "decline" ? "…" : "Decline"}
        </button>
      </div>
    </div>
  );
}

function ConfirmedRequestCard({ request }: { request: OneOnOneRequest }) {
  const slot = slotFromRequest(request);
  const [links, setLinks] = useState<{
    hostHasCard: boolean;
    requesterHasCard: boolean;
    requesterUploadUrl: string | null;
  } | null>(null);

  const loadLinks = async () => {
    const res = await getRequestDanceCardLinksAction(request.id);
    if (!res.error) {
      setLinks({
        hostHasCard: res.hostHasCard,
        requesterHasCard: res.requesterHasCard,
        requesterUploadUrl: res.requesterUploadUrl,
      });
    }
  };

  return (
    <div className="rounded-xl p-4" style={{ background: "#F0FDF4", border: "1.5px solid #BBF7D0" }}>
      <p className="font-semibold text-sm" style={{ color: "var(--color-dark)" }}>
        {request.requester_name}
        <span className="font-normal text-gray-500"> · {request.requester_chapter}</span>
      </p>
      {slot && <p className="text-xs mt-2 text-gray-600">{formatSlotSummary(slot)}</p>}
      <div className="flex flex-wrap gap-2 mt-3">
        <a
          href={`/api/121-ics/${request.id}`}
          className="text-xs font-semibold px-3 py-1.5 rounded-lg"
          style={{ background: "#FEE2E2", color: "var(--color-primary)" }}
        >
          Download .ics
        </a>
        {!links ? (
          <button
            type="button"
            onClick={loadLinks}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-gray-200"
          >
            View dance cards
          </button>
        ) : (
          <>
            {links.hostHasCard && (
              <a
                href="/api/dance-card-pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-gray-200"
              >
                Your dance card
              </a>
            )}
            {links.requesterUploadUrl && (
              <a
                href={links.requesterUploadUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-gray-200"
              >
                Requester PDF
              </a>
            )}
            {links.requesterHasCard && !links.requesterUploadUrl && (
              <span className="text-xs text-gray-500 self-center">Requester has dance card on file</span>
            )}
          </>
        )}
      </div>
    </div>
  );
}
