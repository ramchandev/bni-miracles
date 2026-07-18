"use server";

import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { getMemberSession } from "@/lib/member-session";
import { formatSlotSummary } from "@/lib/one-on-one";
import type { MemberNotification, MemberNotificationType } from "@/lib/notifications";
import type { OneOnOneSlot } from "@/lib/supabase";

const REQUEST_SELECT = `
  id,
  requester_name,
  requester_chapter,
  requester_member_id,
  host_member_id,
  status,
  created_at,
  one_on_one_slots (
    slot_date,
    start_time,
    meeting_type,
    location,
    meeting_url
  )
`;

function slotFromJoin(
  raw: OneOnOneSlot | OneOnOneSlot[] | null | undefined
): OneOnOneSlot | null {
  if (!raw) return null;
  if (Array.isArray(raw)) return raw[0] ?? null;
  return raw;
}

function readKey(type: string, sourceId: string): string {
  return `${type}:${sourceId}`;
}

function virtualId(type: string, sourceId: string): string {
  return `live-${type}-${sourceId}`;
}

function to121Notification(
  row: Record<string, unknown>,
  type: MemberNotificationType,
  isRead: boolean
): MemberNotification {
  const id = row.id as string;
  const slot = slotFromJoin(row.one_on_one_slots as OneOnOneSlot | OneOnOneSlot[] | null);
  const slotNorm = slot
    ? { ...slot, start_time: String(slot.start_time).slice(0, 5) }
    : null;

  const body = slotNorm
    ? type === "121_request"
      ? `${row.requester_chapter} · ${formatSlotSummary(slotNorm)}`
      : formatSlotSummary(slotNorm)
    : String(row.requester_chapter ?? "");

  const titles: Record<MemberNotificationType, string> = {
    "121_request": `1-2-1 request from ${row.requester_name}`,
    "121_accepted": `1-2-1 confirmed`,
    "121_declined": `1-2-1 request declined`,
    bizrox_comment: "",
  };

  return {
    id: virtualId(type, id),
    member_id: "",
    type,
    title: titles[type] || "Notification",
    body,
    href: "/my-121",
    source_id: id,
    is_read: isRead,
    created_at: row.created_at as string,
  };
}

async function fetchReadKeys(memberId: string): Promise<Set<string>> {
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("member_notifications")
    .select("type, source_id")
    .eq("member_id", memberId)
    .eq("is_read", true);

  if (error) {
    // Table may not exist yet — read state falls back to client localStorage
    return new Set();
  }

  return new Set(
    (data ?? [])
      .filter((r) => r.source_id)
      .map((r) => readKey(r.type as string, r.source_id as string))
  );
}

async function fetchLive121Notifications(
  memberId: string,
  readKeys: Set<string>
): Promise<MemberNotification[]> {
  const admin = createSupabaseAdminClient();
  const out: MemberNotification[] = [];

  const [hostResult, requesterResult] = await Promise.all([
    admin
      .from("one_on_one_requests")
      .select(REQUEST_SELECT)
      .eq("host_member_id", memberId)
      .eq("status", "pending")
      .order("created_at", { ascending: false }),
    admin
      .from("one_on_one_requests")
      .select(REQUEST_SELECT)
      .eq("requester_member_id", memberId)
      .in("status", ["accepted", "declined"])
      .order("created_at", { ascending: false })
      .limit(15),
  ]);

  if (hostResult.error) {
    console.error("[fetchLive121Notifications] host pending:", hostResult.error.message);
  }
  if (requesterResult.error) {
    console.error("[fetchLive121Notifications] as requester:", requesterResult.error.message);
  }

  const hostPending = hostResult.data;
  const asRequester = requesterResult.data;

  for (const row of hostPending ?? []) {
    const sourceId = row.id as string;
    out.push(
      to121Notification(
        row as Record<string, unknown>,
        "121_request",
        readKeys.has(readKey("121_request", sourceId))
      )
    );
  }

  for (const row of asRequester ?? []) {
    const sourceId = row.id as string;
    const status = row.status as string;
    const type: MemberNotificationType =
      status === "accepted" ? "121_accepted" : "121_declined";
    const n = to121Notification(row as Record<string, unknown>, type, readKeys.has(readKey(type, sourceId)));
    if (type === "121_accepted") {
      n.title = "1-2-1 confirmed with host";
    }
    out.push(n);
  }

  return out;
}

async function fetchLiveBizRoxNotifications(
  memberId: string,
  readKeys: Set<string>
): Promise<MemberNotification[]> {
  const admin = createSupabaseAdminClient();
  const { data: posts } = await admin
    .from("bizrox_posts")
    .select("id, content")
    .eq("member_id", memberId)
    .eq("is_active", true);

  if (!posts?.length) return [];

  const postIds = posts.map((p) => p.id as string);
  const postContent = new Map(posts.map((p) => [p.id as string, p.content as string]));

  const { data: comments } = await admin
    .from("bizrox_comments")
    .select("id, post_id, content, created_at, member_id, members(name)")
    .in("post_id", postIds)
    .neq("member_id", memberId)
    .order("created_at", { ascending: false })
    .limit(15);

  return (comments ?? []).map((c) => {
    const sourceId = c.id as string;
    const author = c.members as { name?: string } | { name?: string }[] | null;
    const authorName = Array.isArray(author) ? author[0]?.name : author?.name;
    return {
      id: virtualId("bizrox_comment", sourceId),
      member_id: memberId,
      type: "bizrox_comment" as const,
      title: `${authorName ?? "Someone"} commented on your post`,
      body: (c.content as string).slice(0, 120),
      href: `/bizrox/${c.post_id}`,
      source_id: sourceId,
      is_read: readKeys.has(readKey("bizrox_comment", sourceId)),
      created_at: c.created_at as string,
    };
  });
}

