"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { categoryAppliesTo } from "@/lib/gives-asks-categories";

export async function updateMemberGiveAskCategoryAction(
  rowId: string,
  categoryId: string | null
): Promise<{ error?: string }> {
  const supabase = await createSupabaseServerClient();

  const { data: row, error: fetchError } = await supabase
    .from("member_gives_asks")
    .select("id, type")
    .eq("id", rowId)
    .maybeSingle();

  if (fetchError) return { error: fetchError.message };
  if (!row) return { error: "Give/ask entry not found." };

  if (categoryId) {
    const { data: category, error: catError } = await supabase
      .from("gives_asks_categories")
      .select("id, type")
      .eq("id", categoryId)
      .maybeSingle();

    if (catError) return { error: catError.message };
    if (!category) return { error: "Category not found." };
    if (!categoryAppliesTo(category, row.type as "give" | "ask")) {
      return { error: "This category does not apply to this entry type." };
    }
  }

  const { error } = await supabase
    .from("member_gives_asks")
    .update({ category_id: categoryId })
    .eq("id", rowId);

  if (error) return { error: error.message };

  revalidatePath("/admin/gives-asks");
  return {};
}
