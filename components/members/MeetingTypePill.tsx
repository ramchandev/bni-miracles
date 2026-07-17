import type { OneOnOneSlot } from "@/lib/supabase";

function OnlineIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden>
      <circle cx="12" cy="12" r="3" />
      <path d="M5 12a7 7 0 0 1 7-7M19 12a7 7 0 0 0-7-7" />
      <path d="M2 12a10 10 0 0 1 10-10M22 12a10 10 0 0 0-10-10" />
    </svg>
  );
}

function InPersonIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden>
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

export default function MeetingTypePill({ meetingType }: { meetingType: OneOnOneSlot["meeting_type"] }) {
  const online = meetingType === "online";
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide shrink-0"
      style={
        online
          ? { background: "#DBEAFE", color: "#1D4ED8" }
          : { background: "#FFEDD5", color: "#C2410C" }
      }
    >
      {online ? <OnlineIcon /> : <InPersonIcon />}
      {online ? "Online" : "In Person"}
    </span>
  );
}
