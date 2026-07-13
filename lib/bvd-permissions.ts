import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { fetchMemberLeadershipRoles } from "@/lib/leadership-server";
import { isSiteAdmin } from "@/lib/power-team-permissions";
import { getMemberSession } from "@/lib/member-session";
import type { BvdSettings } from "@/lib/supabase";

const LVH_ROLE_RE = /lead\s*visitor\s*host/i;
const VH_ROLE_RE = /visitor\s*host/i;

export async function isLeadVisitorHost(memberId: string): Promise<boolean> {
  const roles = await fetchMemberLeadershipRoles(memberId);
  return roles.some((r) => LVH_ROLE_RE.test(r.roleName));
}

export async function isVisitorHost(memberId: string): Promise<boolean> {
  const roles = await fetchMemberLeadershipRoles(memberId);
  return roles.some((r) => VH_ROLE_RE.test(r.roleName));
}

export async function fetchBvdSettings(): Promise<BvdSettings | null> {
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("bvd_settings")
    .select("*")
    .eq("id", 1)
    .maybeSingle();

  if (error || !data) {
    console.error("[fetchBvdSettings]", error?.message);
    return null;
  }

  return data as BvdSettings;
}

/**
 * Site admin, BVD Chairman, BVD Co-Chairman, or any Visitor Host.
 */
export async function canManageBvdRegistrations(
  memberId?: string | null
): Promise<boolean> {
  if (await isSiteAdmin()) return true;

  const id = memberId ?? (await getMemberSession())?.id;
  if (!id) return false;

  const settings = await fetchBvdSettings();
  if (
    settings &&
    (settings.chairman_member_id === id || settings.co_chairman_member_id === id)
  ) {
    return true;
  }

  return isVisitorHost(id);
}

export async function requireBvdManager(): Promise<
  | { allowed: true; asAdmin: boolean; memberId: string | null }
  | { allowed: false; error: string }
> {
  if (await isSiteAdmin()) {
    const member = await getMemberSession();
    return { allowed: true, asAdmin: true, memberId: member?.id ?? null };
  }

  const member = await getMemberSession();
  if (!member) {
    return { allowed: false, error: "Please log in to manage BVD registrations." };
  }

  const ok = await canManageBvdRegistrations(member.id);
  if (!ok) {
    return { allowed: false, error: "You do not have permission to manage BVD registrations." };
  }

  return { allowed: true, asAdmin: false, memberId: member.id };
}
