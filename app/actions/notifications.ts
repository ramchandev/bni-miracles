"use server";

import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { getMemberSession } from "@/lib/member-session";
import type { MemberNotification, MemberNotificationType } from "@/lib/notifications";

export async function createMemberNotification(input: {
  memberId: string;
  type: MemberNotificationType;
  title: string;
  body: string;
  href?: string | null;
  sourceId?: string | null;
}): Promise<void> {
  const admin = createSupabaseAdminClient();

  if (input.sourceId) {
    const { data: existing } = await admin
      .from("member_notifications")
      .select("id")
      .eq("member_id", input.memberId)
      .eq("type", input.type)
      .eq("source_id", input.sourceId)
      .maybeSingle();
    if (existing) return;
  }

  const { error } = await admin.from("member_notifications").insert({
    member_id: input.memberId,
    type: input.type,
    title: input.title,
    body: input.body,
    href: input.href ?? null,
    source_id: input.sourceId ?? null,
    is_read: false,
  });

  if (error) {
    console.error("[createMemberNotification]", error.message);
  }
}

/** Backfill notifications for pending 121 requests missing a row. */
async function syncPending121Notifications(memberId: string): Promise<void> {
  const admin = createSupabaseAdminClient();
  const { data: pending } = await admin
    .from("one_on_one_requests")
    .select("id, requester_name, requester_chapter, created_at, one_on_one_slots(slot_date, start_time)")
    .eq("host_member_id", memberId)
    .eq("status", "pending");

  for (const req of pending ?? []) {
    const slotRaw = req.one_on_one_slots as
      | { slot_date: string; start_time: string }
      | { slot_date: string; start_time: string }[]
      | null;
    const slot = Array.isArray(slotRaw) ? slotRaw[0] : slotRaw;
    const when = slot
      ? `${slot.slot_date} ${String(slot.start_time).slice(0, 5)}`
      : "scheduled time";

    await createMemberNotification({
      memberId,
      type: "121_request",
      title: `1-2-1 request from ${req.requester_name}`,
      body: `${req.requester_chapter} · ${when}`,
      href: "/my-121",
      sourceId: req.id as string,
    });
  }
}

export async function fetchMemberNotificationsAction(): Promise<{
  notifications: MemberNotification[];
  unreadCount: number;
}> {
  const session = await getMemberSession();
  if (!session) return { notifications: [], unreadCount: 0 };

  await syncPending121Notifications(session.id);

  const admin = createSupabaseAdminClient();
  const { data } = await admin
    .from("member_notifications")
    .select("*")
    .eq("member_id", session.id)
    .order("created_at", { ascending: false })
    .limit(30);

  const notifications = (data ?? []) as MemberNotification[];
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return { notifications, unreadCount };
}

export async function markNotificationsReadAction(
  notificationIds?: string[]
): Promise<void> {
  const session = await getMemberSession();
  if (!session) return;

  const admin = createSupabaseAdminClient();
  let query = admin
    .from("member_notifications")
    .update({ is_read: true })
    .eq("member_id", session.id)
    .eq("is_read", false);

  if (notificationIds?.length) {
    query = query.in("id", notificationIds);
  }

  await query;
}
