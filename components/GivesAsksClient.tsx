"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  verifyPhoneAction,
  saveGivesAsksAction,
  type GivesAsksBasicMember,
} from "@/app/actions/gives-asks";

/* ── Shared styles ───────────────────────────────────────────────────────── */
const inputCls =
  "w-full px-4 py-3 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-200";
const border = { border: "1.5px solid #E5E7EB" } as const;
const labelSt: React.CSSProperties = {
  display: "block", fontSize: 13, fontWeight: 600, marginBottom: 4,
  color: "var(--color-dark)",
};

/* ── Line-item list ──────────────────────────────────────────────────────── */
function LineItems({
  label, emoji, accentColor, items, onChange, placeholder,
}: {
  label: string; emoji: string; accentColor: string;
  items: string[]; onChange: (v: string[]) => void; placeholder: string;
}) {
  const add    = () => onChange([...items, ""]);
  const remove = (i: number) => onChange(items.filter((_, x) => x !== i));
  const update = (i: number, v: string) =>
    onChange(items.map((item, x) => (x === i ? v : item)));

  return (
    <div className="flex flex-col gap-3">
      {/* Header */}
      <div
        className="flex items-center gap-2 px-4 py-2.5 rounded-lg"
        style={{ background: accentColor + "12" }}
      >
        <span className="text-lg">{emoji}</span>
        <p className="text-sm font-extrabold" style={{ color: accentColor }}>{label}</p>
        <span
          className="ml-auto text-xs font-bold px-2 py-0.5 rounded-full"
          style={{ background: accentColor, color: "#fff" }}
        >
          {items.filter(Boolean).length}
        </span>
      </div>

      {/* Items */}
      <div className="flex flex-col gap-2 pl-1">
        {items.map((item, i) => (
          <div key={i} className="flex gap-2 items-center">
            <span className="text-xs shrink-0" style={{ color: accentColor }}>•</span>
            <input
              type="text"
              value={item}
              onChange={(e) => update(i, e.target.value)}
              placeholder={placeholder}
              className={inputCls + " flex-1"}
              style={border}
            />
            <button
              type="button"
              onClick={() => remove(i)}
              title="Remove"
              className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold transition-colors hover:bg-red-50"
              style={{ color: "var(--color-primary)", border: "1.5px solid #FCA5A5" }}
            >
              ✕
            </button>
          </div>
        ))}
        {items.length === 0 && (
          <p className="text-xs italic pl-4" style={{ color: "var(--color-gray)" }}>
            No {label.toLowerCase()} added yet.
          </p>
        )}
      </div>

      {/* Add button */}
      <button
        type="button"
        onClick={add}
        className="self-start flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-opacity hover:opacity-80"
        style={{
          background: accentColor + "15",
          color: accentColor,
          border: `1px solid ${accentColor}40`,
        }}
      >
        + Add {label.endsWith("s") ? label.slice(0, -1) : label}
      </button>
    </div>
  );
}

/* ── Phase 1: phone verify ───────────────────────────────────────────────── */
function PhoneForm({
  onVerified,
}: {
  onVerified: (m: GivesAsksBasicMember, gives: string[], asks: string[]) => void;
}) {
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await verifyPhoneAction(phone);
    setLoading(false);
    if (!res.ok) setError(res.error);
    else onVerified(res.member, res.gives, res.asks);
  };

  return (
    <div style={{ maxWidth: 440, margin: "0 auto" }}>
      <div className="card p-8">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-5 mx-auto"
          style={{ background: "#DCFCE7" }}
        >
          🤝
        </div>
        <h2 className="text-xl font-extrabold text-center mb-1" style={{ color: "var(--color-dark)" }}>
          Access My Gives &amp; Asks
        </h2>
        <p className="text-sm text-center mb-6" style={{ color: "var(--color-gray)" }}>
          Enter your registered phone number to update your referral preferences.
        </p>

        <form onSubmit={submit} className="flex flex-col gap-5">
          <div>
            <label style={labelSt}>
              Phone Number <span style={{ color: "var(--color-primary)" }}>*</span>
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. 9841767641 or +91 98417 67641"
              required
              className={inputCls}
              style={border}
            />
            <p className="text-xs mt-1" style={{ color: "var(--color-gray)" }}>
              The number registered with BNI Miracles — with or without country code.
            </p>
          </div>

          {error && (
            <div className="flex gap-2 items-start px-4 py-3 rounded-lg text-sm"
              style={{ background: "#FEE2E2", color: "#991B1B" }}>
              <span className="shrink-0">❌</span> {error}
            </div>
          )}

          <button type="submit" disabled={loading} className="btn-primary w-full"
            style={{ opacity: loading ? 0.7 : 1 }}>
            {loading ? "Verifying…" : "Continue →"}
          </button>
        </form>
      </div>
      <p className="text-center text-xs mt-4" style={{ color: "var(--color-gray)" }}>
        Having trouble? Contact the chapter admin on WhatsApp.
      </p>
    </div>
  );
}

