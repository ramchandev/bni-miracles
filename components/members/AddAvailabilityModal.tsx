"use client";

import { useEffect } from "react";
import AvailabilitySlotForm from "@/components/members/AvailabilitySlotForm";
import { formatHourLabel, formatProfileDate } from "@/lib/one-on-one";
import type { OneOnOneSlot } from "@/lib/supabase";

type Props = {
  open: boolean;
  slotDate: string;
  startHour: number;
  hostMemberId: string;
  onClose: () => void;
  onCreated: (slot: OneOnOneSlot) => void;
};

export default function AddAvailabilityModal({
  open,
  slotDate,
  startHour,
  hostMemberId,
  onClose,
  onCreated,
}: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/50"
        aria-label="Close add availability"
        onClick={onClose}
      />
      <div
        className="relative w-full sm:max-w-md max-h-[92vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl shadow-xl bg-white"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-availability-title"
      >
        <div className="sticky top-0 flex justify-end p-2 z-10 sm:absolute sm:right-2 sm:top-2">
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-500 bg-white/90 hover:bg-gray-100 shadow-sm"
            aria-label="Close"
          >
            ×
          </button>
        </div>
        <div className="px-5 pt-4 pb-1 sm:px-6 sm:pt-6">
          <h2
            id="add-availability-title"
            className="font-bold text-base pr-8"
            style={{ color: "var(--color-dark)" }}
          >
            Add availability
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            {formatProfileDate(slotDate)}, {formatHourLabel(startHour)} –{" "}
            {formatHourLabel(startHour + 1)} IST
          </p>
        </div>
        <AvailabilitySlotForm
          key={`${slotDate}-${startHour}`}
          hostMemberId={hostMemberId}
          initialSlotDate={slotDate}
          initialStartHour={startHour}
          onCreated={onCreated}
          onCancel={onClose}
          variant="plain"
        />
      </div>
    </div>
  );
}
