"use client";

import { useRef, useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import MemberAssignPicker, { type MemberOption } from "@/components/admin/MemberAssignPicker";
import { updateBvdSettingsAction, uploadBvdQrAction } from "@/app/admin/actions/bvd";
import type { BvdSettings } from "@/lib/supabase";

type Props = {
  settings: BvdSettings;
  members: MemberOption[];
};

export default function BvdSettingsForm({ settings, members }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [chairmanId, setChairmanId] = useState<string | null>(settings.chairman_member_id);
  const [coChairmanId, setCoChairmanId] = useState<string | null>(settings.co_chairman_member_id);
  const [qrUrl, setQrUrl] = useState(settings.payment_qr_url);
  const qrInputRef = useRef<HTMLInputElement>(null);

  function onSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSuccess("");
    const fd = new FormData(e.currentTarget);
    fd.set("chairman_member_id", chairmanId ?? "");
    fd.set("co_chairman_member_id", coChairmanId ?? "");

    startTransition(async () => {
      const result = await updateBvdSettingsAction(fd);
      if (result.error) {
        setError(result.error);
        return;
      }
      setSuccess("Settings saved.");
      router.refresh();
    });
  }

  function onQrChange(file: File | null) {
    if (!file) return;
    setError("");
    setSuccess("");
    const MAX_MB = 5;
    if (file.size > MAX_MB * 1024 * 1024) {
      setError(`Image is too large — max ${MAX_MB} MB. Try a smaller image.`);
      return;
    }
    const fd = new FormData();
    fd.set("file", file);
    startTransition(async () => {
      const result = await uploadBvdQrAction(fd);
      if (result.error) {
        setError(result.error);
        return;
      }
      if (result.url) setQrUrl(result.url);
      setSuccess("Payment QR updated.");
      router.refresh();
    });
  }

  return (
    <form onSubmit={onSave} className="flex flex-col gap-6">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wide" style={{ color: "var(--color-gray)" }}>
            Event date
          </label>
          <input
            type="date"
            name="event_date"
            required
            defaultValue={settings.event_date}
            className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
            style={{ border: "1px solid #E5E7EB", background: "#F9FAFB" }}
          />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wide" style={{ color: "var(--color-gray)" }}>
            Breakfast amount (₹)
          </label>
          <input
            type="number"
            name="breakfast_amount"
            min={0}
            step="1"
            required
            defaultValue={Number(settings.breakfast_amount)}
            className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
            style={{ border: "1px solid #E5E7EB", background: "#F9FAFB" }}
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wide" style={{ color: "var(--color-gray)" }}>
          Notification emails (comma-separated)
        </label>
        <input
          type="text"
          name="notification_emails"
          defaultValue={settings.notification_emails ?? ""}
          placeholder="host@example.com, admin@example.com"
          className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
          style={{ border: "1px solid #E5E7EB", background: "#F9FAFB" }}
        />
        <p className="text-xs mt-1.5" style={{ color: "var(--color-gray)" }}>
          These addresses receive an email whenever someone registers on /bvd.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-6">
        <div>
          <p className="text-xs font-semibold mb-2 uppercase tracking-wide" style={{ color: "var(--color-gray)" }}>
            BVD Chairman
          </p>
          <MemberAssignPicker
            members={members}
            value={chairmanId}
            onChange={setChairmanId}
            emptyButtonLabel="Assign Chairman…"
          />
        </div>
        <div>
          <p className="text-xs font-semibold mb-2 uppercase tracking-wide" style={{ color: "var(--color-gray)" }}>
            BVD Co-Chairman
          </p>
          <MemberAssignPicker
            members={members}
            value={coChairmanId}
            onChange={setCoChairmanId}
            emptyButtonLabel="Assign Co-Chairman…"
          />
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold mb-2 uppercase tracking-wide" style={{ color: "var(--color-gray)" }}>
          Payment QR code
        </p>
        {qrUrl && (
          <div className="mb-3 inline-block p-3 rounded-xl" style={{ background: "#F9FAFB", border: "1px solid #E5E7EB" }}>
            <Image src={qrUrl} alt="Payment QR" width={160} height={160} className="rounded-lg" unoptimized />
          </div>
        )}
        <div>
          <input
            ref={qrInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => onQrChange(e.target.files?.[0] ?? null)}
          />
          <button
            type="button"
            disabled={pending}
            className="btn-outline text-sm px-4 py-2"
            onClick={() => qrInputRef.current?.click()}
          >
            {qrUrl ? "Replace QR image" : "Upload QR image"}
          </button>
        </div>
      </div>

      {error && (
        <p className="text-sm p-3 rounded-lg" style={{ background: "#FEE2E2", color: "var(--color-primary)" }}>
          {error}
        </p>
      )}
      {success && (
        <p className="text-sm p-3 rounded-lg" style={{ background: "#DCFCE7", color: "#166534" }}>
          {success}
        </p>
      )}

      <button type="submit" disabled={pending} className="btn-primary self-start px-6 py-2.5" style={{ opacity: pending ? 0.7 : 1 }}>
        {pending ? "Saving…" : "Save settings"}
      </button>
    </form>
  );
}
