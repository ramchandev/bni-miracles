import { cookies } from "next/headers";
import { createSupabaseAdminClient } from "./supabase-admin";
import type { SessionMember } from "./supabase";

const COOKIE_NAME = "bizrox_sid";
const SESSION_MS   = 7 * 24 * 60 * 60 * 1000; // 7 days

/** Create a DB-backed session and set the httpOnly cookie. */
export async function createMemberSession(memberId: string): Promise<void> {
  const admin = createSupabaseAdminClient();
  const expiresAt = new Date(Date.now() + SESSION_MS);

  const { data, error } = await admin
    .from("bizrox_sessions")
    .insert({ member_id: memberId, expires_at: expiresAt.toISOString() })
    .select("id")
    .single();

  if (error || !data) {
    console.error("[createMemberSession]", error?.message);
    return;
  }

  const jar = await cookies();
  jar.set(COOKIE_NAME, data.id as string, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: expiresAt,
    path: "/",
  });
}

/** Read the session cookie → look up DB → return member or null. */
export async function getMemberSession(): Promise<SessionMember | null> {
  const jar   = await cookies();
  const token = jar.get(COOKIE_NAME)?.value;
  if (!token) return null;

  const admin = createSupabaseAdminClient();

  const { data: session } = await admin
    .from("bizrox_sessions")
    .select("member_id, expires_at")
    .eq("id", token)
    .single();

  if (!session) return null;

  if (new Date(session.expires_at as string) < new Date()) {
    await deleteMemberSession();
    return null;
  }

  const { data: member } = await admin
    .from("members")
    .select("id, name, slug, profile_picture_url, phone, email")
    .eq("id", session.member_id as string)
    .eq("is_active", true)
    .single();

  return (member as SessionMember | null) ?? null;
}

/** Delete the DB row and clear the cookie. */
export async function deleteMemberSession(): Promise<void> {
  const jar   = await cookies();
  const token = jar.get(COOKIE_NAME)?.value;

  if (token) {
    const admin = createSupabaseAdminClient();
    await admin.from("bizrox_sessions").delete().eq("id", token);
  }

  jar.delete(COOKIE_NAME);
}
