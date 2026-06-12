import type {
  OneOnOneMeetingType,
  OneOnOneRequest,
  OneOnOneSlot,
} from "@/lib/supabase";

export const MIRACLES_CHAPTER = "BNI Miracles";
export const SLOT_HOURS = [9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19] as const;
export const TIMEZONE = "Asia/Kolkata";

/** YYYY-MM-DD in Asia/Kolkata — consistent on server (UTC) and client (local). */
export function kolkataDateString(d = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

/** Calendar month view anchored to IST, not the host machine timezone. */
export function kolkataYearMonth(d = new Date()): { year: number; month: number } {
  const [year, month] = kolkataDateString(d).split("-").map(Number);
  return { year, month: month - 1 };
}

export function formatKolkataMonthYear(year: number, month: number): string {
  const m = String(month + 1).padStart(2, "0");
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: TIMEZONE,
    month: "long",
    year: "numeric",
  }).format(new Date(`${year}-${m}-15T12:00:00+05:30`));
}

export type SlotHour = (typeof SLOT_HOURS)[number];

export function formatHourOption(hour: number): string {
  const h = hour.toString().padStart(2, "0");
  return `${h}:00`;
}

export function formatHourLabel(hour: number): string {
  if (hour < 12) return `${hour}:00 AM`;
  if (hour === 12) return "12:00 PM";
  return `${hour - 12}:00 PM`;
}

export function parseStartTime(time: string): number {
  const [h] = time.split(":");
  return parseInt(h, 10);
}

export function isValidSlotHour(hour: number): hour is SlotHour {
  return (SLOT_HOURS as readonly number[]).includes(hour);
}

export function slotDateTime(slot: Pick<OneOnOneSlot, "slot_date" | "start_time">): Date {
  const time = slot.start_time.slice(0, 5);
  return new Date(`${slot.slot_date}T${time}:00+05:30`);
}

export function slotEndDateTime(slot: Pick<OneOnOneSlot, "slot_date" | "start_time">): Date {
  const start = slotDateTime(slot);
  return new Date(start.getTime() + 60 * 60 * 1000);
}

export function formatSlotSummary(
  slot: Pick<OneOnOneSlot, "slot_date" | "start_time" | "meeting_type" | "location" | "meeting_url">
): string {
  const start = slotDateTime(slot);
  const dateStr = start.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: TIMEZONE,
  });
  const timeStr = `${formatHourLabel(parseStartTime(slot.start_time))} – ${formatHourLabel(
    parseStartTime(slot.start_time) + 1
  )} IST`;
  const typeLabel = slot.meeting_type === "online" ? "Online" : "In person";
  const place =
    slot.meeting_type === "online"
      ? slot.meeting_url?.trim() || "Link to be shared"
      : slot.location?.trim() || "Location to be confirmed";
  return `${dateStr}, ${timeStr} · ${typeLabel} · ${place}`;
}

export type CalendarDayStatus = "none" | "open" | "pending" | "confirmed";

export function calendarStatusForDate(
  dateStr: string,
  slots: OneOnOneSlot[],
  requests: OneOnOneRequest[]
): CalendarDayStatus {
  const daySlots = slots.filter((s) => s.slot_date === dateStr && s.status !== "cancelled");
  if (daySlots.length === 0) return "none";

  const slotIds = new Set(daySlots.map((s) => s.id));
  const dayRequests = requests.filter((r) => slotIds.has(r.slot_id));

  if (dayRequests.some((r) => r.status === "accepted")) return "confirmed";
  if (dayRequests.some((r) => r.status === "pending")) return "pending";
  if (daySlots.some((s) => s.status === "open")) return "open";
  return "none";
}

export function generateIcsContent(params: {
  uid: string;
  title: string;
  description: string;
  location: string;
  start: Date;
  end: Date;
  organizerEmail?: string | null;
  attendeeEmail?: string | null;
}): string {
  const fmt = (d: Date) =>
    d
      .toISOString()
      .replace(/[-:]/g, "")
      .replace(/\.\d{3}Z$/, "Z");

  const escape = (s: string) =>
    s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//BNI Miracles//121 Scheduler//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:REQUEST",
    "BEGIN:VEVENT",
    `UID:${params.uid}`,
    `DTSTAMP:${fmt(new Date())}`,
    `DTSTART:${fmt(params.start)}`,
    `DTEND:${fmt(params.end)}`,
    `SUMMARY:${escape(params.title)}`,
    `DESCRIPTION:${escape(params.description)}`,
    `LOCATION:${escape(params.location)}`,
  ];

  if (params.organizerEmail) {
    lines.push(`ORGANIZER;CN=BNI Miracles:mailto:${params.organizerEmail}`);
  }
  if (params.attendeeEmail) {
    lines.push(`ATTENDEE;ROLE=REQ-PARTICIPANT;PARTSTAT=NEEDS-ACTION;RSVP=TRUE:mailto:${params.attendeeEmail}`);
  }

  lines.push("END:VEVENT", "END:VCALENDAR");
  return lines.join("\r\n");
}

export function requiresGuestDanceCardUpload(
  sessionMemberId: string | null | undefined,
  requesterChapter: string,
  hasMemberDanceCard: boolean
): boolean {
  if (!sessionMemberId) return true;
  if (requesterChapter.trim().toLowerCase() !== MIRACLES_CHAPTER.toLowerCase()) return true;
  return !hasMemberDanceCard;
}

export type Member121CalendarData = {
  slots: OneOnOneSlot[];
  requests: OneOnOneRequest[];
  pendingAsHost: OneOnOneRequest[];
};

export type Public121ProfileData = {
  openSlots: OneOnOneSlot[];
  bookedSlots: OneOnOneSlot[];
};

export function sortSlotsByDateTime(slots: OneOnOneSlot[]): OneOnOneSlot[] {
  return [...slots].sort((a, b) => {
    const d = a.slot_date.localeCompare(b.slot_date);
    if (d !== 0) return d;
    return a.start_time.localeCompare(b.start_time);
  });
}

export function groupSlotsByDate(slots: OneOnOneSlot[]): Map<string, OneOnOneSlot[]> {
  const map = new Map<string, OneOnOneSlot[]>();
  for (const slot of sortSlotsByDateTime(slots)) {
    const list = map.get(slot.slot_date) ?? [];
    list.push(slot);
    map.set(slot.slot_date, list);
  }
  return map;
}

export function formatProfileDate(dateStr: string): string {
  const d = new Date(`${dateStr}T12:00:00+05:30`);
  return d.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: TIMEZONE,
  });
}
