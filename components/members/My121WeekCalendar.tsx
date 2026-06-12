"use client";

import { useMemo, useState } from "react";
import {
  addKolkataDays,
  calendarStatusForDate,
  formatHourLabel,
  formatKolkataDayHeader,
  formatKolkataMonthYear,
  formatKolkataWeekRange,
  kolkataDateString,
  kolkataDayOfWeek,
  kolkataWeekDates,
  kolkataWeekStart,
  kolkataYearMonth,
  SLOT_HOURS,
} from "@/lib/one-on-one";
import {
  CALENDAR_END_HOUR,
  CALENDAR_HOUR_HEIGHT,
  CALENDAR_START_HOUR,
  EVENT_STYLES,
  buildMy121CalendarEvents,
  eventTimeLabel,
  eventsForDate,
  layoutDayEvents,
  type My121CalendarEvent,
} from "@/lib/my-121-calendar";
import type { OneOnOneRequest, OneOnOneSlot } from "@/lib/supabase";

const STATUS_DOT: Record<string, string> = {
  open: "#16A34A",
  pending: "#D97706",
  confirmed: "#C8102E",
};

type Props = {
  memberId: string;
  hostSlots: OneOnOneSlot[];
  asHost: OneOnOneRequest[];
  asRequester: OneOnOneRequest[];
  selectedEventId: string | null;
  onSelectEvent: (event: My121CalendarEvent | null) => void;
};

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

function toDateStr(y: number, m: number, d: number) {
  return `${y}-${pad(m + 1)}-${pad(d)}`;
}

