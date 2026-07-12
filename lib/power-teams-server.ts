import { supabase } from "@/lib/supabase";
import { POWER_TEAMS_WITH_MEMBERS_SELECT } from "@/lib/power-teams";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import type {
  PowerTeamMeetingLogWithMeta,
  PowerTeamWithMembers,
  ReactionSummary,
} from "@/lib/supabase";

export type PowerTeamNavItem = {
  slug: string;
  name: string;
  emoji: string;
};

export async function fetchPowerTeamsNav(): Promise<PowerTeamNavItem[]> {
  const { data } = await supabase
    .from("power_teams")
    .select("slug, name, emoji")
    .order("sort_order");

  return (data ?? []).filter((t) => t.slug) as PowerTeamNavItem[];
}

export async function fetchPowerTeamsWithMembers(): Promise<PowerTeamWithMembers[]> {
  const { data } = await supabase
    .from("power_teams")
    .select(POWER_TEAMS_WITH_MEMBERS_SELECT)
    .order("sort_order");

  return (data ?? []) as PowerTeamWithMembers[];
}

export async function fetchPowerTeamBySlug(slug: string): Promise<PowerTeamWithMembers | null> {
  const { data } = await supabase
    .from("power_teams")
    .select(POWER_TEAMS_WITH_MEMBERS_SELECT)
    .eq("slug", slug)
    .maybeSingle();

  return (data as PowerTeamWithMembers | null) ?? null;
}

export function countTeamMembers(team: PowerTeamWithMembers): number {
  return team.power_team_members?.filter((r) => r.members)?.length ?? 0;
}

export type GivesAsksByMemberId = Map<string, { gives: string[]; asks: string[] }>;

export async function fetchGivesAsksForMembers(memberIds: string[]): Promise<GivesAsksByMemberId> {
  const map: GivesAsksByMemberId = new Map();
  if (memberIds.length === 0) return map;

  const { data } = await supabase
    .from("member_gives_asks")
    .select("member_id, type, item")
    .in("member_id", memberIds)
    .order("sort_order");

  for (const row of data ?? []) {
    if (!map.has(row.member_id)) map.set(row.member_id, { gives: [], asks: [] });
    const bucket = map.get(row.member_id)!;
    if (row.type === "give") bucket.gives.push(row.item);
    else bucket.asks.push(row.item);
  }

  return map;
}

export async function fetchCategoryIconMap(): Promise<Map<string, string>> {
  const { data } = await supabase.from("business_categories").select("name, icon");

  const icons = new Map<string, string>();
  for (const cat of data ?? []) {
    if (cat.icon) icons.set(cat.name, cat.icon);
  }
  return icons;
}

export function sortTeamMembers(team: PowerTeamWithMembers) {
  return (team.power_team_members ?? [])
    .filter((r) => r.members)
    .sort((a, b) => {
      const aCaptain = a.members!.id === team.captain_member_id ? 0 : 1;
      const bCaptain = b.members!.id === team.captain_member_id ? 0 : 1;
      if (aCaptain !== bCaptain) return aCaptain - bCaptain;
      return a.sort_order - b.sort_order;
    });
}

function aggregateLogReactions(
  rows: { log_id: string; reaction: string; member_id: string }[]
): Record<string, ReactionSummary[]> {
  const byLog: Record<string, { reaction: string; member_id: string }[]> = {};
  for (const r of rows) {
    if (!byLog[r.log_id]) byLog[r.log_id] = [];
    byLog[r.log_id].push(r);
  }

  const result: Record<string, ReactionSummary[]> = {};
  for (const [logId, list] of Object.entries(byLog)) {
    const map = new Map<string, { count: number; memberIds: string[] }>();
    for (const r of list) {
      if (!map.has(r.reaction)) map.set(r.reaction, { count: 0, memberIds: [] });
      const entry = map.get(r.reaction)!;
      entry.count++;
      entry.memberIds.push(r.member_id);
    }
    result[logId] = [...map.entries()].map(([reaction, { count, memberIds }]) => ({
      reaction,
      count,
      memberIds,
    }));
  }
  return result;
}

