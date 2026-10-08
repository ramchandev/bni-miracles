export type SpecificAskStatus = "not_yet_connected" | "contacted" | "connected";

export const ASK_STATUSES: {
  value: SpecificAskStatus;
  label: string;
  emoji: string;
}[] = [
  { value: "not_yet_connected", label: "Not Yet Connected", emoji: "⏳" },
  { value: "contacted", label: "Contacted", emoji: "📞" },
  { value: "connected", label: "Connected", emoji: "✅" },
];

export function statusLabel(status: SpecificAskStatus): string {
  return ASK_STATUSES.find((s) => s.value === status)?.label ?? status;
}

export function meetingParts(iso: string): { day: number; mon: string; year: number } {
  const [y, m, d] = iso.slice(0, 10).split("-").map(Number);
  const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
  return { day: d, mon: months[(m || 1) - 1] ?? "", year: y };
}

export function formatMeetingLong(iso: string): string {
  const { day, mon, year } = meetingParts(iso);
  const titled = mon.charAt(0) + mon.slice(1).toLowerCase();
  return `${day} ${titled} ${year}`;
}

function parseDate(iso: string): number {
  const [y, m, d] = iso.slice(0, 10).split("-").map(Number);
  return Date.UTC(y, (m || 1) - 1, d || 1);
}

export function kolkataToday(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(new Date());
}

export function daysBetween(fromIso: string, toIso: string): number {
  const diff = parseDate(toIso) - parseDate(fromIso);
  return Math.max(0, Math.round(diff / 86_400_000));
}

export function askedAgoLabel(firstAskedOn: string, today = kolkataToday()): string {
  const days = daysBetween(firstAskedOn, today);
  if (days === 0) return "Asked today";
  if (days === 1) return "Asked 1 day ago";
  return `Asked ${days} days ago`;
}

export function connectedInLabel(firstAskedOn: string, connectedAt: string): string {
  const connectedDay = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(
    new Date(connectedAt)
  );
  const days = daysBetween(firstAskedOn, connectedDay);
  if (days === 0) return "Got connected the same day";
  if (days === 1) return "Got connected in 1 day";
  return `Got connected in ${days} days`;
}

export function openForLabel(firstAskedOn: string, today = kolkataToday()): string {
  const days = daysBetween(firstAskedOn, today);
  if (days === 0) return "opened today";
  if (days === 1) return "open for 1 day";
  return `open for ${days} days`;
}

export type AskPerson = {
  id: string;
  name: string;
  slug: string | null;
  profilePictureUrl: string | null;
  category?: string | null;
};

export type AskConnector = {
  id: string;
  memberId: string | null;
  name: string;
  slug: string | null;
  profilePictureUrl: string | null;
};

export type SpecificAskCard = {
  id: string;
  seeker: AskPerson;
  askText: string;
  firstAskedOn: string;
  status: SpecificAskStatus;
  connectedAt: string | null;
  notes: string | null;
  seekerNotes: string | null;
  connectors: AskConnector[];
  position: number;
};

export type SpecificAskMeeting = {
  id: string;
  meetingDate: string;
};

export type DirectoryMember = {
  id: string;
  name: string;
  slug: string;
  category: string | null;
  profilePictureUrl: string | null;
};

export type OpenAskOption = {
  id: string;
  askText: string;
  firstAskedOn: string;
  status: SpecificAskStatus;
};
