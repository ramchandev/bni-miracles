"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { getMemberSession } from "@/lib/member-session";
import {
  canCreateTeamLog,
  canManageTeamLog,
  isSiteAdmin,
} from "@/lib/power-team-permissions";
import { formatMeetingDateLabel } from "@/lib/power-team-log-format";

const LOG_REACTIONS = [
  "like",
  "love",
  "thanks",
  "fire",
  "idea",
  "good",
  "celebrate",
  "clap",
] as const;

type PowerTeamLogReactionKey = (typeof LOG_REACTIONS)[number];

function isValidLogReaction(key: string): key is PowerTeamLogReactionKey {
  return (LOG_REACTIONS as readonly string[]).includes(key);
}

type AttendanceInput = { memberId: string; present: boolean };

function parseLogFields(input: {
  meetingDate: string;
  comments: string;
  venue?: string;
  referralsExchanged?: number | null;
  businessValue?: number | null;
  imageUrl?: string | null;
}):
  | {
      meetingDate: string;
      comments: string;
      venue: string | null;
      referrals: number | null;
      businessValue: number | null;
      imageUrl: string | null;
    }
  | { error: string } {
  const meetingDate = input.meetingDate.trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(meetingDate)) {
    return { error: "Please select a valid meeting date." };
  }

  const comments = input.comments.trim();
  if (!comments) return { error: "Comments are required." };

  const venue = input.venue?.trim() || null;
  let referrals: number | null = null;
  if (input.referralsExchanged != null && input.referralsExchanged !== undefined) {
    if (!Number.isFinite(input.referralsExchanged) || input.referralsExchanged < 0) {
      return { error: "Referrals exchanged must be zero or greater." };
    }
    referrals = Math.floor(input.referralsExchanged);
  }

  let businessValue: number | null = null;
  if (input.businessValue != null && input.businessValue !== undefined) {
    if (!Number.isFinite(input.businessValue) || input.businessValue < 0) {
      return { error: "Business value must be zero or greater." };
    }
    businessValue = input.businessValue;
  }

  return {
    meetingDate,
    comments,
    venue,
    referrals,
    businessValue,
    imageUrl: input.imageUrl?.trim() || null,
  };
}

async function validateAttendanceForTeam(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  admin: any,
  powerTeamId: string,
  attendance: AttendanceInput[]
): Promise<{ error?: string }> {
  const { data: teamMembers, error: teamMembersError } = await admin
    .from("power_team_members")
    .select("member_id")
    .eq("power_team_id", powerTeamId);

  if (teamMembersError) {
    console.error("[validateAttendanceForTeam]", teamMembersError.message);
    return { error: "Could not load team members for attendance." };
  }

  const teamMemberIds = new Set<string>(
    (teamMembers ?? []).map((r: { member_id: string }) => r.member_id)
  );
  if (teamMemberIds.size === 0) {
    return { error: "This Power Team has no members to mark attendance for." };
  }

  if (!attendance?.length) {
    return { error: "Please mark attendance for all team members." };
  }

  const seen = new Set<string>();
  for (const row of attendance) {
    if (!teamMemberIds.has(row.memberId)) {
      return { error: "Attendance includes a member who is not on this team." };
    }
    if (seen.has(row.memberId)) {
      return { error: "Duplicate attendance entry." };
    }
    seen.add(row.memberId);
  }

  for (const id of teamMemberIds) {
    if (!seen.has(id)) {
      return { error: "Please mark present or absent for every team member." };
    }
  }

  return {};
}

function revalidateTeamPaths(teamSlug: string) {
  revalidatePath(`/power-team/${teamSlug}`);
  revalidatePath("/power-team");
  revalidatePath("/admin/meeting-logs");
  revalidatePath("/bizrox");
}

async function publishLogAnnouncement(params: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  admin: any;
  captainMemberId: string | null;
  teamName: string;
  teamEmoji: string;
  teamSlug: string;
  logId: string;
  meetingDate: string;
  venue: string | null;
  comments: string;
  imageUrl: string | null;
}): Promise<void> {
  if (!params.captainMemberId) return;

  const lines = [
    `${params.teamEmoji} ${params.teamName} — Meeting Log`,
    formatMeetingDateLabel(params.meetingDate),
  ];
  if (params.venue) lines.push(`Venue: ${params.venue}`);
  lines.push(
    "",
    params.comments.trim(),
    "",
    `[View Power Team](/power-team/${params.teamSlug}?log=${params.logId})`
  );

  const content = lines.join("\n");
  const hasImage = Boolean(params.imageUrl?.trim());

  const { error } = await params.admin.from("bizrox_posts").insert({
    member_id: params.captainMemberId,
    post_type: "announcement",
    content,
    media_url: hasImage ? params.imageUrl!.trim() : null,
    media_type: hasImage ? "image" : null,
  });

  if (error) {
    console.error("[publishLogAnnouncement]", error.message);
  }
}

