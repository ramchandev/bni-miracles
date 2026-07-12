"use client";

import { useState, useTransition, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  formatBusinessValue,
  formatMeetingDateLabel,
  relativeMeetingAge,
} from "@/lib/power-team-log-format";
import PowerTeamLogForm, { type LogFormMember } from "@/components/power-team/PowerTeamLogForm";
import PowerTeamLogDetailModal from "@/components/power-team/PowerTeamLogDetailModal";
import PowerTeamLogAttendanceAvatars from "@/components/power-team/PowerTeamLogAttendanceAvatars";
import { deletePowerTeamLogAction } from "@/app/actions/power-team-logs";
import type { PowerTeamMeetingLogWithMeta } from "@/lib/supabase";

type Props = {
  logs: PowerTeamMeetingLogWithMeta[];
  powerTeamId: string;
  teamSlug: string;
  teamColor: string;
  canCreate: boolean;
  canManage: boolean;
  teamMembers: LogFormMember[];
  page: number;
  pageSize: number;
  total: number;
  initialOpenLog?: PowerTeamMeetingLogWithMeta | null;
};

export default function PowerTeamLogsPanel({
  logs,
  powerTeamId,
  teamSlug,
  teamColor,
  canCreate,
  canManage,
  teamMembers,
  page,
  pageSize,
  total,
  initialOpenLog = null,
}: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [openId, setOpenId] = useState<string | null>(
    initialOpenLog?.id ?? logs[0]?.id ?? null
  );
  const [viewing, setViewing] = useState<PowerTeamMeetingLogWithMeta | null>(
    initialOpenLog
  );
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<PowerTeamMeetingLogWithMeta | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (!initialOpenLog) return;
    setViewing(initialOpenLog);
    setOpenId(initialOpenLog.id);
    document.getElementById("meeting-logs")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [initialOpenLog]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const hasPrev = page > 1;
  const hasNext = page < totalPages;

  function pageHref(p: number) {
    if (p <= 1) return `/power-team/${teamSlug}`;
    return `/power-team/${teamSlug}?logsPage=${p}`;
  }

  function handleDelete(log: PowerTeamMeetingLogWithMeta) {
    if (!confirm(`Delete meeting log from ${formatMeetingDateLabel(log.meeting_date)}?`)) return;
    setDeletingId(log.id);
    startTransition(async () => {
      const result = await deletePowerTeamLogAction(log.id, teamSlug);
      setDeletingId(null);
      if (result.error) {
        alert(result.error);
        return;
      }
      if (viewing?.id === log.id) setViewing(null);
      if (editing?.id === log.id) setEditing(null);
      router.refresh();
    });
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-3 mb-4">
        <h2 className="text-xl font-extrabold" style={{ color: "var(--color-dark)" }}>
          Meeting Logs
        </h2>
        {canCreate && (
          <button
            type="button"
            onClick={() => {
              setEditing(null);
              setShowForm(true);
            }}
            className="text-xs font-bold px-3 py-2 rounded-lg text-white shrink-0"
            style={{ background: teamColor }}
          >
            + Add Log
          </button>
        )}
      </div>

      {logs.length === 0 ? (
        <div
          className="rounded-2xl p-8 text-center"
          style={{ background: "white", border: "1px solid #E5E7EB" }}
        >
          <p className="text-3xl mb-2">📋</p>
          <p className="font-semibold text-sm" style={{ color: "var(--color-dark)" }}>
            No meeting logs yet
          </p>
          <p className="text-xs mt-1" style={{ color: "var(--color-gray)" }}>
            {canCreate
              ? "Add the first log for this Power Team."
              : "Logs from team meetings will appear here."}
          </p>
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-2">
            {logs.map((log) => {
              const isOpen = openId === log.id;
              const valueLabel = formatBusinessValue(log.business_value);
              const reactionCount = log.reactions.reduce((n, r) => n + r.count, 0);
              const present = (log.attendance ?? []).filter((a) => a.present);
              const absent = (log.attendance ?? []).filter((a) => !a.present);

              return (
                <div
                  key={log.id}
                  className="rounded-xl overflow-hidden"
                  style={{ background: "white", border: "1px solid #E5E7EB" }}
                >
                  <button
                    type="button"
                    className="w-full text-left px-4 py-3 flex items-start gap-3"
                    onClick={() => setOpenId(isOpen ? null : log.id)}
                    aria-expanded={isOpen}
                  >
                    <span
                      className="mt-0.5 text-xs font-bold shrink-0"
                      style={{ color: teamColor }}
                    >
                      {isOpen ? "▾" : "▸"}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className="text-sm font-extrabold"
                          style={{ color: "var(--color-dark)" }}
                        >
                          {formatMeetingDateLabel(log.meeting_date)}
                        </span>
                        <span
                          className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
                          style={{ background: teamColor + "18", color: teamColor }}
                        >
                          {relativeMeetingAge(log.meeting_date)}
                        </span>
                        {(present.length > 0 || absent.length > 0) && (
                          <span
                            className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
                            style={{ background: "#F3F4F6", color: "#4B5563" }}
                          >
                            P:{present.length} A:{absent.length}
                          </span>
                        )}
                      </div>
                      {log.venue && (
                        <p className="text-xs mt-1 truncate" style={{ color: "var(--color-gray)" }}>
                          {log.venue}
                        </p>
                      )}
                    </div>
                    {log.image_url && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={log.image_url}
                        alt=""
                        className="w-12 h-12 rounded-lg object-cover shrink-0"
                      />
                    )}
                  </button>

                  {isOpen && (
                    <div className="px-4 pb-4 pt-0" style={{ borderTop: "1px solid #F3F4F6" }}>
                      <p
                        className="text-sm mt-3 line-clamp-3"
                        style={{ color: "var(--color-gray)", lineHeight: 1.6 }}
                      >
                        {log.comments}
                      </p>
                      <div className="flex flex-wrap gap-2 mt-3">
                        {log.referrals_exchanged != null && (
                          <span
                            className="text-[11px] font-semibold px-2 py-1 rounded-full"
                            style={{ background: "#EEF2FF", color: "#3730A3" }}
                          >
                            {log.referrals_exchanged} referrals
                          </span>
                        )}
                        {valueLabel && (
                          <span
                            className="text-[11px] font-semibold px-2 py-1 rounded-full"
                            style={{ background: "#ECFDF5", color: "#065F46" }}
                          >
                            {valueLabel}
                          </span>
                        )}
                        {reactionCount > 0 && (
                          <span
                            className="text-[11px] font-semibold px-2 py-1 rounded-full"
                            style={{ background: "#FEF3C7", color: "#92400E" }}
                          >
                            {reactionCount} reactions
                          </span>
                        )}
                      </div>

                      {(present.length > 0 || absent.length > 0) && (
                        <div className="mt-3">
                          <PowerTeamLogAttendanceAvatars
                            attendance={log.attendance ?? []}
                            size={40}
                          />
                        </div>
                      )}

                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setViewing(log)}
                          className="text-xs font-bold"
                          style={{ color: teamColor }}
                        >
                          Open full log →
                        </button>
                        {canManage && (
                          <>
                            <button
                              type="button"
                              onClick={() => {
                                setShowForm(false);
                                setEditing(log);
                              }}
                              className="text-xs font-bold px-2.5 py-1 rounded-lg"
                              style={{ background: "#F3F4F6", color: "var(--color-dark)" }}
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              disabled={pending && deletingId === log.id}
                              onClick={() => handleDelete(log)}
                              className="text-xs font-bold px-2.5 py-1 rounded-lg"
                              style={{
                                background: "#FEE2E2",
                                color: "#991B1B",
                                opacity: pending && deletingId === log.id ? 0.6 : 1,
                              }}
                            >
                              {pending && deletingId === log.id ? "Deleting…" : "Delete"}
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between gap-3 mt-4">
              {hasPrev ? (
                <Link
                  href={pageHref(page - 1)}
                  className="text-xs font-bold px-3 py-2 rounded-lg"
                  style={{ background: "#F3F4F6", color: "var(--color-dark)" }}
                >
                  ← Prev
                </Link>
              ) : (
                <span
                  className="text-xs font-bold px-3 py-2 rounded-lg opacity-40"
                  style={{ background: "#F3F4F6", color: "var(--color-gray)" }}
                >
                  ← Prev
                </span>
              )}
              <p className="text-xs font-semibold" style={{ color: "var(--color-gray)" }}>
                Page {page} of {totalPages}
              </p>
              {hasNext ? (
                <Link
                  href={pageHref(page + 1)}
                  className="text-xs font-bold px-3 py-2 rounded-lg"
                  style={{ background: "#F3F4F6", color: "var(--color-dark)" }}
                >
                  Next →
                </Link>
              ) : (
                <span
                  className="text-xs font-bold px-3 py-2 rounded-lg opacity-40"
                  style={{ background: "#F3F4F6", color: "var(--color-gray)" }}
                >
                  Next →
                </span>
              )}
            </div>
          )}
        </>
      )}

      {(showForm || editing) && (
        <PowerTeamLogForm
          key={editing?.id ?? "new"}
          powerTeamId={powerTeamId}
          teamSlug={teamSlug}
          teamColor={teamColor}
          teamMembers={teamMembers}
          editLog={editing}
          onClose={() => {
            setShowForm(false);
            setEditing(null);
          }}
        />
      )}

      {viewing && (
        <PowerTeamLogDetailModal
          log={viewing}
          teamSlug={teamSlug}
          teamColor={teamColor}
          canManage={canManage}
          onClose={() => setViewing(null)}
          onEdit={() => {
            setViewing(null);
            setEditing(viewing);
          }}
          onDeleted={() => {
            setViewing(null);
            router.refresh();
          }}
        />
      )}
    </div>
  );
}
