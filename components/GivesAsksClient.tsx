"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import GivesAsksCategoryLineItems from "@/components/GivesAsksCategoryLineItems";
import MemberCollaborationSection from "@/components/members/MemberCollaborationSection";
import type { GiveAskEntry } from "@/lib/gives-asks-categories";
import type { MemberCollaborations } from "@/lib/gives-asks-collaboration";
import {
  verifyPhoneAction,
  saveGivesAsksAction,
  fetchMemberCollaborationsAction,
  type GivesAsksBasicMember,
} from "@/app/actions/gives-asks";
import type { GivesAsksCategory } from "@/lib/supabase";

const inputCls =
  "w-full px-4 py-3 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-200";
const border = { border: "1.5px solid #E5E7EB" } as const;
const labelSt: React.CSSProperties = {
  display: "block",
  fontSize: 13,
  fontWeight: 600,
  marginBottom: 4,
  color: "var(--color-dark)",
};

function PhoneForm({
  onVerified,
}: {
  onVerified: (m: GivesAsksBasicMember, gives: GiveAskEntry[], asks: GiveAskEntry[]) => void;
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
            <div
              className="flex gap-2 items-start px-4 py-3 rounded-lg text-sm"
              style={{ background: "#FEE2E2", color: "#991B1B" }}
            >
              <span className="shrink-0">❌</span> {error}
            </div>
          )}

          <button type="submit" disabled={loading} className="btn-primary w-full" style={{ opacity: loading ? 0.7 : 1 }}>
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

