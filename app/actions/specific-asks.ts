"use server";

import { revalidatePath } from "next/cache";
import * as XLSX from "xlsx";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { getMemberSession } from "@/lib/member-session";
import { requireSpecificAskTracker } from "@/lib/specific-asks-permissions";
import {
  fetchOpenAsksForMember,
  publishSpecificAskToBizrox,
  specificAskBizroxContent,
} from "@/lib/specific-asks-server";
import {
  daysBetween,
  formatMeetingLong,
  kolkataToday,
  statusLabel,
  type OpenAskOption,
  type SpecificAskStatus,
} from "@/lib/specific-asks";

function isDate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

async function ensureMeeting(date: string, createdBy: string | null): Promise<string> {
  const admin = createSupabaseAdminClient();
  const { data: existing } = await admin
    .from("specific_ask_meetings")
    .select("id")
    .eq("meeting_date", date)
    .maybeSingle();

  if (existing?.id) return existing.id as string;

  const { data, error } = await admin
    .from("specific_ask_meetings")
    .insert({ meeting_date: date, created_by: createdBy })
    .select("id")
    .single();

  if (error || !data) throw new Error(error?.message ?? "Could not create the meeting date.");
  return data.id as string;
}

export async function listOpenAsksAction(
  memberId: string
): Promise<{ asks: OpenAskOption[]; error?: string }> {
  const gate = await requireSpecificAskTracker();
  if (!gate.allowed) return { asks: [], error: gate.error };
  if (!memberId) return { asks: [] };
  const asks = await fetchOpenAsksForMember(memberId);
  return { asks };
}

export async function logSpecificAskAction(input: {
  meetingDate: string;
  seekerMemberId: string;
  mode: "new" | "existing";
  askText?: string;
  existingAskId?: string;
  connectorMemberIds: string[];
  addCnr?: boolean;
  notes?: string;
}): Promise<{ error?: string }> {
  const gate = await requireSpecificAskTracker();
  if (!gate.allowed) return { error: gate.error };

  const meetingDate = input.meetingDate?.slice(0, 10);
  if (!isDate(meetingDate)) return { error: "Pick a meeting date." };
  if (!input.seekerMemberId) return { error: "Pick the member who is asking." };

  const admin = createSupabaseAdminClient();
  const { data: seeker } = await admin
    .from("members")
    .select("id, name")
    .eq("id", input.seekerMemberId)
    .maybeSingle();

  if (!seeker) return { error: "That member was not found." };

  let meetingId: string;
  try {
    meetingId = await ensureMeeting(meetingDate, gate.memberId);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Could not save the meeting date." };
  }

  const connectorIds = [...new Set(input.connectorMemberIds.filter(Boolean))].filter(
    (id) => id !== input.seekerMemberId
  );

  const { data: connectorMembers } = connectorIds.length
    ? await admin.from("members").select("id, name").in("id", connectorIds)
    : { data: [] as { id: string; name: string }[] };

  const notes = input.notes?.trim() || null;

  if (input.mode === "existing") {
    if (!input.existingAskId) return { error: "Pick the earlier ask to carry forward." };

    const { data: ask } = await admin
      .from("specific_asks")
      .select("id, seeker_member_id, status, notes")
      .eq("id", input.existingAskId)
      .maybeSingle();

    if (!ask || ask.seeker_member_id !== input.seekerMemberId) {
      return { error: "That earlier ask does not belong to this member." };
    }
    if (ask.status === "connected") {
      return { error: "That ask is already connected. Log it as a new ask instead." };
    }

    const { count } = await admin
      .from("specific_ask_meeting_links")
      .select("ask_id", { count: "exact", head: true })
      .eq("meeting_id", meetingId);

    const { error: linkError } = await admin.from("specific_ask_meeting_links").upsert(
      {
        ask_id: ask.id,
        meeting_id: meetingId,
        position: (count ?? 0) + 1,
      },
      { onConflict: "ask_id,meeting_id", ignoreDuplicates: true }
    );

    if (linkError) return { error: linkError.message };

    if (notes && !ask.notes) {
      await admin.from("specific_asks").update({ notes, updated_at: new Date().toISOString() }).eq("id", ask.id);
    }

    await addConnectors(ask.id as string, connectorMembers ?? []);
    if (input.addCnr) await addCnrConnector(ask.id as string);
    revalidatePath("/specific-asks");
    return {};
  }

  const askText = input.askText?.trim() ?? "";
  if (!askText) return { error: "Enter the specific ask." };

  const { count } = await admin
    .from("specific_ask_meeting_links")
    .select("ask_id", { count: "exact", head: true })
    .eq("meeting_id", meetingId);

  const { data: inserted, error } = await admin
    .from("specific_asks")
    .insert({
      seeker_member_id: seeker.id,
      ask_text: askText,
      first_asked_on: meetingDate,
      status: "not_yet_connected",
      notes,
      created_by: gate.memberId,
    })
    .select("id")
    .single();

  if (error || !inserted) return { error: error?.message ?? "Could not save the ask." };

  const askId = inserted.id as string;

  const { error: linkError } = await admin.from("specific_ask_meeting_links").insert({
    ask_id: askId,
    meeting_id: meetingId,
    position: (count ?? 0) + 1,
  });

  if (linkError) return { error: linkError.message };

  await addConnectors(askId, connectorMembers ?? []);
  if (input.addCnr) await addCnrConnector(askId);

  const postId = await publishSpecificAskToBizrox({
    admin,
    seekerMemberId: seeker.id as string,
    seekerName: seeker.name as string,
    askId,
    askText,
    meetingDate,
    notify: true,
  });

  if (postId) {
    await admin.from("specific_asks").update({ bizrox_post_id: postId }).eq("id", askId);
  }

  revalidatePath("/specific-asks");
  revalidatePath("/bizrox");
  return {};
}

