"use server";

import { randomBytes } from "crypto";
import { uploadGuestDanceCardPdf, GUEST_DANCE_CARD_BUCKET } from "@/lib/121-dance-card-upload";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { getMemberSession } from "@/lib/member-session";
import { sendAdminEmail, sendMemberEmail, emailTemplate } from "@/lib/email";
import {
  formatHourOption,
  formatSlotSummary,
  generateIcsContent,
  isValidSlotHour,
  MIRACLES_CHAPTER,
  requiresGuestDanceCardUpload,
  slotDateTime,
  slotEndDateTime,
  type Member121CalendarData,
  type Public121ProfileData,
} from "@/lib/one-on-one";
import type {
  OneOnOneMeetingType,
  OneOnOneRequest,
  OneOnOneSlot,
} from "@/lib/supabase";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://bnimiracles.in";
const GUEST_BUCKET = GUEST_DANCE_CARD_BUCKET;

async function sendNew121RequestEmails(params: {
  hostName: string;
  hostEmail: string;
  requesterName: string;
  requesterChapter: string;
  requesterEmail: string;
  summary: string;
  acceptUrl: string;
  declineUrl: string;
  profileUrl: string;
}): Promise<void> {
  const hostHtml = emailTemplate("New 1-2-1 Request", [
    { label: "Requester", value: params.requesterName },
    { label: "Chapter", value: params.requesterChapter },
    { label: "Email", value: params.requesterEmail },
    { label: "When", value: params.summary },
    {
      label: "Actions",
      value: `<a href="${params.acceptUrl}" style="color:#16A34A;font-weight:600;">Accept</a> · <a href="${params.declineUrl}" style="color:#C8102E;font-weight:600;">Decline</a>`,
    },
    {
      label: "Profile",
      value: `<a href="${params.profileUrl}" style="color:#C8102E;">View on your profile</a>`,
    },
    {
      label: "Calendar",
      value: `<a href="${SITE_URL}/my-121" style="color:#C8102E;">My 1-2-1 Calendar</a>`,
    },
  ]);

  const hostEmail = params.hostEmail.trim();
  let hostNotified = false;

  if (hostEmail) {
    const hostResult = await sendMemberEmail(
      hostEmail,
      `New 1-2-1 request from ${params.requesterName}`,
      hostHtml
    );
    hostNotified = hostResult.sent;
    if (!hostResult.sent) {
      console.error("[121] Host notification failed:", hostResult.error);
    }
  } else {
    console.warn("[121] Host has no email on profile:", params.hostName);
  }

  if (!hostNotified) {
    const adminResult = await sendAdminEmail(
      `[121] New request for ${params.hostName}`,
      emailTemplate("1-2-1 Request — host notify failed", [
        { label: "Host", value: params.hostName },
        {
          label: "Host email",
          value: hostEmail || "Not set on member profile — please ask them to add it.",
        },
        { label: "Requester", value: `${params.requesterName} (${params.requesterChapter})` },
        { label: "Requester email", value: params.requesterEmail },
        { label: "When", value: params.summary },
        {
          label: "Accept",
          value: `<a href="${params.acceptUrl}" style="color:#16A34A;font-weight:600;">Accept</a>`,
        },
        {
          label: "Decline",
          value: `<a href="${params.declineUrl}" style="color:#C8102E;font-weight:600;">Decline</a>`,
        },
      ])
    );
    if (!adminResult.sent) {
      console.error("[121] Admin fallback email also failed:", adminResult.error);
    }
  }

  const requesterResult = await sendMemberEmail(
    params.requesterEmail,
    `1-2-1 request sent to ${params.hostName}`,
    emailTemplate("1-2-1 Request Submitted", [
      { label: "Host", value: params.hostName },
      { label: "When", value: params.summary },
      {
        label: "Status",
        value: "Pending — the host will review and confirm by email.",
      },
      {
        label: "Your calendar",
        value: `<a href="${SITE_URL}/my-121" style="color:#C8102E;">My 1-2-1 Calendar</a>`,
      },
    ])
  );
  if (!requesterResult.sent) {
    console.error("[121] Requester confirmation email failed:", requesterResult.error);
  }
}

function newActionToken(): string {
  return randomBytes(24).toString("hex");
}

function normalizeSlot(row: Record<string, unknown>): OneOnOneSlot {
  const start = String(row.start_time ?? "");
  const hourPart = start.slice(0, 5);
  return { ...(row as object), start_time: hourPart } as OneOnOneSlot;
}

