"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { slugifyPowerTeam } from "@/lib/power-teams";
import { sanitizeRichHtml } from "@/lib/sanitize-html";

function normalizeDescription(raw: string | null): string | null {
  const sanitized = sanitizeRichHtml(raw ?? "");
  const stripped = sanitized.replace(/<p>\s*<\/p>/gi, "").trim();
  if (!stripped) return null;
  return sanitized;
}

function revalidatePowerTeamPaths(slug?: string) {
  revalidatePath("/admin/power-teams");
  revalidatePath("/power-team");
  revalidatePath("/initiatives/power-team");
  revalidatePath("/", "layout");
  if (slug) revalidatePath(`/power-team/${slug}`);
}

async function revalidatePowerTeamForTeamId(teamId: string) {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.from("power_teams").select("slug").eq("id", teamId).maybeSingle();
  revalidatePowerTeamPaths(data?.slug ?? undefined);
}

export async function savePowerTeamAction(
  _prevState: { error: string } | null,
  formData: FormData
): Promise<{ error: string } | null> {
  const supabase = await createSupabaseServerClient();
  const id = formData.get("id") as string | null;
  const name = (formData.get("name") as string).trim();

  if (!name) return { error: "Team name is required." };

  const slugRaw = (formData.get("slug") as string)?.trim();
  const slug = slugRaw || slugifyPowerTeam(name);
  if (!slug) return { error: "URL slug is required." };

  const payload = {
    name,
    slug,
    focus_area: (formData.get("focus_area") as string)?.trim() || null,
    description: normalizeDescription(formData.get("description") as string),
    emoji: (formData.get("emoji") as string)?.trim() || "⚡",
    color: (formData.get("color") as string)?.trim() || "#C8102E",
    sort_order: parseInt(formData.get("sort_order") as string, 10) || 0,
    updated_at: new Date().toISOString(),
  };

  if (id) {
    const { error } = await supabase.from("power_teams").update(payload).eq("id", id);
    if (error) {
      if (error.code === "23505") return { error: `Slug "${slug}" is already used by another team.` };
      return { error: error.message };
    }
    revalidatePowerTeamPaths(slug);
    redirect(`/admin/power-teams/${id}/edit`);
  }

  const { data, error } = await supabase
    .from("power_teams")
    .insert([payload])
    .select("id, slug")
    .single();

  if (error) {
    if (error.code === "23505") return { error: `Slug "${slug}" is already used by another team.` };
    return { error: error.message };
  }

  revalidatePowerTeamPaths(data.slug);
  redirect(`/admin/power-teams/${data.id}/edit`);
}

export async function deletePowerTeamAction(id: string) {
  const supabase = await createSupabaseServerClient();
  await supabase.from("power_teams").delete().eq("id", id);
  revalidatePowerTeamPaths();
  redirect("/admin/power-teams");
}

export async function addPowerTeamMemberAction(
  teamId: string,
  memberId: string,
  roleNotes: string
): Promise<{ error?: string }> {
  const supabase = await createSupabaseServerClient();

  const { data: existing } = await supabase
    .from("power_team_members")
    .select("id, power_team_id")
    .eq("member_id", memberId)
    .maybeSingle();

  if (existing && existing.power_team_id !== teamId) {
    return { error: "This member is already assigned to another Power Team." };
  }

  if (existing) {
    return { error: "This member is already on this team." };
  }

  const { data: maxOrder } = await supabase
    .from("power_team_members")
    .select("sort_order")
    .eq("power_team_id", teamId)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { error } = await supabase.from("power_team_members").insert([
    {
      power_team_id: teamId,
      member_id: memberId,
      role_notes: roleNotes.trim() || null,
      sort_order: (maxOrder?.sort_order ?? -1) + 1,
    },
  ]);

  if (error) {
    if (error.code === "23505") {
      return { error: "This member is already assigned to another Power Team." };
    }
    return { error: error.message };
  }

  await revalidatePowerTeamForTeamId(teamId);
  return {};
}

export async function removePowerTeamMemberAction(teamId: string, memberRowId: string) {
  const supabase = await createSupabaseServerClient();

  const { data: row } = await supabase
    .from("power_team_members")
    .select("member_id")
    .eq("id", memberRowId)
    .eq("power_team_id", teamId)
    .maybeSingle();

  await supabase.from("power_team_members").delete().eq("id", memberRowId);

  if (row?.member_id) {
    await supabase
      .from("power_teams")
      .update({ captain_member_id: null, updated_at: new Date().toISOString() })
      .eq("id", teamId)
      .eq("captain_member_id", row.member_id);
  }

  await revalidatePowerTeamForTeamId(teamId);
}

export async function setPowerTeamCaptainAction(
  teamId: string,
  memberId: string | null
): Promise<{ error?: string }> {
  const supabase = await createSupabaseServerClient();

  if (memberId === null) {
    const { error } = await supabase
      .from("power_teams")
      .update({ captain_member_id: null, updated_at: new Date().toISOString() })
      .eq("id", teamId);
    if (error) return { error: error.message };
    await revalidatePowerTeamForTeamId(teamId);
    return {};
  }

  const { data: onTeam } = await supabase
    .from("power_team_members")
    .select("id")
    .eq("power_team_id", teamId)
    .eq("member_id", memberId)
    .maybeSingle();

  if (!onTeam) {
    return { error: "Team captain must be a member of this team." };
  }

  const { error } = await supabase
    .from("power_teams")
    .update({ captain_member_id: memberId, updated_at: new Date().toISOString() })
    .eq("id", teamId);

  if (error) return { error: error.message };
  await revalidatePowerTeamForTeamId(teamId);
  return {};
}

export async function updatePowerTeamMemberNotesAction(
  teamId: string,
  memberRowId: string,
  roleNotes: string
): Promise<{ error?: string }> {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("power_team_members")
    .update({ role_notes: roleNotes.trim() || null })
    .eq("id", memberRowId);

  if (error) return { error: error.message };
  await revalidatePowerTeamForTeamId(teamId);
  return {};
}
