import { fetchMemberLeadershipRoles } from "@/lib/leadership-server";
import { getMemberSession } from "@/lib/member-session";
import { isSiteAdmin } from "@/lib/power-team-permissions";

const RC_ROLE_RE = /referral\s*coordinator/i;
const HEAD_TABLE_GROUP_RE = /head\s*table/i;

/** Referral Coordinator, any Head Table assignee, or site admin. */
export async function canTrackSpecificAsks(memberId?: string | null): Promise<boolean> {
  if (await isSiteAdmin()) return true;

  const id = memberId ?? (await getMemberSession())?.id;
  if (!id) return false;

  const roles = await fetchMemberLeadershipRoles(id);
  return roles.some(
    (r) => RC_ROLE_RE.test(r.roleName) || HEAD_TABLE_GROUP_RE.test(r.groupName)
  );
}

export async function requireSpecificAskTracker(): Promise<
  | { allowed: true; memberId: string | null }
  | { allowed: false; error: string }
> {
  const member = await getMemberSession();

  if (await isSiteAdmin()) {
    return { allowed: true, memberId: member?.id ?? null };
  }

  if (!member) {
    return { allowed: false, error: "Please log in to log specific asks." };
  }

  if (!(await canTrackSpecificAsks(member.id))) {
    return {
      allowed: false,
      error: "Only the Referral Coordinator and Head Table can log specific asks.",
    };
  }

  return { allowed: true, memberId: member.id };
}
