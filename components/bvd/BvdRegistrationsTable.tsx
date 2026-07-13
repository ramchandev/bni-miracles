"use client";

import { useRef, useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  exportBvdRegistrationsAction,
  updateBvdRegistrationStatusAction,
  uploadBvdPaymentScreenshotAction,
  updateBvdRegistrationAttendanceAction,
} from "@/app/actions/bvd";
import type { BvdPaymentStatus, BvdRegistration, BvdAttendanceStatus } from "@/lib/supabase";

function formatWhen(str: string) {
  return new Date(str).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function BvdRegistrationsTable({
  registrations,
}: {
  registrations: BvdRegistration[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [exporting, setExporting] = useState(false);
  const [search, setSearch] = useState("");
  const [updatingAttendance, setUpdatingAttendance] = useState<string | null>(null);
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});

  function setStatus(id: string, status: BvdPaymentStatus) {
    setError("");
    startTransition(async () => {
      const result = await updateBvdRegistrationStatusAction(id, status);
      if (result.error) setError(result.error);
      else router.refresh();
    });
  }

  function setAttendance(id: string, attendance: BvdAttendanceStatus) {
    setError("");
    setUpdatingAttendance(id);
    startTransition(async () => {
      const result = await updateBvdRegistrationAttendanceAction(id, attendance);
      setUpdatingAttendance(null);
      if (result.error) setError(result.error);
      else router.refresh();
    });
  }

  async function onScreenshot(id: string, file: File | null) {
    if (!file) return;
    setError("");
    const fd = new FormData();
    fd.set("id", id);
    fd.set("file", file);
    startTransition(async () => {
      const result = await uploadBvdPaymentScreenshotAction(fd);
      if (result.error) setError(result.error);
      else router.refresh();
    });
  }

  async function handleExport() {
    setExporting(true);
    setError("");
    const result = await exportBvdRegistrationsAction();
    setExporting(false);
    if (result.error || !result.base64 || !result.filename) {
      setError(result.error ?? "Export failed.");
      return;
    }
    const bytes = Uint8Array.from(atob(result.base64), (c) => c.charCodeAt(0));
    const blob = new Blob([bytes], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = result.filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  const filtered = registrations.filter((r) => {
    const q = search.toLowerCase();
    return (
      r.name.toLowerCase().includes(q) ||
      r.invited_by.toLowerCase().includes(q)
    );
  });

  return (
    <div>
      {/* Search & Export Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md w-full">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400 pointer-events-none">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </span>
          <input
            type="text"
            placeholder="Search by name or who invited..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 rounded-xl text-sm outline-none border border-gray-200 bg-gray-50/50 hover:bg-gray-50 focus:bg-white focus:ring-4 focus:ring-red-500/10 focus:border-red-500 transition-all duration-200"
          />
        </div>

        <div className="flex items-center justify-between md:justify-end gap-4 w-full md:w-auto">
          <p className="text-sm font-semibold text-slate-500">
            {filtered.length} registration{filtered.length === 1 ? "" : "s"}
            {search && <span className="text-xs font-normal text-slate-400 ml-1">(filtered)</span>}
          </p>
          <button
            type="button"
            onClick={handleExport}
            disabled={exporting || registrations.length === 0}
            className="btn-outline text-xs px-4 py-2.5 rounded-xl border-gray-200 text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer font-bold shrink-0"
            style={{ opacity: exporting || !registrations.length ? 0.6 : 1 }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
            </svg>
            {exporting ? "Exporting…" : "Export Excel"}
          </button>
        </div>
      </div>

      {error && (
        <div className="text-sm p-4 rounded-xl mb-6 bg-red-50 border border-red-100 text-red-600 flex items-center gap-2">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span className="font-semibold">{error}</span>
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-4xl mb-3">🔍</p>
          <p className="font-extrabold text-slate-800">
            {search ? "No search results match your query" : "No BVD registrations yet"}
          </p>
          <p className="text-sm text-gray-400 mt-1">
            {search ? "Try checking spelling or searching a different term." : "Registered visitors will appear here."}
          </p>
        </div>
      ) : (
        <>
          {/* Mobile Grid View (block md:hidden) */}
          <div className="block md:hidden space-y-4">
            {filtered.map((r) => (
              <div key={r.id} className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm relative overflow-hidden">
                <div className="flex justify-between items-start gap-2 mb-3">
                  <div>
                    <h4 className="font-extrabold text-slate-800 text-base">{r.name}</h4>
                    <p className="text-xs text-slate-400 font-medium">Invited by: {r.invited_by}</p>
                  </div>
                  <span className="text-[10px] text-slate-400 font-semibold">{formatWhen(r.created_at)}</span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs border-y border-gray-100 py-3 mb-3">
                  <div>
                    <span className="text-slate-400 block font-bold uppercase tracking-wider text-[9px] mb-0.5">Business</span>
                    <span className="font-bold text-slate-700 block line-clamp-1">{r.business_name}</span>
                    <span className="text-slate-500 block truncate">{r.business_category}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-bold uppercase tracking-wider text-[9px] mb-0.5">Contact</span>
                    <a href={`tel:${r.phone}`} className="font-bold text-red-600 block underline">{r.phone}</a>
                    <a href={`mailto:${r.email}`} className="text-slate-500 block truncate underline">{r.email}</a>
                  </div>
                </div>

                <div className="space-y-3.5">
                  {/* Status Dropdown */}
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="text-slate-500 font-semibold">Breakfast: {r.wants_breakfast ? "Yes" : "No"}</span>
                    <select
                      value={r.status}
                      disabled={pending}
                      onChange={(e) => setStatus(r.id, e.target.value as BvdPaymentStatus)}
                      className="text-xs font-bold px-2 py-1.5 rounded-lg outline-none cursor-pointer border border-transparent"
                      style={{
                        background: r.status === "paid" ? "#DCFCE7" : "#FEF3C7",
                        color: r.status === "paid" ? "#166534" : "#92400E",
                      }}
                    >
                      <option value="payment_pending">Pending</option>
                      <option value="paid">Paid</option>
                    </select>
                  </div>

                  {/* Attendance Toggles */}
                  <div className="flex items-center justify-between gap-2 text-xs pt-1.5 border-t border-gray-50">
                    <span className="text-slate-500 font-bold uppercase tracking-wider text-[9px]">Attendance</span>
                    <div className="inline-flex rounded-lg overflow-hidden border border-gray-150 p-0.5 bg-gray-50/50">
                      <button
                        type="button"
                        disabled={pending || updatingAttendance === r.id}
                        onClick={() => setAttendance(r.id, r.attendance === "present" ? "pending" : "present")}
                        className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all duration-150 cursor-pointer ${
                          r.attendance === "present"
                            ? "bg-emerald-500 text-white shadow-sm"
                            : "text-slate-500 hover:bg-gray-100"
                        }`}
                      >
                        Present
                      </button>
                      <button
                        type="button"
                        disabled={pending || updatingAttendance === r.id}
                        onClick={() => setAttendance(r.id, r.attendance === "absent" ? "pending" : "absent")}
                        className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all duration-150 cursor-pointer ${
                          r.attendance === "absent"
                            ? "bg-red-500 text-white shadow-sm"
                            : "text-slate-500 hover:bg-gray-100"
                        }`}
                      >
                        Absent
                      </button>
                    </div>
                  </div>

                  {/* Screenshot Upload / Preview */}
                  <div className="flex items-center justify-between gap-2 text-xs pt-1.5 border-t border-gray-50">
                    <span className="text-slate-500 font-bold uppercase tracking-wider text-[9px]">Payment Slip</span>
                    {r.payment_screenshot_url ? (
                      <a href={r.payment_screenshot_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-bold text-red-600 underline">
                        View Image
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3" />
                        </svg>
                      </a>
                    ) : (
                      <div className="flex items-center gap-2">
                        <input
                          ref={(el) => {
                            fileRefs.current[r.id] = el;
                          }}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => onScreenshot(r.id, e.target.files?.[0] ?? null)}
                        />
                        <button
                          type="button"
                          disabled={pending}
                          className="text-xs font-bold underline text-red-600 cursor-pointer"
                          onClick={() => fileRefs.current[r.id]?.click()}
                        >
                          Upload Screenshot
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table View (hidden md:block) */}
          <div className="hidden md:block overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left border-collapse">
                <thead>
                  <tr style={{ background: "#F9FAFB", borderBottom: "1px solid #E5E7EB" }}>
                    {["Name", "Business", "Contact", "Breakfast", "Status", "Screenshot", "Attendance", "Registered"].map((h) => (
                      <th key={h} className="px-4 py-3.5 font-bold text-slate-500" style={{ fontSize: 12 }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r) => (
                    <tr key={r.id} className="border-b border-gray-50 hover:bg-slate-50/50 transition-colors duration-150">
                      {/* Name / Inviter */}
                      <td className="px-4 py-3">
                        <p className="font-bold text-slate-800">{r.name}</p>
                        <p className="text-xs text-slate-400 font-medium mt-0.5">Invited by: {r.invited_by}</p>
                      </td>

                      {/* Business */}
                      <td className="px-4 py-3">
                        <p className="font-semibold text-slate-700">{r.business_name}</p>
                        <p className="text-xs text-slate-400 font-medium mt-0.5">{r.business_category}</p>
                      </td>

                      {/* Contact */}
                      <td className="px-4 py-3">
                        <a href={`tel:${r.phone}`} className="font-semibold underline text-red-600 block hover:text-red-700">
                          {r.phone}
                        </a>
                        <a href={`mailto:${r.email}`} className="text-xs underline text-slate-400 block mt-0.5 hover:text-slate-500">
                          {r.email}
                        </a>
                      </td>

                      {/* Breakfast wants */}
                      <td className="px-4 py-3 font-medium text-slate-600">
                        {r.wants_breakfast ? (
                          <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-100">Yes</span>
                        ) : (
                          <span className="text-slate-400">No</span>
                        )}
                      </td>

                      {/* Payment Status */}
                      <td className="px-4 py-3">
                        <select
                          value={r.status}
                          disabled={pending}
                          onChange={(e) => setStatus(r.id, e.target.value as BvdPaymentStatus)}
                          className="text-xs font-bold px-2.5 py-1.5 rounded-lg outline-none cursor-pointer border border-transparent focus:ring-2 focus:ring-offset-1"
                          style={{
                            background: r.status === "paid" ? "#DCFCE7" : "#FEF3C7",
                            color: r.status === "paid" ? "#166534" : "#92400E",
                          }}
                        >
                          <option value="payment_pending">Payment Pending</option>
                          <option value="paid">Paid</option>
                        </select>
                      </td>

                      {/* Screenshot */}
                      <td className="px-4 py-3">
                        {r.payment_screenshot_url ? (
                          <a href={r.payment_screenshot_url} target="_blank" rel="noopener noreferrer" className="group block relative w-12 h-12 rounded-lg overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                            <Image
                              src={r.payment_screenshot_url}
                              alt="Payment screenshot"
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-200"
                              unoptimized
                            />
                          </a>
                        ) : (
                          <>
                            <input
                              ref={(el) => {
                                fileRefs.current[r.id] = el;
                              }}
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => onScreenshot(r.id, e.target.files?.[0] ?? null)}
                            />
                            <button
                              type="button"
                              disabled={pending}
                              className="text-xs font-bold underline text-red-600 hover:text-red-700 cursor-pointer"
                              onClick={() => fileRefs.current[r.id]?.click()}
                            >
                              Upload
                            </button>
                          </>
                        )}
                      </td>

                      {/* Attendance */}
                      <td className="px-4 py-3">
                        <div className="inline-flex rounded-lg overflow-hidden border border-gray-150 p-0.5 bg-gray-50/50">
                          <button
                            type="button"
                            disabled={pending || updatingAttendance === r.id}
                            onClick={() => setAttendance(r.id, r.attendance === "present" ? "pending" : "present")}
                            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all duration-150 cursor-pointer ${
                              r.attendance === "present"
                                ? "bg-emerald-500 text-white shadow-sm"
                                : "text-slate-500 hover:bg-gray-100"
                            }`}
                          >
                            Present
                          </button>
                          <button
                            type="button"
                            disabled={pending || updatingAttendance === r.id}
                            onClick={() => setAttendance(r.id, r.attendance === "absent" ? "pending" : "absent")}
                            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all duration-150 cursor-pointer ${
                              r.attendance === "absent"
                                ? "bg-red-500 text-white shadow-sm"
                                : "text-slate-500 hover:bg-gray-100"
                            }`}
                          >
                            Absent
                          </button>
                        </div>
                      </td>

                      {/* Registered Date */}
                      <td className="px-4 py-3 text-xs text-slate-400 font-medium whitespace-nowrap">
                        {formatWhen(r.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
