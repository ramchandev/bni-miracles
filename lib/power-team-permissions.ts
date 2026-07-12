import { fetchMemberLeadershipRoles } from "@/lib/leadership-server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { getMemberSession } from "@/lib/member-session";
import type { PowerTeam } from "@/lib/supabase";

const COORDINATOR_ROLE_RE = /power\s*team\s*coordinator/i;

/** True if member is captain of this team or chapter Power Team Coordinator. */
export async function canCreateTeamLog(
  memberId: string,
  team: Pick<PowerTeam, "captain_member_id">
): Promise<boolean> {
  if (team.captain_member_id === memberId) return true;

  const roles = await fetchMemberLeadershipRoles(memberId);
  return roles.some((r) => COORDINATOR_ROLE_RE.test(r.roleName));
}

/** Site admin (Supabase Auth used by /admin). */
export async function isSiteAdmin(): Promise<boolean> {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return Boolean(user);
  } catch {
    return false;
  }
}

/**
 * Captain, Power Team Coordinator, or site admin may edit/delete logs.
 * Returns whether allowed and optional member id when acting as a member.
 */
export async function canManageTeamLog(
  team: Pick<PowerTeam, "captain_member_id">
): Promise<{ allowed: boolean; asAdmin: boolean; memberId: string | null }> {
  if (await isSiteAdmin()) {
    const member = await getMemberSession();
    return { allowed: true, asAdmin: true, memberId: member?.id ?? null };
  }

  const member = await getMemberSession();
  if (!member) return { allowed: false, asAdmin: false, memberId: null };

  const ok = await canCreateTeamLog(member.id, team);
  return { allowed: ok, asAdmin: false, memberId: member.id };
}

/** Any logged-in chapter member may react. */
export function canReactToLog(memberId: string | null | undefined): boolean {
  return Boolean(memberId);
}
