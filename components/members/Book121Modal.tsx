"use client";

import { useEffect } from "react";
import Book121Form from "@/components/members/Book121Form";
import type { OneOnOneSlot } from "@/lib/supabase";

type Props = {
  open: boolean;
  hostName: string;
  slot: OneOnOneSlot | null;
  onClose: () => void;
  onSuccess: () => void;
};

export default function Book121Modal({ open, hostName, slot, onClose, onSuccess }: Props) {
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

  if (!open || !slot) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/50"
        aria-label="Close booking dialog"
        onClick={onClose}
      />
      <div
        className="relative w-full sm:max-w-md max-h-[92vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="book-121-title"
      >
        <div className="sticky top-0 flex justify-end p-2 bg-white border-b border-gray-100 sm:border-0 sm:absolute sm:right-2 sm:top-2 sm:z-10 sm:bg-transparent">
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-100"
            aria-label="Close"
          >
            ×
          </button>
        </div>
        <Book121Form
          slot={slot}
          hostName={hostName}
          onSuccess={onSuccess}
          onCancel={onClose}
        />
      </div>
    </div>
  );
}
