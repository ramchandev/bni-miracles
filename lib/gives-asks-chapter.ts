import { supabase } from "@/lib/supabase";

export type ChapterGiveAskItem = {
  id: string;
  member_id: string;
  member_name: string;
  member_slug: string;
  member_category: string;
  member_photo: string | null;
  item: string;
  category_id: string | null;
  category_name: string | null;
};

export type ChapterCategoryGroup = {
  label: string;
  items: ChapterGiveAskItem[];
};

function categoryNameFromJoin(raw: unknown): string | null {
  if (!raw || typeof raw !== "object") return null;
  if (Array.isArray(raw)) return (raw[0] as { name?: string })?.name ?? null;
  return (raw as { name?: string }).name ?? null;
}

export function groupChapterItemsByCategory(items: ChapterGiveAskItem[]): ChapterCategoryGroup[] {
  const byCategory = new Map<string, ChapterGiveAskItem[]>();
  const uncategorized: ChapterGiveAskItem[] = [];

  for (const item of items) {
    if (item.category_id && item.category_name) {
      const bucket = byCategory.get(item.category_id) ?? [];
      bucket.push(item);
      byCategory.set(item.category_id, bucket);
    } else {
      uncategorized.push(item);
    }
  }

  const groups: ChapterCategoryGroup[] = [...byCategory.entries()]
    .map(([, rows]) => ({
      label: rows[0].category_name!,
      items: rows.sort((a, b) => a.member_name.localeCompare(b.member_name)),
    }))
    .sort((a, b) => a.label.localeCompare(b.label, undefined, { sensitivity: "base" }));

  if (uncategorized.length > 0) {
    groups.push({
      label: "Uncategorized",
      items: uncategorized.sort((a, b) => a.member_name.localeCompare(b.member_name)),
    });
  }

  return groups;
}

export async function fetchChapterGivesAsksGrouped(): Promise<{
  giveGroups: ChapterCategoryGroup[];
  askGroups: ChapterCategoryGroup[];
}> {
  const [{ data: members }, { data: gaRows }] = await Promise.all([
    supabase
      .from("members")
      .select("id, name, slug, category, profile_picture_url")
      .eq("is_active", true),
    supabase
      .from("member_gives_asks")
      .select("id, member_id, type, item, category_id, gives_asks_categories(name)")
      .order("sort_order"),
  ]);

  const memberMap = new Map((members ?? []).map((m) => [m.id, m]));

  const allRows: (ChapterGiveAskItem & { type: "give" | "ask" })[] = (gaRows ?? [])
    .filter((r) => memberMap.has(r.member_id as string))
    .map((r) => {
      const m = memberMap.get(r.member_id as string)!;
      return {
        id: r.id as string,
        member_id: m.id as string,
        member_name: m.name as string,
        member_slug: m.slug as string,
        member_category: m.category as string,
        member_photo: m.profile_picture_url as string | null,
        type: r.type as "give" | "ask",
        item: r.item as string,
        category_id: (r.category_id as string | null) ?? null,
        category_name: categoryNameFromJoin(
          (r as { gives_asks_categories?: unknown }).gives_asks_categories
        ),
      };
    });

  const gives = allRows.filter((r) => r.type === "give");
  const asks = allRows.filter((r) => r.type === "ask");

  return {
    giveGroups: groupChapterItemsByCategory(gives),
    askGroups: groupChapterItemsByCategory(asks),
  };
}