async function addConnectors(
  askId: string,
  members: { id: string; name: string }[]
): Promise<void> {
  if (members.length === 0) return;
  const admin = createSupabaseAdminClient();
  const { data: existing } = await admin
    .from("specific_ask_connectors")
    .select("member_id")
    .eq("ask_id", askId);

  const have = new Set((existing ?? []).map((row) => row.member_id as string | null));

  const rows = members
    .filter((m) => !have.has(m.id))
    .map((m) => ({
      ask_id: askId,
      member_id: m.id,
      display_name: m.name,
    }));

  if (rows.length === 0) return;
  const { error } = await admin.from("specific_ask_connectors").insert(rows);
  if (error) console.error("[addConnectors]", error.message);
}

async function addCnrConnector(askId: string): Promise<void> {
  const admin = createSupabaseAdminClient();
  const { data: existing } = await admin
    .from("specific_ask_connectors")
    .select("id, display_name")
    .eq("ask_id", askId);

  const already = (existing ?? []).some((row) => String(row.display_name).trim().toLowerCase() === "cnr");
  if (already) return;

  const { error } = await admin.from("specific_ask_connectors").insert({
    ask_id: askId,
    member_id: null,
    display_name: "CNR",
  });
  if (error) console.error("[addCnrConnector]", error.message);
}