function normalizeRequest(row: Record<string, unknown>): OneOnOneRequest {
  const raw = row.one_on_one_slots;
  let slot: OneOnOneSlot | null = null;
  if (raw && typeof raw === "object") {
    if (Array.isArray(raw)) {
      slot = raw[0] ? normalizeSlot(raw[0] as Record<string, unknown>) : null;
    } else {
      slot = normalizeSlot(raw as Record<string, unknown>);
    }
  }
  return {
    ...(row as object),
    one_on_one_slots: slot,
  } as OneOnOneRequest;
}

async function getMemberDanceCardId(memberId: string): Promise<string | null> {
  const admin = createSupabaseAdminClient();
  const { data } = await admin
    .from("dance_cards")
    .select("id")
    .eq("member_id", memberId)
    .maybeSingle();
  return (data?.id as string | undefined) ?? null;
}

async function signedGuestCardUrl(storagePath: string): Promise<string | null> {
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin.storage
    .from(GUEST_BUCKET)
    .createSignedUrl(storagePath, 60 * 60);
  if (error || !data?.signedUrl) return null;
  return data.signedUrl;
}

/** Public profile view: open slots to book + booked times (no requester details). */
export async function fetchPublic121ProfileAction(
  hostMemberId: string
): Promise<Public121ProfileData> {
  const admin = createSupabaseAdminClient();
  const { data: slotsRaw } = await admin
    .from("one_on_one_slots")
    .select("*")
    .eq("host_member_id", hostMemberId)
    .in("status", ["open", "booked"])
    .order("slot_date")
    .order("start_time");

  const slots = ((slotsRaw ?? []) as Record<string, unknown>[]).map(normalizeSlot);
  return {
    openSlots: slots.filter((s) => s.status === "open"),
    bookedSlots: slots.filter((s) => s.status === "booked"),
  };
}

export async function fetchMember121DataAction(
  hostMemberId: string,
  viewerMemberId?: string | null
): Promise<Member121CalendarData> {
  const admin = createSupabaseAdminClient();
  const isOwner = viewerMemberId === hostMemberId;

  const slotQuery = admin
    .from("one_on_one_slots")
    .select("*")
    .eq("host_member_id", hostMemberId)
    .order("slot_date")
    .order("start_time");

  if (!isOwner) {
    slotQuery.eq("status", "open");
  }

  const [{ data: slotsRaw }, { data: requestsRaw }] = await Promise.all([
    slotQuery,
    isOwner
      ? admin
          .from("one_on_one_requests")
          .select("*, one_on_one_slots(*)")
          .eq("host_member_id", hostMemberId)
          .order("created_at", { ascending: false })
      : Promise.resolve({ data: [] as Record<string, unknown>[] }),
  ]);

  const slots = ((slotsRaw ?? []) as Record<string, unknown>[]).map(normalizeSlot);
  const requests = ((requestsRaw ?? []) as Record<string, unknown>[]).map(normalizeRequest);
  const pendingAsHost = requests.filter((r) => r.status === "pending");

  return { slots, requests, pendingAsHost };
}

export async function fetchMy121CalendarAction(
  memberId: string
): Promise<{ asHost: OneOnOneRequest[]; asRequester: OneOnOneRequest[]; hostSlots: OneOnOneSlot[] }> {
  const admin = createSupabaseAdminClient();

  const [{ data: asHostRaw }, { data: asRequesterRaw }, { data: hostSlotsRaw }] = await Promise.all([
    admin
      .from("one_on_one_requests")
      .select("*, one_on_one_slots(*)")
      .eq("host_member_id", memberId)
      .in("status", ["pending", "accepted"])
      .order("created_at", { ascending: false }),
    admin
      .from("one_on_one_requests")
      .select("*, one_on_one_slots(*)")
      .eq("requester_member_id", memberId)
      .in("status", ["pending", "accepted"])
      .order("created_at", { ascending: false }),
    admin
      .from("one_on_one_slots")
      .select("*")
      .eq("host_member_id", memberId)
      .neq("status", "cancelled")
      .order("slot_date")
      .order("start_time"),
  ]);

  return {
    asHost: ((asHostRaw ?? []) as Record<string, unknown>[]).map(normalizeRequest),
    asRequester: ((asRequesterRaw ?? []) as Record<string, unknown>[]).map(normalizeRequest),
    hostSlots: ((hostSlotsRaw ?? []) as Record<string, unknown>[]).map(normalizeSlot),
  };
}

