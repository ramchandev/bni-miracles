import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { mergeGroupWithAssignments, type RawAssignmentRow } from "@/lib/leadership-data";
import type { LeadershipGroup, LeadershipGroupWithRoles, LeadershipRole } from "@/lib/supabase";

const ASSIGNMENT_SELECT = `
  id,
  role_id,
  member_id,
  assignee_name,
  assignee_profile_picture_url,
  created_at,
  members (
    id,
    name,
    slug,
    category,
    business_name,
    profile_picture_url
  )
`;

/** Load group, roles, and assignments in separate queries (reliable vs nested embed). */
export async function fetchLeadershipGroupForAdmin(
  groupId: string
): Promise<LeadershipGroupWithRoles | null> {
  const supabase = createSupabaseAdminClient();

  const { data: group, error: groupError } = await supabase
    .from("leadership_groups")
    .select("*")
    .eq("id", groupId)
    .single<LeadershipGroup>();

  if (groupError || !group) return null;

  const { data: roles, error: rolesError } = await supabase
    .from("leadership_roles")
    .select("*")
    .eq("group_id", groupId)
    .order("sort_order");

  if (rolesError) return null;

  const roleList = (roles ?? []) as LeadershipRole[];
  const roleIds = roleList.map((r) => r.id);

  let assignmentRows: RawAssignmentRow[] = [];
  if (roleIds.length > 0) {
    const { data: assignments, error: assignError } = await supabase
      .from("leadership_assignments")
      .select(ASSIGNMENT_SELECT)
      .in("role_id", roleIds);

    if (assignError) return null;
    assignmentRows = (assignments ?? []) as RawAssignmentRow[];
  }

  return mergeGroupWithAssignments(group, roleList, assignmentRows);
}
