import webpush from "web-push";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";

export type PushPayload = {
  title: string;
  body: string;
  href?: string;
  /** Collapses multiple notifications with the same tag on the device */
  tag?: string;
};

type SubscriptionRow = {
  id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
};

let vapidConfigured = false;

function ensureVapid(): boolean {
  if (vapidConfigured) return true;

  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  if (!publicKey || !privateKey) {
    console.warn("[push] VAPID keys not configured — skipping push send");
    return false;
  }

  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT ?? "mailto:care@miraclemembers.in",
    publicKey,
    privateKey
  );
  vapidConfigured = true;
  return true;
}

async function sendToSubscriptions(
  subs: SubscriptionRow[],
  payload: PushPayload
): Promise<void> {
  if (subs.length === 0 || !ensureVapid()) return;

  const admin = createSupabaseAdminClient();
  const body = JSON.stringify(payload);

  const results = await Promise.allSettled(
    subs.map((sub) =>
      webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: { p256dh: sub.p256dh, auth: sub.auth },
        },
        body
      )
    )
  );

  // Clean up subscriptions the push service reports as gone
  const deadIds: string[] = [];
  results.forEach((result, i) => {
    if (result.status === "rejected") {
      const statusCode = (result.reason as { statusCode?: number })?.statusCode;
      if (statusCode === 404 || statusCode === 410) {
        deadIds.push(subs[i].id);
      } else {
        console.error("[push] send failed:", result.reason);
      }
    }
  });

  if (deadIds.length > 0) {
    await admin.from("push_subscriptions").delete().in("id", deadIds);
  }
}

/** Send a push to every device of the given members. Never throws. */
export async function sendPushToMembers(
  memberIds: string[],
  payload: PushPayload
): Promise<void> {
  try {
    if (memberIds.length === 0) return;
    const admin = createSupabaseAdminClient();
    const { data, error } = await admin
      .from("push_subscriptions")
      .select("id, endpoint, p256dh, auth")
      .in("member_id", memberIds);

    if (error) {
      console.error("[sendPushToMembers] query failed:", error.message);
      return;
    }
    if (!data?.length) {
      console.warn(
        "[sendPushToMembers] no subscriptions for members:",
        memberIds.join(", "),
        "— payload:",
        payload.tag ?? payload.title
      );
      return;
    }
    await sendToSubscriptions(data as SubscriptionRow[], payload);
  } catch (err) {
    console.error("[sendPushToMembers]", err);
  }
}

/** Send a push to all subscribed members, optionally excluding one. Never throws. */
export async function sendPushToAllMembers(
  payload: PushPayload,
  opts?: { excludeMemberId?: string }
): Promise<void> {
  try {
    const admin = createSupabaseAdminClient();
    let q = admin
      .from("push_subscriptions")
      .select("id, endpoint, p256dh, auth");

    if (opts?.excludeMemberId) {
      q = q.neq("member_id", opts.excludeMemberId);
    }

    const { data, error } = await q;
    if (error) return;
    await sendToSubscriptions((data ?? []) as SubscriptionRow[], payload);
  } catch (err) {
    console.error("[sendPushToAllMembers]", err);
  }
}
