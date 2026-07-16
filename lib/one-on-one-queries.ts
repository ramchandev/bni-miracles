import { GUEST_DANCE_CARD_BUCKET } from "@/lib/121-dance-card-upload";
import { getMemberSession } from "@/lib/member-session";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import {
  isAvailabilitySlotInPast,
  MIRACLES_CHAPTER,
  parseStartTime,
  type Member121CalendarData,
  type Public121ProfileData,
} from "@/lib/one-on-one";
import type { OneOnOneRequest, OneOnOneSlot } from "@/lib/supabase";

export function normalizeSlot(row: Record<string, unknown>): OneOnOneSlot {
  const start = String(row.start_time ?? "");
  const hourPart = start.slice(0, 5);
  return { ...(row as object), start_time: hourPart } as OneOnOneSlot;
}

export function normalizeRequest(row: Record<string, unknown>): OneOnOneRequest {
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

export async function getMemberDanceCardId(memberId: string): Promise<string | null> {
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
    .from(GUEST_DANCE_CARD_BUCKET)
    .createSignedUrl(storagePath, 60 * 60);
  if (error || !data?.signedUrl) return null;
  return data.signedUrl;
}

/** Public profile view: open slots to book + booked times (no requester details). */
export async function fetchPublic121Profile(hostMemberId: string): Promise<Public121ProfileData> {
  const admin = createSupabaseAdminClient();
  const { data: slotsRaw } = await admin
    .from("one_on_one_slots")
    .select("*")
    .eq("host_member_id", hostMemberId)
    .in("status", ["open", "booked"])
    .order("slot_date")
    .order("start_time");

  const slots = ((slotsRaw ?? []) as Record<string, unknown>[]).map(normalizeSlot);
  const isUpcoming = (s: OneOnOneSlot) =>
    !isAvailabilitySlotInPast(s.slot_date, parseStartTime(s.start_time));

  return {
    openSlots: slots.filter((s) => s.status === "open" && isUpcoming(s)),
    bookedSlots: slots.filter((s) => s.status === "booked" && isUpcoming(s)),
  };
}

export async function fetchMember121Data(
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

export async function fetchMy121Calendar(memberId: string): Promise<{
  asHost: OneOnOneRequest[];
  asRequester: OneOnOneRequest[];
  hostSlots: OneOnOneSlot[];
}> {
  const admin = createSupabaseAdminClient();

  const [{ data: asHostRaw }, { data: asRequesterRaw }, { data: hostSlotsRaw }] = await Promise.all([
    admin
      .from("one_on_one_requests")
      .select(
        "*, one_on_one_slots(*), requester:members!requester_member_id(name, profile_picture_url, slug)"
      )
      .eq("host_member_id", memberId)
      .in("status", ["pending", "accepted", "met"])
      .order("created_at", { ascending: false }),
    admin
      .from("one_on_one_requests")
      .select(
        "*, one_on_one_slots(*), members!host_member_id(name, profile_picture_url, slug)"
      )
      .eq("requester_member_id", memberId)
      .in("status", ["pending", "accepted", "met"])
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

export async function getRequesterPrefill(): Promise<{
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

export async function getRequestDanceCardLinks(requestId: string): Promise<{
  hostHasCard: boolean;
  requesterUploadUrl: string | null;
  requesterHasCard: boolean;
  error?: string;
}> {
  const session = await getMemberSession();
  if (!session) {
    return { error: "Please log in.", hostHasCard: false, requesterUploadUrl: null, requesterHasCard: false };
  }

  const admin = createSupabaseAdminClient();
  const { data: raw } = await admin
    .from("one_on_one_requests")
    .select("*")
    .eq("id", requestId)
    .in("status", ["accepted", "met"])
    .single();

  if (!raw) {
    return { error: "Meeting not found.", hostHasCard: false, requesterUploadUrl: null, requesterHasCard: false };
  }

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
