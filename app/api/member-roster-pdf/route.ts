import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { createElement } from "react";
import { getMemberSession } from "@/lib/member-session";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { SITE_DOMAIN, SITE_NAME, SITE_TAGLINE } from "@/lib/seo";
import {
  buildRosterLeadership,
  emptyRosterLeadership,
  fetchImageDataUrl,
  groupRosterByCategoryGroupContinuous,
  toRosterMember,
  type RosterLeader,
  type RosterLeadershipRoleInput,
  type RosterPayload,
} from "@/lib/member-roster";
import { MemberRosterPDF } from "@/components/roster/MemberRosterPDF";
import { normalizeMember } from "@/lib/leadership-data";
import type { Member } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

type CategoryRow = {
  name: string;
  sort_order: number | null;
  category_groups:
    | { name: string; sort_order: number }
    | { name: string; sort_order: number }[]
    | null;
};

async function hydrateLeaderPhotos(leaders: RosterLeader[]) {
  const CONCURRENCY = 6;
  for (let i = 0; i < leaders.length; i += CONCURRENCY) {
    const slice = leaders.slice(i, i + CONCURRENCY);
    const urls = await Promise.all(
      slice.map((l) => fetchImageDataUrl(l.sourcePhotoUrl))
    );
    urls.forEach((dataUrl, idx) => {
      slice[idx].photoDataUrl = dataUrl;
    });
  }
}