export async function updateSpecificAskDetailsAction(input: {
  askId: string;
  askText: string;
  notes: string;
  keepConnectorIds: string[];
  addMemberIds: string[];
  addCnr?: boolean;
}): Promise<{ error?: string }> {
  const gate = await requireSpecificAskTracker();
  if (!gate.allowed) return { error: gate.error };

  const askText = input.askText?.trim() ?? "";
  if (!askText) return { error: "Enter the specific ask." };

  const admin = createSupabaseAdminClient();
  const { data: ask } = await admin
    .from("specific_asks")
    .select("id, seeker_member_id, bizrox_post_id, first_asked_on")
    .eq("id", input.askId)
    .maybeSingle();

  if (!ask) return { error: "Ask not found." };

  const notes = input.notes?.trim() || null;
  const { error: updateError } = await admin
    .from("specific_asks")
    .update({ ask_text: askText, notes, updated_at: new Date().toISOString() })
    .eq("id", ask.id);

  if (updateError) return { error: updateError.message };

  const keep = new Set(input.keepConnectorIds.filter(Boolean));
  const { data: current } = await admin
    .from("specific_ask_connectors")
    .select("id")
    .eq("ask_id", ask.id);

  const removeIds = (current ?? [])
    .map((row) => row.id as string)
    .filter((id) => !keep.has(id));

  if (removeIds.length > 0) {
    const { error: removeError } = await admin
      .from("specific_ask_connectors")
      .delete()
      .in("id", removeIds);
    if (removeError) return { error: removeError.message };
  }

  const addIds = [...new Set(input.addMemberIds.filter(Boolean))].filter(
    (id) => id !== ask.seeker_member_id
  );
  const { data: connectorMembers } = addIds.length
    ? await admin.from("members").select("id, name").in("id", addIds)
    : { data: [] as { id: string; name: string }[] };

  await addConnectors(ask.id as string, connectorMembers ?? []);
  if (input.addCnr) await addCnrConnector(ask.id as string);

  if (ask.bizrox_post_id) {
    await admin
      .from("bizrox_posts")
      .update({
        content: specificAskBizroxContent(askText, ask.id as string, String(ask.first_asked_on).slice(0, 10)),
      })
      .eq("id", ask.bizrox_post_id);
    revalidatePath("/bizrox");
  }

  revalidatePath("/specific-asks");
  return {};
}

export async function updateSpecificAskStatusAction(
  askId: string,
  status: SpecificAskStatus
): Promise<{ error?: string }> {
  const session = await getMemberSession();
  if (!session) return { error: "Please log in to update the status." };

  if (!["not_yet_connected", "contacted", "connected"].includes(status)) {
    return { error: "Unknown status." };
  }

  const admin = createSupabaseAdminClient();
  const { data: ask } = await admin
    .from("specific_asks")
    .select("id, seeker_member_id, status, connected_at")
    .eq("id", askId)
    .maybeSingle();

  if (!ask) return { error: "Ask not found." };

  const gate = await requireSpecificAskTracker();
  const isSeeker = ask.seeker_member_id === session.id;
  if (!isSeeker && !gate.allowed) {
    return { error: "Only the member who asked, the Referral Coordinator, or Head Table can update this." };
  }

  const patch: {
    status: SpecificAskStatus;
    connected_at: string | null;
    updated_at: string;
  } = {
    status,
    connected_at: status === "connected" ? (ask.connected_at as string | null) ?? new Date().toISOString() : null,
    updated_at: new Date().toISOString(),
  };

  const { error } = await admin.from("specific_asks").update(patch).eq("id", askId);
  if (error) return { error: error.message };

  revalidatePath("/specific-asks");
  return {};
}