export async function createMemberNotification(input: {
  memberId: string;
  type: MemberNotificationType;
  title: string;
  body: string;
  href?: string | null;
  sourceId?: string | null;
}): Promise<void> {
  if (!input.sourceId) return;

  const admin = createSupabaseAdminClient();
  const { data: existing } = await admin
    .from("member_notifications")
    .select("id")
    .eq("member_id", input.memberId)
    .eq("type", input.type)
    .eq("source_id", input.sourceId)
    .maybeSingle();

  if (existing) return;

  const { error } = await admin.from("member_notifications").insert({
    member_id: input.memberId,
    type: input.type,
    title: input.title,
    body: input.body,
    href: input.href ?? null,
    source_id: input.sourceId,
    is_read: false,
  });

  if (error && !error.message.includes("member_notifications")) {
    console.error("[createMemberNotification]", error.message);
  }
}

export async function fetchMemberNotificationsAction(): Promise<{
  notifications: MemberNotification[];
  unreadCount: number;
}> {
  const session = await getMemberSession();
  if (!session) return { notifications: [], unreadCount: 0 };

  const readKeys = await fetchReadKeys(session.id);

  const [live121, liveBizrox] = await Promise.all([
    fetchLive121Notifications(session.id, readKeys),
    fetchLiveBizRoxNotifications(session.id, readKeys),
  ]);

  const notifications = [...live121, ...liveBizrox]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 30)
    .map((n) => ({ ...n, member_id: session.id }));

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return { notifications, unreadCount };
}

/**
 * Lightweight badge counts for the member dock.
 * - count121: pending requests for this host + unread accept/decline as requester
 * - countBizrox: new posts since lastSeen + unread comments on own posts
 */
export async function fetchDockBadgeCountsAction(
  bizroxLastSeenIso?: string | null
): Promise<{ count121: number; countBizrox: number }> {
  const session = await getMemberSession();
  if (!session) return { count121: 0, countBizrox: 0 };

  const admin = createSupabaseAdminClient();
  const readKeys = await fetchReadKeys(session.id);

  const [pendingResult, requesterResult, bizroxComments, newPostsResult] =
    await Promise.all([
      admin
        .from("one_on_one_requests")
        .select("id", { count: "exact", head: true })
        .eq("host_member_id", session.id)
        .eq("status", "pending"),
      admin
        .from("one_on_one_requests")
        .select("id, status")
        .eq("requester_member_id", session.id)
        .in("status", ["accepted", "declined"])
        .order("created_at", { ascending: false })
        .limit(30),
      fetchLiveBizRoxNotifications(session.id, readKeys),
      (async () => {
        if (!bizroxLastSeenIso) return 0;
        const since = new Date(bizroxLastSeenIso);
        if (Number.isNaN(since.getTime())) return 0;
        const { count } = await admin
          .from("bizrox_posts")
          .select("id", { count: "exact", head: true })
          .eq("is_active", true)
          .gt("created_at", since.toISOString());
        return count ?? 0;
      })(),
    ]);

  if (pendingResult.error) {
    console.error("[fetchDockBadgeCountsAction] pending:", pendingResult.error.message);
  }
  if (requesterResult.error) {
    console.error("[fetchDockBadgeCountsAction] requester:", requesterResult.error.message);
  }

  // All pending host requests are actionable — always count them
  const pendingCount = pendingResult.count ?? 0;

  let unreadRequester = 0;
  for (const row of requesterResult.data ?? []) {
    const type = row.status === "accepted" ? "121_accepted" : "121_declined";
    if (!readKeys.has(readKey(type, row.id as string))) unreadRequester++;
  }

  const unreadBizroxComments = bizroxComments.filter((n) => !n.is_read).length;

  return {
    count121: pendingCount + unreadRequester,
    countBizrox: newPostsResult + unreadBizroxComments,
  };
}

/** Parse virtual id from bell UI: live-{type}-{sourceId} */
function parseVirtualNotificationId(
  notificationId: string
): { type: MemberNotificationType; sourceId: string } | null {
  if (!notificationId.startsWith("live-")) return null;
  const rest = notificationId.slice(5);
  const types: MemberNotificationType[] = [
    "121_request",
    "121_accepted",
    "121_declined",
    "bizrox_comment",
  ];
  for (const type of types) {
    const prefix = `${type}-`;
    if (rest.startsWith(prefix)) {
      return { type, sourceId: rest.slice(prefix.length) };
    }
  }
  return null;
}

export async function markNotificationsReadAction(
  notificationIds?: string[]
): Promise<void> {
  const session = await getMemberSession();
  if (!session) return;

  const admin = createSupabaseAdminClient();
  const ids = notificationIds ?? [];

  for (const nid of ids) {
    const parsed = parseVirtualNotificationId(nid);
    if (!parsed) continue;

    const { data: existing } = await admin
      .from("member_notifications")
      .select("id")
      .eq("member_id", session.id)
      .eq("type", parsed.type)
      .eq("source_id", parsed.sourceId)
      .maybeSingle();

    if (existing) {
      await admin
        .from("member_notifications")
        .update({ is_read: true })
        .eq("id", existing.id as string);
    } else {
      await admin.from("member_notifications").insert({
        member_id: session.id,
        type: parsed.type,
        title: "Read",
        body: "",
        source_id: parsed.sourceId,
        is_read: true,
      });
    }
  }

  if (!notificationIds?.length) {
    await admin
      .from("member_notifications")
      .update({ is_read: true })
      .eq("member_id", session.id)
      .eq("is_read", false);
  }
}
