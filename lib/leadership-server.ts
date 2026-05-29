import { supabase } from "@/lib/supabase";
import {
  getAssignmentMemberId,
  mergeGroupWithAssignments,
  normalizeAssignments,
  normalizeMember,
} from "@/lib/leadership-data";
import type { RawAssignmentRow } from "@/lib/leadership-data";
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

async function fetchAllGroupsMerged(): Promise<LeadershipGroupWithRoles[]> {
  const { data: groups } = await supabase
    .from("leadership_groups")
    .select("*")
    .order("sort_order");

  if (!groups?.length) return [];

  const groupList = groups as LeadershipGroup[];
  const groupIds = groupList.map((g) => g.id);

  const { data: roles } = await supabase
    .from("leadership_roles")
    .select("*")
    .in("group_id", groupIds)
    .order("sort_order");

  const roleList = (roles ?? []) as LeadershipRole[];
  const roleIds = roleList.map((r) => r.id);

  let assignmentRows: RawAssignmentRow[] = [];
  if (roleIds.length > 0) {
    const { data: assignments } = await supabase
      .from("leadership_assignments")
      .select(ASSIGNMENT_SELECT)
      .in("role_id", roleIds);

    assignmentRows = (assignments ?? []) as RawAssignmentRow[];
  }

  const rolesByGroup = new Map<string, LeadershipRole[]>();
  for (const role of roleList) {
    if (!rolesByGroup.has(role.group_id)) rolesByGroup.set(role.group_id, []);
    rolesByGroup.get(role.group_id)!.push(role);
  }

  return groupList.map((group) =>
    mergeGroupWithAssignments(group, rolesByGroup.get(group.id) ?? [], assignmentRows)
  );
}

export async function fetchLeadershipGroupsWithRoles(): Promise<LeadershipGroupWithRoles[]> {
  return fetchAllGroupsMerged();
}

export type LeadershipRoleAssignee = {
  kind: "member" | "non_member";
  name: string;
  profile_picture_url: string | null;
  slug?: string;
  category?: string;
  business_name?: string | null;
};

export function getRoleAssignee(
  role: LeadershipGroupWithRoles["leadership_roles"][0]
): LeadershipRoleAssignee | null {
  const list = normalizeAssignments(role.leadership_assignments);
  const assignment = list[0];
  if (!assignment) return null;

  const member = normalizeMember(assignment.members ?? null);
  if (assignment.member_id && member) {
    return {
      kind: "member",
      name: member.name,
      profile_picture_url: member.profile_picture_url,
      slug: member.slug,
      category: member.category,
      business_name: member.business_name,
    };
  }

  if (assignment.assignee_name?.trim()) {
    return {
      kind: "non_member",
      name: assignment.assignee_name.trim(),
      profile_picture_url: assignment.assignee_profile_picture_url ?? null,
    };
  }

  return null;
}

export type MemberLeadershipRole = {
  roleId: string;
  roleName: string;
  roleDescription: string | null;
  roleSortOrder: number;
  groupId: string;
  groupName: string;
  groupSubtitle: string | null;
  groupColor: string;
  groupSortOrder: number;
};

type RawRoleRef = {
  id: string;
  name: string;
  description: string | null;
  sort_order: number;
  leadership_groups: {
    id: string;
    name: string;
    subtitle: string | null;
    color: string;
    sort_order: number;
  } | {
    id: string;
    name: string;
    subtitle: string | null;
    color: string;
    sort_order: number;
  }[] | null;
};

function normalizeGroup(
  raw: RawRoleRef["leadership_groups"]
): { id: string; name: string; subtitle: string | null; color: string; sort_order: number } | null {
  if (!raw) return null;
  return Array.isArray(raw) ? raw[0] ?? null : raw;
}

function normalizeRoleRef(raw: RawRoleRef | RawRoleRef[] | null): RawRoleRef | null {
  if (!raw) return null;
  return Array.isArray(raw) ? raw[0] ?? null : raw;
}

/** Chapter leadership roles held by a member (for profile page). */
export async function fetchMemberLeadershipRoles(memberId: string): Promise<MemberLeadershipRole[]> {
  const { data, error } = await supabase
    .from("leadership_assignments")
    .select(
      `
      id,
      role_id,
      leadership_roles (
        id,
        name,
        description,
        sort_order,
        leadership_groups (
          id,
          name,
          subtitle,
          color,
          sort_order
        )
      )
    `
    )
    .eq("member_id", memberId);

  if (error || !data?.length) return [];

  const rows: MemberLeadershipRole[] = [];

  for (const row of data) {
    const roleRef = normalizeRoleRef(row.leadership_roles as RawRoleRef | RawRoleRef[] | null);
    const group = normalizeGroup(roleRef?.leadership_groups ?? null);
    if (!roleRef || !group) continue;

    rows.push({
      roleId: roleRef.id,
      roleName: roleRef.name,
      roleDescription: roleRef.description ?? null,
      roleSortOrder: roleRef.sort_order,
      groupId: group.id,
      groupName: group.name,
      groupSubtitle: group.subtitle,
      groupColor: group.color || "#C8102E",
      groupSortOrder: group.sort_order,
    });
  }

  return rows.sort((a, b) => {
    if (a.groupSortOrder !== b.groupSortOrder) return a.groupSortOrder - b.groupSortOrder;
    return a.roleSortOrder - b.roleSortOrder;
  });
}
