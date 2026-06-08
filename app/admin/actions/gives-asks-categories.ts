"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import type { GivesAsksCategory, GivesAsksCategoryType } from "@/lib/supabase";

function revalidateGivesAsksCategoryPaths() {
  revalidatePath("/admin/gives-asks/categories", "layout");
  revalidatePath("/admin/gives-asks", "page");
  revalidatePath("/gives-asks", "page");
  revalidatePath("/edit-my-details", "page");
  revalidatePath("/members", "layout");
}

export async function createGivesAsksCategoryQuickAction(
  name: string,
  type: GivesAsksCategoryType = "both"
): Promise<{ category?: GivesAsksCategory; error?: string }> {
  const supabase = await createSupabaseServerClient();
  const trimmed = name.trim();

  if (!trimmed) return { error: "Category name is required." };

  const { data: maxRow } = await supabase
    .from("gives_asks_categories")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  const sort_order = (maxRow?.sort_order ?? -1) + 1;

  const { data, error } = await supabase
    .from("gives_asks_categories")
    .insert([{ name: trimmed, type, sort_order, is_active: true }])
    .select("*")
    .single();

  if (error) {
    if (error.code === "23505") {
      const { data: existing } = await supabase
        .from("gives_asks_categories")
        .select("*")
        .eq("name", trimmed)
        .maybeSingle();
      if (existing) {
        revalidateGivesAsksCategoryPaths();
        return { category: existing };
      }
      return { error: `Category "${trimmed}" already exists.` };
    }
    return { error: error.message };
  }

  revalidateGivesAsksCategoryPaths();
  return { category: data };
}

export async function saveGivesAsksCategoryAction(
  _prev: { error: string } | null,
  formData: FormData
): Promise<{ error: string } | null> {
  const supabase = await createSupabaseServerClient();
  const id = formData.get("id") as string | null;
  const name = (formData.get("name") as string)?.trim();
  const type = (formData.get("type") as GivesAsksCategoryType) || "both";
  const is_active = formData.get("is_active") === "on";

  if (!name) return { error: "Category name is required." };

  let sort_order = parseInt(formData.get("sort_order") as string, 10);
  if (Number.isNaN(sort_order)) sort_order = 0;

  if (!id) {
    const { data: maxRow } = await supabase
      .from("gives_asks_categories")
      .select("sort_order")
      .order("sort_order", { ascending: false })
      .limit(1)
      .maybeSingle();
    sort_order = (maxRow?.sort_order ?? -1) + 1;
  }

  const payload = {
    name,
    type,
    sort_order,
    is_active,
    updated_at: new Date().toISOString(),
  };

  if (id) {
    const { error } = await supabase.from("gives_asks_categories").update(payload).eq("id", id);
    if (error) {
      if (error.code === "23505") return { error: `Category "${name}" already exists.` };
      return { error: error.message };
    }
  } else {
    const { error } = await supabase.from("gives_asks_categories").insert([payload]);
    if (error) {
      if (error.code === "23505") return { error: `Category "${name}" already exists.` };
      return { error: error.message };
    }
  }

  revalidateGivesAsksCategoryPaths();
  redirect("/admin/gives-asks/categories");
}

export async function deleteGivesAsksCategoryAction(id: string) {
  const supabase = await createSupabaseServerClient();
  await supabase.from("gives_asks_categories").delete().eq("id", id);
  revalidateGivesAsksCategoryPaths();
  redirect("/admin/gives-asks/categories");
}
