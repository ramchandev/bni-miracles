import {
  formatHourLabel,
  parseStartTime,
  SLOT_HOURS,
  type CalendarDayStatus,
  calendarStatusForDate,
} from "@/lib/one-on-one";
import type { OneOnOneRequest, OneOnOneSlot } from "@/lib/supabase";

export const CALENDAR_START_HOUR = SLOT_HOURS[0];
export const CALENDAR_END_HOUR = SLOT_HOURS[SLOT_HOURS.length - 1] + 1;
export const CALENDAR_HOUR_HEIGHT = 52;

export type My121EventKind =
  | "open"
  | "pending_host"
  | "confirmed_host"
  | "pending_guest"
  | "confirmed_guest";

export type My121CalendarEvent = {
  id: string;
  kind: My121EventKind;
  date: string;
  startHour: number;
  title: string;
  subtitle: string;
  slot: OneOnOneSlot;
  request: OneOnOneRequest | null;
  role: "host" | "guest";
};

export const EVENT_STYLES: Record<
  My121EventKind,
  { bg: string; border: string; text: string }
> = {
  open: { bg: "#DCFCE7", border: "#16A34A", text: "#14532D" },
  pending_host: { bg: "#FEF3C7", border: "#D97706", text: "#92400E" },
  confirmed_host: { bg: "#FEE2E2", border: "#C8102E", text: "#7F1D1D" },
  pending_guest: { bg: "#E0E7FF", border: "#6366F1", text: "#3730A3" },
  confirmed_guest: { bg: "#DBEAFE", border: "#2563EB", text: "#1E3A8A" },
};

function slotFromRequest(req: OneOnOneRequest): OneOnOneSlot | null {
  const s = req.one_on_one_slots;
  if (!s || Array.isArray(s)) return null;
  return s;
}

function hostNameFromRequest(req: OneOnOneRequest): string | null {
  const raw = (req as OneOnOneRequest & { members?: { name?: string } | { name?: string }[] })
    .members;
  if (!raw) return null;
  return Array.isArray(raw) ? raw[0]?.name ?? null : raw.name ?? null;
}

export function buildMy121CalendarEvents(
  memberId: string,
  hostSlots: OneOnOneSlot[],
  asHost: OneOnOneRequest[],
  asRequester: OneOnOneRequest[]
): My121CalendarEvent[] {
  const events: My121CalendarEvent[] = [];
  const guestSlotIds = new Set<string>();

  for (const slot of hostSlots) {
    if (slot.status === "cancelled") continue;
    const req = asHost.find((r) => r.slot_id === slot.id && r.status !== "declined");
    const hour = parseStartTime(slot.start_time);

    if (slot.status === "open") {
      events.push({
        id: `slot-${slot.id}`,
        kind: "open",
        date: slot.slot_date,
        startHour: hour,
        title: "Available",
        subtitle: slot.meeting_type === "online" ? "Online" : slot.location?.trim() || "In person",
        slot,
        request: null,
        role: "host",
      });
      continue;
    }

    if (req?.status === "pending") {
      events.push({
        id: `req-${req.id}`,
        kind: "pending_host",
        date: slot.slot_date,
        startHour: hour,
        title: req.requester_name,
        subtitle: `${req.requester_chapter} · Pending`,
        slot,
        request: req,
        role: "host",
      });
      continue;
    }

    if (req?.status === "accepted") {
      events.push({
        id: `req-${req.id}`,
        kind: "confirmed_host",
        date: slot.slot_date,
        startHour: hour,
        title: req.requester_name,
        subtitle: `${req.requester_chapter} · Confirmed`,
        slot,
        request: req,
        role: "host",
      });
    }
  }

  for (const req of asRequester) {
    if (req.status !== "pending" && req.status !== "accepted") continue;
    const slot = slotFromRequest(req);
    if (!slot) continue;
    if (slot.host_member_id === memberId) continue;

    guestSlotIds.add(slot.id);
    const hour = parseStartTime(slot.start_time);
    const hostName = hostNameFromRequest(req);
    const pending = req.status === "pending";

    events.push({
      id: `guest-${req.id}`,
      kind: pending ? "pending_guest" : "confirmed_guest",
      date: slot.slot_date,
      startHour: hour,
      title: hostName ? `With ${hostName}` : "1-2-1 meeting",
      subtitle: pending ? "Awaiting host" : "Confirmed · Guest",
      slot,
      request: req,
      role: "guest",
    });
  }

  return events.sort((a, b) => {
    const d = a.date.localeCompare(b.date);
    if (d !== 0) return d;
    return a.startHour - b.startHour;
  });
}

export function eventsForDate(
  events: My121CalendarEvent[],
  dateStr: string
): My121CalendarEvent[] {
  return events.filter((e) => e.date === dateStr);
}

export function layoutDayEvents(
  dayEvents: My121CalendarEvent[]
): (My121CalendarEvent & { lane: number; laneCount: number })[] {
  const byHour = new Map<number, My121CalendarEvent[]>();
  for (const e of dayEvents) {
    const list = byHour.get(e.startHour) ?? [];
    list.push(e);
    byHour.set(e.startHour, list);
  }

  const out: (My121CalendarEvent & { lane: number; laneCount: number })[] = [];
  for (const group of byHour.values()) {
    group.forEach((e, lane) => {
      out.push({ ...e, lane, laneCount: group.length });
    });
  }
  return out;
}

export function eventTimeLabel(startHour: number): string {
  return `${formatHourLabel(startHour)} – ${formatHourLabel(startHour + 1)}`;
}

export function dayStatusForWeek(
  dateStr: string,
  hostSlots: OneOnOneSlot[],
  requests: OneOnOneRequest[]
): CalendarDayStatus {
  return calendarStatusForDate(dateStr, hostSlots, requests);
}
