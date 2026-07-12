import type { Metadata } from "next";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import AdminMeetingLogsTable, {
  type AdminMeetingLogRow,
} from "@/components/admin/AdminMeetingLogsTable";

export const metadata: Metadata = { title: "Meeting Logs — Miracle Members Admin" };

export const dynamic = "force-dynamic";

export default async function AdminMeetingLogsPage() {
  const admin = createSupabaseAdminClient();

  const { data, error } = await admin
    .from("power_team_meeting_logs")
    .select(
      `
      id, meeting_date, venue, comments, created_at, power_team_id,
      members:created_by_member_id(name),
      power_teams:power_team_id(name, slug, color)
    `
    )
    .order("meeting_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[AdminMeetingLogsPage]", error.message);
  }

  const logsRaw = data ?? [];
  const logIds = logsRaw.map((l) => l.id as string);

  const attendanceByLog: Record<string, { present: number; absent: number }> = {};
  if (logIds.length) {
    const { data: att } = await admin
      .from("power_team_log_attendance")
      .select("log_id, present")
      .in("log_id", logIds);

    for (const row of att ?? []) {
      const id = row.log_id as string;
      if (!attendanceByLog[id]) attendanceByLog[id] = { present: 0, absent: 0 };
      if (row.present) attendanceByLog[id].present++;
      else attendanceByLog[id].absent++;
    }
  }

  const logs: AdminMeetingLogRow[] = logsRaw.map((row) => {
    type TeamRef = { name: string; slug: string; color: string };
    type MemberRef = { name: string };
    const teamRaw = row.power_teams as TeamRef | TeamRef[] | null;
    const team = Array.isArray(teamRaw) ? teamRaw[0] : teamRaw;
    const authorRaw = row.members as MemberRef | MemberRef[] | null;
    const author = Array.isArray(authorRaw) ? authorRaw[0] : authorRaw;
    const counts = attendanceByLog[row.id as string] ?? { present: 0, absent: 0 };

    return {
      id: row.id as string,
      meeting_date: row.meeting_date as string,
      venue: (row.venue as string | null) ?? null,
      comments: row.comments as string,
      team_name: team?.name ?? "Team",
      team_slug: team?.slug ?? "",
      team_color: team?.color ?? "#C8102E",
      author_name: author?.name ?? null,
      present_count: counts.present,
      absent_count: counts.absent,
      created_at: row.created_at as string,
    };
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold" style={{ color: "var(--color-dark)" }}>
          Power Team Meeting Logs
        </h1>
        <p className="text-sm mt-0.5" style={{ color: "var(--color-gray)" }}>
          {logs.length} logs total — open a team page to edit a log; delete here or on the team page.
        </p>
      </div>
      <AdminMeetingLogsTable logs={logs} />
    </div>
  );
}
