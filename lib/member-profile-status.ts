import type { Member } from "@/lib/supabase";

const PROFILE_FIELDS: (keyof Member)[] = [
  "profile_picture_url",
  "email",
  "phone",
  "business_location",
  "website",
  "services",
  "why_choose_us",
  "success_stories",
];

export function memberProfileCompletionPercent(member: Member): number {
  const filled = PROFILE_FIELDS.filter((key) => {
    const v = member[key];
    return v != null && String(v).trim() !== "";
  }).length;
  return Math.round((filled / PROFILE_FIELDS.length) * 100);
}

export function givesAsksAdminLabel(hasGiveOrAsk: boolean): string {
  return hasGiveOrAsk ? "GA: 100%" : "GA: 0%";
}

export type DanceCardStatusRow = {
  member_id: string;
  pdf_generated_at?: string | null;
  bio_profession?: string | null;
  gains_goals?: string | null;
  gains_accomplishments?: string | null;
  bio_burning_desire?: string | null;
  updated_at?: string | null;
};

/** PDF generated, or dance card saved with meaningful content. */
export function isDanceCardComplete(row: DanceCardStatusRow): boolean {
  if (row.pdf_generated_at) return true;
  const fields = [
    row.bio_profession,
    row.gains_goals,
    row.gains_accomplishments,
    row.bio_burning_desire,
  ];
  return fields.some((v) => v != null && String(v).trim() !== "");
}

export function danceCardAdminLabel(complete: boolean): string {
  return complete ? "DC: Generated" : "DC: NA";
}

export type MemberAdminRow = Member & {
  profileCompletionPercent: number;
  givesAsksLabel: string;
  danceCardLabel: string;
};

export function buildMemberAdminRows(
  members: Member[],
  giveAskMemberIds: Set<string>,
  danceCardGeneratedIds: Set<string>
): MemberAdminRow[] {
  return members.map((m) => ({
    ...m,
    profileCompletionPercent: memberProfileCompletionPercent(m),
    givesAsksLabel: givesAsksAdminLabel(giveAskMemberIds.has(m.id)),
    danceCardLabel: danceCardAdminLabel(danceCardGeneratedIds.has(m.id)),
  }));
}
