"use client";

import { useCallback, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { fetchPlan121AvailabilityAction } from "@/app/actions/plan-121s";
import Book121Modal from "@/components/members/Book121Modal";
import {
  formatHourLabel,
  formatProfileDate,
  groupSlotsByDate,
  parseStartTime,
} from "@/lib/one-on-one";
import type { Plan121Entry } from "@/lib/plan-121s";
import type { OneOnOneSlot } from "@/lib/supabase";

type Props = {
  initial: Plan121Entry[];
};

type ViewMode = "date" | "member";

type BookingTarget = {
  slot: OneOnOneSlot;
  hostName: string;
};

function HostAvatar({ host }: { host: Plan121Entry["host"] }) {
  if (host.profile_picture_url) {
    return (
      <Image
        src={host.profile_picture_url}
        alt=""
        width={40}
        height={40}
        className="rounded-full object-cover w-10 h-10 shrink-0"
      />
    );
  }
  const parts = host.name.trim().split(" ");
  const initials =
    parts.length >= 2
      ? `${parts[0][0]}${parts[parts.length - 1][0]}`
      : parts[0].slice(0, 2);
  return (
    <div
      className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
      style={{ background: "var(--color-primary)" }}
    >
      {initials.toUpperCase()}
    </div>
  );
}

function SlotMeta({ slot }: { slot: OneOnOneSlot }) {
  const hour = parseStartTime(slot.start_time);
  const typeLabel = slot.meeting_type === "online" ? "Online" : "In person";
  const place =
    slot.meeting_type === "online"
      ? slot.meeting_url?.trim() || "Link shared on confirm"
      : slot.location?.trim() || "Location on profile";

  return (
    <>
      <span className="font-semibold" style={{ color: "var(--color-dark)" }}>
        {formatHourLabel(hour)} – {formatHourLabel(hour + 1)} IST
      </span>
      <span className="text-gray-500 ml-2">{typeLabel}</span>
      <span className="block text-xs text-gray-500 mt-0.5">{place}</span>
    </>
  );
}

export default function Plan121sClient({ initial }: Props) {
  const [entries, setEntries] = useState(initial);
  const [viewMode, setViewMode] = useState<ViewMode>("date");
  const [search, setSearch] = useState("");
  const [booking, setBooking] = useState<BookingTarget | null>(null);

  const refresh = useCallback(async () => {
    setEntries(await fetchPlan121AvailabilityAction());
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return entries;
    return entries.filter(
      (e) =>
        e.host.name.toLowerCase().includes(q) ||
        e.host.category.toLowerCase().includes(q) ||
        e.host.slug.toLowerCase().includes(q)
    );
  }, [entries, search]);

  const byDate = useMemo(() => {
    const map = new Map<string, Plan121Entry[]>();
    for (const entry of filtered) {
      const list = map.get(entry.slot.slot_date) ?? [];
      list.push(entry);
      map.set(entry.slot.slot_date, list);
    }
    for (const list of map.values()) {
      list.sort((a, b) => a.slot.start_time.localeCompare(b.slot.start_time));
    }
    return [...map.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [filtered]);

  const byMember = useMemo(() => {
    const map = new Map<string, Plan121Entry[]>();
    for (const entry of filtered) {
      const list = map.get(entry.host.id) ?? [];
      list.push(entry);
      map.set(entry.host.id, list);
    }
    const groups = [...map.values()];
    for (const list of groups) {
      list.sort((a, b) => {
        const d = a.slot.slot_date.localeCompare(b.slot.slot_date);
        if (d !== 0) return d;
        return a.slot.start_time.localeCompare(b.slot.start_time);
      });
    }
    return groups.sort((a, b) => a[0].host.name.localeCompare(b[0].host.name));
  }, [filtered]);

  const openBook = (entry: Plan121Entry) => {
    setBooking({ slot: entry.slot, hostName: entry.host.name });
  };

  const handleBookSuccess = () => {
    void refresh();
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by member or category…"
          className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm"
        />
        <div className="flex rounded-xl border border-gray-200 overflow-hidden text-xs font-semibold shrink-0">
          <button
            type="button"
            onClick={() => setViewMode("date")}
            className="px-4 py-2.5"
            style={{
              background: viewMode === "date" ? "var(--color-primary)" : "white",
              color: viewMode === "date" ? "white" : "var(--color-dark)",
            }}
          >
            By date
          </button>
          <button
            type="button"
            onClick={() => setViewMode("member")}
            className="px-4 py-2.5 border-l border-gray-200"
            style={{
              background: viewMode === "member" ? "var(--color-primary)" : "white",
              color: viewMode === "member" ? "white" : "var(--color-dark)",
            }}
          >
            By member
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div
          className="rounded-2xl p-10 text-center"
          style={{ background: "white", border: "1.5px solid #E5E7EB" }}
        >
          <p className="text-4xl mb-3" aria-hidden>
            📅
          </p>
          <p className="font-semibold text-sm" style={{ color: "var(--color-dark)" }}>
            {search ? "No matching availability" : "No open 1-2-1 slots right now"}
          </p>
          <p className="text-xs text-gray-500 mt-2 max-w-sm mx-auto">
            {search
              ? "Try a different name or clear the search."
              : "Members can add availability from My 1-2-1 Calendar. Check back soon."}
          </p>
        </div>
      ) : viewMode === "date" ? (
        <div className="space-y-6">
          {byDate.map(([date, dayEntries]) => (
            <section
              key={date}
              className="rounded-2xl overflow-hidden"
              style={{ background: "white", border: "1.5px solid #E5E7EB" }}
            >
              <h2
                className="px-4 py-3 text-sm font-bold border-b border-gray-100"
                style={{ color: "var(--color-dark)", background: "#F9FAFB" }}
              >
                {formatProfileDate(date)}
                <span className="font-normal text-gray-500 ml-2">
                  {dayEntries.length} slot{dayEntries.length !== 1 ? "s" : ""}
                </span>
              </h2>
              <ul className="divide-y divide-gray-100">
                {dayEntries.map((entry) => (
                  <li
                    key={entry.slot.id}
                    className="flex flex-col sm:flex-row sm:items-center gap-3 px-4 py-3"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <HostAvatar host={entry.host} />
                      <div className="min-w-0">
                        <Link
                          href={`/members/${entry.host.slug}`}
                          className="font-semibold text-sm hover:underline"
                          style={{ color: "var(--color-dark)" }}
                        >
                          {entry.host.name}
                        </Link>
                        <p className="text-xs text-gray-500 truncate">{entry.host.category}</p>
                        <div className="text-sm mt-1">
                          <SlotMeta slot={entry.slot} />
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => openBook(entry)}
                      className="btn-primary text-sm shrink-0 w-full sm:w-auto"
                    >
                      Schedule
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {byMember.map((memberEntries) => {
            const host = memberEntries[0].host;
            const slotsByDate = groupSlotsByDate(memberEntries.map((e) => e.slot));
            return (
              <article
                key={host.id}
                className="rounded-2xl overflow-hidden"
                style={{ background: "white", border: "1.5px solid #E5E7EB" }}
              >
                <div
                  className="flex items-center gap-3 px-4 py-3 border-b border-gray-100"
                  style={{ background: "#F0FDF4" }}
                >
                  <HostAvatar host={host} />
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/members/${host.slug}`}
                      className="font-bold text-sm hover:underline"
                      style={{ color: "var(--color-dark)" }}
                    >
                      {host.name}
                    </Link>
                    <p className="text-xs text-gray-500 truncate">{host.category}</p>
                  </div>
                  <span className="text-xs font-semibold text-green-700 shrink-0">
                    {memberEntries.length} open
                  </span>
                </div>
                <div className="p-4 space-y-4 max-h-80 overflow-y-auto">
                  {Array.from(slotsByDate.entries()).map(([date, slots]) => (
                    <div key={date}>
                      <p className="text-xs font-semibold text-green-700 mb-2">
                        {formatProfileDate(date)}
                      </p>
                      <ul className="space-y-2">
                        {slots.map((slot) => {
                          const entry = memberEntries.find((e) => e.slot.id === slot.id)!;
                          return (
                            <li
                              key={slot.id}
                              className="flex items-start justify-between gap-2 rounded-lg px-3 py-2"
                              style={{ background: "#F9FAFB", border: "1px solid #E5E7EB" }}
                            >
                              <div className="text-sm min-w-0">
                                <SlotMeta slot={slot} />
                              </div>
                              <button
                                type="button"
                                onClick={() => openBook(entry)}
                                className="text-xs font-semibold shrink-0 px-3 py-1.5 rounded-lg text-white"
                                style={{ background: "var(--color-primary)" }}
                              >
                                Book
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  ))}
                </div>
              </article>
            );
          })}
        </div>
      )}

      <Book121Modal
        open={!!booking}
        hostName={booking?.hostName ?? ""}
        slot={booking?.slot ?? null}
        onClose={() => setBooking(null)}
        onSuccess={handleBookSuccess}
      />
    </>
  );
}
