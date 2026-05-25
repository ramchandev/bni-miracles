"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  verifyMemberAction,
  saveMemberDetailsAction,
  type VerifiedMember,
} from "@/app/actions/member-self-edit";

/* ── Styles shared across the form ──────────────────────────────────────── */

const inputCls =
  "w-full px-4 py-3 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-200";
const inputStyle = { border: "1.5px solid #E5E7EB" };
const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 13,
  fontWeight: 600,
  marginBottom: 4,
  color: "var(--color-dark)",
};
const hintStyle: React.CSSProperties = { fontSize: 12, color: "var(--color-gray)", marginTop: 3 };

/* ── Line items (Gives / Asks) ───────────────────────────────────────────── */

function LineItems({
  label,
  emoji,
  color,
  items,
  onChange,
  placeholder,
}: {
  label: string;
  emoji: string;
  color: string;
  items: string[];
  onChange: (next: string[]) => void;
  placeholder: string;
}) {
  const add = () => onChange([...items, ""]);
  const remove = (i: number) => onChange(items.filter((_, idx) => idx !== i));
  const update = (i: number, val: string) =>
    onChange(items.map((item, idx) => (idx === i ? val : item)));

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-base">{emoji}</span>
        <p className="text-sm font-bold" style={{ color }}>
          {label}
        </p>
      </div>

      <div className="flex flex-col gap-2">
        {items.map((item, i) => (
          <div key={i} className="flex gap-2">
            <input
              type="text"
              value={item}
              onChange={(e) => update(i, e.target.value)}
              placeholder={placeholder}
              className={inputCls + " flex-1"}
              style={inputStyle}
            />
            <button
              type="button"
              onClick={() => remove(i)}
              className="px-3 py-2 rounded-lg text-sm font-bold transition-colors hover:bg-red-50"
              style={{ color: "var(--color-primary)", border: "1.5px solid #FCA5A5" }}
              title="Remove"
            >
              ✕
            </button>
          </div>
        ))}
        {items.length === 0 && (
          <p className="text-xs italic" style={{ color: "var(--color-gray)" }}>
            No {label.toLowerCase()} added yet.
          </p>
        )}
      </div>

      <button
        type="button"
        onClick={add}
        className="mt-3 flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors hover:opacity-80"
        style={{ background: color + "15", color, border: `1px solid ${color}40` }}
      >
        + Add {label.slice(0, -1)}
      </button>
    </div>
  );
}

/* ── Verify phase ────────────────────────────────────────────────────────── */

