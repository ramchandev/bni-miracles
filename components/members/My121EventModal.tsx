"use client";

import { useEffect } from "react";
import My121EventDetail from "@/components/members/My121EventDetail";
import type { My121CalendarEvent } from "@/lib/my-121-calendar";

type Props = {
  open: boolean;
  event: My121CalendarEvent | null;
  onClose: () => void;
  onUpdate: () => void | Promise<void>;
  onRemoveSlot?: (slotId: string) => void | Promise<void>;
  removingSlotId?: string | null;
};

export default function My121EventModal({
  open,
  event,
  onClose,
  onUpdate,
  onRemoveSlot,
  removingSlotId,
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

  if (!open || !event) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/50"
        aria-label="Close meeting details"
        onClick={onClose}
      />
      <div
        className="relative w-full sm:max-w-md max-h-[92vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl shadow-xl"
        role="dialog"
        aria-modal="true"
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
        <My121EventDetail
          event={event}
          onUpdate={onUpdate}
          onRemoveSlot={onRemoveSlot}
          removingSlotId={removingSlotId}
        />
      </div>
    </div>
  );
}