/* ── Phase 2: edit gives & asks ──────────────────────────────────────────── */
function EditGivesAsks({
  member,
  initialGives,
  initialAsks,
}: {
  member: GivesAsksBasicMember;
  initialGives: string[];
  initialAsks: string[];
}) {
  const [gives, setGives] = useState<string[]>(initialGives.length ? initialGives : [""]);
  const [asks, setAsks]   = useState<string[]>(initialAsks.length ? initialAsks : [""]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved]   = useState(false);
  const [error, setError]   = useState("");

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSaved(false);
    const res = await saveGivesAsksAction(
      member.id,
      member.slug,
      gives.filter(Boolean),
      asks.filter(Boolean)
    );
    setSaving(false);
    if (res.error) setError(res.error);
    else setSaved(true);
  };

  return (
    <div style={{ maxWidth: 720, margin: "0 auto" }}>

      {/* Welcome strip */}
      <div className="flex items-center gap-4 rounded-2xl p-5 mb-6"
        style={{ background: "white", border: "1.5px solid #E5E7EB" }}>
        {member.profile_picture_url ? (
          <Image src={member.profile_picture_url} alt={member.name}
            width={56} height={56}
            className="rounded-full object-cover shrink-0"
            style={{ width: 56, height: 56 }} />
        ) : (
          <div className="flex items-center justify-center rounded-full shrink-0 text-white font-bold text-xl"
            style={{ width: 56, height: 56, background: "var(--color-primary)" }}>
            {member.name.charAt(0).toUpperCase()}
          </div>
        )}
        <div>
          <p className="font-extrabold" style={{ color: "var(--color-dark)" }}>
            Hi, {member.name.split(" ")[0]}! 👋
          </p>
          <p className="text-sm" style={{ color: "var(--color-gray)" }}>
            {member.category} · Update what you give and what you need.
          </p>
        </div>
        <Link href={`/members/${member.slug}`}
          className="ml-auto text-xs font-semibold shrink-0 px-3 py-1.5 rounded-lg"
          style={{ background: "#F3F4F6", color: "var(--color-gray)" }}>
          View Profile →
        </Link>
      </div>

      <form onSubmit={save} className="flex flex-col gap-6">

        {/* Explanation */}
        <div className="grid sm:grid-cols-2 gap-4 text-sm">
          <div className="rounded-xl p-4" style={{ background: "#ECFDF5", border: "1px solid #86EFAC" }}>
            <p className="font-bold mb-1" style={{ color: "#166534" }}>✅ What are Gives?</p>
            <p style={{ color: "#15803D" }}>
              Referrals you can confidently pass to others — clients, leads, or introductions from your network.
            </p>
          </div>
          <div className="rounded-xl p-4" style={{ background: "#FEF2F2", border: "1px solid #FCA5A5" }}>
            <p className="font-bold mb-1" style={{ color: "#991B1B" }}>🙏 What are Asks?</p>
            <p style={{ color: "#B91C1C" }}>
              The type of referrals you&apos;re actively looking for right now — be specific so members know how to help you.
            </p>
          </div>
        </div>

        {/* Gives & Asks side by side */}
        <div className="rounded-2xl p-6 flex flex-col gap-8"
          style={{ background: "white", border: "1.5px solid #E5E7EB" }}>
          <LineItems
            label="Gives"
            emoji="✅"
            accentColor="#16A34A"
            items={gives}
            onChange={setGives}
            placeholder="e.g. Interior design project referrals"
          />
          <div style={{ borderTop: "1px solid #F3F4F6" }} />
          <LineItems
            label="Asks"
            emoji="🙏"
            accentColor="#DC2626"
            items={asks}
            onChange={setAsks}
            placeholder="e.g. New homeowners needing furniture"
          />
        </div>

        {/* Tips */}
        <div className="rounded-xl px-5 py-4 text-xs" style={{ background: "#F9FAFB", border: "1px solid #E5E7EB" }}>
          <p className="font-semibold mb-1" style={{ color: "var(--color-dark)" }}>💡 Tips for better referrals</p>
          <ul className="list-disc list-inside space-y-1" style={{ color: "var(--color-gray)" }}>
            <li>Be specific: "SME owners in Anna Nagar needing GST filing" beats "businesses".</li>
            <li>Add 3–5 gives and 3–5 asks — variety helps chapter members spot opportunities faster.</li>
            <li>Update monthly as your business needs shift.</li>
          </ul>
        </div>

        {/* Success */}
        {saved && (
          <div className="flex items-center gap-3 px-5 py-4 rounded-xl text-sm font-semibold"
            style={{ background: "#DCFCE7", color: "#166534" }}>
            <span className="text-xl">✅</span>
            <div>
              <p>Saved successfully!</p>
              <Link href={`/members/${member.slug}`}
                className="text-xs font-normal underline" style={{ color: "#15803D" }}>
                View your updated public profile →
              </Link>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="flex gap-2 items-start px-4 py-3 rounded-lg text-sm"
            style={{ background: "#FEE2E2", color: "#991B1B" }}>
            <span className="shrink-0">❌</span> {error}
          </div>
        )}

        <div className="flex items-center gap-4 flex-wrap">
          <button type="submit" disabled={saving} className="btn-primary px-10"
            style={{ opacity: saving ? 0.7 : 1 }}>
            {saving ? "Saving…" : "💾 Save Gives & Asks"}
          </button>
          <Link href={`/members/${member.slug}`}
            className="text-sm" style={{ color: "var(--color-gray)" }}>
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}