export async function updateSpecificAskSeekerNotesAction(
  askId: string,
  notes: string
): Promise<{ error?: string }> {
  const session = await getMemberSession();
  if (!session) return { error: "Please log in to add a note." };

  const admin = createSupabaseAdminClient();
  const { data: ask } = await admin
    .from("specific_asks")
    .select("id, seeker_member_id")
    .eq("id", askId)
    .maybeSingle();

  if (!ask) return { error: "Ask not found." };
  if (ask.seeker_member_id !== session.id) {
    return { error: "Only the member who asked can add this note." };
  }

  const { error } = await admin
    .from("specific_asks")
    .update({
      seeker_notes: notes.trim() || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", askId);

  if (error) return { error: error.message };
  revalidatePath("/specific-asks");
  return {};
}

export async function volunteerSpecificAskAction(askId: string): Promise<{ error?: string }> {
  const session = await getMemberSession();
  if (!session) return { error: "Please log in to say you can connect." };

  const admin = createSupabaseAdminClient();
  const { data: ask } = await admin
    .from("specific_asks")
    .select("id, seeker_member_id, status")
    .eq("id", askId)
    .maybeSingle();

  if (!ask) return { error: "Ask not found." };
  if (ask.seeker_member_id === session.id) {
    return { error: "This is your own ask." };
  }
  if (ask.status === "connected") {
    return { error: "This ask is already connected." };
  }

  const { data: existing } = await admin
    .from("specific_ask_connectors")
    .select("id")
    .eq("ask_id", askId)
    .eq("member_id", session.id)
    .maybeSingle();

  if (existing) {
    const { error: removeError } = await admin
      .from("specific_ask_connectors")
      .delete()
      .eq("id", existing.id as string);
    if (removeError) return { error: removeError.message };
    revalidatePath("/specific-asks");
    return {};
  }

  const { error } = await admin.from("specific_ask_connectors").insert({
    ask_id: askId,
    member_id: session.id,
    display_name: session.name,
  });

  if (error) return { error: error.message };
  revalidatePath("/specific-asks");
  return {};
}

export async function exportSpecificAsksAction(): Promise<{
  base64?: string;
  filename?: string;
  error?: string;
}> {
  const gate = await requireSpecificAskTracker();
  if (!gate.allowed) return { error: gate.error };

  const admin = createSupabaseAdminClient();
  const { data: meetings, error } = await admin
    .from("specific_ask_meetings")
    .select("id, meeting_date")
    .order("meeting_date", { ascending: true });

  if (error) return { error: error.message };

  const { data: links, error: linksError } = await admin
    .from("specific_ask_meeting_links")
    .select(
      `
      meeting_id,
      position,
      specific_asks (
        ask_text,
        first_asked_on,
        status,
        connected_at,
        notes,
        seeker_notes,
        seeker:members!specific_asks_seeker_member_id_fkey ( name ),
        specific_ask_connectors ( display_name )
      )
    `
    )
    .order("position", { ascending: true });

  if (linksError) return { error: linksError.message };

  const today = kolkataToday();
  const wb = XLSX.utils.book_new();

  const allRows: Record<string, string | number>[] = [];

  for (const meeting of meetings ?? []) {
    const date = String(meeting.meeting_date).slice(0, 10);
    const meetingLinks = (links ?? []).filter((link) => link.meeting_id === meeting.id);
    const sheetRows = meetingLinks.map((link, index) => {
      const ask = Array.isArray(link.specific_asks) ? link.specific_asks[0] : link.specific_asks;
      if (!ask) return null;
      const seeker = Array.isArray(ask.seeker) ? ask.seeker[0] : ask.seeker;
      const connectors = (ask.specific_ask_connectors ?? [])
        .map((c: { display_name: string }) => c.display_name)
        .join(" / ");
      const first = String(ask.first_asked_on).slice(0, 10);
      const status = ask.status as SpecificAskStatus;
      let connectedIn: string | number = "";
      if (status === "connected" && ask.connected_at) {
        const connectedDay = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(
          new Date(ask.connected_at as string)
        );
        connectedIn = daysBetween(first, connectedDay);
      }
      const row = {
        "#": index + 1,
        Member: seeker?.name ?? "",
        "Asked for": ask.ask_text as string,
        On: formatMeetingLong(first),
        "Who Can Connect": connectors,
        Status: statusLabel(status),
        Notes: (ask.notes as string | null) ?? "",
        "Seeker Notes": (ask.seeker_notes as string | null) ?? "",
        "Asked (days)": daysBetween(first, today),
        "Connected in (days)": connectedIn,
      };
      return row;
    }).filter((row): row is NonNullable<typeof row> => row !== null);

    const titled = formatMeetingLong(date);
    const sheetName = titled.slice(0, 31);
    const ws = XLSX.utils.json_to_sheet(
      sheetRows.length
        ? sheetRows
        : [{ "#": "", Member: "", "Asked for": "", On: "", "Who Can Connect": "", Status: "", Notes: "", "Seeker Notes": "", "Asked (days)": "", "Connected in (days)": "" }]
    );
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
    allRows.push(
      ...sheetRows.map((row) => ({
        Meeting: titled,
        ...row,
      }))
    );
  }

  const allSheet = XLSX.utils.json_to_sheet(
    allRows.length
      ? allRows
      : [{ Meeting: "", "#": "", Member: "", "Asked for": "", On: "", "Who Can Connect": "", Status: "", Notes: "" }]
  );
  XLSX.utils.book_append_sheet(wb, allSheet, "All");

  const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" }) as Buffer;
  return {
    base64: Buffer.from(buffer).toString("base64"),
    filename: `specific-asks-${today}.xlsx`,
  };
}
