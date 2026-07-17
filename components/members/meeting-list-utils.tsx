"use client";

import Image from "next/image";
import Link from "next/link";
import {
  formatHourLabel,
  formatProfileDate,
  isAvailabilitySlotInPast,
  parseStartTime,
  slotDateTimeSortKey,
} from "@/lib/one-on-one";
import type { OneOnOneRequest, OneOnOneRequestStatus } from "@/lib/supabase";

export type Counterparty = {
  name: string;
  profile_picture_url: string | null;
  slug?: string | null;
  isGuest: boolean;
};

export type MeetingRow = {
  id: string;
  counterparty: Counterparty;
  roleLabel: string;
  slotDate: string;
  startTime: string;
  dateLabel: string;
  timeLabel: string;
};

type JoinedMember = {
  name?: string;
  profile_picture_url?: string | null;
  slug?: string | null;
};

function slotFromRequest(req: OneOnOneRequest) {
  const s = req.one_on_one_slots;
  if (!s || Array.isArray(s)) return null;
  return s;
}

function pickJoined(joined?: JoinedMember | JoinedMember[] | null): JoinedMember | null {
  if (!joined) return null;
  return Array.isArray(joined) ? joined[0] ?? null : joined;
}

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }
  return parts[0]?.slice(0, 2).toUpperCase() ?? "?";
}

export function CounterpartyAvatar({ person }: { person: Counterparty }) {
  const inner = person.profile_picture_url ? (
    <Image
      src={person.profile_picture_url}
      alt=""
      width={40}
      height={40}
      className="rounded-full object-cover w-10 h-10 shrink-0"
    />
  ) : (
    <div
      className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
      style={{ background: "var(--color-primary)" }}
      title={person.isGuest ? "Guest" : undefined}
    >
      {initialsFromName(person.name)}
    </div>
  );

  if (person.slug && !person.isGuest) {
    return (
      <Link href={`/members/${person.slug}`} className="shrink-0" title={`View ${person.name}`}>
        {inner}
      </Link>
    );
  }

  return <div className="shrink-0">{inner}</div>;
}

export function buildMeetingRows(
  asHost: OneOnOneRequest[],
  asRequester: OneOnOneRequest[],
  options: {
    statuses: OneOnOneRequestStatus[];
    upcomingOnly?: boolean;
    pastOnly?: boolean;
  }
): MeetingRow[] {
  const { statuses, upcomingOnly = false, pastOnly = false } = options;
  const statusSet = new Set(statuses);
  const rows: MeetingRow[] = [];
  const skipByTime = (slotDate: string, startTime: string) => {
    const past = isAvailabilitySlotInPast(slotDate, parseStartTime(startTime));
    return (upcomingOnly && past) || (pastOnly && !past);
  };

  for (const req of asHost.filter((r) => statusSet.has(r.status))) {
    const slot = slotFromRequest(req);
    if (!slot) continue;
    if (skipByTime(slot.slot_date, slot.start_time)) continue;

    const joined = pickJoined(
      (req as OneOnOneRequest & { requester?: JoinedMember | JoinedMember[] | null }).requester
    );
    const isGuest = !req.requester_member_id;
    const hour = parseStartTime(slot.start_time);

    rows.push({
      id: req.id,
      counterparty: {
        name: joined?.name ?? req.requester_name,
        profile_picture_url: isGuest ? null : joined?.profile_picture_url ?? null,
        slug: joined?.slug ?? null,
        isGuest,
      },
      roleLabel: "You host",
      slotDate: slot.slot_date,
      startTime: slot.start_time,
      dateLabel: formatProfileDate(slot.slot_date),
      timeLabel: `${formatHourLabel(hour)} – ${formatHourLabel(hour + 1)}`,
    });
  }

  for (const req of asRequester.filter((r) => statusSet.has(r.status))) {
    const slot = slotFromRequest(req);
    if (!slot) continue;
    if (skipByTime(slot.slot_date, slot.start_time)) continue;

    const host = pickJoined(
      (req as OneOnOneRequest & { members?: JoinedMember | JoinedMember[] | null }).members
    );
    const hour = parseStartTime(slot.start_time);

    rows.push({
      id: req.id,
      counterparty: {
        name: host?.name ?? "Host",
        profile_picture_url: host?.profile_picture_url ?? null,
        slug: host?.slug ?? null,
        isGuest: false,
      },
      roleLabel: "You attend",
      slotDate: slot.slot_date,
      startTime: slot.start_time,
      dateLabel: formatProfileDate(slot.slot_date),
      timeLabel: `${formatHourLabel(hour)} – ${formatHourLabel(hour + 1)}`,
    });
  }

  return rows;
}

export function sortMeetingRows(rows: MeetingRow[], direction: "asc" | "desc"): MeetingRow[] {
  return [...rows].sort((a, b) => {
    const diff = slotDateTimeSortKey(a.slotDate, a.startTime) - slotDateTimeSortKey(b.slotDate, b.startTime);
    return direction === "asc" ? diff : -diff;
  });
}