/* ── Root ────────────────────────────────────────────────────────────────── */
export default function GivesAsksClient() {
  const [phase, setPhase]     = useState<"verify" | "edit">("verify");
  const [member, setMember]   = useState<GivesAsksBasicMember | null>(null);
  const [gives, setGives]     = useState<string[]>([]);
  const [asks, setAsks]       = useState<string[]>([]);

  const handleVerified = (m: GivesAsksBasicMember, g: string[], a: string[]) => {
    setMember(m); setGives(g); setAsks(a);
    setPhase("edit");
  };

  return (
    <>
      {/* Hero */}
      <section
        className="px-6 text-center"
        style={{ background: "var(--color-dark)", paddingTop: 100, paddingBottom: 48 }}
      >
        <p className="text-sm font-semibold tracking-widest uppercase mb-3"
          style={{ color: "var(--color-accent)" }}>
          Member Self-Service
        </p>
        <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-3">
          My Gives &amp; Asks
        </h1>
        <p className="text-white/60 text-sm max-w-md mx-auto">
          {phase === "verify"
            ? "Enter your phone number to manage your referral preferences."
            : "Update what you can give and what you need — changes are live instantly."}
        </p>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-3 mt-6">
          {["Verify", "Edit"].map((step, i) => {
            const active = (i === 0 && phase === "verify") || (i === 1 && phase === "edit");
            const done   = i === 0 && phase === "edit";
            return (
              <div key={step} className="flex items-center gap-2">
                <div className="flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold"
                  style={{
                    background: done ? "#16A34A" : active ? "var(--color-primary)" : "rgba(255,255,255,0.15)",
                    color: "white",
                  }}>
                  {done ? "✓" : i + 1}
                </div>
                <span className="text-xs font-semibold"
                  style={{ color: active ? "white" : done ? "#86EFAC" : "rgba(255,255,255,0.4)" }}>
                  {step}
                </span>
                {i < 1 && (
                  <div className="w-8 h-px"
                    style={{ background: done ? "#86EFAC" : "rgba(255,255,255,0.2)" }} />
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Content */}
      <section className="py-12 px-6" style={{ background: "var(--color-bg)" }}>
        {phase === "verify" ? (
          <PhoneForm onVerified={handleVerified} />
        ) : (
          member && (
            <EditGivesAsks member={member} initialGives={gives} initialAsks={asks} />
          )
        )}
      </section>
    </>
  );
}
