"use server";

import { revalidatePath } from "next/cache";
import { supabase, type Member } from "@/lib/supabase";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import {
  fetchAllGivesAsksCategories,
  mapMemberGiveAskRowsToEntries,
  replaceMemberGivesAsks,
  type GiveAskEntry,
} from "@/lib/gives-asks-categories";

/* ── Phone normalisation ─────────────────────────────────────────────────── */

/**
 * Strips spaces/dashes/parens, removes leading + or country code 91.
 * "91 98417 67641", "+919841767641", "98417 67641" all → "9841767641"
 */
function normalizePhone(raw: string): string {
  let p = raw.replace(/[\s\-\(\)\.]/g, "").replace(/^\+/, "");
  if (p.startsWith("91") && p.length === 12) p = p.slice(2);
  if (p.startsWith("0") && p.length === 11) p = p.slice(1);
  return p;
}

/* ── Verify ──────────────────────────────────────────────────────────────── */

export type VerifiedMember = Pick<
  Member,
  | "id" | "name" | "slug" | "business_name" | "business_location"
  | "website" | "email" | "services" | "why_choose_us" | "success_stories"
  | "category" | "profile_picture_url"
>;

function normalizeEmail(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
    return "";
  }
  return trimmed.toLowerCase();
}

export type VerifyResult =
  | { ok: false; error: string }
  | { ok: true; member: VerifiedMember; gives: GiveAskEntry[]; asks: GiveAskEntry[] };

export async function verifyMemberAction(
  phone: string,
  securityAnswer: string
): Promise<VerifyResult> {
  // Security question check (case-insensitive)
  if (securityAnswer.trim().toLowerCase() !== "ramada") {
    return { ok: false, error: "Incorrect meeting location. Hint: it's a hotel name." };
  }

  const normalized = normalizePhone(phone.trim());
  if (normalized.length < 7) {
    return { ok: false, error: "Please enter a valid phone number." };
  }

  // Fetch all active members that have a phone on file
  const { data: members, error } = await supabase
    .from("members")
    .select(
      "id, name, slug, business_name, business_location, website, email, services, why_choose_us, success_stories, category, profile_picture_url, phone"
    )
    .eq("is_active", true)
    .not("phone", "is", null);

  if (error) return { ok: false, error: "Database error. Please try again." };

  const matched = (members ?? []).find(
    (m) => m.phone && normalizePhone(m.phone) === normalized
  );

  if (!matched) {
    return {
      ok: false,
      error: "No member found with that phone number. Please check and try again.",
    };
  }

  // Fetch gives & asks
  const [{ data: gaData }, categories] = await Promise.all([
    supabase
      .from("member_gives_asks")
      .select("type, item, category_id")
      .eq("member_id", matched.id)
      .order("sort_order"),
    (async () => {
      const { fetchAllGivesAsksCategories } = await import("@/lib/gives-asks-categories");
      return fetchAllGivesAsksCategories();
    })(),
  ]);

  const gives = mapMemberGiveAskRowsToEntries(gaData ?? [], categories, "give");
  const asks = mapMemberGiveAskRowsToEntries(gaData ?? [], categories, "ask");

  // Exclude the raw phone from the returned payload
  const { phone: _ignored, ...rest } = matched;
  void _ignored;

  return { ok: true, member: rest as VerifiedMember, gives, asks };
}

/* ── Save ────────────────────────────────────────────────────────────────── */

export type SavePayload = {
  memberId: string;
  slug: string;
  business_name: string;
  business_location: string;
  website: string;
  email: string;
  services: string;
  why_choose_us: string;
  success_stories: string;
  gives: GiveAskEntry[];
  asks: GiveAskEntry[];
};

export async function saveMemberDetailsAction(
  payload: SavePayload
): Promise<{ error?: string }> {
  const admin = createSupabaseAdminClient();

  const email = normalizeEmail(payload.email);
  if (email === "") {
    return { error: "Please enter a valid email address, or leave the field blank." };
  }

  // Update core member fields
  const { error: updateError } = await admin
    .from("members")
    .update({
      business_name:     payload.business_name.trim(),
      business_location: payload.business_location.trim() || null,
      website:           payload.website.trim() || null,
      email,
      services:          payload.services.trim() || null,
      why_choose_us:     payload.why_choose_us.trim() || null,
      success_stories:   payload.success_stories.trim() || null,
      updated_at:        new Date().toISOString(),
    })
    .eq("id", payload.memberId);

  if (updateError) return { error: updateError.message };

  const categories = await fetchAllGivesAsksCategories();
  const gaResult = await replaceMemberGivesAsks(
    payload.memberId,
    payload.gives,
    payload.asks,
    categories
  );
  if (gaResult.error) return gaResult;

  revalidatePath(`/members/${payload.slug}`);
  revalidatePath("/members");

  return {};
}
