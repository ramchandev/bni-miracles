import { supabase } from "@/lib/supabase";
import { POWER_TEAMS_WITH_MEMBERS_SELECT } from "@/lib/power-teams";
import type { PowerTeamWithMembers } from "@/lib/supabase";

export type PowerTeamNavItem = {
  slug: string;
  name: string;
  emoji: string;
};

export async function fetchPowerTeamsNav(): Promise<PowerTeamNavItem[]> {
  const { data } = await supabase
    .from("power_teams")
    .select("slug, name, emoji")
    .order("sort_order");

  return (data ?? []).filter((t) => t.slug) as PowerTeamNavItem[];
}

export async function fetchPowerTeamsWithMembers(): Promise<PowerTeamWithMembers[]> {
  const { data } = await supabase
    .from("power_teams")
    .select(POWER_TEAMS_WITH_MEMBERS_SELECT)
    .order("sort_order");

  return (data ?? []) as PowerTeamWithMembers[];
}

export async function fetchPowerTeamBySlug(slug: string): Promise<PowerTeamWithMembers | null> {
  const { data } = await supabase
    .from("power_teams")
    .select(POWER_TEAMS_WITH_MEMBERS_SELECT)
    .eq("slug", slug)
    .maybeSingle();

  return (data as PowerTeamWithMembers | null) ?? null;
}

export function countTeamMembers(team: PowerTeamWithMembers): number {
  return team.power_team_members?.filter((r) => r.members)?.length ?? 0;
}

export type GivesAsksByMemberId = Map<string, { gives: string[]; asks: string[] }>;

export async function fetchGivesAsksForMembers(memberIds: string[]): Promise<GivesAsksByMemberId> {
  const map: GivesAsksByMemberId = new Map();
  if (memberIds.length === 0) return map;

  const { data } = await supabase
    .from("member_gives_asks")
    .select("member_id, type, item")
    .in("member_id", memberIds)
    .order("sort_order");

  for (const row of data ?? []) {
    if (!map.has(row.member_id)) map.set(row.member_id, { gives: [], asks: [] });
    const bucket = map.get(row.member_id)!;
    if (row.type === "give") bucket.gives.push(row.item);
    else bucket.asks.push(row.item);
  }

  return map;
}

export async function fetchCategoryIconMap(): Promise<Map<string, string>> {
  const { data } = await supabase.from("business_categories").select("name, icon");

  const icons = new Map<string, string>();
  for (const cat of data ?? []) {
    if (cat.icon) icons.set(cat.name, cat.icon);
  }
  return icons;
}

export function sortTeamMembers(team: PowerTeamWithMembers) {
  return (team.power_team_members ?? [])
    .filter((r) => r.members)
    .sort((a, b) => {
      const aCaptain = a.members!.id === team.captain_member_id ? 0 : 1;
      const bCaptain = b.members!.id === team.captain_member_id ? 0 : 1;
      if (aCaptain !== bCaptain) return aCaptain - bCaptain;
      return a.sort_order - b.sort_order;
    });
}
