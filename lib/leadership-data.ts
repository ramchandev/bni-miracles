import type {
  LeadershipAssignmentWithMember,
  LeadershipGroup,
  LeadershipGroupWithRoles,
  LeadershipRole,
  Member,
} from "@/lib/supabase";

type MemberPick = Pick<
  Member,
  "id" | "name" | "slug" | "category" | "business_name" | "profile_picture_url"
>;

export function normalizeMember(
  raw: MemberPick | MemberPick[] | null | undefined
): MemberPick | null {
  if (!raw) return null;
  return Array.isArray(raw) ? raw[0] ?? null : raw;
}

/** PostgREST may return a single related row as an object instead of a one-item array. */
export function normalizeAssignments(
  raw: LeadershipAssignmentWithMember[] | LeadershipAssignmentWithMember | null | undefined
): LeadershipAssignmentWithMember[] {
  if (!raw) return [];
  return Array.isArray(raw) ? raw : [raw];
}

export function getAssignmentMemberId(
  assignments: LeadershipAssignmentWithMember[] | LeadershipAssignmentWithMember | null | undefined
): string | null {
  const list = normalizeAssignments(assignments);
  return list[0]?.member_id ?? null;
}

export function getNonMemberAssignment(
  assignments: LeadershipAssignmentWithMember[] | LeadershipAssignmentWithMember | null | undefined
): { name: string; profile_picture_url: string | null } | null {
  const list = normalizeAssignments(assignments);
  const row = list[0];
  if (!row?.assignee_name?.trim()) return null;
  return {
    name: row.assignee_name.trim(),
    profile_picture_url: row.assignee_profile_picture_url ?? null,
  };
}

export type RawAssignmentRow = LeadershipAssignmentWithMember & {
  members?: MemberPick | MemberPick[] | null;
};

export function normalizeAssignmentRow(row: RawAssignmentRow): LeadershipAssignmentWithMember {
  return {
    ...row,
    members: normalizeMember(row.members),
  };
}

export function mergeGroupWithAssignments(
  group: LeadershipGroup,
  roles: LeadershipRole[],
  assignments: RawAssignmentRow[]
): LeadershipGroupWithRoles {
  const byRoleId = new Map<string, LeadershipAssignmentWithMember[]>();
  for (const row of assignments) {
    byRoleId.set(row.role_id, [normalizeAssignmentRow(row)]);
  }

  return {
    ...group,
    leadership_roles: roles
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((role) => ({
        ...role,
        leadership_assignments: byRoleId.get(role.id) ?? [],
      })),
  };
}
