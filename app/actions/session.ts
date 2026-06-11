"use server";

import { supabase } from "@/lib/supabase";
import {
  createMemberSession,
  deleteMemberSession,
} from "@/lib/member-session";
import type { SessionMember } from "@/lib/supabase";

function normalizePhone(raw: string): string {
  let p = raw.replace(/[\s\-\(\)\.]/g, "").replace(/^\+/, "");
  if (p.startsWith("91") && p.length === 12) p = p.slice(2);
  if (p.startsWith("0") && p.length === 11) p = p.slice(1);
  return p;
}

export type LoginResult =
  | { ok: false; error: string }
  | { ok: true; member: SessionMember };

/** Verify phone + "Ramada" → create session cookie → return member. */
export async function loginMemberAction(
  phone: string,
  answer: string
): Promise<LoginResult> {
  if (answer.trim().toLowerCase() !== "ramada") {
    return { ok: false, error: "Incorrect meeting place. Hint: it's a hotel name." };
  }

  const normalized = normalizePhone(phone.trim());
  if (normalized.length < 7) {
    return { ok: false, error: "Please enter a valid phone number." };
  }

  const { data: members } = await supabase
    .from("members")
    .select("id, name, slug, profile_picture_url, phone, email")
    .eq("is_active", true)
    .not("phone", "is", null);

  const matched = (members ?? []).find(
    (m) => m.phone && normalizePhone(m.phone as string) === normalized
  );

  if (!matched) {
    return { ok: false, error: "No member found with that phone number." };
  }

  await createMemberSession(matched.id as string);

  return { ok: true, member: matched as SessionMember };
}

/** Delete session cookie and DB row. Client should clear context and navigate home. */
export async function logoutMemberAction(): Promise<void> {
  await deleteMemberSession();
}
