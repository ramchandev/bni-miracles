export function formatMeetingDateLabel(dateStr: string): string {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  });
}

/** Relative label from meeting_date vs today in Asia/Kolkata. */
export function relativeMeetingAge(dateStr: string): string {
  const todayParts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const y = Number(todayParts.find((p) => p.type === "year")?.value);
  const m = Number(todayParts.find((p) => p.type === "month")?.value);
  const d = Number(todayParts.find((p) => p.type === "day")?.value);

  const [my, mm, md] = dateStr.split("-").map(Number);
  const todayUtc = Date.UTC(y, m - 1, d);
  const meetingUtc = Date.UTC(my, mm - 1, md);
  const days = Math.round((todayUtc - meetingUtc) / 86_400_000);

  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days > 1 && days < 7) return `${days} days ago`;
  if (days >= 7 && days < 14) return "1 week ago";
  if (days >= 14 && days < 30) return `${Math.floor(days / 7)} weeks ago`;
  if (days >= 30 && days < 60) return "1 month ago";
  if (days >= 60) return `${Math.floor(days / 30)} months ago`;
  if (days === -1) return "Tomorrow";
  if (days < 0) return `In ${Math.abs(days)} days`;
  return formatMeetingDateLabel(dateStr);
}

export function formatBusinessValue(value: number | null | undefined): string | null {
  if (value == null || Number.isNaN(Number(value))) return null;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value));
}
