/** Preset accent colours for new teams (cycles by sort order on admin) */
export const POWER_TEAM_COLOR_PRESETS = [
  { color: "#F97316", lightBg: "#FFF7ED" },
  { color: "#8B5CF6", lightBg: "#F5F3FF" },
  { color: "#10B981", lightBg: "#ECFDF5" },
  { color: "#0EA5E9", lightBg: "#F0F9FF" },
  { color: "#3B82F6", lightBg: "#EFF6FF" },
  { color: "#C8102E", lightBg: "#FFF1F2" },
] as const;

export function teamLightBg(color: string): string {
  const preset = POWER_TEAM_COLOR_PRESETS.find((p) => p.color === color);
  return preset?.lightBg ?? `${color}14`;
}

export function slugifyPowerTeam(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** @deprecated Use slugifyPowerTeam — slug comes from database */
export const slugifyTeamName = slugifyPowerTeam;

export const POWER_TEAMS_WITH_MEMBERS_SELECT = `
  *,
  power_team_members (
    id,
    role_notes,
    sort_order,
    members (
      id,
      slug,
      name,
      category,
      business_name,
      business_location,
      profile_picture_url,
      is_active
    )
  )
` as const;