function EditGivesAsks({
  member,
  initialGives,
  initialAsks,
  initialCollaborations,
  categories,
}: {
  member: GivesAsksBasicMember;
  initialGives: GiveAskEntry[];
  initialAsks: GiveAskEntry[];
  initialCollaborations: MemberCollaborations | null;
  categories: GivesAsksCategory[];
}) {
  const [gives, setGives] = useState<GiveAskEntry[]>(initialGives);
  const [asks, setAsks] = useState<GiveAskEntry[]>(initialAsks);
  const [collaborations, setCollaborations] = useState<MemberCollaborations | null>(
    initialCollaborations
  );
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!initialCollaborations) {
      fetchMemberCollaborationsAction(member.id).then(setCollaborations);
    }
  }, [member.id, initialCollaborations]);

  const refreshCollaborations = () => {
    fetchMemberCollaborationsAction(member.id).then(setCollaborations);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSaved(false);
    const res = await saveGivesAsksAction(
      member.id,
      member.slug,
      gives.filter((g) => g.text.trim()),
      asks.filter((a) => a.text.trim())
    );
    setSaving(false);
    if (res.error) setError(res.error);
    else {
      setSaved(true);
      refreshCollaborations();
    }
  };

  return (
    <div style={{ maxWidth: 720, margin: "0 auto" }}>
      <div
        className="flex items-center gap-4 rounded-2xl p-5 mb-6"
        style={{ background: "white", border: "1.5px solid #E5E7EB" }}
      >
        {member.profile_picture_url ? (
          <Image
            src={member.profile_picture_url}
            alt={member.name}
            width={56}
            height={56}
            className="rounded-full object-cover shrink-0"
            style={{ width: 56, height: 56 }}
          />
        ) : (
          <div
            className="flex items-center justify-center rounded-full shrink-0 text-white font-bold text-xl"
            style={{ width: 56, height: 56, background: "var(--color-primary)" }}
          >
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
        <Link
          href={`/members/${member.slug}`}
          className="ml-auto text-xs font-semibold shrink-0 px-3 py-1.5 rounded-lg"
          style={{ background: "#F3F4F6", color: "var(--color-gray)" }}
        >
          View Profile →
        </Link>
      </div>

      <form onSubmit={save} className="flex flex-col gap-6">
        <div className="grid sm:grid-cols-2 gap-4 text-sm">
          <div className="rounded-xl p-4" style={{ background: "#ECFDF5", border: "1px solid #86EFAC" }}>
            <p className="font-bold mb-1" style={{ color: "#166534" }}>✅ What are Gives?</p>
            <p style={{ color: "#15803D" }}>
              Referrals you can confidently pass to others — pick the types of leads you can introduce.
            </p>
          </div>
          <div className="rounded-xl p-4" style={{ background: "#FEF2F2", border: "1px solid #FCA5A5" }}>
            <p className="font-bold mb-1" style={{ color: "#991B1B" }}>🙏 What are Asks?</p>
            <p style={{ color: "#B91C1C" }}>
              The referral types you&apos;re actively looking for — choose from the chapter categories.
            </p>
          </div>
        </div>

        <div
          className="rounded-2xl p-6 flex flex-col gap-8"
          style={{ background: "white", border: "1.5px solid #E5E7EB" }}
        >
          <GivesAsksCategoryLineItems
            label="Gives"
            emoji="✅"
            accentColor="#16A34A"
            kind="give"
            textFieldName="gives"
            categoryFieldName="give_categories"
            categories={categories}
            items={gives}
            onChange={setGives}
            textPlaceholder="e.g. VJN Systems"
          />
          <div style={{ borderTop: "1px solid #F3F4F6" }} />
          <GivesAsksCategoryLineItems
            label="Asks"
            emoji="🙏"
            accentColor="#DC2626"
            kind="ask"
            textFieldName="asks"
            categoryFieldName="ask_categories"
            categories={categories}
            items={asks}
            onChange={setAsks}
            textPlaceholder="e.g. New homeowners in OMR"
          />
        </div>

        {collaborations && (
          <MemberCollaborationSection collaborations={collaborations} compact />
        )}

        <div className="rounded-xl px-5 py-4 text-xs" style={{ background: "#F9FAFB", border: "1px solid #E5E7EB" }}>
          <p className="font-semibold mb-1" style={{ color: "var(--color-dark)" }}>💡 Tips for better referrals</p>
          <ul className="list-disc list-inside space-y-1" style={{ color: "var(--color-gray)" }}>
            <li>Enter the company or contact name, then pick a referral type from the dropdown.</li>
            <li>Add 3–5 gives and 3–5 asks — variety helps chapter members spot opportunities faster.</li>
            <li>Update monthly as your business needs shift.</li>
          </ul>
        </div>

        {saved && (
          <div
            className="flex items-center gap-3 px-5 py-4 rounded-xl text-sm font-semibold"
            style={{ background: "#DCFCE7", color: "#166534" }}
          >
            <span className="text-xl">✅</span>
            <div>
              <p>Saved successfully!</p>
              <Link href={`/members/${member.slug}`} className="text-xs font-normal underline" style={{ color: "#15803D" }}>
                View your updated public profile →
              </Link>
            </div>
          </div>
        )}

        {error && (
          <div
            className="flex gap-2 items-start px-4 py-3 rounded-lg text-sm"
            style={{ background: "#FEE2E2", color: "#991B1B" }}
          >
            <span className="shrink-0">❌</span> {error}
          </div>
        )}

        <div className="flex items-center gap-4 flex-wrap">
          <button type="submit" disabled={saving} className="btn-primary px-10" style={{ opacity: saving ? 0.7 : 1 }}>
            {saving ? "Saving…" : "💾 Save Gives & Asks"}
          </button>
          <Link href={`/members/${member.slug}`} className="text-sm" style={{ color: "var(--color-gray)" }}>
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}

type PrefilledData = {
  member: GivesAsksBasicMember;
  gives: GiveAskEntry[];
  asks: GiveAskEntry[];
  collaborations: MemberCollaborations;
};

type Props = {
  categories: GivesAsksCategory[];
  prefilled?: PrefilledData | null;
};

export default function GivesAsksClient({ categories, prefilled = null }: Props) {
  const [phase, setPhase] = useState<"verify" | "edit">(prefilled ? "edit" : "verify");
  const [member, setMember] = useState<GivesAsksBasicMember | null>(prefilled?.member ?? null);
  const [gives, setGives] = useState<GiveAskEntry[]>(prefilled?.gives ?? []);
  const [asks, setAsks] = useState<GiveAskEntry[]>(prefilled?.asks ?? []);
  const [collaborations, setCollaborations] = useState<MemberCollaborations | null>(
    prefilled?.collaborations ?? null
  );

  const handleVerified = async (m: GivesAsksBasicMember, g: GiveAskEntry[], a: GiveAskEntry[]) => {
    setMember(m);
    setGives(g);
    setAsks(a);
    setPhase("edit");
    const data = await fetchMemberCollaborationsAction(m.id);
    setCollaborations(data);
  };

  return (
    <>
      <section
        className="px-6 text-center"
        style={{ background: "var(--color-dark)", paddingTop: 100, paddingBottom: 48 }}
      >
        <p className="text-sm font-semibold tracking-widest uppercase mb-3" style={{ color: "var(--color-accent)" }}>
          Member Self-Service
        </p>
        <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-3">My Gives &amp; Asks</h1>
        <p className="text-white/60 text-sm max-w-md mx-auto">
          {phase === "verify"
            ? "Enter your phone number to manage your referral preferences."
            : "Update what you can give and what you need — see who you can collaborate with."}
        </p>

        <div className="flex items-center justify-center gap-3 mt-6">
          {["Verify", "Edit"].map((step, i) => {
            const active = (i === 0 && phase === "verify") || (i === 1 && phase === "edit");
            const done = i === 0 && phase === "edit";
            return (
              <div key={step} className="flex items-center gap-2">
                <div
                  className="flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold"
                  style={{
                    background: done ? "#16A34A" : active ? "var(--color-primary)" : "rgba(255,255,255,0.15)",
                    color: "white",
                  }}
                >
                  {done ? "✓" : i + 1}
                </div>
                <span
                  className="text-xs font-semibold"
                  style={{ color: active ? "white" : done ? "#86EFAC" : "rgba(255,255,255,0.4)" }}
                >
                  {step}
                </span>
                {i < 1 && (
                  <div className="w-8 h-px" style={{ background: done ? "#86EFAC" : "rgba(255,255,255,0.2)" }} />
                )}
              </div>
            );
          })}
        </div>
      </section>

      <section className="py-12 px-6" style={{ background: "var(--color-bg)" }}>
        {phase === "verify" ? (
          <PhoneForm onVerified={handleVerified} />
        ) : (
          member && (
            <EditGivesAsks
              member={member}
              initialGives={gives}
              initialAsks={asks}
              initialCollaborations={collaborations}
              categories={categories}
            />
          )
        )}
      </section>
    </>
  );
}