export default function My121WeekCalendar({
  memberId,
  hostSlots,
  asHost,
  asRequester,
  selectedEventId,
  onSelectEvent,
}: Props) {
  const todayStr = kolkataDateString();
  const [weekStart, setWeekStart] = useState(() => kolkataWeekStart());
  const [viewMode, setViewMode] = useState<"week" | "day">("week");
  const [focusDay, setFocusDay] = useState(() => todayStr);
  const [miniMonth, setMiniMonth] = useState(() => kolkataYearMonth());

  const allRequests = useMemo(() => [...asHost, ...asRequester], [asHost, asRequester]);
  const events = useMemo(
    () => buildMy121CalendarEvents(memberId, hostSlots, asHost, asRequester),
    [memberId, hostSlots, asHost, asRequester]
  );

  const weekDates = useMemo(() => kolkataWeekDates(weekStart), [weekStart]);
  const displayDates = viewMode === "week" ? weekDates : [focusDay];

  const gridHeight = SLOT_HOURS.length * CALENDAR_HOUR_HEIGHT;

  const goToday = () => {
    const today = kolkataDateString();
    setWeekStart(kolkataWeekStart(today));
    setFocusDay(today);
    setMiniMonth(kolkataYearMonth());
  };

  const shiftWeek = (delta: number) => {
    const newStart = addKolkataDays(weekStart, delta * 7);
    setWeekStart(newStart);
    if (viewMode === "day") {
      setFocusDay(addKolkataDays(focusDay, delta * 7));
    }
    setMiniMonth(kolkataYearMonth(newStart));
  };

  const pickMiniDay = (dateStr: string) => {
    setWeekStart(kolkataWeekStart(dateStr));
    setFocusDay(dateStr);
    setMiniMonth(kolkataYearMonth(dateStr));
    onSelectEvent(null);
  };

  const miniCells = useMemo(() => {
    const { year, month } = miniMonth;
    const firstStr = toDateStr(year, month, 1);
    const startPad = kolkataDayOfWeek(firstStr);
    const nextMonth = month === 11 ? { year: year + 1, month: 0 } : { year, month: month + 1 };
    const lastDay = addKolkataDays(toDateStr(nextMonth.year, nextMonth.month, 1), -1);
    const dayCount = parseInt(lastDay.slice(8), 10);
    const out: { date: string | null }[] = [];
    for (let i = 0; i < startPad; i++) out.push({ date: null });
    for (let d = 1; d <= dayCount; d++) {
      out.push({ date: toDateStr(year, month, d) });
    }
    return out;
  }, [miniMonth]);

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: "white", border: "1.5px solid #E5E7EB" }}>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={goToday}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50"
          >
            Today
          </button>
          <button
            type="button"
            onClick={() => shiftWeek(-1)}
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100"
            aria-label="Previous week"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={() => shiftWeek(1)}
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100"
            aria-label="Next week"
          >
            ›
          </button>
          <span className="text-sm font-bold" style={{ color: "var(--color-dark)" }}>
            {viewMode === "week" ? formatKolkataWeekRange(weekStart) : formatKolkataDayHeader(focusDay)}
          </span>
        </div>
        <div className="flex rounded-lg border border-gray-200 overflow-hidden text-xs font-semibold">
          <button
            type="button"
            onClick={() => setViewMode("week")}
            className="px-3 py-1.5"
            style={{
              background: viewMode === "week" ? "var(--color-primary)" : "white",
              color: viewMode === "week" ? "white" : "var(--color-dark)",
            }}
          >
            Week
          </button>
          <button
            type="button"
            onClick={() => setViewMode("day")}
            className="px-3 py-1.5 border-l border-gray-200"
            style={{
              background: viewMode === "day" ? "var(--color-primary)" : "white",
              color: viewMode === "day" ? "white" : "var(--color-dark)",
            }}
          >
            Day
          </button>
        </div>
      </div>

      {/* Mini month */}
      <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/80">
        <div className="flex items-center justify-between mb-2">
          <button
            type="button"
            onClick={() =>
              setMiniMonth((m) =>
                m.month === 0 ? { year: m.year - 1, month: 11 } : { year: m.year, month: m.month - 1 }
              )
            }
            className="text-gray-500 hover:text-gray-800 px-1"
            aria-label="Previous month"
          >
            ‹
          </button>
          <span className="text-xs font-bold" style={{ color: "var(--color-dark)" }}>
            {formatKolkataMonthYear(miniMonth.year, miniMonth.month)}
          </span>
          <button
            type="button"
            onClick={() =>
              setMiniMonth((m) =>
                m.month === 11 ? { year: m.year + 1, month: 0 } : { year: m.year, month: m.month + 1 }
              )
            }
            className="text-gray-500 hover:text-gray-800 px-1"
            aria-label="Next month"
          >
            ›
          </button>
        </div>
        <div className="grid grid-cols-7 gap-0.5 text-center">
          {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
            <div key={`${d}-${i}`} className="text-[9px] font-semibold text-gray-400 py-0.5">
              {d}
            </div>
          ))}
          {miniCells.map((cell, i) => {
            if (!cell.date) return <div key={`e-${i}`} />;
            const inWeek = weekDates.includes(cell.date);
            const isToday = cell.date === todayStr;
            const status = calendarStatusForDate(cell.date, hostSlots, allRequests);
            const dot = status !== "none" ? STATUS_DOT[status] : null;
            return (
              <button
                key={cell.date}
                type="button"
                onClick={() => pickMiniDay(cell.date!)}
                className="relative text-[10px] font-semibold rounded-md py-1 hover:bg-white transition-colors"
                style={{
                  background: inWeek ? "white" : "transparent",
                  color: isToday ? "var(--color-primary)" : "var(--color-dark)",
                  outline: focusDay === cell.date ? "2px solid var(--color-primary)" : "none",
                }}
              >
                {parseInt(cell.date.slice(8), 10)}
                {dot && (
                  <span
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                    style={{ background: dot }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Time grid */}
      <div className="overflow-x-auto">
        <div style={{ minWidth: viewMode === "week" ? 720 : 280 }}>
          {/* Day headers */}
          <div className="flex border-b border-gray-100 sticky top-0 bg-white z-10">
            <div className="w-14 shrink-0" />
            {displayDates.map((date) => {
              const isToday = date === todayStr;
              return (
                <button
                  key={date}
                  type="button"
                  onClick={() => {
                    setFocusDay(date);
                    if (viewMode === "day") onSelectEvent(null);
                  }}
                  className="flex-1 min-w-[72px] py-2 text-center border-l border-gray-100 hover:bg-gray-50"
                >
                  <p
                    className="text-[10px] font-semibold uppercase text-gray-400"
                  >
                    {formatKolkataDayHeader(date).split(" ")[0]}
                  </p>
                  <p
                    className="text-sm font-bold mt-0.5 w-7 h-7 mx-auto rounded-full flex items-center justify-center"
                    style={{
                      background: isToday ? "var(--color-primary)" : "transparent",
                      color: isToday ? "white" : "var(--color-dark)",
                    }}
                  >
                    {parseInt(date.slice(8), 10)}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Grid body */}
          <div className="flex">
            <div className="w-14 shrink-0 relative" style={{ height: gridHeight }}>
              {SLOT_HOURS.map((h) => (
                <div
                  key={h}
                  className="absolute w-full text-[10px] text-gray-400 text-right pr-2 -translate-y-2"
                  style={{ top: (h - CALENDAR_START_HOUR) * CALENDAR_HOUR_HEIGHT }}
                >
                  {formatHourLabel(h)}
                </div>
              ))}
              <div
                className="absolute w-full text-[10px] text-gray-400 text-right pr-2"
                style={{ top: gridHeight - 4 }}
              >
                {formatHourLabel(CALENDAR_END_HOUR)}
              </div>
            </div>

            {displayDates.map((date) => {
              const dayEvents = layoutDayEvents(eventsForDate(events, date));
              return (
                <div
                  key={date}
                  className="flex-1 min-w-[72px] relative border-l border-gray-100"
                  style={{ height: gridHeight }}
                >
                  {SLOT_HOURS.map((h) => (
                    <div
                      key={h}
                      className="absolute w-full border-t border-gray-100"
                      style={{ top: (h - CALENDAR_START_HOUR) * CALENDAR_HOUR_HEIGHT }}
                    />
                  ))}

                  {dayEvents.map((ev) => {
                    const es = EVENT_STYLES[ev.kind];
                    const selected = selectedEventId === ev.id;
                    return (
                      <button
                        key={ev.id}
                        type="button"
                        onClick={() => onSelectEvent(selected ? null : ev)}
                        className="absolute rounded-md px-1.5 py-1 text-left overflow-hidden transition-shadow hover:brightness-95"
                        style={{
                          top: (ev.startHour - CALENDAR_START_HOUR) * CALENDAR_HOUR_HEIGHT + 2,
                          height: CALENDAR_HOUR_HEIGHT - 4,
                          left: `calc(${(ev.lane / ev.laneCount) * 100}% + 2px)`,
                          width: `calc(${100 / ev.laneCount}% - 4px)`,
                          background: es.bg,
                          borderLeft: `3px solid ${es.border}`,
                          color: es.text,
                          boxShadow: selected ? `0 0 0 2px ${es.border}` : "none",
                          zIndex: selected ? 2 : 1,
                        }}
                      >
                        <span className="text-[10px] font-bold block truncate leading-tight">
                          {ev.title}
                        </span>
                        <span className="text-[9px] block truncate opacity-80 leading-tight">
                          {eventTimeLabel(ev.startHour)}
                        </span>
                        {ev.kind !== "open" && (
                          <span className="text-[8px] block truncate opacity-70 leading-tight">
                            {ev.subtitle}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-x-4 gap-y-2 px-4 py-3 border-t border-gray-100 text-[10px] text-gray-500">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded" style={{ background: EVENT_STYLES.open.bg, borderLeft: `3px solid ${EVENT_STYLES.open.border}` }} />
          Available
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded" style={{ background: EVENT_STYLES.pending_host.bg, borderLeft: `3px solid ${EVENT_STYLES.pending_host.border}` }} />
          Pending (host)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded" style={{ background: EVENT_STYLES.confirmed_host.bg, borderLeft: `3px solid ${EVENT_STYLES.confirmed_host.border}` }} />
          Confirmed (host)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded" style={{ background: EVENT_STYLES.confirmed_guest.bg, borderLeft: `3px solid ${EVENT_STYLES.confirmed_guest.border}` }} />
          Attending
        </span>
      </div>
    </div>
  );
}
