"use client";

import { useEffect, useState } from "react";
import { bvdEventStartMs } from "@/lib/bvd-format";

type Parts = { days: number; hours: number; minutes: number; seconds: number };

function calc(targetMs: number): Parts | null {
  const diff = targetMs - Date.now();
  if (diff <= 0) return null;
  const days = Math.floor(diff / 86_400_000);
  const hours = Math.floor((diff % 86_400_000) / 3_600_000);
  const minutes = Math.floor((diff % 3_600_000) / 60_000);
  const seconds = Math.floor((diff % 60_000) / 1000);
  return { days, hours, minutes, seconds };
}

export default function BvdCountdown({ eventDate }: { eventDate: string }) {
  const targetMs = bvdEventStartMs(eventDate);
  // null until mount — avoids SSR/client Date.now() hydration mismatch
  const [parts, setParts] = useState<Parts | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
    setParts(calc(targetMs));
    const id = setInterval(() => setParts(calc(targetMs)), 1000);
    return () => clearInterval(id);
  }, [targetMs]);

  if (!ready) {
    return (
      <div className="mt-8 flex flex-col items-center" aria-hidden>
        <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest mb-3.5 text-white/50">
          Securing Seats - Event Starts In
        </span>
        <div className="flex items-center justify-center gap-3 sm:gap-4">
          {["Days", "Hours", "Mins", "Secs"].map((label) => (
            <div
              key={label}
              className="flex flex-col items-center min-w-[70px] sm:min-w-[80px] rounded-2xl px-3 py-3.5 bg-white/5 border border-white/10"
            >
              <span className="text-3xl sm:text-4xl font-black text-white/30 tabular-nums">--</span>
              <span className="text-[9px] sm:text-[10px] font-extrabold uppercase tracking-widest mt-1.5 text-white/40">
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!parts) {
    return (
      <div className="mt-8 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20">
        <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
        <p className="text-sm font-bold text-amber-300">
          The event is happening now — or has just started!
        </p>
      </div>
    );
  }

  const cells = [
    { label: "Days", value: parts.days },
    { label: "Hours", value: parts.hours },
    { label: "Mins", value: parts.minutes },
    { label: "Secs", value: parts.seconds },
  ];

  return (
    <div className="mt-8 flex flex-col items-center">
      <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest mb-3.5 text-white/50 flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        Securing Seats - Event Starts In
      </span>

      <div className="flex items-center justify-center gap-3 sm:gap-4">
        {cells.map((c) => (
          <div
            key={c.label}
            className="flex flex-col items-center min-w-[70px] sm:min-w-[80px] rounded-2xl px-3 py-3.5 backdrop-blur-md bg-white/5 border border-white/10 shadow-2xl transition-all duration-300 hover:bg-white/10 hover:border-white/20"
          >
            <span className="text-3xl sm:text-4xl font-black text-white tracking-tight tabular-nums bg-gradient-to-b from-white to-gray-300 bg-clip-text text-transparent">
              {String(c.value).padStart(2, "0")}
            </span>
            <span className="text-[9px] sm:text-[10px] font-extrabold uppercase tracking-widest mt-1.5 text-white/40">
              {c.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
