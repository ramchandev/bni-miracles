"use server";

import { supabase } from "@/lib/supabase";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { revalidatePath } from "next/cache";

/* ── Phone normalisation (shared logic) ──────────────────────────────────── */

function normalizePhone(raw: string): string {
  let p = raw.replace(/[\s\-\(\)\.]/g, "").replace(/^\+/, "");
  if (p.startsWith("91") && p.length === 12) p = p.slice(2);
  if (p.startsWith("0") && p.length === 11) p = p.slice(1);
  return p;
}

/* ── Types ───────────────────────────────────────────────────────────────── */

export type GivesAsksBasicMember = {
  id: string;
  name: string;
  slug: string;
  category: string;
  profile_picture_url: string | null;
};

export type PhoneVerifyResult =
  | { ok: false; error: string }
  | { ok: true; member: GivesAsksBasicMember; gives: string[]; asks: string[] };

/* ── Verify by phone only ────────────────────────────────────────────────── */

export async function verifyPhoneAction(phone: string): Promise<PhoneVerifyResult> {
  const normalized = normalizePhone(phone.trim());
  if (normalized.length < 7) {
    return { ok: false, error: "Please enter a valid phone number." };
  }

  const { data: members, error } = await supabase
    .from("members")
    .select("id, name, slug, category, profile_picture_url, phone")
    .eq("is_active", true)
    .not("phone", "is", null);

  if (error) return { ok: false, error: "Database error. Please try again." };

  const matched = (members ?? []).find(
    (m) => m.phone && normalizePhone(m.phone as string) === normalized
  );

  if (!matched) {
    return {
      ok: false,
      error: "No member found with that phone number. Please check and try again.",
    };
  }

  const { data: gaData } = await supabase
    .from("member_gives_asks")
    .select("type, item")
    .eq("member_id", matched.id)
    .order("sort_order");

  const gives = (gaData ?? [])
    .filter((g) => g.type === "give")
    .map((g) => g.item as string);
  const asks = (gaData ?? [])
    .filter((g) => g.type === "ask")
    .map((g) => g.item as string);

  const { phone: _ph, ...rest } = matched;
  void _ph;

  return { ok: true, member: rest as GivesAsksBasicMember, gives, asks };
}

/* ── Save gives & asks ───────────────────────────────────────────────────── */

export async function saveGivesAsksAction(
  memberId: string,
  slug: string,
  gives: string[],
  asks: string[]
): Promise<{ error?: string }> {
  const admin = createSupabaseAdminClient();

  await admin.from("member_gives_asks").delete().eq("member_id", memberId);

  const rows = [
    ...gives
      .map((item, i) => ({
        member_id: memberId,
        type: "give" as const,
        item: item.trim(),
        sort_order: i,
      }))
      .filter((r) => r.item.length > 0),
    ...asks
      .map((item, i) => ({
        member_id: memberId,
        type: "ask" as const,
        item: item.trim(),
        sort_order: i,
      }))
      .filter((r) => r.item.length > 0),
  ];

  if (rows.length > 0) {
    const { error } = await admin.from("member_gives_asks").insert(rows);
    if (error) return { error: error.message };
  }

  revalidatePath(`/members/${slug}`);
  revalidatePath("/members");
  revalidatePath("/admin/gives-asks");

  return {};
}
