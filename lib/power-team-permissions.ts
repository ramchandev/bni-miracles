import { fetchMemberLeadershipRoles } from "@/lib/leadership-server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { getMemberSession } from "@/lib/member-session";
import type { PowerTeam } from "@/lib/supabase";

const COORDINATOR_ROLE_RE = /power\s*team\s*coordinator/i;
const HEAD_TABLE_GROUP_RE = /head\s*table/i;

/** True if member is captain of this team or chapter Power Team Coordinator. */
export async function canCreateTeamLog(
  memberId: string,
  team: Pick<PowerTeam, "captain_member_id">
): Promise<boolean> {
  if (team.captain_member_id === memberId) return true;

  const roles = await fetchMemberLeadershipRoles(memberId);
  return roles.some((r) => COORDINATOR_ROLE_RE.test(r.roleName));
}

/**
 * Edit/delete on the public team page: team captain, Power Team Coordinator,
 * or any Head Table leadership assignee.
 */
export async function memberCanManageTeamLog(
  memberId: string,
  team: Pick<PowerTeam, "captain_member_id">
): Promise<boolean> {
  if (team.captain_member_id === memberId) return true;

  const roles = await fetchMemberLeadershipRoles(memberId);
  return roles.some(
    (r) =>
      COORDINATOR_ROLE_RE.test(r.roleName) || HEAD_TABLE_GROUP_RE.test(r.groupName)
  );
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
 * Captain, Power Team Coordinator, Head Table member, or site admin may
 * edit/delete logs (site admin covers /admin/meeting-logs).
 */
export async function canManageTeamLog(
  team: Pick<PowerTeam, "captain_member_id">
): Promise<{ allowed: boolean; asAdmin: boolean; memberId: string | null }> {
  const member = await getMemberSession();

  if (member && (await memberCanManageTeamLog(member.id, team))) {
    return { allowed: true, asAdmin: false, memberId: member.id };
  }

  if (await isSiteAdmin()) {
    return { allowed: true, asAdmin: true, memberId: member?.id ?? null };
  }

  return { allowed: false, asAdmin: false, memberId: member?.id ?? null };
}

/** Any logged-in chapter member may react. */
export function canReactToLog(memberId: string | null | undefined): boolean {
  return Boolean(memberId);
}
