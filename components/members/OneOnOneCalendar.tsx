"use client";

import { useMemo, useState } from "react";
import {
  calendarStatusForDate,
  type CalendarDayStatus,
} from "@/lib/one-on-one";
import type { OneOnOneRequest, OneOnOneSlot } from "@/lib/supabase";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const STATUS_STYLES: Record<CalendarDayStatus, { bg: string; ring: string }> = {
  none: { bg: "transparent", ring: "transparent" },
  open: { bg: "#DCFCE7", ring: "#16A34A" },
  pending: { bg: "#FEF3C7", ring: "#D97706" },
  confirmed: { bg: "#FEE2E2", ring: "#C8102E" },
};

type Props = {
  slots: OneOnOneSlot[];
  requests: OneOnOneRequest[];
  selectedDate: string | null;
  onSelectDate: (date: string | null) => void;
};

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

function toDateStr(y: number, m: number, d: number) {
  return `${y}-${pad(m + 1)}-${pad(d)}`;
}

export default function OneOnOneCalendar({
  slots,
  requests,
  selectedDate,
  onSelectDate,
}: Props) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const cells = useMemo(() => {
    const first = new Date(viewYear, viewMonth, 1);
    const startPad = first.getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const out: { date: string | null; status: CalendarDayStatus }[] = [];

    for (let i = 0; i < startPad; i++) out.push({ date: null, status: "none" });
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = toDateStr(viewYear, viewMonth, d);
      out.push({
        date: dateStr,
        status: calendarStatusForDate(dateStr, slots, requests),
      });
    }
    return out;
  }, [viewYear, viewMonth, slots, requests]);

  const monthLabel = new Date(viewYear, viewMonth, 1).toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  });

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewYear((y) => y - 1);
      setViewMonth(11);
    } else setViewMonth((m) => m - 1);
  };

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewYear((y) => y + 1);
      setViewMonth(0);
    } else setViewMonth((m) => m + 1);
  };

  return (
    <div className="rounded-2xl p-4" style={{ background: "white", border: "1.5px solid #E5E7EB" }}>
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={prevMonth}
          className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100"
          aria-label="Previous month"
        >
          ‹
        </button>
        <p className="font-bold text-sm" style={{ color: "var(--color-dark)" }}>
          {monthLabel}
        </p>
        <button
          type="button"
          onClick={nextMonth}
          className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100"
          aria-label="Next month"
        >
          ›
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-1">
        {WEEKDAYS.map((d) => (
          <div key={d} className="text-center text-[10px] font-semibold text-gray-400 py-1">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((cell, i) => {
          if (!cell.date) return <div key={`empty-${i}`} className="aspect-square" />;
          const isSelected = selectedDate === cell.date;
          const style = STATUS_STYLES[cell.status];
          const isPast =
            new Date(cell.date) < new Date(today.toISOString().slice(0, 10));

          return (
            <button
              key={cell.date}
              type="button"
              disabled={cell.status === "none" && !isSelected}
              onClick={() => onSelectDate(isSelected ? null : cell.date)}
              className="aspect-square rounded-lg text-xs font-semibold transition-all disabled:opacity-40"
              style={{
                background: cell.status !== "none" ? style.bg : isSelected ? "#F3F4F6" : "transparent",
                color: "var(--color-dark)",
                outline: isSelected ? `2px solid var(--color-primary)` : "none",
                boxShadow: cell.status !== "none" ? `inset 0 0 0 1.5px ${style.ring}` : "none",
                opacity: isPast && cell.status === "none" ? 0.35 : 1,
              }}
            >
              {parseInt(cell.date.slice(8), 10)}
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-3 mt-4 pt-3 border-t border-gray-100 text-[10px] text-gray-500">
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded" style={{ background: "#DCFCE7", boxShadow: "inset 0 0 0 1px #16A34A" }} />
          Open
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded" style={{ background: "#FEF3C7", boxShadow: "inset 0 0 0 1px #D97706" }} />
          Pending
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded" style={{ background: "#FEE2E2", boxShadow: "inset 0 0 0 1px #C8102E" }} />
          Confirmed
        </span>
      </div>
    </div>
  );
}
