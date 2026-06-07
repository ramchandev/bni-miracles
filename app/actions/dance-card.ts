"use server";

import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import type {
  DanceCardData,
  DanceCardRow,
  ContactSphereEntry,
  CustomerEntry,
} from "@/lib/dance-card-types";
// Types are defined in lib/dance-card-types.ts — import from there directly.

/* ── Shape helpers ───────────────────────────────────────────────────── */

function ensureContactSphere(raw: unknown): ContactSphereEntry[] {
  const arr = Array.isArray(raw) ? raw : [];
  const out: ContactSphereEntry[] = arr.map((r) =>
    typeof r === "object" && r !== null
      ? {
          name:       (r as ContactSphereEntry).name       ?? "",
          profession: (r as ContactSphereEntry).profession ?? "",
        }
      : { name: "", profession: "" }
  );
  while (out.length < 10) out.push({ name: "", profession: "" });
  return out.slice(0, 10);
}

function ensureTop3(raw: unknown): string[] {
  const arr = Array.isArray(raw) ? raw : [];
  const out  = arr.map((x) => (typeof x === "string" ? x : ""));
  while (out.length < 3) out.push("");
  return out.slice(0, 3);
}

function ensureCustomers(raw: unknown): CustomerEntry[] {
  const arr = Array.isArray(raw) ? raw : [];
  const out: CustomerEntry[] = arr.map((r) =>
    typeof r === "object" && r !== null
      ? { name: (r as CustomerEntry).name ?? "", notes: (r as CustomerEntry).notes ?? "" }
      : { name: "", notes: "" }
  );
  while (out.length < 10) out.push({ name: "", notes: "" });
  return out.slice(0, 10);
}

/* ── Actions ─────────────────────────────────────────────────────────── */

export async function getDanceCardAction(
  memberId: string
): Promise<DanceCardRow | null> {
  const admin = createSupabaseAdminClient();
  const { data } = await admin
    .from("dance_cards")
    .select("*")
    .eq("member_id", memberId)
    .single();

  if (!data) return null;

  const raw = data as Record<string, unknown>;
  return {
    ...(raw as object),
    bio_years:         raw.bio_years != null ? String(raw.bio_years) : "",
    contact_sphere:    ensureContactSphere(raw.contact_sphere),
    top_3_professions: ensureTop3(raw.top_3_professions),
    last_customers:    ensureCustomers(raw.last_customers),
  } as DanceCardRow;
}

export async function saveDanceCardAction(
  memberId: string,
  data: DanceCardData
): Promise<{ error?: string }> {
  const admin = createSupabaseAdminClient();

  const payload = {
    member_id:           memberId,
    bio_profession:      data.bio_profession.trim()      || null,
    bio_location:        data.bio_location.trim()        || null,
    bio_years:           data.bio_years ? parseInt(data.bio_years, 10) : null,
    bio_previous_jobs:   data.bio_previous_jobs.trim()   || null,
    bio_spouse:          data.bio_spouse.trim()          || null,
    bio_children:        data.bio_children.trim()        || null,
    bio_animals:         data.bio_animals.trim()         || null,
    bio_hobbies:         data.bio_hobbies.trim()         || null,
    bio_activities:      data.bio_activities.trim()      || null,
    bio_city:            data.bio_city.trim()            || null,
    bio_city_duration:   data.bio_city_duration.trim()   || null,
    bio_burning_desire:  data.bio_burning_desire.trim()  || null,
    bio_secret:          data.bio_secret.trim()          || null,
    bio_key_to_success:  data.bio_key_to_success.trim()  || null,
    gains_goals:           data.gains_goals.trim()           || null,
    gains_accomplishments: data.gains_accomplishments.trim() || null,
    gains_interests:       data.gains_interests.trim()       || null,
    gains_networks:        data.gains_networks.trim()        || null,
    gains_skills:          data.gains_skills.trim()          || null,
    contact_sphere:      data.contact_sphere.filter((c) => c.name.trim() || c.profession.trim()),
    top_3_professions:   data.top_3_professions.filter(Boolean),
    last_customers:      data.last_customers.filter((c) => c.name.trim() || c.notes.trim()),
    referral_sources:    data.referral_sources.trim()    || null,
    good_referrals:      data.good_referrals.trim()      || null,
    bad_referrals:       data.bad_referrals.trim()       || null,
    updated_at:          new Date().toISOString(),
  };

  const { error } = await admin
    .from("dance_cards")
    .upsert(payload, { onConflict: "member_id" });

  if (error) return { error: error.message };
  return {};
}

export async function markPdfGeneratedAction(
  memberId: string
): Promise<void> {
  const admin = createSupabaseAdminClient();
  await admin
    .from("dance_cards")
    .update({ pdf_generated_at: new Date().toISOString() })
    .eq("member_id", memberId);
}