export async function uploadPowerTeamLogImageAction(
  formData: FormData
): Promise<{ url?: string; error?: string }> {
  const member = await getMemberSession();
  const adminUser = await isSiteAdmin();
  if (!member && !adminUser) return { error: "Please log in to upload images." };

  const file = formData.get("file") as File | null;
  if (!file || file.size === 0) return { error: "No file provided." };

  const MAX_MB = 8;
  if (file.size > MAX_MB * 1024 * 1024) {
    return { error: `File too large — max ${MAX_MB} MB.` };
  }

  const ext = (file.name.split(".").pop() ?? "jpg").toLowerCase();
  const allowed = ["jpg", "jpeg", "png", "webp"];
  if (!allowed.includes(ext)) return { error: "Only JPG, JPEG, PNG, or WEBP allowed." };

  const fileName = `power-team-logs/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const admin = createSupabaseAdminClient();

  const { error: uploadError } = await admin.storage
    .from("bizrox-media")
    .upload(fileName, buffer, {
      contentType: file.type || "image/jpeg",
      upsert: true,
    });

  if (uploadError) return { error: uploadError.message };

  const {
    data: { publicUrl },
  } = admin.storage.from("bizrox-media").getPublicUrl(fileName);

  return { url: publicUrl };
}

export async function createPowerTeamLogAction(input: {
  powerTeamId: string;
  teamSlug: string;
  meetingDate: string;
  venue?: string;
  comments: string;
  referralsExchanged?: number | null;
  businessValue?: number | null;
  imageUrl?: string | null;
  attendance: AttendanceInput[];
}): Promise<{ success?: boolean; error?: string }> {
  const member = await getMemberSession();
  if (!member) return { error: "Please log in to add a meeting log." };

  const admin = createSupabaseAdminClient();
  const { data: team } = await admin
    .from("power_teams")
    .select("id, captain_member_id, slug, name, emoji")
    .eq("id", input.powerTeamId)
    .maybeSingle();

  if (!team) return { error: "Power Team not found." };

  const allowed = await canCreateTeamLog(member.id, team);
  if (!allowed) {
    return { error: "Only the Team Captain or Power Team Coordinator can add logs." };
  }

  const fields = parseLogFields(input);
  if ("error" in fields) return { error: fields.error };

  const attCheck = await validateAttendanceForTeam(admin, input.powerTeamId, input.attendance);
  if (attCheck.error) return { error: attCheck.error };

  const { data: inserted, error } = await admin
    .from("power_team_meeting_logs")
    .insert({
      power_team_id: input.powerTeamId,
      created_by_member_id: member.id,
      meeting_date: fields.meetingDate,
      venue: fields.venue,
      comments: fields.comments,
      referrals_exchanged: fields.referrals,
      business_value: fields.businessValue,
      image_url: fields.imageUrl,
    })
    .select("id")
    .single();

  if (error || !inserted) {
    console.error("[createPowerTeamLogAction]", error?.message);
    return { error: "Could not save the meeting log. Please try again." };
  }

  const { error: attError } = await admin.from("power_team_log_attendance").insert(
    input.attendance.map((row) => ({
      log_id: inserted.id,
      member_id: row.memberId,
      present: row.present,
    }))
  );

  if (attError) {
    console.error("[createPowerTeamLogAction] attendance", attError.message);
    await admin.from("power_team_meeting_logs").delete().eq("id", inserted.id);
    return { error: "Could not save attendance. Please try again." };
  }

  await publishLogAnnouncement({
    admin,
    captainMemberId: team.captain_member_id as string | null,
    teamName: (team.name as string) || "Power Team",
    teamEmoji: (team.emoji as string) || "⚡",
    teamSlug: (team.slug as string) || input.teamSlug,
    logId: inserted.id as string,
    meetingDate: fields.meetingDate,
    venue: fields.venue,
    comments: fields.comments,
    imageUrl: fields.imageUrl,
  });

  revalidateTeamPaths(input.teamSlug);
  return { success: true };
}

export async function updatePowerTeamLogAction(input: {
  logId: string;
  powerTeamId: string;
  teamSlug: string;
  meetingDate: string;
  venue?: string;
  comments: string;
  referralsExchanged?: number | null;
  businessValue?: number | null;
  imageUrl?: string | null;
  attendance: AttendanceInput[];
}): Promise<{ success?: boolean; error?: string }> {
  const admin = createSupabaseAdminClient();
  const { data: team } = await admin
    .from("power_teams")
    .select("id, captain_member_id, slug")
    .eq("id", input.powerTeamId)
    .maybeSingle();

  if (!team) return { error: "Power Team not found." };

  const manage = await canManageTeamLog(team);
  if (!manage.allowed) {
    return { error: "You do not have permission to edit this log." };
  }

  const { data: existing } = await admin
    .from("power_team_meeting_logs")
    .select("id, power_team_id")
    .eq("id", input.logId)
    .maybeSingle();

  if (!existing || existing.power_team_id !== input.powerTeamId) {
    return { error: "Meeting log not found." };
  }

  const fields = parseLogFields(input);
  if ("error" in fields) return { error: fields.error };

  const attCheck = await validateAttendanceForTeam(admin, input.powerTeamId, input.attendance);
  if (attCheck.error) return { error: attCheck.error };

  const { error } = await admin
    .from("power_team_meeting_logs")
    .update({
      meeting_date: fields.meetingDate,
      venue: fields.venue,
      comments: fields.comments,
      referrals_exchanged: fields.referrals,
      business_value: fields.businessValue,
      image_url: fields.imageUrl,
    })
    .eq("id", input.logId);

  if (error) {
    console.error("[updatePowerTeamLogAction]", error.message);
    return { error: "Could not update the meeting log." };
  }

  await admin.from("power_team_log_attendance").delete().eq("log_id", input.logId);

  const { error: attError } = await admin.from("power_team_log_attendance").insert(
    input.attendance.map((row) => ({
      log_id: input.logId,
      member_id: row.memberId,
      present: row.present,
    }))
  );

  if (attError) {
    console.error("[updatePowerTeamLogAction] attendance", attError.message);
    return { error: "Log updated but attendance failed to save. Please edit again." };
  }

  revalidateTeamPaths(input.teamSlug);
  return { success: true };
}

export async function deletePowerTeamLogAction(
  logId: string,
  teamSlug: string
): Promise<{ success?: boolean; error?: string }> {
  const admin = createSupabaseAdminClient();

  const { data: log } = await admin
    .from("power_team_meeting_logs")
    .select("id, power_team_id, power_teams:power_team_id(captain_member_id, slug)")
    .eq("id", logId)
    .maybeSingle();

  if (!log) return { error: "Meeting log not found." };

  type TeamRef = { captain_member_id: string | null; slug: string };
  const teamRaw = log.power_teams as TeamRef | TeamRef[] | null;
  const team = Array.isArray(teamRaw) ? teamRaw[0] : teamRaw;
  if (!team) return { error: "Power Team not found." };

  const manage = await canManageTeamLog(team);
  if (!manage.allowed) {
    return { error: "You do not have permission to delete this log." };
  }

  const { error } = await admin.from("power_team_meeting_logs").delete().eq("id", logId);
  if (error) {
    console.error("[deletePowerTeamLogAction]", error.message);
    return { error: "Could not delete the meeting log." };
  }

  revalidateTeamPaths(team.slug || teamSlug);
  return { success: true };
}

export async function togglePowerTeamLogReactionAction(
  logId: string,
  reaction: string,
  teamSlug: string
): Promise<{ error?: string; added: boolean }> {
  const member = await getMemberSession();
  if (!member) return { error: "Please log in to react.", added: false };

  if (!isValidLogReaction(reaction)) {
    return { error: "Invalid reaction.", added: false };
  }

  const admin = createSupabaseAdminClient();

  const { data: existing } = await admin
    .from("power_team_log_reactions")
    .select("id")
    .eq("log_id", logId)
    .eq("member_id", member.id)
    .eq("reaction", reaction)
    .maybeSingle();

  if (existing) {
    await admin.from("power_team_log_reactions").delete().eq("id", existing.id);
    revalidatePath(`/power-team/${teamSlug}`);
    return { added: false };
  }

  const { error } = await admin.from("power_team_log_reactions").insert({
    log_id: logId,
    member_id: member.id,
    reaction,
  });

  if (error) {
    console.error("[togglePowerTeamLogReactionAction]", error.message);
    return { error: "Could not save reaction.", added: false };
  }

  revalidatePath(`/power-team/${teamSlug}`);
  return { added: true };
}
