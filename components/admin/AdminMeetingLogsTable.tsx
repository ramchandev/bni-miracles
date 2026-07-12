"use client";

import { useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { deletePowerTeamLogAction } from "@/app/actions/power-team-logs";

export type AdminMeetingLogRow = {
  id: string;
  meeting_date: string;
  venue: string | null;
  comments: string;
  team_name: string;
  team_slug: string;
  team_color: string;
  author_name: string | null;
  present_count: number;
  absent_count: number;
  created_at: string;
};

export default function AdminMeetingLogsTable({ logs }: { logs: AdminMeetingLogRow[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleDelete(log: AdminMeetingLogRow) {
    if (!confirm(`Delete log for ${log.team_name} on ${log.meeting_date}?`)) return;
    startTransition(async () => {
      const result = await deletePowerTeamLogAction(log.id, log.team_slug);
      if (result.error) {
        alert(result.error);
        return;
      }
      router.refresh();
    });
  }

  if (!logs.length) {
    return (
      <div className="card p-12 text-center">
        <p className="text-4xl mb-2">📋</p>
        <p className="font-semibold" style={{ color: "var(--color-dark)" }}>
          No meeting logs yet
        </p>
      </div>
    );
  }

  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr style={{ background: "#F9FAFB", borderBottom: "1px solid #E5E7EB" }}>
              {["Team", "Meeting Date", "Author", "Attendance", "Comments", "Actions"].map((h) => (
                <th
                  key={h}
                  className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide"
                  style={{ color: "var(--color-gray)" }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {logs.map((log, i) => (
              <tr
                key={log.id}
                style={{ borderBottom: i < logs.length - 1 ? "1px solid #F3F4F6" : "none" }}
              >
                <td className="px-4 py-3">
                  <Link
                    href={`/power-team/${log.team_slug}`}
                    className="text-sm font-semibold hover:underline"
                    style={{ color: log.team_color || "var(--color-dark)" }}
                    target="_blank"
                  >
                    {log.team_name}
                  </Link>
                </td>
                <td className="px-4 py-3 text-sm" style={{ color: "var(--color-dark)" }}>
                  {new Date(log.meeting_date + "T00:00:00").toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </td>
                <td className="px-4 py-3 text-sm" style={{ color: "var(--color-gray)" }}>
                  {log.author_name ?? "—"}
                </td>
                <td className="px-4 py-3 text-xs font-semibold" style={{ color: "var(--color-gray)" }}>
                  P:{log.present_count} A:{log.absent_count}
                </td>
                <td className="px-4 py-3 text-sm max-w-xs truncate" style={{ color: "var(--color-gray)" }}>
                  {log.comments}
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <Link
                      href={`/power-team/${log.team_slug}`}
                      className="text-xs px-2.5 py-1.5 rounded-lg font-semibold"
                      style={{ background: "#F3F4F6", color: "var(--color-gray)" }}
                      target="_blank"
                    >
                      Open
                    </Link>
                    <button
                      type="button"
                      disabled={pending}
                      onClick={() => handleDelete(log)}
                      className="text-xs px-2.5 py-1.5 rounded-lg font-semibold"
                      style={{
                        border: "1px solid #FECACA",
                        color: "#DC2626",
                        opacity: pending ? 0.6 : 1,
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
