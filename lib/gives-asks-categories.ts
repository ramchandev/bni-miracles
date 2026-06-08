import { supabase } from "@/lib/supabase";
import type { GivesAsksCategory, GivesAsksCategoryType, MemberGiveAsk } from "@/lib/supabase";

export type GiveAskEntry = {
  text: string;
  categoryId: string;
};

export function categoryAppliesTo(
  category: Pick<GivesAsksCategory, "type">,
  kind: "give" | "ask"
): boolean {
  return category.type === "both" || category.type === kind;
}

export function filterCategoriesForType(
  categories: GivesAsksCategory[],
  kind: "give" | "ask"
): GivesAsksCategory[] {
  return categories.filter((c) => c.is_active && categoryAppliesTo(c, kind));
}

/** Active categories for a kind, sorted A→Z (for member dropdowns). */
export function filterCategoriesForTypeAlphabetical(
  categories: GivesAsksCategory[],
  kind: "give" | "ask"
): GivesAsksCategory[] {
  return filterCategoriesForType(categories, kind).sort((a, b) =>
    a.name.localeCompare(b.name, undefined, { sensitivity: "base" })
  );
}

export function formatGiveAskDisplay(item: string, categoryName?: string | null): string {
  const text = item.trim();
  if (!text) return categoryName?.trim() ?? "";
  if (!categoryName?.trim()) return text;
  return `${text} · ${categoryName.trim()}`;
}

/** Load active categories for member-facing dropdowns. */
export async function fetchActiveGivesAsksCategories(): Promise<GivesAsksCategory[]> {
  const { data } = await supabase
    .from("gives_asks_categories")
    .select("*")
    .eq("is_active", true)
    .order("sort_order");

  return (data ?? []) as GivesAsksCategory[];
}

/** Map stored rows to editable entries (text + category). */
export function mapMemberGiveAskRowsToEntries(
  rows: Pick<MemberGiveAsk, "category_id" | "item" | "type">[],
  categories: GivesAsksCategory[],
  kind: "give" | "ask"
): GiveAskEntry[] {
  const pool = filterCategoriesForType(categories, kind);
  const byId = new Map(pool.map((c) => [c.id, c]));
  const byName = new Map(pool.map((c) => [c.name.toLowerCase(), c]));

  return rows
    .filter((r) => r.type === kind)
    .map((row) => {
      const text = (row.item ?? "").trim();
      let categoryId = row.category_id && byId.has(row.category_id) ? row.category_id : "";

      if (!categoryId && text) {
        const matched = byName.get(text.toLowerCase());
        if (matched) {
          categoryId = matched.id;
        }
      }

      return { text, categoryId };
    });
}

export function buildGiveAskInsertRows(
  memberId: string,
  gives: GiveAskEntry[],
  asks: GiveAskEntry[],
  categories: GivesAsksCategory[]
) {
  const byId = new Map(categories.map((c) => [c.id, c]));

  const mapEntries = (entries: GiveAskEntry[], type: "give" | "ask") =>
    entries
      .map((entry, i) => {
        const text = entry.text.trim();
        if (!text) return null;

        const category = entry.categoryId ? byId.get(entry.categoryId) : null;
        if (entry.categoryId && (!category || !categoryAppliesTo(category, type))) {
          return null;
        }

        return {
          member_id: memberId,
          type,
          item: text,
          category_id: entry.categoryId || null,
          sort_order: i,
        };
      })
      .filter(Boolean);

  return [...mapEntries(gives, "give"), ...mapEntries(asks, "ask")] as Array<{
    member_id: string;
    type: "give" | "ask";
    item: string;
    category_id: string | null;
    sort_order: number;
  }>;
}

/** All categories for admin save resolution (includes inactive). */
export async function fetchAllGivesAsksCategories(): Promise<GivesAsksCategory[]> {
  const { data } = await supabase
    .from("gives_asks_categories")
    .select("*")
    .order("sort_order");

  return (data ?? []) as GivesAsksCategory[];
}

export async function replaceMemberGivesAsks(
  memberId: string,
  gives: GiveAskEntry[],
  asks: GiveAskEntry[],
  categories: GivesAsksCategory[]
): Promise<{ error?: string }> {
  const { createSupabaseAdminClient } = await import("@/lib/supabase-admin");
  const admin = createSupabaseAdminClient();

  const rows = buildGiveAskInsertRows(memberId, gives, asks, categories);

  await admin.from("member_gives_asks").delete().eq("member_id", memberId);

  if (rows.length > 0) {
    const { error } = await admin.from("member_gives_asks").insert(rows);
    if (error) return { error: error.message };
  }

  return {};
}

export function typeLabel(type: GivesAsksCategoryType): string {
  if (type === "give") return "Give only";
  if (type === "ask") return "Ask only";
  return "Give & Ask";
}

export function categoryNameById(categories: GivesAsksCategory[], categoryId: string | null): string | null {
  if (!categoryId) return null;
  return categories.find((c) => c.id === categoryId)?.name ?? null;
}
