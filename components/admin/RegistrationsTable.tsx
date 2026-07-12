"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteRegistrationAction } from "@/app/admin/actions/registrations";
import type { MeetingRegistration } from "@/lib/supabase";

function formatMeetingDate(str: string) {
  return new Date(str + "T00:00:00").toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatRegisteredOn(str: string) {
  return new Date(str).toLocaleString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatShortMeetingDate(str: string) {
  return new Date(str + "T00:00:00").toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

type Props = {
  registrations: MeetingRegistration[];
};

export default function RegistrationsTable({ registrations }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [viewing, setViewing] = useState<MeetingRegistration | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  function handleDelete(r: MeetingRegistration) {
    if (!confirm(`Delete registration for ${r.name}? This cannot be undone.`)) return;
    setError("");
    setDeletingId(r.id);
    startTransition(async () => {
      const result = await deleteRegistrationAction(r.id);
      setDeletingId(null);
      if (result.error) {
        setError(result.error);
        return;
      }
      if (viewing?.id === r.id) setViewing(null);
      router.refresh();
    });
  }

  if (!registrations.length) {
    return (
      <div className="card p-12 text-center">
        <p className="text-4xl mb-2">📅</p>
        <p className="font-semibold" style={{ color: "var(--color-dark)" }}>
          No registrations yet
        </p>
      </div>
    );
  }

  return (
    <>
      {error && (
        <p
          className="text-sm p-3 rounded-lg mb-4"
          style={{ background: "#FEE2E2", color: "var(--color-primary)" }}
        >
          {error}
        </p>
      )}

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ background: "#F9FAFB", borderBottom: "1px solid #E5E7EB" }}>
                {["Name", "Phone", "Meeting Date", "Registered On", "Actions"].map((h) => (
                  <th
                    key={h}
                    className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide"
                    style={{ color: "var(--color-gray)" }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {registrations.map((r, i) => (
                <tr
                  key={r.id}
                  style={{
                    borderBottom: i < registrations.length - 1 ? "1px solid #F3F4F6" : "none",
                  }}
                >
                  <td
                    className="px-4 py-3 text-sm font-semibold"
                    style={{ color: "var(--color-dark)" }}
                  >
                    {r.name}
                  </td>
                  <td className="px-4 py-3 text-sm" style={{ color: "var(--color-gray)" }}>
                    <a href={`tel:${r.phone}`} className="hover:underline">
                      {r.phone}
                    </a>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="text-xs px-2.5 py-1 rounded-full font-semibold"
                      style={{ background: "#FEF3C7", color: "#92400E" }}
                    >
                      {formatShortMeetingDate(r.meeting_date)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs" style={{ color: "var(--color-gray)" }}>
                    {new Date(r.created_at).toLocaleDateString("en-IN")}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setViewing(r)}
                        className="text-xs px-2.5 py-1.5 rounded-lg font-semibold"
                        style={{ background: "#F3F4F6", color: "var(--color-gray)" }}
                      >
                        View
                      </button>
                      <button
                        type="button"
                        disabled={pending && deletingId === r.id}
                        onClick={() => handleDelete(r)}
                        className="text-xs px-2.5 py-1.5 rounded-lg font-semibold transition-colors hover:bg-red-50"
                        style={{
                          border: "1px solid #FECACA",
                          color: "#DC2626",
                          opacity: pending && deletingId === r.id ? 0.6 : 1,
                        }}
                      >
                        {pending && deletingId === r.id ? "Deleting…" : "Delete"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {viewing && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.45)" }}
          onClick={() => setViewing(null)}
          role="presentation"
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white shadow-xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="registration-detail-title"
          >
            <div
              className="flex items-center justify-between px-5 py-4 border-b"
              style={{ borderColor: "#E5E7EB" }}
            >
              <h2
                id="registration-detail-title"
                className="text-lg font-extrabold"
                style={{ color: "var(--color-dark)" }}
              >
                Registration details
              </h2>
              <button
                type="button"
                onClick={() => setViewing(null)}
                className="text-sm font-semibold px-2 py-1 rounded-lg"
                style={{ color: "var(--color-gray)" }}
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <div className="px-5 py-5 flex flex-col gap-4">
              {(
                [
                  { label: "Full Name", value: viewing.name },
                  {
                    label: "Phone",
                    value: (
                      <a
                        href={`tel:${viewing.phone}`}
                        className="hover:underline font-semibold"
                        style={{ color: "var(--color-primary)" }}
                      >
                        {viewing.phone}
                      </a>
                    ),
                  },
                  { label: "Meeting Date", value: formatMeetingDate(viewing.meeting_date) },
                  { label: "Registered On", value: formatRegisteredOn(viewing.created_at) },
                  {
                    label: "Registration ID",
                    value: (
                      <span className="font-mono text-xs break-all">{viewing.id}</span>
                    ),
                  },
                ] as const
              ).map((row) => (
                <div key={row.label}>
                  <p
                    className="text-xs font-semibold uppercase tracking-wide mb-1"
                    style={{ color: "var(--color-gray)" }}
                  >
                    {row.label}
                  </p>
                  <div className="text-sm font-medium" style={{ color: "var(--color-dark)" }}>
                    {row.value}
                  </div>
                </div>
              ))}
            </div>

            <div
              className="flex justify-end gap-2 px-5 py-4 border-t"
              style={{ borderColor: "#E5E7EB", background: "#F9FAFB" }}
            >
              <button
                type="button"
                onClick={() => setViewing(null)}
                className="text-sm font-semibold px-4 py-2 rounded-lg"
                style={{ background: "#E5E7EB", color: "var(--color-dark)" }}
              >
                Close
              </button>
              <button
                type="button"
                disabled={pending && deletingId === viewing.id}
                onClick={() => handleDelete(viewing)}
                className="text-sm font-semibold px-4 py-2 rounded-lg"
                style={{
                  background: "#FEE2E2",
                  color: "#991B1B",
                  opacity: pending && deletingId === viewing.id ? 0.6 : 1,
                }}
              >
                {pending && deletingId === viewing.id ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
