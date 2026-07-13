import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { fetchBvdSettings } from "@/lib/bvd-permissions";
import type { BvdChairMember, BvdRegistration, BvdSettings } from "@/lib/supabase";

export {
  bvdEventStartMs,
  formatBvdEventDate,
  parseNotificationEmails,
} from "@/lib/bvd-format";

const MEMBER_SELECT =
  "id, name, slug, category, business_name, profile_picture_url, phone";

const LVH_ROLE_RE = /lead\s*visitor\s*host/i;

async function fetchMemberById(id: string | null): Promise<BvdChairMember | null> {
  if (!id) return null;
  const admin = createSupabaseAdminClient();
  const { data } = await admin.from("members").select(MEMBER_SELECT).eq("id", id).maybeSingle();
  return (data as BvdChairMember | null) ?? null;
}

/** Resolve Lead Visitor Host phone from chapter leadership assignment. */
export async function fetchLeadVisitorHostPhone(): Promise<string | null> {
  const admin = createSupabaseAdminClient();

  const { data: roles } = await admin
    .from("leadership_roles")
    .select("id, name");

  const lvhRole = (roles ?? []).find((r: { name: string }) => LVH_ROLE_RE.test(r.name));
  if (!lvhRole) return null;

  const { data: assignment } = await admin
    .from("leadership_assignments")
    .select("member_id")
    .eq("role_id", lvhRole.id)
    .maybeSingle();

  if (!assignment?.member_id) return null;

  const { data: member } = await admin
    .from("members")
    .select("phone")
    .eq("id", assignment.member_id)
    .maybeSingle();

  const phone = member?.phone ? String(member.phone).trim() : "";
  return phone || null;
}

export type BvdPublicPageData = {
  settings: BvdSettings;
  chairman: BvdChairMember | null;
  coChairman: BvdChairMember | null;
  lvhPhone: string | null;
};

export async function fetchBvdPublicPageData(): Promise<BvdPublicPageData | null> {
  const settings = await fetchBvdSettings();
  if (!settings) return null;

  const [chairman, coChairman, lvhPhone] = await Promise.all([
    fetchMemberById(settings.chairman_member_id),
    fetchMemberById(settings.co_chairman_member_id),
    fetchLeadVisitorHostPhone(),
  ]);

  return { settings, chairman, coChairman, lvhPhone };
}

export async function fetchBvdRegistrations(): Promise<BvdRegistration[]> {
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("bvd_registrations")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[fetchBvdRegistrations]", error.message);
    return [];
  }

  return (data ?? []) as BvdRegistration[];
}
