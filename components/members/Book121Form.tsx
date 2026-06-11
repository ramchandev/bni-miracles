"use client";

import { useEffect, useState } from "react";
import {
  getRequesterPrefillAction,
  submit121RequestAction,
} from "@/app/actions/one-on-one";
import { formatSlotSummary, MIRACLES_CHAPTER, requiresGuestDanceCardUpload } from "@/lib/one-on-one";
import type { OneOnOneSlot } from "@/lib/supabase";

type Props = {
  slot: OneOnOneSlot;
  hostName: string;
  onSuccess: () => void;
  onCancel: () => void;
};

export default function Book121Form({ slot, hostName, onSuccess, onCancel }: Props) {
  const [name, setName] = useState("");
  const [chapter, setChapter] = useState(MIRACLES_CHAPTER);
  const [email, setEmail] = useState("");
  const [memberId, setMemberId] = useState<string | null>(null);
  const [hasDanceCard, setHasDanceCard] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    getRequesterPrefillAction().then((p) => {
      if (p.name) setName(p.name);
      if (p.chapter) setChapter(p.chapter);
      if (p.email) setEmail(p.email);
      setMemberId(p.memberId);
      setHasDanceCard(p.hasDanceCard);
    });
  }, []);

  const needsUpload = requiresGuestDanceCardUpload(memberId, chapter, hasDanceCard);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    let guestDanceCardPath: string | null = null;
    if (needsUpload) {
      if (!pdfFile) {
        setError("Please upload your dance card PDF.");
        setSaving(false);
        return;
      }
      const fd = new FormData();
      fd.set("file", pdfFile);
      const uploadRes = await fetch("/api/121-dance-card-upload", {
        method: "POST",
        body: fd,
      });
      const up = (await uploadRes.json()) as { path?: string; error?: string };
      if (!uploadRes.ok || up.error) {
        setError(up.error ?? "Failed to upload dance card.");
        setSaving(false);
        return;
      }
      guestDanceCardPath = up.path ?? null;
    }

    const res = await submit121RequestAction({
      slotId: slot.id,
      requesterName: name,
      requesterChapter: chapter,
      requesterEmail: email,
      confirmed,
      guestDanceCardPath,
    });

    setSaving(false);
    if (res.error) setError(res.error);
    else {
      setDone(true);
      onSuccess();
    }
  };

  if (done) {
    return (
      <div className="rounded-2xl p-6 text-center" style={{ background: "#DCFCE7", border: "1.5px solid #16A34A33" }}>
        <p className="font-bold text-base mb-2" style={{ color: "#166534" }}>
          Request sent!
        </p>
        <p className="text-sm text-gray-600">
          {hostName} will review your request and email you when it&apos;s confirmed.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="rounded-2xl p-5 space-y-4" style={{ background: "white", border: "1.5px solid #E5E7EB" }}>
      <div>
        <h3 className="font-bold text-sm mb-1" style={{ color: "var(--color-dark)" }}>
          Book 1-2-1 with {hostName}
        </h3>
        <p className="text-xs text-gray-500">{formatSlotSummary(slot)}</p>
      </div>

      <label className="block text-xs font-semibold text-gray-500">
        Your name
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
          required
        />
      </label>

      <label className="block text-xs font-semibold text-gray-500">
        Your chapter
        <input
          type="text"
          value={chapter}
          onChange={(e) => setChapter(e.target.value)}
          className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
          required
        />
      </label>

      <label className="block text-xs font-semibold text-gray-500">
        Email (for confirmation)
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
          required
        />
      </label>

      {needsUpload && (
        <label className="block text-xs font-semibold text-gray-500">
          Dance card (PDF)
          <input
            type="file"
            accept="application/pdf,.pdf"
            onChange={(e) => setPdfFile(e.target.files?.[0] ?? null)}
            className="mt-1 w-full text-sm"
            required
          />
        </label>
      )}

      {!needsUpload && memberId && (
        <p className="text-xs text-green-700 bg-green-50 rounded-lg px-3 py-2">
          Your saved dance card will be shared when the host accepts.
        </p>
      )}

      <label className="flex items-start gap-2 text-sm cursor-pointer">
        <input
          type="checkbox"
          checked={confirmed}
          onChange={(e) => setConfirmed(e.target.checked)}
          className="mt-1"
          required
        />
        <span style={{ color: "var(--color-dark)" }}>
          Yes, we can schedule the 1-2-1 at this time
        </span>
      </label>

      {error && <p className="text-xs text-red-600">{error}</p>}

      <div className="flex gap-2">
        <button type="button" onClick={onCancel} className="btn-outline text-sm flex-1">
          Cancel
        </button>
        <button type="submit" disabled={saving} className="btn-primary text-sm flex-1">
          {saving ? "Sending…" : "Request 1-2-1"}
        </button>
      </div>
    </form>
  );
}
