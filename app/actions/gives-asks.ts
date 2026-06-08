"use server";

import { supabase } from "@/lib/supabase";
import {
  fetchAllGivesAsksCategories,
  mapMemberGiveAskRowsToEntries,
  replaceMemberGivesAsks,
  type GiveAskEntry,
} from "@/lib/gives-asks-categories";
import { revalidatePath } from "next/cache";
import { fetchMemberCollaborations, type MemberCollaborations } from "@/lib/gives-asks-collaboration";
import { getMemberSession } from "@/lib/member-session";

function normalizePhone(raw: string): string {
  let p = raw.replace(/[\s\-\(\)\.]/g, "").replace(/^\+/, "");
  if (p.startsWith("91") && p.length === 12) p = p.slice(2);
  if (p.startsWith("0") && p.length === 11) p = p.slice(1);
  return p;
}

export type GivesAsksBasicMember = {
  id: string;
  name: string;
  slug: string;
  category: string;
  profile_picture_url: string | null;
};

export type PhoneVerifyResult =
  | { ok: false; error: string }
  | { ok: true; member: GivesAsksBasicMember; gives: GiveAskEntry[]; asks: GiveAskEntry[] };

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

  const [{ data: gaData }, categories] = await Promise.all([
    supabase
      .from("member_gives_asks")
      .select("type, item, category_id")
      .eq("member_id", matched.id)
      .order("sort_order"),
    fetchAllGivesAsksCategories(),
  ]);

  const rows = gaData ?? [];
  const gives = mapMemberGiveAskRowsToEntries(rows, categories, "give");
  const asks = mapMemberGiveAskRowsToEntries(rows, categories, "ask");

  const { phone: _ph, ...rest } = matched;
  void _ph;

  return { ok: true, member: rest as GivesAsksBasicMember, gives, asks };
}

export async function saveGivesAsksAction(
  memberId: string,
  slug: string,
  gives: GiveAskEntry[],
  asks: GiveAskEntry[]
): Promise<{ error?: string }> {
  const session = await getMemberSession();
  if (!session || session.id !== memberId) {
    return { error: "You must be logged in to save changes." };
  }

  const categories = await fetchAllGivesAsksCategories();
  const result = await replaceMemberGivesAsks(memberId, gives, asks, categories);
  if (result.error) return result;

  revalidatePath(`/members/${slug}`);
  revalidatePath("/members");
  revalidatePath("/admin/gives-asks");

  return {};
}

export async function fetchMemberCollaborationsAction(
  memberId: string
): Promise<MemberCollaborations> {
  return fetchMemberCollaborations(memberId);
}
