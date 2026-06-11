"use client";

import { useCallback, useMemo, useState } from "react";
import {
  deleteAvailabilitySlotAction,
  fetchMy121CalendarAction,
  getRequestDanceCardLinksAction,
} from "@/app/actions/one-on-one";
import AvailabilitySlotForm from "@/components/members/AvailabilitySlotForm";
import HostRequestsPanel from "@/components/members/HostRequestsPanel";
import OneOnOneCalendar from "@/components/members/OneOnOneCalendar";
import { formatHourLabel, formatSlotSummary, parseStartTime } from "@/lib/one-on-one";
import type { OneOnOneRequest, OneOnOneSlot } from "@/lib/supabase";

type Props = {
  memberId: string;
  initial: {
    asHost: OneOnOneRequest[];
    asRequester: OneOnOneRequest[];
    hostSlots: OneOnOneSlot[];
  };
};

function slotFromRequest(req: OneOnOneRequest) {
  const s = req.one_on_one_slots;
  if (!s || Array.isArray(s)) return null;
  return s;
}

export default function My121Client({ memberId, initial }: Props) {
  const [data, setData] = useState(initial);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setData(await fetchMy121CalendarAction(memberId));
  }, [memberId]);

  const allRequests = useMemo(
    () => [...data.asHost, ...data.asRequester],
    [data.asHost, data.asRequester]
  );

  const removeSlot = async (slotId: string) => {
    setDeletingId(slotId);
    await deleteAvailabilitySlotAction(slotId, memberId);
    setDeletingId(null);
    await refresh();
  };

  const slotsOnSelectedDate = selectedDate
    ? data.hostSlots.filter((s) => s.slot_date === selectedDate)
    : [];

  return (
    <>
      <section
        className="px-6 text-center"
        style={{ background: "var(--color-dark)", paddingTop: 100, paddingBottom: 48 }}
      >
        <p
          className="text-sm font-semibold tracking-widest uppercase mb-3"
          style={{ color: "var(--color-accent)" }}
        >
          Member Self-Service
        </p>
        <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-3">My 1-2-1 Calendar</h1>
        <p className="text-white/60 text-sm max-w-lg mx-auto">
          Add your availability, review requests, and see every 1-2-1 on your schedule.
        </p>
      </section>

      <section className="py-12 px-6" style={{ background: "var(--color-bg)" }}>
        <div style={{ maxWidth: 960, margin: "0 auto" }} className="space-y-8">
          <AvailabilitySlotForm hostMemberId={memberId} onCreated={refresh} />

          <HostRequestsPanel requests={data.asHost} onUpdate={refresh} />

          <div className="grid lg:grid-cols-2 gap-6">
            <OneOnOneCalendar
              slots={data.hostSlots}
              requests={allRequests}
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
            />

            <div className="space-y-4">
              {selectedDate ? (
                <div className="rounded-2xl p-4" style={{ background: "white", border: "1.5px solid #E5E7EB" }}>
                  <h3 className="font-bold text-sm mb-3" style={{ color: "var(--color-dark)" }}>
                    Your slots on {selectedDate}
                  </h3>
                  {slotsOnSelectedDate.length === 0 ? (
                    <p className="text-xs text-gray-500">No slots on this day.</p>
                  ) : (
                    <ul className="space-y-2">
                      {slotsOnSelectedDate.map((slot) => (
                        <li
                          key={slot.id}
                          className="flex items-center justify-between gap-2 text-sm rounded-lg px-3 py-2"
                          style={{ background: "#F9FAFB" }}
                        >
                          <span>
                            {formatHourLabel(parseStartTime(slot.start_time))} ·{" "}
                            <span
                              className="text-xs font-semibold uppercase"
                              style={{
                                color:
                                  slot.status === "open"
                                    ? "#16A34A"
                                    : slot.status === "booked"
                                      ? "var(--color-primary)"
                                      : "#9CA3AF",
                              }}
                            >
                              {slot.status}
                            </span>
                          </span>
                          {slot.status === "open" && (
                            <button
                              type="button"
                              disabled={deletingId === slot.id}
                              onClick={() => removeSlot(slot.id)}
                              className="text-xs text-red-600 hover:underline"
                            >
                              {deletingId === slot.id ? "…" : "Remove"}
                            </button>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ) : (
                <p className="text-sm text-gray-500 rounded-2xl p-4" style={{ background: "white", border: "1.5px solid #E5E7EB" }}>
                  Select a date on the calendar to view or remove your slots.
                </p>
              )}

              <MeetingList
                title="Attending"
                empty="No meetings as a guest."
                requests={data.asRequester.filter((r) => r.status === "accepted")}
                role="requester"
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function MeetingList({
  title,
  empty,
  requests,
  role,
}: {
  title: string;
  empty: string;
  requests: OneOnOneRequest[];
  role: "host" | "requester";
}) {
  return (
    <div className="rounded-2xl p-4" style={{ background: "white", border: "1.5px solid #E5E7EB" }}>
      <h3 className="font-bold text-sm mb-3" style={{ color: "var(--color-dark)" }}>
        {title}
      </h3>
      {requests.length === 0 ? (
        <p className="text-xs text-gray-500">{empty}</p>
      ) : (
        <ul className="space-y-3">
          {requests.map((req) => (
            <MeetingRow key={req.id} request={req} role={role} />
          ))}
        </ul>
      )}
    </div>
  );
}

function MeetingRow({ request, role }: { request: OneOnOneRequest; role: "host" | "requester" }) {
  const slot = slotFromRequest(request);
  const [links, setLinks] = useState<{
    hostHasCard: boolean;
    requesterHasCard: boolean;
    requesterUploadUrl: string | null;
  } | null>(null);

  const label =
    role === "host"
      ? `${request.requester_name} (${request.requester_chapter})`
      : "With host";

  return (
    <li className="rounded-lg p-3 text-sm" style={{ background: "#F9FAFB" }}>
      <p className="font-semibold">{label}</p>
      {slot && <p className="text-xs text-gray-500 mt-1">{formatSlotSummary(slot)}</p>}
      <div className="flex flex-wrap gap-2 mt-2">
        <a
          href={`/api/121-ics/${request.id}`}
          className="text-xs font-semibold"
          style={{ color: "var(--color-primary)" }}
        >
          .ics
        </a>
        <button
          type="button"
          onClick={async () => {
            const res = await getRequestDanceCardLinksAction(request.id);
            if (!res.error) {
              setLinks({
                hostHasCard: res.hostHasCard,
                requesterHasCard: res.requesterHasCard,
                requesterUploadUrl: res.requesterUploadUrl,
              });
            }
          }}
          className="text-xs font-semibold text-gray-600"
        >
          Dance cards
        </button>
        {links?.requesterUploadUrl && (
          <a href={links.requesterUploadUrl} target="_blank" rel="noopener noreferrer" className="text-xs">
            PDF
          </a>
        )}
        {links?.hostHasCard && role === "host" && (
          <a href="/api/dance-card-pdf" target="_blank" rel="noopener noreferrer" className="text-xs">
            Your card
          </a>
        )}
      </div>
    </li>
  );
}
