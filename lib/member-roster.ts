import type { Member } from "@/lib/supabase";

export type RosterMember = {
  id: string;
  name: string;
  category: string;
  /** Category group from members page (e.g. Health & Wellness) */
  categoryGroup: string;
  businessName: string;
  phone: string | null;
  email: string | null;
  website: string | null;
  location: string | null;
  crorepathiGiver: boolean;
  photoDataUrl: string | null;
  initial: string;
};

export type RosterPayload = {
  chapterName: string;
  tagline: string;
  siteDomain: string;
  generatedAt: string;
  memberCount: number;
  members: RosterMember[];
};

/** Horizontal person cards stacked on each roster page */
export const ROSTER_CARDS_PER_PAGE = 4;

/** BNI / chapter core values — one shown per roster page (cycles). */
export const ROSTER_CORE_VALUES = [
  { title: "Givers Gain", line: "The more you give, the more you receive." },
  { title: "Building Relationships", line: "Trust grows through consistent, genuine connection." },
  { title: "Lifelong Learning", line: "Stay curious — growth compounds over time." },
  { title: "Traditions + Innovation", line: "Honour what works, and keep improving how we serve." },
  { title: "Positive Attitude", line: "Optimism opens doors that skill alone cannot." },
  { title: "Accountability", line: "We do what we say — for ourselves and for each other." },
  { title: "Recognition", line: "Celebrate the givers who lift the whole chapter." },
] as const;

export function chunkMembers<T>(items: T[], size: number): T[][] {
  if (size <= 0) return [items];
  const pages: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    pages.push(items.slice(i, i + size));
  }
  return pages.length ? pages : [[]];
}

export function memberInitial(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  return (parts[0] ?? "?").slice(0, 2).toUpperCase();
}

/** Compact website for roster cards (drop protocol / trailing slash). */
export function formatRosterWebsite(url: string | null | undefined): string | null {
  if (!url?.trim()) return null;
  return url
    .trim()
    .replace(/^https?:\/\//i, "")
    .replace(/^www\./i, "")
    .replace(/\/$/, "");
}

export function toRosterMember(
  member: Member,
  categoryGroup = "Other"
): RosterMember {
  return {
    id: member.id,
    name: member.name,
    category: member.category,
    categoryGroup,
    businessName: member.business_name,
    phone: member.phone,
    email: member.email,
    website: formatRosterWebsite(member.website),
    location: member.business_location,
    crorepathiGiver: Boolean(member.crorepathi_giver),
    photoDataUrl: null,
    initial: memberInitial(member.name),
  };
}

/**
 * Same structure as the members page: bucket by category group, order groups by
 * sort_order (Other last), members A–Z within each group, then flatten into a
 * continuous card stream.
 */
export function groupRosterByCategoryGroupContinuous(
  members: RosterMember[],
  groupSortOrder?: Map<string, number>
): RosterMember[] {
  const buckets = new Map<string, RosterMember[]>();
  for (const member of members) {
    const key = member.categoryGroup?.trim() || "Other";
    const list = buckets.get(key) ?? [];
    list.push(member);
    buckets.set(key, list);
  }

  const orderedGroups = [...buckets.keys()].sort((a, b) => {
    if (a === "Other" && b !== "Other") return 1;
    if (b === "Other" && a !== "Other") return -1;
    const ao = groupSortOrder?.get(a) ?? 9999;
    const bo = groupSortOrder?.get(b) ?? 9999;
    if (ao !== bo) return ao - bo;
    return a.localeCompare(b, "en", { sensitivity: "base" });
  });

  return orderedGroups.flatMap((group) =>
    [...(buckets.get(group) ?? [])].sort((a, b) => {
      const byCategory = a.category.localeCompare(b.category, "en", { sensitivity: "base" });
      if (byCategory !== 0) return byCategory;
      return a.name.localeCompare(b.name, "en", { sensitivity: "base" });
    })
  );
}

function sniffMime(buffer: Buffer): string | null {
  if (buffer.length < 12) return null;
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return "image/jpeg";
  if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) {
    return "image/png";
  }
  if (buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46) return "image/gif";
  if (
    buffer[0] === 0x52 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x46 &&
    buffer[8] === 0x57 &&
    buffer[9] === 0x45 &&
    buffer[10] === 0x42 &&
    buffer[11] === 0x50
  ) {
    return "image/webp";
  }
  return null;
}

/**
 * Fetch a profile photo and normalize to JPEG for @react-pdf (WebP/large files often fail).
 */
export async function fetchImageDataUrl(url: string | null | undefined): Promise<string | null> {
  if (!url?.trim()) return null;

  const absolute = url.startsWith("//") ? `https:${url}` : url.trim();

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 15_000);
      const res = await fetch(absolute, {
        signal: controller.signal,
        headers: { Accept: "image/*,*/*" },
        redirect: "follow",
      });
      clearTimeout(timer);
      if (!res.ok) continue;

      const buffer = Buffer.from(await res.arrayBuffer());
      if (buffer.byteLength < 32) continue;

      const headerType = (res.headers.get("content-type") ?? "").split(";")[0].trim().toLowerCase();
      const sniffed = sniffMime(buffer);
      const looksLikeImage =
        sniffed != null ||
        headerType.startsWith("image/") ||
        headerType === "application/octet-stream" ||
        headerType === "";

      if (!looksLikeImage) continue;

      // Always re-encode via sharp → reliable JPEG for react-pdf
      try {
        const sharp = (await import("sharp")).default;
        // Square crop for roster photo frames
        const jpeg = await sharp(buffer)
          .rotate()
          .resize(360, 360, { fit: "cover", position: "top" })
          .jpeg({ quality: 86, mozjpeg: true })
          .toBuffer();
        return `data:image/jpeg;base64,${jpeg.toString("base64")}`;
      } catch {
        // Fallback: pass through if already JPEG/PNG
        if (sniffed === "image/jpeg" || headerType === "image/jpeg" || headerType === "image/jpg") {
          if (buffer.byteLength <= 2_500_000) {
            return `data:image/jpeg;base64,${buffer.toString("base64")}`;
          }
        }
        if (sniffed === "image/png" || headerType === "image/png") {
          if (buffer.byteLength <= 2_500_000) {
            return `data:image/png;base64,${buffer.toString("base64")}`;
          }
        }
      }
    } catch {
      // retry once
    }
  }

  return null;
}