function VerifyForm({
  onVerified,
}: {
  onVerified: (member: VerifiedMember, gives: string[], asks: string[]) => void;
}) {
  const [phone, setPhone] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const result = await verifyMemberAction(phone, answer);
    setLoading(false);
    if (!result.ok) {
      setError(result.error);
    } else {
      onVerified(result.member, result.gives, result.asks);
    }
  };

  return (
    <div style={{ maxWidth: 480, margin: "0 auto" }}>
      <div className="card p-8">
        {/* Icon */}
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-5 mx-auto"
          style={{ background: "#FEE2E2" }}
        >
          ✏️
        </div>

        <h2
          className="text-xl font-extrabold text-center mb-1"
          style={{ color: "var(--color-dark)" }}
        >
          Edit Your Profile
        </h2>
        <p className="text-sm text-center mb-6" style={{ color: "var(--color-gray)" }}>
          Verify your identity to update your business details.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Phone */}
          <div>
            <label style={labelStyle}>
              Your Phone Number{" "}
              <span style={{ color: "var(--color-primary)" }}>*</span>
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. 9841767641 or 91 98417 67641"
              required
              className={inputCls}
              style={inputStyle}
            />
            <p style={hintStyle}>
              Enter the number registered with BNI Miracles — with or without the country code.
            </p>
          </div>

          {/* Security question */}
          <div>
            <label style={labelStyle}>
              Where does BNI Miracles usually meet in person?{" "}
              <span style={{ color: "var(--color-primary)" }}>*</span>
            </label>
            <input
              type="text"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Hotel name…"
              required
              className={inputCls}
              style={inputStyle}
            />
            <p style={hintStyle}>This is a quick security check — not case sensitive.</p>
          </div>

          {error && (
            <div
              className="flex gap-2 items-start px-4 py-3 rounded-lg text-sm"
              style={{ background: "#FEE2E2", color: "#991B1B" }}
            >
              <span className="shrink-0">❌</span>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full"
            style={{ opacity: loading ? 0.7 : 1 }}
          >
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

/* ── Edit phase ──────────────────────────────────────────────────────────── */

function EditForm({
  member,
  initialGives,
  initialAsks,
}: {
  member: VerifiedMember;
  initialGives: string[];
  initialAsks: string[];
}) {
  const router = useRouter();

  const [businessName, setBusinessName] = useState(member.business_name ?? "");
  const [businessLocation, setBusinessLocation] = useState(member.business_location ?? "");
  const [website, setWebsite] = useState(member.website ?? "");
  const [services, setServices] = useState(member.services ?? "");
  const [whyChooseUs, setWhyChooseUs] = useState(member.why_choose_us ?? "");
  const [successStories, setSuccessStories] = useState(member.success_stories ?? "");
  const [gives, setGives] = useState<string[]>(initialGives.length ? initialGives : [""]);
  const [asks, setAsks] = useState<string[]>(initialAsks.length ? initialAsks : [""]);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName.trim()) {
      setError("Business Name is required.");
      return;
    }
    setSaving(true);
    setError("");

    const result = await saveMemberDetailsAction({
      memberId: member.id,
      slug: member.slug,
      business_name: businessName,
      business_location: businessLocation,
      website,
      services,
      why_choose_us: whyChooseUs,
      success_stories: successStories,
      gives: gives.filter((g) => g.trim()),
      asks: asks.filter((a) => a.trim()),
    });

    setSaving(false);

    if (result.error) {
      setError(result.error);
    } else {
      router.push(`/members/${member.slug}`);
    }
  };

  return (
    <div style={{ maxWidth: 720, margin: "0 auto" }}>
      {/* Welcome strip */}
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
            className="flex items-center justify-center rounded-full shrink-0 text-white font-bold text-lg"
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
            {member.category} · Update your details below and save.
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="flex flex-col gap-8">

        {/* ── Business Details ─────────────────────────────────────────── */}
        <section
          className="rounded-2xl p-6"
          style={{ background: "white", border: "1.5px solid #E5E7EB" }}
        >
          <h3
            className="text-base font-extrabold mb-5 pb-3"
            style={{ color: "var(--color-dark)", borderBottom: "1px solid #F3F4F6" }}
          >
            🏢 Business Details
          </h3>

          <div className="flex flex-col gap-5">
            {/* Business Name */}
            <div>
              <label style={labelStyle}>
                Business Name{" "}
                <span style={{ color: "var(--color-primary)" }}>*</span>
              </label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="Your business name"
                required
                className={inputCls}
                style={inputStyle}
              />
            </div>

            {/* Business Location */}
            <div>
              <label style={labelStyle}>Business Location</label>
              <input
                type="text"
                value={businessLocation}
                onChange={(e) => setBusinessLocation(e.target.value)}
                placeholder="e.g. Anna Nagar, Chennai"
                className={inputCls}
                style={inputStyle}
              />
            </div>

            {/* Website */}
            <div>
              <label style={labelStyle}>Website</label>
              <input
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://yourbusiness.com"
                className={inputCls}
                style={inputStyle}
              />
            </div>
          </div>
        </section>

        {/* ── Gives & Asks ─────────────────────────────────────────────── */}
        <section
          className="rounded-2xl p-6"
          style={{ background: "white", border: "1.5px solid #E5E7EB" }}
        >
          <h3
            className="text-base font-extrabold mb-5 pb-3"
            style={{ color: "var(--color-dark)", borderBottom: "1px solid #F3F4F6" }}
          >
            🤝 Gives &amp; Asks
          </h3>
          <p className="text-xs mb-5" style={{ color: "var(--color-gray)" }}>
            What referrals can you give? What referrals are you looking for?
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            <LineItems
              label="Gives"
              emoji="✅"
              color="#16A34A"
              items={gives}
              onChange={setGives}
              placeholder="e.g. Interior design clients"
            />
            <LineItems
              label="Asks"
              emoji="🙏"
              color="#DC2626"
              items={asks}
              onChange={setAsks}
              placeholder="e.g. New home owners"
            />
          </div>
        </section>

        {/* ── Profile Details ───────────────────────────────────────────── */}
        <section
          className="rounded-2xl p-6"
          style={{ background: "white", border: "1.5px solid #E5E7EB" }}
        >
          <h3
            className="text-base font-extrabold mb-5 pb-3"
            style={{ color: "var(--color-dark)", borderBottom: "1px solid #F3F4F6" }}
          >
            📝 Profile Details
          </h3>

          <div className="flex flex-col gap-5">
            {/* Services */}
            <div>
              <label style={labelStyle}>
                Services / Products Offered{" "}
                <span style={{ color: "var(--color-primary)" }}>*</span>
              </label>
              <textarea
                value={services}
                onChange={(e) => setServices(e.target.value)}
                placeholder="Describe what you offer — this appears on your public profile."
                rows={4}
                className={inputCls}
                style={{ ...inputStyle, resize: "vertical" }}
              />
            </div>

            {/* Why Choose Us */}
            <div>
              <label style={labelStyle}>
                Why Choose Us{" "}
                <span style={{ color: "var(--color-primary)" }}>*</span>
              </label>
              <textarea
                value={whyChooseUs}
                onChange={(e) => setWhyChooseUs(e.target.value)}
                placeholder="What sets you apart from others in your field?"
                rows={3}
                className={inputCls}
                style={{ ...inputStyle, resize: "vertical" }}
              />
            </div>

            {/* Success Stories */}
            <div>
              <label style={labelStyle}>Success Stories</label>
              <textarea
                value={successStories}
                onChange={(e) => setSuccessStories(e.target.value)}
                placeholder="Share a testimonial or a referral win — builds trust with visitors."
                rows={3}
                className={inputCls}
                style={{ ...inputStyle, resize: "vertical" }}
              />
              <p style={hintStyle}>Optional but recommended — shows social proof.</p>
            </div>
          </div>
        </section>

        {/* ── Error & Save ─────────────────────────────────────────────── */}
        {error && (
          <div
            className="flex gap-2 items-start px-4 py-3 rounded-lg text-sm"
            style={{ background: "#FEE2E2", color: "#991B1B" }}
          >
            <span className="shrink-0">❌</span>
            {error}
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="btn-primary w-full sm:w-auto px-10"
            style={{ opacity: saving ? 0.7 : 1 }}
          >
            {saving ? "Saving…" : "💾 Save & View Profile"}
          </button>
          <p className="text-xs text-center" style={{ color: "var(--color-gray)" }}>
            You&apos;ll be taken to your public member profile after saving.
          </p>
        </div>
      </form>
    </div>
  );
}

/* ── Root component ──────────────────────────────────────────────────────── */

export default function EditMyDetailsClient() {
  const [phase, setPhase] = useState<"verify" | "edit">("verify");
  const [member, setMember] = useState<VerifiedMember | null>(null);
  const [gives, setGives] = useState<string[]>([]);
  const [asks, setAsks] = useState<string[]>([]);

  const handleVerified = (m: VerifiedMember, g: string[], a: string[]) => {
    setMember(m);
    setGives(g);
    setAsks(a);
    setPhase("edit");
  };

  return (
    <>
      {/* ── Hero ────────────────────────────────────────────────────── */}
      <section
        className="px-6 text-center"
        style={{ background: "var(--color-dark)", paddingTop: 100, paddingBottom: 48 }}
      >
        <p
          className="text-sm font-semibold tracking-widest uppercase mb-3"
          style={{ color: "var(--color-accent)" }}
        >
          Member Portal
        </p>
        <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-3">
          {phase === "verify" ? "Edit My Details" : `Update Your Profile`}
        </h1>
        <p className="text-white/60 text-sm max-w-md mx-auto">
          {phase === "verify"
            ? "Verify your identity, then update your business profile directly."
            : "Changes are live on your public member page immediately after saving."}
        </p>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-3 mt-6">
          {["Verify", "Edit"].map((step, i) => {
            const active = (i === 0 && phase === "verify") || (i === 1 && phase === "edit");
            const done   = i === 0 && phase === "edit";
            return (
              <div key={step} className="flex items-center gap-2">
                <div
                  className="flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold transition-colors"
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
                  <div
                    className="w-8 h-px"
                    style={{ background: done ? "#86EFAC" : "rgba(255,255,255,0.2)" }}
                  />
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Content ─────────────────────────────────────────────────── */}
      <section className="py-12 px-6" style={{ background: "var(--color-bg)" }}>
        {phase === "verify" ? (
          <VerifyForm onVerified={handleVerified} />
        ) : (
          member && (
            <EditForm member={member} initialGives={gives} initialAsks={asks} />
          )
        )}
      </section>
    </>
  );
}
