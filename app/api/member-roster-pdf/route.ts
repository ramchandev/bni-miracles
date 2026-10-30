import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { createElement } from "react";
import { getMemberSession } from "@/lib/member-session";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { SITE_DOMAIN, SITE_NAME, SITE_TAGLINE } from "@/lib/seo";
import {
  fetchImageDataUrl,
  groupRosterByCategoryGroupContinuous,
  toRosterMember,
  type RosterPayload,
} from "@/lib/member-roster";
import { MemberRosterPDF } from "@/components/roster/MemberRosterPDF";
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

export async function GET() {
  const session = await getMemberSession();
  if (!session) return new NextResponse("Unauthorized", { status: 401 });

  const admin = createSupabaseAdminClient();

  const [{ data: membersData }, { data: catData }] = await Promise.all([
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
  ]);

  const members = (membersData ?? []) as Member[];

  // Match members page: category → group name + group sort_order
  const categoryToGroup = new Map<string, string>();
  const groupSortOrder = new Map<string, number>();
  for (const c of (catData ?? []) as CategoryRow[]) {
    const g = Array.isArray(c.category_groups) ? c.category_groups[0] : c.category_groups;
    const groupName = g?.name ?? "Other";
    categoryToGroup.set(c.name, groupName);
    if (g?.name != null && typeof g.sort_order === "number") {
      const prev = groupSortOrder.get(g.name);
      if (prev == null || g.sort_order < prev) groupSortOrder.set(g.name, g.sort_order);
    }
  }

  const rosterMembers = groupRosterByCategoryGroupContinuous(
    members.map((m) => toRosterMember(m, categoryToGroup.get(m.category) ?? "Other")),
    groupSortOrder
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

  const payload: RosterPayload = {
    chapterName: SITE_NAME,
    tagline: SITE_TAGLINE,
    siteDomain: SITE_DOMAIN,
    generatedAt,
    memberCount: rosterMembers.length,
    members: rosterMembers,
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