export async function GET() {
  const session = await getMemberSession();
  if (!session) return new NextResponse("Unauthorized", { status: 401 });

  const admin = createSupabaseAdminClient();

  const [
    { data: membersData },
    { data: catData },
    { data: groupsData },
    { data: rolesData },
    { data: categoryGroupsData },
  ] = await Promise.all([
    admin
      .from("members")
      .select(
        "id, name, slug, business_name, category, phone, email, business_location, website, profile_picture_url, crorepathi_giver, is_active"
      )
      .eq("is_active", true)
      .order("name"),
    admin
      .from("business_categories")
      .select("name, sort_order, category_groups(name, sort_order)")
      .order("sort_order"),
    admin.from("leadership_groups").select("id, name, sort_order").order("sort_order"),
    admin
      .from("leadership_roles")
      .select("id, name, description, group_id, sort_order")
      .order("sort_order"),
    admin.from("category_groups").select("name, sort_order").order("sort_order"),
  ]);

  const members = (membersData ?? []) as Member[];
  const groups = (groupsData ?? []) as { id: string; name: string; sort_order: number }[];
  const roles = (rolesData ?? []) as {
    id: string;
    name: string;
    description: string | null;
    group_id: string;
    sort_order: number;
  }[];

  const roleIds = roles.map((r) => r.id);
  const { data: assignmentData } =
    roleIds.length > 0
      ? await admin
          .from("leadership_assignments")
          .select(
            `
            id,
            role_id,
            member_id,
            assignee_name,
            assignee_profile_picture_url,
            members (
              id,
              name,
              slug,
              category,
              business_name,
              profile_picture_url
            )
          `
          )
          .in("role_id", roleIds)
      : { data: [] };

  const groupById = new Map(groups.map((g) => [g.id, g]));
  const assignmentByRole = new Map<
    string,
    {
      member_id: string | null;
      assignee_name: string | null;
      assignee_profile_picture_url: string | null;
      members:
        | Pick<Member, "id" | "name" | "slug" | "category" | "business_name" | "profile_picture_url">
        | Pick<Member, "id" | "name" | "slug" | "category" | "business_name" | "profile_picture_url">[]
        | null;
    }
  >();
  for (const row of assignmentData ?? []) {
    assignmentByRole.set(row.role_id, row);
  }

  const leadershipInputs: RosterLeadershipRoleInput[] = [];

  for (const role of roles) {
    const group = groupById.get(role.group_id);
    if (!group) continue;
    const assignment = assignmentByRole.get(role.id);
    if (!assignment) continue;

    const member = normalizeMember(assignment.members ?? null);
    let name = "";
    let category: string | null = null;
    let businessName: string | null = null;
    let phone: string | null = null;
    let photoUrl: string | null = null;

    if (assignment.member_id && member) {
      name = member.name;
      category = member.category ?? null;
      businessName = member.business_name ?? null;
      photoUrl = member.profile_picture_url ?? null;
      phone = members.find((m) => m.id === assignment.member_id)?.phone ?? null;
    } else if (assignment.assignee_name?.trim()) {
      name = assignment.assignee_name.trim();
      photoUrl = assignment.assignee_profile_picture_url ?? null;
    } else {
      continue;
    }

    leadershipInputs.push({
      groupName: group.name,
      roleName: role.name,
      responsibility: role.description ?? null,
      sortOrder: role.sort_order,
      name,
      category,
      businessName,
      phone,
      photoUrl,
    });
  }

  const leadership = buildRosterLeadership(leadershipInputs);
  await hydrateLeaderPhotos([
    ...leadership.executiveDirectors,
    ...leadership.regionalSupportTeam,
    ...leadership.headTable,
    ...leadership.lvhTeam,
  ]);

  // Match members page: category → group name
  const categoryToGroup = new Map<string, string>();
  for (const c of (catData ?? []) as CategoryRow[]) {
    const g = Array.isArray(c.category_groups) ? c.category_groups[0] : c.category_groups;
    categoryToGroup.set(c.name, g?.name ?? "Other");
  }

  const rosterMembers = groupRosterByCategoryGroupContinuous(
    members.map((m) => toRosterMember(m, categoryToGroup.get(m.category) ?? "Other"))
  );

  const photoById = new Map(members.map((m) => [m.id, m.profile_picture_url] as const));
  const CONCURRENCY = 6;
  for (let i = 0; i < rosterMembers.length; i += CONCURRENCY) {
    const slice = rosterMembers.slice(i, i + CONCURRENCY);
    const urls = await Promise.all(
      slice.map((m) => fetchImageDataUrl(photoById.get(m.id)))
    );
    urls.forEach((dataUrl, idx) => {
      slice[idx].photoDataUrl = dataUrl;
    });
  }

  const logoPath = path.join(process.cwd(), "public", "BNI-Miracles-Logo.png");
  const pinPath = path.join(process.cwd(), "public", "images", "crorepathi-giver-pin.png");
  const globePath = path.join(process.cwd(), "public", "images", "networking-globe.png");
  const logoBase64 = `data:image/png;base64,${fs.readFileSync(logoPath).toString("base64")}`;
  const crorepathiPinBase64 = `data:image/png;base64,${fs.readFileSync(pinPath).toString("base64")}`;
  const globeBase64 = `data:image/png;base64,${fs.readFileSync(globePath).toString("base64")}`;

  const generatedAt = new Date().toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const usedGroupNames = new Set(rosterMembers.map((m) => m.categoryGroup));
  const categoryGroups = (
    (categoryGroupsData ?? []) as { name: string; sort_order: number }[]
  )
    .map((g) => g.name)
    .filter((name) => usedGroupNames.has(name));
  for (const name of usedGroupNames) {
    if (!categoryGroups.includes(name) && name !== "Other") categoryGroups.push(name);
  }
  if (usedGroupNames.has("Other")) categoryGroups.push("Other");

  const payload: RosterPayload = {
    chapterName: SITE_NAME,
    tagline: SITE_TAGLINE,
    siteDomain: SITE_DOMAIN,
    generatedAt,
    memberCount: rosterMembers.length,
    members: rosterMembers,
    leadership: leadership ?? emptyRosterLeadership(),
    categoryGroups,
  };

  const pdfElement = createElement(MemberRosterPDF, {
    payload,
    logoBase64,
    crorepathiPinBase64,
    globeBase64,
  });

  const { renderToBuffer } = await import("@react-pdf/renderer");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const nodeBuffer: Buffer = await renderToBuffer(pdfElement as any);

  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  const stamp = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  const filename = `Miracle-Members-Roster-${stamp}.pdf`;

  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(nodeBuffer);
      controller.close();
    },
  });

  return new NextResponse(stream, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
