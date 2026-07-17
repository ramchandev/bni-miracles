"use server";

import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { getMemberSession } from "@/lib/member-session";

export type PushSubscriptionInput = {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
};

export async function savePushSubscriptionAction(
  subscription: PushSubscriptionInput,
  userAgent?: string
): Promise<{ error?: string }> {
  const member = await getMemberSession();
  if (!member) return { error: "Please log in to enable notifications." };

  if (!subscription?.endpoint || !subscription.keys?.p256dh || !subscription.keys?.auth) {
    return { error: "Invalid subscription." };
  }

  const admin = createSupabaseAdminClient();
  const { error } = await admin.from("push_subscriptions").upsert(
    {
      member_id: member.id,
      endpoint: subscription.endpoint,
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth,
      user_agent: userAgent?.slice(0, 300) ?? null,
    },
    { onConflict: "endpoint" }
  );

  if (error) {
    console.error("[savePushSubscriptionAction]", error.message);
    return { error: "Could not save the subscription." };
  }

  return {};
}

export async function removePushSubscriptionAction(
  endpoint: string
): Promise<void> {
  if (!endpoint) return;
  const admin = createSupabaseAdminClient();
  await admin.from("push_subscriptions").delete().eq("endpoint", endpoint);
}
