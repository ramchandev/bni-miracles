/** Event start: 7:00 AM IST on event_date */
export function bvdEventStartMs(eventDate: string): number {
  return new Date(`${eventDate}T07:00:00+05:30`).getTime();
}

export function formatBvdEventDate(dateStr: string): string {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function parseNotificationEmails(raw: string | null | undefined): string[] {
  if (!raw?.trim()) return [];
  return raw
    .split(",")
    .map((e) => e.trim())
    .filter((e) => e.includes("@"));
}