export async function createAvailabilitySlotAction(input: {
  hostMemberId: string;
  slotDate: string;
  startHour: number;
  meetingType: OneOnOneMeetingType;
  location?: string;
  meetingUrl?: string;
}): Promise<{ slot?: OneOnOneSlot; error?: string }> {
  const session = await getMemberSession();
  if (!session || session.id !== input.hostMemberId) {
    return { error: "You can only manage your own availability." };
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.slotDate)) {
    return { error: "Invalid date." };
  }
  if (!isValidSlotHour(input.startHour)) {
    return { error: "Time must be between 9:00 AM and 7:00 PM." };
  }
  if (input.meetingType === "in_person" && !input.location?.trim()) {
    return { error: "Please enter a location for in-person meetings." };
  }
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("one_on_one_slots")
    .insert({
      host_member_id: input.hostMemberId,
      slot_date: input.slotDate,
      start_time: formatHourOption(input.startHour),
      meeting_type: input.meetingType,
      location: input.meetingType === "in_person" ? input.location?.trim() ?? null : null,
      meeting_url: input.meetingType === "online" ? input.meetingUrl?.trim() ?? null : null,
      status: "open",
    })
    .select("*")
    .single();

  if (error) {
    if (error.code === "23505") return { error: "You already have a slot at that time." };
    return { error: error.message };
  }

  return { slot: normalizeSlot(data as Record<string, unknown>) };
}

export async function deleteAvailabilitySlotAction(
  slotId: string,
  hostMemberId: string
): Promise<{ error?: string }> {
  const session = await getMemberSession();
  if (!session || session.id !== hostMemberId) {
    return { error: "Unauthorized." };
  }

  const admin = createSupabaseAdminClient();
  const { data: slot } = await admin
    .from("one_on_one_slots")
    .select("status, host_member_id")
    .eq("id", slotId)
    .single();

  if (!slot || slot.host_member_id !== hostMemberId) {
    return { error: "Slot not found." };
  }
  if (slot.status !== "open") {
    return { error: "Only open slots can be removed." };
  }

  const { error } = await admin.from("one_on_one_slots").delete().eq("id", slotId);
  if (error) return { error: error.message };
  return {};
}

/** @deprecated Prefer POST /api/121-dance-card-upload (avoids Server Action body size limit) */
export async function uploadGuestDanceCardAction(
  formData: FormData
): Promise<{ path?: string; error?: string }> {
  const file = formData.get("file");
  if (!(file instanceof File)) return { error: "No file provided." };
  return uploadGuestDanceCardPdf(file);
}

export async function submit121RequestAction(input: {
  slotId: string;
  requesterName: string;
  requesterChapter: string;
  requesterEmail: string;
  confirmed: boolean;
  guestDanceCardPath?: string | null;
}): Promise<{ error?: string }> {
  if (!input.confirmed) {
    return { error: "Please confirm you can attend at the scheduled time." };
  }

  const name = input.requesterName.trim();
  const chapter = input.requesterChapter.trim();
  const email = input.requesterEmail.trim();

  if (!name || !chapter || !email.includes("@")) {
    return { error: "Name, chapter, and a valid email are required." };
  }

  const session = await getMemberSession();
  const requesterMemberId = session?.id ?? null;
  const requesterDanceCardId = requesterMemberId
    ? await getMemberDanceCardId(requesterMemberId)
    : null;

  const needsUpload = requiresGuestDanceCardUpload(
    requesterMemberId,
    chapter,
    !!requesterDanceCardId
  );

  if (needsUpload && !input.guestDanceCardPath?.trim()) {
    return { error: "Please upload your dance card PDF." };
  }

  const admin = createSupabaseAdminClient();
  const { data: slot } = await admin
    .from("one_on_one_slots")
    .select("*")
    .eq("id", input.slotId)
    .eq("status", "open")
    .single();

  if (!slot) return { error: "This slot is no longer available." };

  if (requesterMemberId && requesterMemberId === slot.host_member_id) {
    return { error: "You cannot book your own slot." };
  }

  const { data: host } = await admin
    .from("members")
    .select("name, slug, email")
    .eq("id", slot.host_member_id)
    .single();

  const token = newActionToken();
  const { error } = await admin.from("one_on_one_requests").insert({
    slot_id: input.slotId,
    host_member_id: slot.host_member_id,
    requester_member_id: requesterMemberId,
    requester_name: name,
    requester_chapter: chapter,
    requester_email: email,
    guest_dance_card_url: needsUpload ? input.guestDanceCardPath!.trim() : null,
    requester_dance_card_id: requesterDanceCardId,
    status: "pending",
    host_action_token: token,
  });

  if (error) return { error: error.message };

  const slotNorm = normalizeSlot(slot as Record<string, unknown>);
  const summary = formatSlotSummary(slotNorm);
  const profileUrl = `${SITE_URL}/members/${host?.slug ?? ""}#one-on-one`;
  const acceptUrl = `${SITE_URL}/121/respond/${token}?action=accept`;
  const declineUrl = `${SITE_URL}/121/respond/${token}?action=decline`;

  await sendNew121RequestEmails({
    hostName: (host?.name as string) ?? "BNI Miracles member",
    hostEmail: (host?.email as string | null) ?? "",
    requesterName: name,
    requesterChapter: chapter,
    requesterEmail: email,
    summary,
    acceptUrl,
    declineUrl,
    profileUrl,
  });

  return {};
}

