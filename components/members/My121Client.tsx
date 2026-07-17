"use client";

import { useCallback, useMemo, useState } from "react";
import { deleteAvailabilitySlotAction } from "@/app/actions/one-on-one";
import { fetchMy121CalendarAction } from "@/app/actions/one-on-one-queries";
import AddAvailabilityModal from "@/components/members/AddAvailabilityModal";
import CompletedMeetingsPanel from "@/components/members/CompletedMeetingsPanel";
import UpcomingMeetingsPanel from "@/components/members/UpcomingMeetingsPanel";
import PendingRequestsPanel from "@/components/members/PendingRequestsPanel";
import { ToastProvider } from "@/components/Toast";
import My121EventModal from "@/components/members/My121EventModal";
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
  const [addSlotPrefill, setAddSlotPrefill] = useState<{
    slotDate: string;
    startHour: number;
  } | null>(null);

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

  const removeSlot = async (slotId: string) => {
    setDeletingId(slotId);
    await deleteAvailabilitySlotAction(slotId, memberId);
    setDeletingId(null);
    setSelectedEventId(null);
    await refresh();
  };

  const handleSelectEvent = (event: My121CalendarEvent | null) => {
    if (!event) {
      setSelectedEventId(null);
      return;
    }
    // Pending requests are handled in the sidebar; confirmed/open show in pop-up
    if (event.kind === "pending_host") {
      setSelectedEventId(null);
      return;
    }
    setSelectedEventId(event.id);
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
          Click an empty slot to add availability, review requests, and see every 1-2-1 on your schedule.
        </p>
      </section>

      <section className="py-12 px-6" style={{ background: "var(--color-bg)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div className="grid lg:grid-cols-3 gap-6 items-start">
            <div className="lg:col-span-2 order-2 lg:order-1">
              <My121WeekCalendar
                memberId={memberId}
                hostSlots={data.hostSlots}
                asHost={data.asHost}
                asRequester={data.asRequester}
                selectedEventId={selectedEventId}
                onSelectEvent={handleSelectEvent}
                onEmptySlotClick={(slotDate, startHour) => {
                  setSelectedEventId(null);
                  setAddSlotPrefill({ slotDate, startHour });
                }}
              />
            </div>
            <div className="lg:col-span-1 order-1 lg:order-2 lg:sticky lg:top-24 space-y-4">
              <PendingRequestsPanel requests={data.asHost} onUpdate={refresh} />
              <UpcomingMeetingsPanel
                asHost={data.asHost}
                asRequester={data.asRequester}
                onUpdate={async () => {
                  setSelectedEventId(null);
                  await refresh();
                }}
              />
              <CompletedMeetingsPanel
                asHost={data.asHost}
                asRequester={data.asRequester}
                onUpdate={refresh}
              />
            </div>
          </div>
        </div>
      </section>

      <My121EventModal
        open={!!selectedEvent}
        event={selectedEvent}
        onClose={() => setSelectedEventId(null)}
        onUpdate={refresh}
        onRemoveSlot={removeSlot}
        removingSlotId={deletingId}
      />

      {addSlotPrefill && (
        <AddAvailabilityModal
          open
          slotDate={addSlotPrefill.slotDate}
          startHour={addSlotPrefill.startHour}
          hostMemberId={memberId}
          onClose={() => setAddSlotPrefill(null)}
          onCreated={() => {
            setAddSlotPrefill(null);
            void refresh();
          }}
        />
      )}
    </ToastProvider>
  );
}
