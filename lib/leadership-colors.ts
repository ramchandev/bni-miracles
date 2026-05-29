/** Default group accent colours (matches seed migration) */
export const LEADERSHIP_GROUP_COLOR_PRESETS = [
  { color: "#C8102E", label: "Chapter Red" },
  { color: "#8B5CF6", label: "Purple" },
  { color: "#0EA5E9", label: "Blue" },
  { color: "#F97316", label: "Orange" },
  { color: "#10B981", label: "Green" },
  { color: "#FBBF24", label: "Gold" },
] as const;

export function groupLightBg(color: string): string {
  const preset = LEADERSHIP_GROUP_COLOR_PRESETS.find((p) => p.color === color);
  if (preset) {
    const map: Record<string, string> = {
      "#C8102E": "#FFF1F2",
      "#8B5CF6": "#F5F3FF",
      "#0EA5E9": "#F0F9FF",
      "#F97316": "#FFF7ED",
      "#10B981": "#ECFDF5",
      "#FBBF24": "#FFFBEB",
    };
    return map[color] ?? `${color}14`;
  }
  return `${color}14`;
}
