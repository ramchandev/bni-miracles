"use client";

import { useEffect, useState } from "react";
import { createAvailabilitySlotAction } from "@/app/actions/one-on-one";
import { useToast } from "@/components/Toast";
import {
  formatHourLabel,
  formatProfileDate,
  kolkataDateString,
  parseStartTime,
  SLOT_HOURS,
} from "@/lib/one-on-one";
import type { OneOnOneMeetingType, OneOnOneSlot } from "@/lib/supabase";

type Props = {
  hostMemberId: string;
  onCreated: (slot: OneOnOneSlot) => void;
  initialSlotDate?: string;
  initialStartHour?: number;
  onCancel?: () => void;
  variant?: "card" | "plain";
};

export default function AvailabilitySlotForm({
  hostMemberId,
  onCreated,
  initialSlotDate,
  initialStartHour,
  onCancel,
  variant = "card",
}: Props) {
  const showToast = useToast();
  const today = kolkataDateString();
  const [slotDate, setSlotDate] = useState(initialSlotDate ?? today);
  const [startHour, setStartHour] = useState<number>(initialStartHour ?? 9);
  const [meetingType, setMeetingType] = useState<OneOnOneMeetingType>("in_person");
  const [location, setLocation] = useState("");
  const [meetingUrl, setMeetingUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (initialSlotDate) setSlotDate(initialSlotDate);
    if (initialStartHour != null) setStartHour(initialStartHour);
  }, [initialSlotDate, initialStartHour]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    const res = await createAvailabilitySlotAction({
      hostMemberId,
      slotDate,
      startHour,
      meetingType,
      location: meetingType === "in_person" ? location : undefined,
      meetingUrl: meetingType === "online" ? meetingUrl : undefined,
    });
    setSaving(false);
    if (res.error) setError(res.error);
    else if (res.slot) {
      const hour = parseStartTime(res.slot.start_time);
      showToast(
        `Slot created — ${formatProfileDate(res.slot.slot_date)}, ${formatHourLabel(hour)} – ${formatHourLabel(hour + 1)} IST`
      );
      onCreated(res.slot);
      setLocation("");
      setMeetingUrl("");
      if (!initialSlotDate) {
        setSlotDate(today);
        setStartHour(9);
      }
    }
  };

  const formClass =
    variant === "card"
      ? "rounded-2xl p-5 space-y-4"
      : "p-5 sm:p-6 space-y-4 bg-white";

  return (
    <form
      onSubmit={submit}
      className={formClass}
      style={
        variant === "card"
          ? { background: "#F9FAFB", border: "1.5px solid #E5E7EB" }
          : undefined
      }
    >
      {variant === "card" && (
        <h3 className="font-bold text-sm" style={{ color: "var(--color-dark)" }}>
          Add availability
        </h3>
      )}

      <div className="grid sm:grid-cols-2 gap-3">
        <label className="block text-xs font-semibold text-gray-500">
          Date
          <input
            type="date"
            value={slotDate}
            min={today}
            onChange={(e) => setSlotDate(e.target.value)}
            className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
            required
          />
        </label>
        <label className="block text-xs font-semibold text-gray-500">
          Start time (1 hour)
          <select
            value={startHour}
            onChange={(e) => setStartHour(parseInt(e.target.value, 10))}
            className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
          >
            {SLOT_HOURS.map((h) => (
              <option key={h} value={h}>
                {formatHourLabel(h)} – {formatHourLabel(h + 1)}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="flex gap-2">
        {(["in_person", "online"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setMeetingType(t)}
            className="flex-1 py-2 rounded-lg text-xs font-semibold border transition-colors"
            style={{
              borderColor: meetingType === t ? "var(--color-primary)" : "#E5E7EB",
              background: meetingType === t ? "#FEE2E2" : "white",
              color: meetingType === t ? "var(--color-primary)" : "var(--color-gray)",
            }}
          >
            {t === "in_person" ? "In person" : "Online"}
          </button>
        ))}
      </div>

      {meetingType === "in_person" ? (
        <label className="block text-xs font-semibold text-gray-500">
          Location
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g. Our usual meeting place"
            className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
            required
          />
        </label>
      ) : (
        <label className="block text-xs font-semibold text-gray-500">
          Meeting link <span className="font-normal text-gray-400">(optional)</span>
          <input
            type="url"
            value={meetingUrl}
            onChange={(e) => setMeetingUrl(e.target.value)}
            placeholder="https://zoom.us/… or leave blank"
            className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
          />
        </label>
      )}

      {error && <p className="text-xs text-red-600">{error}</p>}

      <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="text-sm font-semibold text-gray-500 hover:text-gray-700 py-2 px-4"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={saving}
          className="btn-primary text-sm w-full sm:w-auto sm:ml-auto"
        >
          {saving ? "Adding…" : "Add slot"}
        </button>
      </div>
    </form>
  );
}
