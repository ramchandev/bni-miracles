"use client";

import { useState } from "react";
import { useRouter } from "nextjs-toploader/app";
import Image from "next/image";
import {
  saveMemberDetailsAction,
  type VerifiedMember,
} from "@/app/actions/member-self-edit";
import GivesAsksCategoryLineItems from "@/components/GivesAsksCategoryLineItems";
import type { GiveAskEntry } from "@/lib/gives-asks-categories";
import type { GivesAsksCategory } from "@/lib/supabase";

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

type Props = {
  member: VerifiedMember;
  gives: GiveAskEntry[];
  asks: GiveAskEntry[];
  categories: GivesAsksCategory[];
};

export default function EditMyDetailsClient({ member, gives: initialGives, asks: initialAsks, categories }: Props) {
  const router = useRouter();

  const [businessName, setBusinessName] = useState(member.business_name ?? "");
  const [businessLocation, setBusinessLocation] = useState(member.business_location ?? "");
  const [website, setWebsite] = useState(member.website ?? "");
  const [email, setEmail] = useState(member.email ?? "");
  const [services, setServices] = useState(member.services ?? "");
  const [whyChooseUs, setWhyChooseUs] = useState(member.why_choose_us ?? "");
  const [successStories, setSuccessStories] = useState(member.success_stories ?? "");
  const [gives, setGives] = useState<GiveAskEntry[]>(initialGives);
  const [asks, setAsks] = useState<GiveAskEntry[]>(initialAsks);

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
      email,
      services,
      why_choose_us: whyChooseUs,
      success_stories: successStories,
      gives: gives.filter((g) => g.text.trim()),
      asks: asks.filter((a) => a.text.trim()),
    });

    setSaving(false);

    if (result.error) {
      setError(result.error);
    } else {
      router.push(`/members/${member.slug}`);
    }
  };

  return (
    <>
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
        <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-3">Update Your Profile</h1>
        <p className="text-white/60 text-sm max-w-md mx-auto">
          Changes are live on your public member page immediately after saving.
        </p>
      </section>

      <section className="py-12 px-6" style={{ background: "var(--color-bg)" }}>
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
                <div>
                  <label style={labelStyle}>
                    Business Name <span style={{ color: "var(--color-primary)" }}>*</span>
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

                <div>
                  <label style={labelStyle}>Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@yourbusiness.com"
                    className={inputCls}
                    style={inputStyle}
                    autoComplete="email"
                  />
                  <p style={hintStyle}>Shown on your public profile. Leave blank to hide.</p>
                </div>
              </div>
            </section>

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
                  textPlaceholder="e.g. Hardware retailers"
                />
              </div>
            </section>

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
                <div>
                  <label style={labelStyle}>
                    Services / Products Offered <span style={{ color: "var(--color-primary)" }}>*</span>
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

                <div>
                  <label style={labelStyle}>
                    Why Choose Us <span style={{ color: "var(--color-primary)" }}>*</span>
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
      </section>
    </>
  );
}