async function loadRequestForAction(
  requestId: string,
  token?: string | null
): Promise<{ request: OneOnOneRequest; slot: OneOnOneSlot; error?: string } | { error: string }> {
  const admin = createSupabaseAdminClient();
  const { data: raw } = await admin
    .from("one_on_one_requests")
    .select("*, one_on_one_slots(*)")
    .eq("id", requestId)
    .single();

  if (!raw) return { error: "Request not found." };

  const request = normalizeRequest(raw as Record<string, unknown>);
  const slotRaw = request.one_on_one_slots;
  if (!slotRaw || Array.isArray(slotRaw)) return { error: "Slot not found." };
  const slot = slotRaw;

  const session = await getMemberSession();
  const isHost = session?.id === request.host_member_id;
  const tokenOk = token && token === request.host_action_token;

  if (!isHost && !tokenOk) {
    return { error: "Unauthorized." };
  }

  return { request, slot };
}

export async function accept121RequestAction(
  requestId: string,
  token?: string | null
): Promise<{ error?: string }> {
  const loaded = await loadRequestForAction(requestId, token);
  if ("error" in loaded) return { error: loaded.error };

  const { request, slot } = loaded;
  if (request.status !== "pending") return { error: "This request has already been handled." };
  if (slot.status !== "open") return { error: "This slot is no longer open." };

  const admin = createSupabaseAdminClient();
  const hostDanceCardId = await getMemberDanceCardId(request.host_member_id);
  const now = new Date().toISOString();

  const { error: reqError } = await admin
    .from("one_on_one_requests")
    .update({
      status: "accepted",
      confirmed_at: now,
      host_dance_card_id: hostDanceCardId,
      requester_dance_card_id: request.requester_dance_card_id ?? request.requester_dance_card_id,
    })
    .eq("id", requestId)
    .eq("status", "pending");

  if (reqError) return { error: reqError.message };

  const { error: slotError } = await admin
    .from("one_on_one_slots")
    .update({ status: "booked" })
    .eq("id", slot.id)
    .eq("status", "open");

  if (slotError) return { error: slotError.message };

  const [{ data: host }, ics] = await Promise.all([
    admin.from("members").select("name, email").eq("id", request.host_member_id).single(),
    generate121IcsAction(requestId),
  ]);

  const summary = formatSlotSummary(slot);
  const icsLink = ics.content
    ? `${SITE_URL}/api/121-ics/${requestId}`
    : null;

  const confirmResult = await sendMemberEmail(
    request.requester_email,
    `1-2-1 confirmed with ${host?.name ?? "your host"}`,
    emailTemplate("1-2-1 Confirmed", [
      { label: "Host", value: (host?.name as string) ?? "BNI Miracles member" },
      { label: "When", value: summary },
      {
        label: "Meeting",
        value:
          slot.meeting_type === "online"
            ? slot.meeting_url ?? "Link shared separately"
            : slot.location ?? "See host for location",
      },
      ...(icsLink
        ? [{ label: "Calendar", value: `<a href="${icsLink}" style="color:#C8102E;">Download .ics file</a>` }]
        : []),
      {
        label: "Dance cards",
        value: "View dance card links on your My 1-2-1 Calendar after logging in.",
      },
    ])
  );
  if (!confirmResult.sent) {
    console.error("[accept121RequestAction] Confirmation email failed:", confirmResult.error);
  }

  return {};
}

export async function decline121RequestAction(
  requestId: string,
  token?: string | null
): Promise<{ error?: string }> {
  const loaded = await loadRequestForAction(requestId, token);
  if ("error" in loaded) return { error: loaded.error };

  const { request } = loaded;
  if (request.status !== "pending") return { error: "This request has already been handled." };

  const admin = createSupabaseAdminClient();
  const { error } = await admin
    .from("one_on_one_requests")
    .update({ status: "declined" })
    .eq("id", requestId)
    .eq("status", "pending");

  if (error) return { error: error.message };

  const slotJoin = request.one_on_one_slots;
  const slot = slotJoin && !Array.isArray(slotJoin) ? slotJoin : null;

  const declineResult = await sendMemberEmail(
    request.requester_email,
    "1-2-1 request update — BNI Miracles",
    emailTemplate("1-2-1 Request Declined", [
      { label: "Host", value: "The member was unable to confirm this time." },
      {
        label: "Next step",
        value: slot
          ? `You may choose another open slot on their profile.`
          : "Please try booking another time.",
      },
    ])
  );
  if (!declineResult.sent) {
    console.error("[decline121RequestAction] Notification email failed:", declineResult.error);
  }

  return {};
}

