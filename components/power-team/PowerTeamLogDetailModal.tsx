"use client";

import { useState, useTransition } from "react";
import {
  formatBusinessValue,
  formatMeetingDateLabel,
  relativeMeetingAge,
} from "@/lib/power-team-log-format";
import PowerTeamLogReactionBar from "@/components/power-team/PowerTeamLogReactionBar";
import PowerTeamLogAttendanceAvatars from "@/components/power-team/PowerTeamLogAttendanceAvatars";
import { deletePowerTeamLogAction } from "@/app/actions/power-team-logs";
import type { PowerTeamMeetingLogWithMeta } from "@/lib/supabase";

type Props = {
  log: PowerTeamMeetingLogWithMeta;
  teamSlug: string;
  teamColor: string;
  canManage?: boolean;
  onClose: () => void;
  onEdit?: () => void;
  onDeleted?: () => void;
};

export default function PowerTeamLogDetailModal({
  log,
  teamSlug,
  teamColor,
  canManage = false,
  onClose,
  onEdit,
  onDeleted,
}: Props) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const valueLabel = formatBusinessValue(log.business_value);

  function handleDelete() {
    if (!confirm(`Delete meeting log from ${formatMeetingDateLabel(log.meeting_date)}?`)) return;
    setError("");
    startTransition(async () => {
      const result = await deletePowerTeamLogAction(log.id, teamSlug);
      if (result.error) {
        setError(result.error);
        return;
      }
      onDeleted?.();
      onClose();
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.45)" }}
      onClick={onClose}
      role="presentation"
    >
      <div
        className="w-full max-w-3xl rounded-2xl bg-white shadow-xl overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="log-detail-title"
      >
        <div
          className="flex items-center justify-between px-5 py-4 border-b shrink-0"
          style={{ borderColor: "#E5E7EB" }}
        >
          <div>
            <h2
              id="log-detail-title"
              className="text-lg font-extrabold"
              style={{ color: "var(--color-dark)" }}
            >
              Meeting Log
            </h2>
            <p className="text-xs mt-0.5" style={{ color: teamColor }}>
              {relativeMeetingAge(log.meeting_date)} · {formatMeetingDateLabel(log.meeting_date)}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-sm font-semibold px-2 py-1"
            style={{ color: "var(--color-gray)" }}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="overflow-y-auto px-5 py-5 flex flex-col gap-4">
          {log.image_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={log.image_url}
              alt="Meeting photo"
              className="w-full h-auto object-contain rounded-xl"
            />
          )}

          <div className="grid grid-cols-1 gap-3">
            <Field label="Meeting Date" value={formatMeetingDateLabel(log.meeting_date)} />
            {log.venue && <Field label="Venue" value={log.venue} />}
            <Field label="Comments" value={log.comments} multiline />
            {log.referrals_exchanged != null && (
              <Field
                label="Referrals Exchanged"
                value={String(log.referrals_exchanged)}
              />
            )}
            {valueLabel && <Field label="Business Value" value={valueLabel} />}
            {log.members && (
              <Field label="Logged by" value={log.members.name} />
            )}
          </div>

          {(log.attendance?.length ?? 0) > 0 && (
            <PowerTeamLogAttendanceAvatars attendance={log.attendance} size={52} />
          )}

          <PowerTeamLogReactionBar
            logId={log.id}
            teamSlug={teamSlug}
            initialReactions={log.reactions}
          />

          {error && (
            <p className="text-sm p-3 rounded-lg" style={{ background: "#FEE2E2", color: "#991B1B" }}>
              {error}
            </p>
          )}

          {canManage && (
            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={onEdit}
                className="text-sm font-semibold px-4 py-2 rounded-lg"
                style={{ background: "#F3F4F6", color: "var(--color-dark)" }}
              >
                Edit
              </button>
              <button
                type="button"
                disabled={pending}
                onClick={handleDelete}
                className="text-sm font-semibold px-4 py-2 rounded-lg"
                style={{
                  background: "#FEE2E2",
                  color: "#991B1B",
                  opacity: pending ? 0.6 : 1,
                }}
              >
                {pending ? "Deleting…" : "Delete"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  multiline,
}: {
  label: string;
  value: string;
  multiline?: boolean;
}) {
  return (
    <div>
      <p
        className="text-xs font-semibold uppercase tracking-wide mb-1"
        style={{ color: "var(--color-gray)" }}
      >
        {label}
      </p>
      <p
        className="text-sm font-medium"
        style={{
          color: "var(--color-dark)",
          whiteSpace: multiline ? "pre-wrap" : undefined,
          lineHeight: multiline ? 1.6 : undefined,
        }}
      >
        {value}
      </p>
    </div>
  );
}
