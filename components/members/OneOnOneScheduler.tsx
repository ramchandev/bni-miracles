"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { fetchPublic121ProfileAction } from "@/app/actions/one-on-one-queries";
import {
  formatHourLabel,
  formatProfileDate,
  groupSlotsByDate,
  parseStartTime,
  type Public121ProfileData,
} from "@/lib/one-on-one";
import type { OneOnOneSlot, SessionMember } from "@/lib/supabase";
import Book121Form from "./Book121Form";
import ExternalTextOrLink from "@/components/ExternalTextOrLink";
import MeetingTypePill from "@/components/members/MeetingTypePill";

type HostMember = {
  id: string;
  name: string;
  slug: string;
};

type Props = {
  host: HostMember;
  sessionMember: SessionMember | null;
  initialData: Public121ProfileData;
};

export default function OneOnOneScheduler({ host, sessionMember, initialData }: Props) {
  const isOwner = sessionMember?.id === host.id;
  const [data, setData] = useState(initialData);
  const [bookingSlot, setBookingSlot] = useState<OneOnOneSlot | null>(null);

  const openByDate = useMemo(() => groupSlotsByDate(data.openSlots), [data.openSlots]);
  const bookedByDate = useMemo(() => groupSlotsByDate(data.bookedSlots), [data.bookedSlots]);

  const refresh = async () => {
    setData(await fetchPublic121ProfileAction(host.id));
    setBookingSlot(null);
  };

  const hasAny = data.openSlots.length > 0 || data.bookedSlots.length > 0;

  return (
    <div id="one-on-one" className="scroll-mt-28">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
            style={{ background: "var(--color-primary)" }}
          >
            121
          </div>
          <div>
            <h2 className="font-bold text-xl" style={{ color: "var(--color-dark)" }}>
              Schedule a 1-2-1
            </h2>
            <p className="text-xs" style={{ color: "var(--color-gray)" }}>
              {isOwner
                ? "Your public availability — visitors book open slots below"
                : `Book a one-to-one with ${host.name}`}
            </p>
          </div>
        </div>
        {isOwner && (
          <Link
            href="/my-121"
            className="text-sm font-semibold shrink-0"
            style={{ color: "var(--color-primary)" }}
          >
            Manage availability →
          </Link>
        )}
      </div>

      {bookingSlot ? (
        <Book121Form
          slot={bookingSlot}
          hostName={host.name}
          onSuccess={refresh}
          onCancel={() => setBookingSlot(null)}
        />
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          <SlotGroup
            title="Available"
            hint="Pick a time to request a 1-2-1"
            empty="No open slots right now."
            byDate={openByDate}
            variant="open"
            onBook={isOwner ? undefined : setBookingSlot}
          />
          <SlotGroup
            title="Booked"
            hint="These times are already taken"
            empty="No booked slots yet."
            byDate={bookedByDate}
            variant="booked"
          />
        </div>
      )}

      {!hasAny && !bookingSlot && (
        <p className="text-sm text-center mt-4" style={{ color: "var(--color-gray)" }}>
          {isOwner
            ? "Add your first availability on My 1-2-1 Calendar."
            : `${host.name} has not opened any 1-2-1 slots yet.`}
        </p>
      )}
    </div>
  );
}

function SlotGroup({
  title,
  hint,
  empty,
  byDate,
  variant,
  onBook,
}: {
  title: string;
  hint: string;
  empty: string;
  byDate: Map<string, OneOnOneSlot[]>;
  variant: "open" | "booked";
  onBook?: (slot: OneOnOneSlot) => void;
}) {
  const isOpen = variant === "open";
  const accent = isOpen ? "#16A34A" : "var(--color-primary)";
  const bg = isOpen ? "#16A34A08" : "#C8102E08";
  const border = isOpen ? "#16A34A33" : "#C8102E33";

  if (byDate.size === 0) {
    return (
      <div className="rounded-2xl p-5" style={{ background: bg, border: `1.5px solid ${border}` }}>
        <h3 className="font-bold text-sm mb-1" style={{ color: "var(--color-dark)" }}>
          {title}
        </h3>
        <p className="text-xs text-gray-500">{empty}</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl p-5" style={{ background: bg, border: `1.5px solid ${border}` }}>
      <h3 className="font-bold text-sm mb-0.5" style={{ color: "var(--color-dark)" }}>
        {title}
      </h3>
      <p className="text-xs mb-4" style={{ color: "var(--color-gray)" }}>
        {hint}
      </p>
      <div className="space-y-4">
        {Array.from(byDate.entries()).map(([date, slots]) => (
          <div key={date}>
            <p className="text-xs font-semibold mb-2" style={{ color: accent }}>
              {formatProfileDate(date)}
            </p>
            <ul className="space-y-2.5">
              {slots.map((slot) => (
                <li key={slot.id}>
                  <SlotCard
                    slot={slot}
                    showPlace={isOpen || Boolean(onBook)}
                    onBook={onBook}
                    booked={!isOpen}
                  />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

function SlotCard({
  slot,
  showPlace,
  onBook,
  booked,
}: {
  slot: OneOnOneSlot;
  showPlace?: boolean;
  onBook?: (slot: OneOnOneSlot) => void;
  booked?: boolean;
}) {
  const hour = parseStartTime(slot.start_time);
  const place =
    showPlace &&
    (slot.meeting_type === "online" ? slot.meeting_url : slot.location);

  return (
    <div
      className="rounded-xl px-3.5 py-3"
      style={{
        background: "white",
        border: "1px solid #E5E7EB",
        opacity: booked ? 0.88 : 1,
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="font-bold text-sm" style={{ color: "var(--color-dark)" }}>
              {formatHourLabel(hour)} – {formatHourLabel(hour + 1)}
            </span>
            <MeetingTypePill meetingType={slot.meeting_type} />
          </div>
          {place && (
            <p className="text-xs truncate" style={{ color: "var(--color-gray)" }}>
              <ExternalTextOrLink
                text={place}
                linkLabel={slot.meeting_type === "online" ? "Meeting Link" : "Location Link"}
                className="text-xs"
              />
            </p>
          )}
        </div>
        {onBook && (
          <button
            type="button"
            onClick={() => onBook(slot)}
            className="shrink-0 rounded-full px-3 py-1 text-[11px] font-bold tracking-wide transition-opacity hover:opacity-90"
            style={{
              background: "var(--color-primary)",
              color: "white",
              lineHeight: 1.4,
            }}
          >
            Book
          </button>
        )}
      </div>
    </div>
  );
}
