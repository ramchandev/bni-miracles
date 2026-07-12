"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  createPowerTeamLogAction,
  updatePowerTeamLogAction,
  uploadPowerTeamLogImageAction,
} from "@/app/actions/power-team-logs";
import type { PowerTeamMeetingLogWithMeta } from "@/lib/supabase";

export type LogFormMember = { id: string; name: string };

type Props = {
  powerTeamId: string;
  teamSlug: string;
  teamColor: string;
  teamMembers: LogFormMember[];
  onClose: () => void;
  /** When set, form updates this log instead of creating. */
  editLog?: PowerTeamMeetingLogWithMeta | null;
};

export default function PowerTeamLogForm({
  powerTeamId,
  teamSlug,
  teamColor,
  teamMembers,
  onClose,
  editLog = null,
}: Props) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(editLog?.image_url ?? null);
  const [imageName, setImageName] = useState(editLog?.image_url ? "Current photo" : "");
  const [attendance, setAttendance] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    for (const m of teamMembers) {
      const row = editLog?.attendance?.find((a) => a.member_id === m.id);
      initial[m.id] = row ? row.present : true;
    }
    return initial;
  });

  const isEdit = Boolean(editLog);

  async function handleFileChange(file: File | null) {
    setError("");
    if (!file) {
      setImageUrl(null);
      setImageName("");
      return;
    }

    const ext = (file.name.split(".").pop() ?? "").toLowerCase();
    if (!["jpg", "jpeg", "png", "webp"].includes(ext)) {
      setError("Only JPG, JPEG, PNG, or WEBP allowed.");
      if (fileRef.current) fileRef.current.value = "";
      return;
    }

    setUploading(true);
    const fd = new FormData();
    fd.set("file", file);
    const result = await uploadPowerTeamLogImageAction(fd);
    setUploading(false);

    if (result.error || !result.url) {
      setError(result.error ?? "Upload failed.");
      if (fileRef.current) fileRef.current.value = "";
      return;
    }

    setImageUrl(result.url);
    setImageName(file.name);
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const form = e.currentTarget;
    const fd = new FormData(form);

    const meetingDate = String(fd.get("meeting_date") ?? "").trim();
    const comments = String(fd.get("comments") ?? "").trim();
    const venue = String(fd.get("venue") ?? "").trim();
    const referralsRaw = String(fd.get("referrals_exchanged") ?? "").trim();
    const valueRaw = String(fd.get("business_value") ?? "").trim();

    if (!meetingDate) {
      setError("Meeting date is required.");
      return;
    }
    if (!comments) {
      setError("Comments are required.");
      return;
    }
    if (teamMembers.length === 0) {
      setError("This Power Team has no members to mark attendance for.");
      return;
    }

    const referralsExchanged = referralsRaw === "" ? null : Number(referralsRaw);
    const businessValue = valueRaw === "" ? null : Number(valueRaw);
    const attendancePayload = teamMembers.map((m) => ({
      memberId: m.id,
      present: attendance[m.id] !== false,
    }));

    startTransition(async () => {
      const result = isEdit && editLog
        ? await updatePowerTeamLogAction({
            logId: editLog.id,
            powerTeamId,
            teamSlug,
            meetingDate,
            venue,
            comments,
            referralsExchanged,
            businessValue,
            imageUrl,
            attendance: attendancePayload,
          })
        : await createPowerTeamLogAction({
            powerTeamId,
            teamSlug,
            meetingDate,
            venue,
            comments,
            referralsExchanged,
            businessValue,
            imageUrl,
            attendance: attendancePayload,
          });

      if (result.error) {
        setError(result.error);
        return;
      }
      router.refresh();
      onClose();
    });
  }

  const inputStyle = {
    border: "1.5px solid #E5E7EB",
    background: "white",
  } as const;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.45)" }}
      onClick={onClose}
      role="presentation"
    >
      <div
        className="w-full max-w-lg rounded-2xl bg-white shadow-xl overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="log-form-title"
      >
        <div
          className="flex items-center justify-between px-5 py-4 border-b shrink-0"
          style={{ borderColor: "#E5E7EB" }}
        >
          <h2
            id="log-form-title"
            className="text-lg font-extrabold"
            style={{ color: "var(--color-dark)" }}
          >
            {isEdit ? "Edit Meeting Log" : "Add Meeting Log"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-sm font-semibold px-2 py-1"
            style={{ color: "var(--color-gray)" }}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto px-5 py-5 flex flex-col gap-4">
          <div>
            <label className="block text-sm font-semibold mb-1" style={{ color: "var(--color-dark)" }}>
              Meeting Date <span style={{ color: "var(--color-primary)" }}>*</span>
            </label>
            <input
              name="meeting_date"
              type="date"
              required
              defaultValue={editLog?.meeting_date ?? ""}
              className="w-full px-4 py-2.5 rounded-lg text-sm"
              style={inputStyle}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1" style={{ color: "var(--color-dark)" }}>
              Venue
            </label>
            <input
              name="venue"
              type="text"
              placeholder="Where did you meet?"
              defaultValue={editLog?.venue ?? ""}
              className="w-full px-4 py-2.5 rounded-lg text-sm"
              style={inputStyle}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1" style={{ color: "var(--color-dark)" }}>
              Comments <span style={{ color: "var(--color-primary)" }}>*</span>
            </label>
            <textarea
              name="comments"
              required
              rows={4}
              placeholder="What happened at the meeting?"
              defaultValue={editLog?.comments ?? ""}
              className="w-full px-4 py-2.5 rounded-lg text-sm resize-y"
              style={inputStyle}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1" style={{ color: "var(--color-dark)" }}>
                No. of Referrals Exchanged
              </label>
              <input
                name="referrals_exchanged"
                type="number"
                min={0}
                step={1}
                placeholder="0"
                defaultValue={editLog?.referrals_exchanged ?? ""}
                className="w-full px-4 py-2.5 rounded-lg text-sm"
                style={inputStyle}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1" style={{ color: "var(--color-dark)" }}>
                Business Value (₹)
              </label>
              <input
                name="business_value"
                type="number"
                min={0}
                step="0.01"
                placeholder="0"
                defaultValue={editLog?.business_value ?? ""}
                className="w-full px-4 py-2.5 rounded-lg text-sm"
                style={inputStyle}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1" style={{ color: "var(--color-dark)" }}>
              Picture (1 only)
            </label>
            <input
              ref={fileRef}
              type="file"
              accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
              className="w-full text-sm"
              disabled={uploading || pending}
              onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
            />
            {uploading && (
              <p className="text-xs mt-1" style={{ color: "var(--color-gray)" }}>
                Uploading…
              </p>
            )}
            {imageUrl && (
              <div className="mt-2 flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imageUrl}
                  alt="Upload preview"
                  className="w-16 h-16 rounded-lg object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-xs truncate" style={{ color: "var(--color-gray)" }}>
                    {imageName}
                  </p>
                  <button
                    type="button"
                    className="text-xs font-semibold mt-1"
                    style={{ color: "#DC2626" }}
                    onClick={() => {
                      setImageUrl(null);
                      setImageName("");
                      if (fileRef.current) fileRef.current.value = "";
                    }}
                  >
                    Remove
                  </button>
                </div>
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between gap-2 mb-2">
              <label className="block text-sm font-semibold" style={{ color: "var(--color-dark)" }}>
                Attendance <span style={{ color: "var(--color-primary)" }}>*</span>
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  className="text-[11px] font-bold"
                  style={{ color: "#166534" }}
                  onClick={() => {
                    const next: Record<string, boolean> = {};
                    for (const m of teamMembers) next[m.id] = true;
                    setAttendance(next);
                  }}
                >
                  All present
                </button>
                <button
                  type="button"
                  className="text-[11px] font-bold"
                  style={{ color: "#991B1B" }}
                  onClick={() => {
                    const next: Record<string, boolean> = {};
                    for (const m of teamMembers) next[m.id] = false;
                    setAttendance(next);
                  }}
                >
                  All absent
                </button>
              </div>
            </div>
            <div
              className="rounded-xl overflow-hidden"
              style={{ border: "1px solid #E5E7EB", maxHeight: 220, overflowY: "auto" }}
            >
              {teamMembers.map((m, i) => {
                const present = attendance[m.id] !== false;
                return (
                  <div
                    key={m.id}
                    className="flex items-center justify-between gap-3 px-3 py-2.5"
                    style={{
                      borderBottom: i < teamMembers.length - 1 ? "1px solid #F3F4F6" : "none",
                    }}
                  >
                    <span className="text-sm font-medium truncate" style={{ color: "var(--color-dark)" }}>
                      {m.name}
                    </span>
                    <div className="flex gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => setAttendance((prev) => ({ ...prev, [m.id]: true }))}
                        className="text-[11px] font-bold px-2.5 py-1 rounded-full"
                        style={{
                          background: present ? "#DCFCE7" : "#F3F4F6",
                          color: present ? "#166534" : "#6B7280",
                          border: present ? "1px solid #86EFAC" : "1px solid transparent",
                        }}
                      >
                        Present
                      </button>
                      <button
                        type="button"
                        onClick={() => setAttendance((prev) => ({ ...prev, [m.id]: false }))}
                        className="text-[11px] font-bold px-2.5 py-1 rounded-full"
                        style={{
                          background: !present ? "#FEE2E2" : "#F3F4F6",
                          color: !present ? "#991B1B" : "#6B7280",
                          border: !present ? "1px solid #FECACA" : "1px solid transparent",
                        }}
                      >
                        Absent
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {error && (
            <p
              className="text-sm p-3 rounded-lg"
              style={{ background: "#FEE2E2", color: "var(--color-primary)" }}
            >
              {error}
            </p>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="text-sm font-semibold px-4 py-2 rounded-lg"
              style={{ background: "#E5E7EB", color: "var(--color-dark)" }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={pending || uploading}
              className="text-sm font-semibold px-4 py-2 rounded-lg text-white"
              style={{
                background: teamColor,
                opacity: pending || uploading ? 0.7 : 1,
              }}
            >
              {pending ? "Saving…" : isEdit ? "Save Changes" : "Save Log"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
