"use client";

import { useCallback, useMemo, useState } from "react";
import {
  deleteAvailabilitySlotAction,
  fetchMy121CalendarAction,
} from "@/app/actions/one-on-one";
import AvailabilitySlotForm from "@/components/members/AvailabilitySlotForm";
import { ToastProvider } from "@/components/Toast";
import My121EventDetail from "@/components/members/My121EventDetail";
import My121WeekCalendar from "@/components/members/My121WeekCalendar";
import { buildMy121CalendarEvents, type My121CalendarEvent } from "@/lib/my-121-calendar";
import type { OneOnOneRequest, OneOnOneSlot } from "@/lib/supabase";

type Props = {
  memberId: string;
  initial: {
    asHost: OneOnOneRequest[];
    asRequester: OneOnOneRequest[];
    hostSlots: OneOnOneSlot[];
  };
};

export default function My121Client({ memberId, initial }: Props) {
  const [data, setData] = useState(initial);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const next = await fetchMy121CalendarAction(memberId);
    setData(next);
    setSelectedEventId((prev) => {
      if (!prev) return null;
      const events = buildMy121CalendarEvents(
        memberId,
        next.hostSlots,
        next.asHost,
        next.asRequester
      );
      return events.some((e) => e.id === prev) ? prev : null;
    });
  }, [memberId]);

  const events = useMemo(
    () => buildMy121CalendarEvents(memberId, data.hostSlots, data.asHost, data.asRequester),
    [memberId, data.hostSlots, data.asHost, data.asRequester]
  );

  const selectedEvent = useMemo(
    () => events.find((e) => e.id === selectedEventId) ?? null,
    [events, selectedEventId]
  );

  const pendingHostCount = data.asHost.filter((r) => r.status === "pending").length;

  const removeSlot = async (slotId: string) => {
    setDeletingId(slotId);
    await deleteAvailabilitySlotAction(slotId, memberId);
    setDeletingId(null);
    setSelectedEventId(null);
    await refresh();
  };

  const handleSelectEvent = (event: My121CalendarEvent | null) => {
    setSelectedEventId(event?.id ?? null);
  };

  return (
    <ToastProvider>
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
        <div style={{ maxWidth: 1200, margin: "0 auto" }} className="space-y-6">
          <AvailabilitySlotForm hostMemberId={memberId} onCreated={refresh} />

          {pendingHostCount > 0 && (
            <div
              className="rounded-xl px-4 py-3 text-sm font-medium"
              style={{ background: "#FEF3C7", border: "1.5px solid #FDE68A", color: "#92400E" }}
            >
              {pendingHostCount} pending request{pendingHostCount > 1 ? "s" : ""} — click the amber
              blocks on your calendar to accept or decline.
            </div>
          )}

          <div className="grid lg:grid-cols-3 gap-6 items-start">
            <div className="lg:col-span-2">
              <My121WeekCalendar
                memberId={memberId}
                hostSlots={data.hostSlots}
                asHost={data.asHost}
                asRequester={data.asRequester}
                selectedEventId={selectedEventId}
                onSelectEvent={handleSelectEvent}
              />
            </div>
            <div className="lg:col-span-1 lg:sticky lg:top-24">
              <My121EventDetail
                event={selectedEvent}
                onUpdate={refresh}
                onRemoveSlot={removeSlot}
                removingSlotId={deletingId}
              />
            </div>
          </div>
        </div>
      </section>
    </ToastProvider>
  );
}