export async function fetchLogsForTeam(
  powerTeamId: string,
  opts?: { page?: number; pageSize?: number }
): Promise<{
  logs: PowerTeamMeetingLogWithMeta[];
  total: number;
  page: number;
  pageSize: number;
}> {
  const pageSize = Math.max(1, opts?.pageSize ?? 5);
  const page = Math.max(1, opts?.page ?? 1);
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const admin = createSupabaseAdminClient();

  const { count, error: countError } = await admin
    .from("power_team_meeting_logs")
    .select("id", { count: "exact", head: true })
    .eq("power_team_id", powerTeamId);

  if (countError) {
    console.error("[fetchLogsForTeam] count", countError.message);
  }

  const total = count ?? 0;

  const { data, error } = await admin
    .from("power_team_meeting_logs")
    .select(
      `
      id, power_team_id, created_by_member_id, meeting_date, venue, comments,
      referrals_exchanged, business_value, image_url, created_at,
      members:created_by_member_id(name, slug, profile_picture_url)
    `
    )
    .eq("power_team_id", powerTeamId)
    .order("meeting_date", { ascending: false })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    console.error("[fetchLogsForTeam]", error.message);
    return { logs: [], total: 0, page, pageSize };
  }

  type RawLog = Omit<PowerTeamMeetingLogWithMeta, "reactions" | "members" | "attendance"> & {
    members:
      | PowerTeamMeetingLogWithMeta["members"]
      | PowerTeamMeetingLogWithMeta["members"][];
  };

  const logs = (data ?? []) as RawLog[];
  if (logs.length === 0) {
    return { logs: [], total, page, pageSize };
  }

  const logIds = logs.map((l) => l.id);

  const [{ data: reactionRows }, { data: attendanceRows }] = await Promise.all([
    admin
      .from("power_team_log_reactions")
      .select("log_id, reaction, member_id")
      .in("log_id", logIds),
    admin
      .from("power_team_log_attendance")
      .select("log_id, member_id, present, members:member_id(name, profile_picture_url)")
      .in("log_id", logIds),
  ]);

  const byLog = aggregateLogReactions(
    (reactionRows ?? []) as { log_id: string; reaction: string; member_id: string }[]
  );

  type AttRow = {
    log_id: string;
    member_id: string;
    present: boolean;
    members:
      | { name: string; profile_picture_url: string | null }
      | { name: string; profile_picture_url: string | null }[]
      | null;
  };

  const attendanceByLog: Record<string, PowerTeamMeetingLogWithMeta["attendance"]> = {};
  for (const row of (attendanceRows ?? []) as AttRow[]) {
    const nameRef = Array.isArray(row.members) ? row.members[0] : row.members;
    if (!attendanceByLog[row.log_id]) attendanceByLog[row.log_id] = [];
    attendanceByLog[row.log_id].push({
      member_id: row.member_id,
      present: row.present,
      name: nameRef?.name ?? "Member",
      profile_picture_url: nameRef?.profile_picture_url ?? null,
    });
  }

  for (const list of Object.values(attendanceByLog)) {
    list.sort((a, b) => {
      if (a.present !== b.present) return a.present ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
  }

  return {
    logs: logs.map((log) => ({
      ...log,
      members: Array.isArray(log.members) ? log.members[0] ?? null : log.members,
      reactions: byLog[log.id] ?? [],
      attendance: attendanceByLog[log.id] ?? [],
    })),
    total,
    page,
    pageSize,
  };
}

/** Single log with reactions + attendance (for deep links). */
export async function fetchPowerTeamLogById(
  logId: string,
  powerTeamId: string
): Promise<PowerTeamMeetingLogWithMeta | null> {
  const admin = createSupabaseAdminClient();

  const { data, error } = await admin
    .from("power_team_meeting_logs")
    .select(
      `
      id, power_team_id, created_by_member_id, meeting_date, venue, comments,
      referrals_exchanged, business_value, image_url, created_at,
      members:created_by_member_id(name, slug, profile_picture_url)
    `
    )
    .eq("id", logId)
    .eq("power_team_id", powerTeamId)
    .maybeSingle();

  if (error || !data) {
    if (error) console.error("[fetchPowerTeamLogById]", error.message);
    return null;
  }

  type RawLog = Omit<PowerTeamMeetingLogWithMeta, "reactions" | "members" | "attendance"> & {
    members:
      | PowerTeamMeetingLogWithMeta["members"]
      | PowerTeamMeetingLogWithMeta["members"][];
  };

  const log = data as RawLog;

  const [{ data: reactionRows }, { data: attendanceRows }] = await Promise.all([
    admin
      .from("power_team_log_reactions")
      .select("log_id, reaction, member_id")
      .eq("log_id", logId),
    admin
      .from("power_team_log_attendance")
      .select("log_id, member_id, present, members:member_id(name, profile_picture_url)")
      .eq("log_id", logId),
  ]);

  const byLog = aggregateLogReactions(
    (reactionRows ?? []) as { log_id: string; reaction: string; member_id: string }[]
  );

  type AttRow = {
    log_id: string;
    member_id: string;
    present: boolean;
    members:
      | { name: string; profile_picture_url: string | null }
      | { name: string; profile_picture_url: string | null }[]
      | null;
  };

  const attendance: PowerTeamMeetingLogWithMeta["attendance"] = [];
  for (const row of (attendanceRows ?? []) as AttRow[]) {
    const nameRef = Array.isArray(row.members) ? row.members[0] : row.members;
    attendance.push({
      member_id: row.member_id,
      present: row.present,
      name: nameRef?.name ?? "Member",
      profile_picture_url: nameRef?.profile_picture_url ?? null,
    });
  }
  attendance.sort((a, b) => {
    if (a.present !== b.present) return a.present ? -1 : 1;
    return a.name.localeCompare(b.name);
  });

  return {
    ...log,
    members: Array.isArray(log.members) ? log.members[0] ?? null : log.members,
    reactions: byLog[log.id] ?? [],
    attendance,
  };
}

/** Count of meetings each member attended (present=true) for this team. */
export async function fetchAttendanceCountsForTeam(
  powerTeamId: string
): Promise<Record<string, number>> {
  const admin = createSupabaseAdminClient();

  const { data: logs, error: logsError } = await admin
    .from("power_team_meeting_logs")
    .select("id")
    .eq("power_team_id", powerTeamId);

  if (logsError || !logs?.length) {
    if (logsError) console.error("[fetchAttendanceCountsForTeam]", logsError.message);
    return {};
  }

  const { data: rows, error } = await admin
    .from("power_team_log_attendance")
    .select("member_id")
    .eq("present", true)
    .in(
      "log_id",
      logs.map((l) => l.id)
    );

  if (error) {
    console.error("[fetchAttendanceCountsForTeam] attendance", error.message);
    return {};
  }

  const counts: Record<string, number> = {};
  for (const row of rows ?? []) {
    const id = row.member_id as string;
    counts[id] = (counts[id] ?? 0) + 1;
  }
  return counts;
}
