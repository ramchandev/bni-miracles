"use server";

import { randomBytes } from "crypto";
import { uploadGuestDanceCardPdf } from "@/lib/121-dance-card-upload";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { getMemberSession } from "@/lib/member-session";
import { sendAdminEmail, sendMemberEmail, emailTemplate } from "@/lib/email";
import { createMemberNotification } from "@/app/actions/notifications";
import {
  getMemberDanceCardId,
  normalizeRequest,
  normalizeSlot,
} from "@/lib/one-on-one-queries";
import {
  formatHourOption,
  formatSlotSummary,
  generateIcsContent,
  isAvailabilitySlotInPast,
  isValidSlotHour,
  MIRACLES_CHAPTER,
  parseStartTime,
  slotDateTime,
  slotEndDateTime,
} from "@/lib/one-on-one";
import { SITE_DOMAIN, SITE_URL } from "@/lib/seo";
import { sendPushToMembers } from "@/lib/push-server";
import type {
  OneOnOneMeetingType,
  OneOnOneRequest,
  OneOnOneSlot,
} from "@/lib/supabase";

async function sendNew121RequestEmails(params: {
  hostMemberId: string;
  hostName: string;
  hostEmail: string;
  requesterName: string;
  requesterChapter: string;
  requesterEmail: string;
  requestId: string;
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

  const admin = createSupabaseAdminClient();
  const { data: slot } = await admin
    .from("one_on_one_slots")
    .select("*")
    .eq("id", input.slotId)
    .eq("status", "open")
    .single();

  if (!slot) return { error: "This slot is no longer available." };

  const startHour = parseStartTime(String(slot.start_time));
  if (isAvailabilitySlotInPast(String(slot.slot_date), startHour)) {
    return { error: "This slot has already passed." };
  }

  if (requesterMemberId && requesterMemberId === slot.host_member_id) {
    return { error: "You cannot book your own slot." };
  }

  const { data: host } = await admin
    .from("members")
    .select("name, slug, email")
    .eq("id", slot.host_member_id)
    .single();

  const token = newActionToken();
  const { data: inserted, error } = await admin.from("one_on_one_requests").insert({
    slot_id: input.slotId,
    host_member_id: slot.host_member_id,
    requester_member_id: requesterMemberId,
    requester_name: name,
    requester_chapter: chapter,
    requester_email: email,
    guest_dance_card_url: input.guestDanceCardPath?.trim() || null,
    requester_dance_card_id: requesterDanceCardId,
    status: "pending",
    host_action_token: token,
  }).select("id").single();

  if (error) return { error: error.message };
  if (!inserted?.id) return { error: "Could not save request." };

  const slotNorm = normalizeSlot(slot as Record<string, unknown>);
  const summary = formatSlotSummary(slotNorm);
  const profileUrl = `${SITE_URL}/members/${host?.slug ?? ""}#one-on-one`;
  const acceptUrl = `${SITE_URL}/121/respond/${token}?action=accept`;
  const declineUrl = `${SITE_URL}/121/respond/${token}?action=decline`;
  const hostMemberId = String(slot.host_member_id);

  // Push first (before emails) so the host is notified even if email delivery is slow/fails
  await createMemberNotification({
    memberId: hostMemberId,
    type: "121_request",
    title: `1-2-1 request from ${name}`,
    body: `${chapter} · ${summary}`,
    href: "/my-121",
    sourceId: inserted.id as string,
  });
  await sendPushToMembers([hostMemberId], {
    title: `1-2-1 request from ${name}`,
    body: `${chapter} · ${summary}`,
    href: "/my-121",
    tag: `121-request-${inserted.id as string}`,
  });

  await sendNew121RequestEmails({
    hostMemberId,
    hostName: (host?.name as string) ?? "Miracle Members member",
    hostEmail: (host?.email as string | null) ?? "",
    requesterName: name,
    requesterChapter: chapter,
    requesterEmail: email,
    requestId: inserted.id as string,
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
      { label: "Host", value: (host?.name as string) ?? "Miracle Members member" },
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

  if (request.requester_member_id) {
    await createMemberNotification({
      memberId: request.requester_member_id,
      type: "121_accepted",
      title: `1-2-1 confirmed with ${(host?.name as string) ?? "your host"}`,
      body: summary,
      href: "/my-121",
      sourceId: requestId,
    });

    await sendPushToMembers([request.requester_member_id], {
      title: `1-2-1 confirmed with ${(host?.name as string) ?? "your host"}`,
      body: summary,
      href: "/my-121",
      tag: `121-accepted-${requestId}`,
    });
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
    "1-2-1 request update — Miracle Members",
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

  if (request.requester_member_id) {
    await createMemberNotification({
      memberId: request.requester_member_id,
      type: "121_declined",
      title: "1-2-1 request declined",
      body: "The host was unable to confirm this time. Try another slot.",
      href: "/my-121",
      sourceId: requestId,
    });

    await sendPushToMembers([request.requester_member_id], {
      title: "1-2-1 request declined",
      body: "The host was unable to confirm this time. Try another slot.",
      href: "/my-121",
      tag: `121-declined-${requestId}`,
    });
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
    uid: `121-${requestId}@${SITE_DOMAIN}`,
    title: `1-2-1: ${request.requester_name} × ${(host?.name as string) ?? "Miracle Members"}`,
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

async function loadAcceptedMeetingForMember(
  requestId: string
): Promise<{ request: OneOnOneRequest; slot: OneOnOneSlot; error?: string } | { error: string }> {
  const session = await getMemberSession();
  if (!session) return { error: "Please log in." };

  const admin = createSupabaseAdminClient();
  const { data: raw } = await admin
    .from("one_on_one_requests")
    .select("*, one_on_one_slots(*)")
    .eq("id", requestId)
    .eq("status", "accepted")
    .single();

  if (!raw) return { error: "Meeting not found." };

  const request = normalizeRequest(raw as Record<string, unknown>);
  const slotJoin = request.one_on_one_slots;
  if (!slotJoin || Array.isArray(slotJoin)) return { error: "Slot not found." };
  const slot = slotJoin;

  const isHost = session.id === request.host_member_id;
  const isRequester = session.id === request.requester_member_id;
  if (!isHost && !isRequester) return { error: "Unauthorized." };

  return { request, slot };
}

async function reopenBookedSlot(admin: ReturnType<typeof createSupabaseAdminClient>, slotId: string) {
  await admin.from("one_on_one_slots").update({ status: "open" }).eq("id", slotId).eq("status", "booked");
}

export async function mark121MeetingMetAction(requestId: string): Promise<{ error?: string }> {
  const loaded = await loadAcceptedMeetingForMember(requestId);
  if ("error" in loaded) return { error: loaded.error };

  const admin = createSupabaseAdminClient();
  const { error } = await admin
    .from("one_on_one_requests")
    .update({ status: "met" })
    .eq("id", requestId)
    .eq("status", "accepted");

  if (error) return { error: error.message };
  return {};
}

/**
 * Mark a past meeting as cancelled without freeing/deleting the slot —
 * used when neither party marked the 1-2-1 after its time passed.
 */
export async function mark121MeetingCancelledAction(
  requestId: string
): Promise<{ error?: string }> {
  const loaded = await loadAcceptedMeetingForMember(requestId);
  if ("error" in loaded) return { error: loaded.error };

  const admin = createSupabaseAdminClient();
  const { error } = await admin
    .from("one_on_one_requests")
    .update({ status: "cancelled" })
    .eq("id", requestId)
    .eq("status", "accepted");

  if (error) return { error: error.message };
  return {};
}

export async function cancel121MeetingAction(requestId: string): Promise<{ error?: string }> {
  const loaded = await loadAcceptedMeetingForMember(requestId);
  if ("error" in loaded) return { error: loaded.error };

  const { request, slot } = loaded;
  const session = await getMemberSession();
  if (!session) return { error: "Please log in." };

  const admin = createSupabaseAdminClient();
  const { error } = await admin
    .from("one_on_one_requests")
    .update({ status: "cancelled" })
    .eq("id", requestId)
    .eq("status", "accepted");

  if (error) return { error: error.message };

  const isHost = session.id === request.host_member_id;
  if (isHost) {
    const { error: slotError } = await admin.from("one_on_one_slots").delete().eq("id", slot.id);
    if (slotError) return { error: slotError.message };
  } else {
    await reopenBookedSlot(admin, slot.id);
  }
  return {};
}

export async function delete121MeetingAction(requestId: string): Promise<{ error?: string }> {
  const loaded = await loadAcceptedMeetingForMember(requestId);
  if ("error" in loaded) return { error: loaded.error };

  const { request, slot } = loaded;
  const session = await getMemberSession();
  if (!session) return { error: "Please log in." };

  const admin = createSupabaseAdminClient();
  const isHost = session.id === request.host_member_id;

  if (isHost) {
    const { error } = await admin.from("one_on_one_slots").delete().eq("id", slot.id);
    if (error) return { error: error.message };
  } else {
    const { error } = await admin.from("one_on_one_requests").delete().eq("id", requestId);
    if (error) return { error: error.message };
    await reopenBookedSlot(admin, slot.id);
  }
  return {};
}