export async function respond121ByTokenAction(
  token: string,
  action: "accept" | "decline"
): Promise<{ requestId?: string; error?: string }> {
  const admin = createSupabaseAdminClient();
  const { data } = await admin
    .from("one_on_one_requests")
    .select("id, status")
    .eq("host_action_token", token)
    .single();

  if (!data) return { error: "Invalid or expired link." };
  if (data.status !== "pending") {
    return { requestId: data.id as string, error: "This request was already handled." };
  }

  const result =
    action === "accept"
      ? await accept121RequestAction(data.id as string, token)
      : await decline121RequestAction(data.id as string, token);

  if (result.error) return { requestId: data.id as string, error: result.error };
  return { requestId: data.id as string };
}

export async function generate121IcsAction(
  requestId: string
): Promise<{ content?: string; filename?: string; error?: string }> {
  const admin = createSupabaseAdminClient();
  const { data: raw } = await admin
    .from("one_on_one_requests")
    .select("*, one_on_one_slots(*)")
    .eq("id", requestId)
    .eq("status", "accepted")
    .single();

  if (!raw) return { error: "Confirmed meeting not found." };

  const request = normalizeRequest(raw as Record<string, unknown>);
  const slotRaw = request.one_on_one_slots;
  if (!slotRaw || Array.isArray(slotRaw)) return { error: "Slot not found." };

  const [{ data: host }] = await Promise.all([
    admin.from("members").select("name, email").eq("id", request.host_member_id).single(),
  ]);

  const start = slotDateTime(slotRaw);
  const end = slotEndDateTime(slotRaw);
  const location =
    slotRaw.meeting_type === "online"
      ? slotRaw.meeting_url ?? "Online"
      : slotRaw.location ?? "In person";

  const content = generateIcsContent({
    uid: `121-${requestId}@bnimiracles.in`,
    title: `1-2-1: ${request.requester_name} × ${(host?.name as string) ?? "BNI Miracles"}`,
    description: formatSlotSummary(slotRaw),
    location,
    start,
    end,
    organizerEmail: (host?.email as string | null) ?? undefined,
    attendeeEmail: request.requester_email,
  });

  return {
    content,
    filename: `121-${slotRaw.slot_date}.ics`,
  };
}

export async function getRequestDanceCardLinksAction(
  requestId: string
): Promise<{
  hostHasCard: boolean;
  requesterUploadUrl: string | null;
  requesterHasCard: boolean;
  error?: string;
}> {
  const session = await getMemberSession();
  if (!session) return { error: "Please log in.", hostHasCard: false, requesterUploadUrl: null, requesterHasCard: false };

  const admin = createSupabaseAdminClient();
  const { data: raw } = await admin
    .from("one_on_one_requests")
    .select("*")
    .eq("id", requestId)
    .eq("status", "accepted")
    .single();

  if (!raw) return { error: "Meeting not found.", hostHasCard: false, requesterUploadUrl: null, requesterHasCard: false };

  const request = raw as OneOnOneRequest;
  const isHost = session.id === request.host_member_id;
  const isRequester = session.id === request.requester_member_id;
  if (!isHost && !isRequester) {
    return { error: "Unauthorized.", hostHasCard: false, requesterUploadUrl: null, requesterHasCard: false };
  }

  let requesterUploadUrl: string | null = null;
  if (request.guest_dance_card_url) {
    requesterUploadUrl = await signedGuestCardUrl(request.guest_dance_card_url);
  }

  return {
    hostHasCard: !!request.host_dance_card_id,
    requesterHasCard: !!request.requester_dance_card_id,
    requesterUploadUrl,
  };
}

export async function getRequesterPrefillAction(): Promise<{
  name: string;
  chapter: string;
  email: string;
  memberId: string | null;
  hasDanceCard: boolean;
}> {
  const session = await getMemberSession();
  if (!session) {
    return { name: "", chapter: "", email: "", memberId: null, hasDanceCard: false };
  }

  const danceCardId = await getMemberDanceCardId(session.id);
  return {
    name: session.name,
    chapter: MIRACLES_CHAPTER,
    email: session.email ?? "",
    memberId: session.id,
    hasDanceCard: !!danceCardId,
  };
}
