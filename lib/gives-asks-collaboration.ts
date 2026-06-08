import { supabase } from "@/lib/supabase";

export type CollaborationMatch = {
  categoryId: string;
  categoryName: string;
  myItem: string;
  partnerId: string;
  partnerName: string;
  partnerSlug: string;
  partnerCategory: string;
  partnerPhoto: string | null;
  partnerItem: string;
};

export type MemberCollaborations = {
  /** Other members whose asks match this member's gives (people you can refer). */
  giveMatches: CollaborationMatch[];
  /** Other members whose gives match this member's asks (people who can refer you). */
  askMatches: CollaborationMatch[];
};

export type CollaborationCategoryGroup = {
  categoryId: string;
  categoryName: string;
  myItems: string[];
  partners: Array<{
    id: string;
    name: string;
    slug: string;
    category: string;
    profile_picture_url: string | null;
    items: string[];
  }>;
};

function categoryNameFromJoin(raw: unknown): string | null {
  if (!raw || typeof raw !== "object") return null;
  if (Array.isArray(raw)) return (raw[0] as { name?: string })?.name ?? null;
  return (raw as { name?: string }).name ?? null;
}

export async function fetchMemberCollaborations(
  memberId: string
): Promise<MemberCollaborations> {
  const [{ data: gaRows }, { data: members }] = await Promise.all([
    supabase
      .from("member_gives_asks")
      .select("member_id, type, item, category_id, gives_asks_categories(name)")
      .not("category_id", "is", null),
    supabase
      .from("members")
      .select("id, name, slug, category, profile_picture_url")
      .eq("is_active", true),
  ]);

  const memberMap = new Map(
    (members ?? []).map((m) => [
      m.id,
      {
        id: m.id as string,
        name: m.name as string,
        slug: m.slug as string,
        category: m.category as string,
        profile_picture_url: m.profile_picture_url as string | null,
      },
    ])
  );

  type NormalizedRow = {
    member_id: string;
    type: "give" | "ask";
    item: string;
    category_id: string;
    category_name: string;
  };

  const allRows: NormalizedRow[] = (gaRows ?? [])
    .filter((r) => memberMap.has(r.member_id as string) && r.category_id)
    .map((r) => ({
      member_id: r.member_id as string,
      type: r.type as "give" | "ask",
      item: (r.item as string).trim(),
      category_id: r.category_id as string,
      category_name:
        categoryNameFromJoin((r as { gives_asks_categories?: unknown }).gives_asks_categories) ??
        "Unknown",
    }))
    .filter((r) => r.item);

  const myRows = allRows.filter((r) => r.member_id === memberId);
  const otherRows = allRows.filter((r) => r.member_id !== memberId);

  const giveMatches: CollaborationMatch[] = [];
  const askMatches: CollaborationMatch[] = [];

  for (const give of myRows.filter((r) => r.type === "give")) {
    for (const ask of otherRows.filter(
      (r) => r.type === "ask" && r.category_id === give.category_id
    )) {
      const partner = memberMap.get(ask.member_id);
      if (!partner) continue;
      giveMatches.push({
        categoryId: give.category_id,
        categoryName: give.category_name,
        myItem: give.item,
        partnerId: partner.id,
        partnerName: partner.name,
        partnerSlug: partner.slug,
        partnerCategory: partner.category,
        partnerPhoto: partner.profile_picture_url,
        partnerItem: ask.item,
      });
    }
  }

  for (const ask of myRows.filter((r) => r.type === "ask")) {
    for (const give of otherRows.filter(
      (r) => r.type === "give" && r.category_id === ask.category_id
    )) {
      const partner = memberMap.get(give.member_id);
      if (!partner) continue;
      askMatches.push({
        categoryId: ask.category_id,
        categoryName: ask.category_name,
        myItem: ask.item,
        partnerId: partner.id,
        partnerName: partner.name,
        partnerSlug: partner.slug,
        partnerCategory: partner.category,
        partnerPhoto: partner.profile_picture_url,
        partnerItem: give.item,
      });
    }
  }

  const sortMatches = (a: CollaborationMatch, b: CollaborationMatch) =>
    a.categoryName.localeCompare(b.categoryName) ||
    a.partnerName.localeCompare(b.partnerName) ||
    a.myItem.localeCompare(b.myItem);

  giveMatches.sort(sortMatches);
  askMatches.sort(sortMatches);

  return { giveMatches, askMatches };
}

export function groupCollaborationMatches(
  matches: CollaborationMatch[]
): CollaborationCategoryGroup[] {
  const byCategory = new Map<string, CollaborationCategoryGroup>();

  for (const match of matches) {
    let group = byCategory.get(match.categoryId);
    if (!group) {
      group = {
        categoryId: match.categoryId,
        categoryName: match.categoryName,
        myItems: [],
        partners: [],
      };
      byCategory.set(match.categoryId, group);
    }

    if (!group.myItems.includes(match.myItem)) {
      group.myItems.push(match.myItem);
    }

    let partner = group.partners.find((p) => p.id === match.partnerId);
    if (!partner) {
      partner = {
        id: match.partnerId,
        name: match.partnerName,
        slug: match.partnerSlug,
        category: match.partnerCategory,
        profile_picture_url: match.partnerPhoto,
        items: [],
      };
      group.partners.push(partner);
    }

    if (!partner.items.includes(match.partnerItem)) {
      partner.items.push(match.partnerItem);
    }
  }

  return [...byCategory.values()]
    .sort((a, b) => a.categoryName.localeCompare(b.categoryName))
    .map((g) => ({
      ...g,
      partners: g.partners.sort((a, b) => a.name.localeCompare(b.name)),
    }));
}
