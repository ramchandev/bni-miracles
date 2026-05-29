"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";

const ADMIN_KEY_HINT =
  "Add SUPABASE_SERVICE_ROLE_KEY to .env.local and restart the dev server.";

function adminDb() {
  return createSupabaseAdminClient();
}

function revalidateLeadershipPaths(groupId?: string) {
  revalidatePath("/admin/leadership", "layout");
  revalidatePath("/about", "page");
  revalidatePath("/members", "layout");
  if (groupId) {
    revalidatePath(`/admin/leadership/groups/${groupId}/edit`, "page");
  }
}

function formatDbError(error: { message: string; code?: string }): string {
  if (error.code === "42P01") {
    return "Leadership tables not found. Run supabase/migrations/20250529100000_chapter_leadership.sql in Supabase.";
  }
  return error.message;
}

export async function saveLeadershipGroupAction(
  _prev: { error: string } | null,
  formData: FormData
): Promise<{ error: string } | null> {
  let supabase;
  try {
    supabase = adminDb();
  } catch {
    return { error: ADMIN_KEY_HINT };
  }

  const id = formData.get("id") as string | null;
  const name = (formData.get("name") as string).trim();

  if (!name) return { error: "Group name is required." };

  const color = ((formData.get("color") as string) || "#C8102E").trim() || "#C8102E";
  const nonMembers = formData.get("non_members") === "on";

  const payload = {
    name,
    subtitle: (formData.get("subtitle") as string)?.trim() || null,
    color,
    non_members: nonMembers,
    sort_order: parseInt(formData.get("sort_order") as string, 10) || 0,
    updated_at: new Date().toISOString(),
  };

  if (id) {
    const { error } = await supabase.from("leadership_groups").update(payload).eq("id", id);
    if (error) return { error: formatDbError(error) };
    revalidateLeadershipPaths(id);
    redirect(`/admin/leadership/groups/${id}/edit`);
  }

  const { data, error } = await supabase.from("leadership_groups").insert([payload]).select("id").single();
  if (error) return { error: formatDbError(error) };
  revalidateLeadershipPaths(data.id);
  redirect(`/admin/leadership/groups/${data.id}/edit`);
}

export async function deleteLeadershipGroupAction(id: string) {
  const supabase = adminDb();
  await supabase.from("leadership_groups").delete().eq("id", id);
  revalidateLeadershipPaths();
  redirect("/admin/leadership");
}

export async function saveLeadershipRoleAction(
  _prev: { error: string } | null,
  formData: FormData
): Promise<{ error: string } | null> {
  const supabase = adminDb();
  const id = formData.get("id") as string | null;
  const groupId = formData.get("group_id") as string;
  const name = (formData.get("name") as string)?.trim();

  if (!name) return { error: "Role name is required." };
  if (!groupId) return { error: "Group is required." };

  const description = (formData.get("description") as string)?.trim() || null;

  const payload = {
    group_id: groupId,
    name,
    description,
    sort_order: parseInt(formData.get("sort_order") as string, 10) || 0,
  };

  if (id) {
    const { error } = await supabase.from("leadership_roles").update(payload).eq("id", id);
    if (error) return { error: formatDbError(error) };
  } else {
    const { error } = await supabase.from("leadership_roles").insert([payload]);
    if (error) return { error: formatDbError(error) };
  }

  revalidateLeadershipPaths(groupId);
  redirect(`/admin/leadership/groups/${groupId}/edit`);
}

export async function updateLeadershipRoleAction(
  roleId: string,
  groupId: string,
  data: { name: string; description: string | null; sort_order: number }
): Promise<{ success: boolean; error?: string }> {
  const name = data.name.trim();
  if (!name) return { success: false, error: "Role name is required." };

  const description = data.description?.trim() || null;

  const supabase = adminDb();
  const { error } = await supabase
    .from("leadership_roles")
    .update({ name, description, sort_order: data.sort_order })
    .eq("id", roleId);

  if (error) return { success: false, error: formatDbError(error) };
  revalidateLeadershipPaths(groupId);
  return { success: true };
}

export async function deleteLeadershipRoleAction(roleId: string, groupId: string) {
  const supabase = adminDb();
  await supabase.from("leadership_roles").delete().eq("id", roleId);
  revalidateLeadershipPaths(groupId);
  redirect(`/admin/leadership/groups/${groupId}/edit`);
}

export async function assignLeadershipMemberAction(
  roleId: string,
  groupId: string,
  memberId: string | null
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = adminDb();

    const { error: deleteError } = await supabase
      .from("leadership_assignments")
      .delete()
      .eq("role_id", roleId);

    if (deleteError) {
      return { success: false, error: formatDbError(deleteError) };
    }

    if (memberId) {
      const { data, error: insertError } = await supabase
        .from("leadership_assignments")
        .insert({ role_id: roleId, member_id: memberId })
        .select("id, role_id, member_id")
        .single();

      if (insertError) {
        return { success: false, error: formatDbError(insertError) };
      }
      if (!data) {
        return {
          success: false,
          error: "Assignment did not save. Confirm leadership tables exist in Supabase.",
        };
      }
    }

    revalidateLeadershipPaths(groupId);
    return { success: true };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    if (message.includes("SUPABASE_SERVICE_ROLE_KEY")) {
      return { success: false, error: ADMIN_KEY_HINT };
    }
    return { success: false, error: message };
  }
}

export async function assignLeadershipNonMemberAction(
  roleId: string,
  groupId: string,
  data: { assignee_name: string; assignee_profile_picture_url: string | null }
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = adminDb();
    const assigneeName = data.assignee_name.trim();

    const { error: deleteError } = await supabase
      .from("leadership_assignments")
      .delete()
      .eq("role_id", roleId);

    if (deleteError) {
      return { success: false, error: formatDbError(deleteError) };
    }

    if (assigneeName) {
      const { data: row, error: insertError } = await supabase
        .from("leadership_assignments")
        .insert({
          role_id: roleId,
          member_id: null,
          assignee_name: assigneeName,
          assignee_profile_picture_url: data.assignee_profile_picture_url?.trim() || null,
        })
        .select("id, role_id, assignee_name")
        .single();

      if (insertError) {
        return { success: false, error: formatDbError(insertError) };
      }
      if (!row) {
        return {
          success: false,
          error: "Assignment did not save. Confirm leadership tables exist in Supabase.",
        };
      }
    }

    revalidateLeadershipPaths(groupId);
    return { success: true };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    if (message.includes("SUPABASE_SERVICE_ROLE_KEY")) {
      return { success: false, error: ADMIN_KEY_HINT };
    }
    return { success: false, error: message };
  }
}
