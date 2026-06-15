"use client";

import { useState } from "react";
import Image from "next/image";
import { saveDanceCardAction } from "@/app/actions/dance-card";
import {
  EMPTY_DATA,
  type DanceCardData,
  type DanceCardRow,
  type ContactSphereEntry,
  type CustomerEntry,
} from "@/lib/dance-card-types";
import type { SessionMember } from "@/lib/supabase";

/* ── Shared input styles ─────────────────────────────────────────────── */
const inputCls = "w-full px-3 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-200";
const border   = { border: "1.5px solid #E5E7EB" } as const;
const label    = (text: string, required = false) => (
  <label className="block text-xs font-semibold mb-1" style={{ color: "var(--color-dark)" }}>
    {text}{required && <span style={{ color: "var(--color-primary)" }}> *</span>}
  </label>
);
const hint = (text: string) => (
  <p className="text-xs mt-1 italic" style={{ color: "var(--color-gray)" }}>{text}</p>
);

type Tab = "bio" | "gains" | "contact" | "customers";
type Mode = "form" | "view";

const TABS: { id: Tab; emoji: string; title: string }[] = [
  { id: "bio",       emoji: "👤", title: "BIO Sheet" },
  { id: "gains",     emoji: "🎯", title: "GAINS" },
  { id: "contact",   emoji: "🤝", title: "Contact Sphere" },
  { id: "customers", emoji: "💼", title: "Last 10 Customers" },
];

/* ── Main component ──────────────────────────────────────────────────── */

export default function DanceCardClient({
  member,
  initialData,
}: {
  member: SessionMember & { business_name?: string; category?: string };
  initialData: DanceCardRow | null;
}) {
  const [mode, setMode]         = useState<Mode>(initialData?.pdf_generated_at ? "view" : "form");
  const [activeTab, setActiveTab] = useState<Tab>("bio");
  const [saving, setSaving]       = useState(false);
  const [saveMsg, setSaveMsg]     = useState("");
  const [formData, setFormData]   = useState<DanceCardData>(() => {
    if (!initialData) return EMPTY_DATA;
    return {
      bio_profession:     initialData.bio_profession     ?? "",
      bio_location:       initialData.bio_location       ?? "",
      bio_years:          initialData.bio_years          ?? "",
      bio_previous_jobs:  initialData.bio_previous_jobs  ?? "",
      bio_spouse:         initialData.bio_spouse         ?? "",
      bio_children:       initialData.bio_children       ?? "",
      bio_animals:        initialData.bio_animals        ?? "",
      bio_hobbies:        initialData.bio_hobbies        ?? "",
      bio_activities:     initialData.bio_activities     ?? "",
      bio_city:           initialData.bio_city           ?? "",
      bio_city_duration:  initialData.bio_city_duration  ?? "",
      bio_burning_desire: initialData.bio_burning_desire ?? "",
      bio_secret:         initialData.bio_secret         ?? "",
      bio_key_to_success: initialData.bio_key_to_success ?? "",
      gains_goals:          initialData.gains_goals          ?? "",
      gains_accomplishments:initialData.gains_accomplishments ?? "",
      gains_interests:      initialData.gains_interests      ?? "",
      gains_networks:       initialData.gains_networks       ?? "",
      gains_skills:         initialData.gains_skills         ?? "",
      contact_sphere:    initialData.contact_sphere,
      top_3_professions: initialData.top_3_professions,
      last_customers:    initialData.last_customers,
      referral_sources:  initialData.referral_sources  ?? "",
      good_referrals:    initialData.good_referrals    ?? "",
      bad_referrals:     initialData.bad_referrals     ?? "",
    };
  });

  const set = (key: keyof DanceCardData, value: unknown) =>
    setFormData((prev) => ({ ...prev, [key]: value }));

  const saveAll = async (): Promise<boolean> => {
    setSaving(true); setSaveMsg("");
    const res = await saveDanceCardAction(member.id, formData);
    setSaving(false);
    if (res.error) { setSaveMsg("❌ " + res.error); return false; }
    setSaveMsg("✅ Saved!");
    setTimeout(() => setSaveMsg(""), 3000);
    return true;
  };

  const [downloading, setDownloading] = useState(false);

  const triggerDownload = async () => {
    setDownloading(true);
    try {
      const res = await fetch("/api/dance-card-pdf");
      if (!res.ok) throw new Error("PDF generation failed");
      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href     = url;
      // The server sets Content-Disposition; this is the browser fallback name
      a.download = "Dance-Card.pdf";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      setSaveMsg("❌ Could not generate PDF. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  const generatePDF = async () => {
    const ok = await saveAll();
    if (!ok) return;
    setMode("view");
    await triggerDownload();
  };

  const downloadPDF = () => triggerDownload();

  /* ── View mode ────────────────────────────────────────────────────── */
  if (mode === "view") {
    return (
      <div style={{ maxWidth: 820, margin: "0 auto" }}>
        {/* Ready banner */}
        <div className="rounded-2xl p-6 mb-6 flex flex-col sm:flex-row items-start sm:items-center gap-4"
          style={{ background: "linear-gradient(135deg,#ECFDF5,#DCFCE7)", border: "1.5px solid #86EFAC" }}>
          <span className="text-4xl">🎉</span>
          <div className="flex-1">
            <p className="font-extrabold text-lg" style={{ color: "#166534" }}>Your Dance Card is ready!</p>
            {initialData?.pdf_generated_at && (
              <p className="text-sm" style={{ color: "#15803D" }}>
                Last generated: {new Date(initialData.pdf_generated_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
              </p>
            )}
          </div>
          <div className="flex gap-3 flex-wrap">
            <button onClick={() => setMode("form")} className="btn-outline text-sm px-5">
              ✏️ Edit
            </button>
            <button
              onClick={downloadPDF}
              disabled={downloading}
              className="btn-primary text-sm px-5"
              style={{ opacity: downloading ? 0.7 : 1 }}
            >
              {downloading ? "Generating…" : "⬇️ Download PDF"}
            </button>
          </div>
        </div>

        {/* Summary cards */}
        <div className="flex flex-col gap-4">
          {/* BIO */}
          <ViewCard title="👤 BIO Sheet" onEdit={() => { setMode("form"); setActiveTab("bio"); }}>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                ["Profession",    formData.bio_profession],
                ["Location",      formData.bio_location],
                ["Years in Biz",  formData.bio_years],
                ["City",          formData.bio_city],
                ["Spouse",        formData.bio_spouse],
                ["Children",      formData.bio_children],
              ].filter(([, v]) => v).map(([k, v]) => (
                <div key={k as string} className="flex gap-2">
                  <span className="text-xs font-semibold w-24 shrink-0" style={{ color: "var(--color-gray)" }}>{k}:</span>
                  <span className="text-xs">{v}</span>
                </div>
              ))}
            </div>
            {formData.bio_burning_desire && (
              <p className="text-xs mt-3 italic" style={{ color: "var(--color-gray)" }}>
                🔥 {formData.bio_burning_desire}
              </p>
            )}
          </ViewCard>

          {/* GAINS */}
          <ViewCard title="🎯 GAINS Worksheet" onEdit={() => { setMode("form"); setActiveTab("gains"); }}>
            <div className="grid sm:grid-cols-2 gap-3">
              {(["G Goals","A Accomplishments","I Interests","N Networks","S Skills"] as const).map((label, i) => {
                const keys = ["gains_goals","gains_accomplishments","gains_interests","gains_networks","gains_skills"] as const;
                const val = formData[keys[i]];
                return val ? (
                  <div key={label}>
                    <p className="text-xs font-bold" style={{ color: "var(--color-primary)" }}>{label}</p>
                    <p className="text-xs mt-0.5 line-clamp-2" style={{ color: "var(--color-gray)" }}>{val}</p>
                  </div>
                ) : null;
              })}
            </div>
          </ViewCard>

          {/* Contact Sphere */}
          <ViewCard title="🤝 Contact Sphere" onEdit={() => { setMode("form"); setActiveTab("contact"); }}>
            <div className="grid sm:grid-cols-2 gap-2">
              {formData.contact_sphere.filter((c) => c.name).slice(0, 6).map((c, i) => (
                <div key={i} className="text-xs flex gap-2">
                  <span className="w-4 text-right shrink-0" style={{ color: "var(--color-gray)" }}>{i+1}.</span>
                  <span>{c.name} {c.profession && <span style={{ color: "var(--color-gray)" }}>({c.profession})</span>}</span>
                </div>
              ))}
            </div>
          </ViewCard>

          {/* Last 10 Customers */}
          <ViewCard title="💼 Last 10 Customers" onEdit={() => { setMode("form"); setActiveTab("customers"); }}>
            <div className="grid sm:grid-cols-2 gap-2">
              {formData.last_customers.filter((c) => c.name).slice(0, 6).map((c, i) => (
                <div key={i} className="text-xs flex gap-2">
                  <span className="w-4 text-right shrink-0" style={{ color: "var(--color-gray)" }}>{i+1}.</span>
                  <span>{c.name}</span>
                </div>
              ))}
            </div>
          </ViewCard>
        </div>
      </div>
    );
  }

  /* ── Form mode ────────────────────────────────────────────────────── */
  return (
    <div style={{ maxWidth: 820, margin: "0 auto" }}>
      {/* Member strip */}
      <div className="flex items-center gap-4 rounded-2xl p-4 mb-6"
        style={{ background: "white", border: "1.5px solid #E5E7EB" }}>
        {member.profile_picture_url ? (
          <Image src={member.profile_picture_url} alt={member.name} width={48} height={48}
            className="rounded-full object-cover shrink-0" style={{ width: 48, height: 48 }} />
        ) : (
          <div className="flex items-center justify-center w-12 h-12 rounded-full shrink-0 text-white font-bold text-xl"
            style={{ background: "var(--color-primary)" }}>
            {member.name.charAt(0).toUpperCase()}
          </div>
        )}
        <div>
          <p className="font-extrabold" style={{ color: "var(--color-dark)" }}>{member.name}</p>
          {member.category && <p className="text-sm" style={{ color: "var(--color-gray)" }}>{member.category}</p>}
        </div>
        <p className="ml-auto text-xs" style={{ color: "var(--color-gray)" }}>
          🎴 One-on-One Dance Card Planner
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 p-1 rounded-xl" style={{ background: "#F3F4F6" }}>
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-semibold transition-all"
            style={{
              background:  activeTab === tab.id ? "white" : "transparent",
              color:       activeTab === tab.id ? "var(--color-dark)" : "var(--color-gray)",
              boxShadow:   activeTab === tab.id ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
            }}
          >
            <span>{tab.emoji}</span>
            <span className="hidden sm:inline">{tab.title}</span>
          </button>
        ))}
      </div>

      {/* Tab panels */}
      <div className="rounded-2xl p-6" style={{ background: "white", border: "1.5px solid #E5E7EB" }}>
        {activeTab === "bio"       && <BioTab       data={formData} member={member} set={set} />}
        {activeTab === "gains"     && <GainsTab     data={formData} set={set} />}
        {activeTab === "contact"   && <ContactTab   data={formData} set={set} />}
        {activeTab === "customers" && <CustomersTab data={formData} set={set} />}
      </div>

      {/* Bottom bar */}
      <div className="flex flex-wrap items-center gap-3 mt-5">
        <button onClick={saveAll} disabled={saving}
          className="btn-outline text-sm px-6" style={{ opacity: saving ? 0.7 : 1 }}>
          {saving ? "Saving…" : "💾 Save Progress"}
        </button>
        <button onClick={generatePDF} disabled={saving || downloading}
          className="btn-primary text-sm px-6" style={{ opacity: (saving || downloading) ? 0.7 : 1 }}>
          {downloading ? "Generating PDF…" : "🎴 Generate & Download PDF"}
        </button>
        {initialData?.pdf_generated_at && (
          <button onClick={() => setMode("view")} className="text-sm" style={{ color: "var(--color-gray)" }}>
            ← Back to view
          </button>
        )}
        {saveMsg && (
          <span className="text-sm font-medium"
            style={{ color: saveMsg.startsWith("✅") ? "#16A34A" : "#DC2626" }}>{saveMsg}</span>
        )}
      </div>
    </div>
  );
}

/* ── Reusable ViewCard ───────────────────────────────────────────────── */
function ViewCard({ title, children, onEdit }: { title: string; children: React.ReactNode; onEdit: () => void }) {
  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: "white", border: "1px solid #E5E7EB" }}>
      <div className="flex items-center justify-between px-5 py-3" style={{ borderBottom: "1px solid #F3F4F6" }}>
        <p className="font-bold text-sm" style={{ color: "var(--color-dark)" }}>{title}</p>
        <button onClick={onEdit} className="text-xs font-semibold" style={{ color: "var(--color-primary)" }}>Edit →</button>
      </div>
      <div className="px-5 py-4">{children}</div>
    </div>
  );
}

/* ── Tab: BIO Sheet ──────────────────────────────────────────────────── */
function BioTab({ data, member, set }: {
  data: DanceCardData;
  member: { business_name?: string };
  set: (k: keyof DanceCardData, v: unknown) => void;
}) {
  const inp = (k: keyof DanceCardData, type = "text") => (
    <input type={type} value={data[k] as string} onChange={(e) => set(k, e.target.value)}
      className={inputCls} style={border} />
  );
  const ta = (k: keyof DanceCardData, rows = 3) => (
    <textarea value={data[k] as string} onChange={(e) => set(k, e.target.value)}
      rows={rows} className={inputCls} style={{ ...border, resize: "vertical" as const }} />
  );

  return (
    <div className="flex flex-col gap-5">
      <SectionTitle>🏢 Business Information</SectionTitle>
      {member.business_name && (
        <div>
          {label("Business Name")}
          <div className="px-3 py-2.5 rounded-lg text-sm font-semibold" style={{ background: "#F9FAFB", border: "1.5px solid #E5E7EB", color: "var(--color-dark)" }}>
            {member.business_name}
          </div>
          {hint("From your member profile — edit in Edit Profile")}
        </div>
      )}
      <div className="grid sm:grid-cols-2 gap-5">
        <div>{label("Profession")} {inp("bio_profession")}</div>
        <div>{label("Location")} {inp("bio_location")}</div>
        <div>{label("Years in This Business")} {inp("bio_years","number")}</div>
      </div>
      <div>{label("Previous Types of Jobs")} {ta("bio_previous_jobs", 2)}</div>

      <SectionTitle>👨‍👩‍👧 Personal Information</SectionTitle>
      <div className="grid sm:grid-cols-3 gap-5">
        <div>{label("Spouse")}   {inp("bio_spouse")}</div>
        <div>{label("Children")} {inp("bio_children")}</div>
        <div>{label("Animals")}  {inp("bio_animals")}</div>
      </div>
      <div className="grid sm:grid-cols-2 gap-5">
        <div>{label("Hobbies")}               {ta("bio_hobbies", 2)}</div>
        <div>{label("Activities of Interest")}{ta("bio_activities", 2)}</div>
        <div>{label("City of Residence")}     {inp("bio_city")}</div>
        <div>{label("How Long?")}             {inp("bio_city_duration")}</div>
      </div>

      <SectionTitle>✨ Miscellaneous</SectionTitle>
      <div>{label("My burning desire is to…")} {ta("bio_burning_desire", 2)}</div>
      <div>{label("Something no one knows about me")} {ta("bio_secret", 2)}</div>
      <div>{label("My key to success")} {ta("bio_key_to_success", 2)}</div>
    </div>
  );
}

/* ── Tab: GAINS ──────────────────────────────────────────────────────── */
function GainsTab({ data, set }: { data: DanceCardData; set: (k: keyof DanceCardData, v: unknown) => void }) {
  const ITEMS = [
    { key: "gains_goals" as const,          letter: "G", title: "Goals",           desc: "Business or personal objectives you want or need to meet for yourself or the people who are important to you." },
    { key: "gains_accomplishments" as const, letter: "A", title: "Accomplishments",  desc: "People like to talk about things they are proud of. Your knowledge, skills, experiences and values can be surmised from your achievements." },
    { key: "gains_interests" as const,       letter: "I", title: "Interests",        desc: "Things like playing sports, reading books and listening to music. People like to spend time with those who share their interests." },
    { key: "gains_networks" as const,        letter: "N", title: "Networks",         desc: "You have many networks, both formal and informal. A network can be an organisation, institution, company or individual you associate with." },
    { key: "gains_skills" as const,          letter: "S", title: "Skills",           desc: "The more people know about your skills, the better your chances! The more you know about others' talents and abilities, the better equipped you are to find referrals." },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-xl px-4 py-3 text-sm" style={{ background: "#F9FAFB", border: "1px solid #E5E7EB" }}>
        <p style={{ color: "var(--color-gray)" }}>
          GAINS stands for <strong>G</strong>oals · <strong>A</strong>ccomplishments · <strong>I</strong>nterests · <strong>N</strong>etworks · <strong>S</strong>kills.
          Fill in each section to help your dance partner know how to refer business to you.
        </p>
      </div>

      {ITEMS.map((item) => (
        <div key={item.key}>
          <div className="flex items-center gap-3 mb-2">
            <div className="flex items-center justify-center w-9 h-9 rounded-full text-white font-extrabold text-lg shrink-0"
              style={{ background: "var(--color-primary)" }}>
              {item.letter}
            </div>
            <div>
              <p className="font-bold text-sm" style={{ color: "var(--color-dark)" }}>{item.title}</p>
              <p className="text-xs" style={{ color: "var(--color-gray)" }}>{item.desc}</p>
            </div>
          </div>
          <textarea
            value={data[item.key]}
            onChange={(e) => set(item.key, e.target.value)}
            rows={3}
            placeholder={`Your ${item.title.toLowerCase()}…`}
            className={inputCls}
            style={{ ...border, resize: "vertical" as const }}
          />
        </div>
      ))}
    </div>
  );
}

/* ── Tab: Contact Sphere ─────────────────────────────────────────────── */
function ContactTab({ data, set }: { data: DanceCardData; set: (k: keyof DanceCardData, v: unknown) => void }) {
  const updateContact = (i: number, field: keyof ContactSphereEntry, val: string) => {
    const updated = data.contact_sphere.map((c, idx) => idx === i ? { ...c, [field]: val } : c);
    set("contact_sphere", updated);
  };
  const updateTop3 = (i: number, val: string) => {
    const updated = data.top_3_professions.map((v, idx) => idx === i ? val : v);
    set("top_3_professions", updated);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-xl px-4 py-3 text-sm" style={{ background: "#F9FAFB", border: "1px solid #E5E7EB" }}>
        <p style={{ color: "var(--color-gray)" }}>
          Your Contact Sphere is made up of businesses that naturally provide referrals for one another —
          related but non-competitive. List up to 10 people in your sphere.
        </p>
      </div>

      <div>
        <SectionTitle>My Contact Sphere (up to 10)</SectionTitle>
        <div className="flex flex-col gap-2 mt-3">
          {data.contact_sphere.map((entry, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="w-6 text-xs text-right shrink-0 font-bold" style={{ color: "var(--color-gray)" }}>{i + 1}.</span>
              <input type="text" value={entry.name} onChange={(e) => updateContact(i, "name", e.target.value)}
                placeholder="Name" className={inputCls + " flex-1"} style={border} />
              <input type="text" value={entry.profession} onChange={(e) => updateContact(i, "profession", e.target.value)}
                placeholder="Profession / Business" className={inputCls + " flex-1"} style={border} />
            </div>
          ))}
        </div>
      </div>

      <div>
        <SectionTitle>Top 3 Professions to Add to My Sphere</SectionTitle>
        <p className="text-xs mb-3" style={{ color: "var(--color-gray)" }}>
          What 3 professions would help you round out your contact sphere?
        </p>
        <div className="flex flex-col gap-2">
          {data.top_3_professions.map((val, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="w-6 text-xs text-right shrink-0 font-bold" style={{ color: "var(--color-primary)" }}>{i + 1}.</span>
              <input type="text" value={val} onChange={(e) => updateTop3(i, e.target.value)}
                placeholder={`Profession ${i + 1}`} className={inputCls + " flex-1"} style={border} />
            </div>
          ))}
        </div>
        <p className="text-xs mt-3 italic" style={{ color: "var(--color-gray)" }}>
          💡 Make a commitment to your dance partner to help fill their Contact Sphere by inviting these professionals to the chapter!
        </p>
      </div>
    </div>
  );
}

/* ── Tab: Last 10 Customers ──────────────────────────────────────────── */
function CustomersTab({ data, set }: { data: DanceCardData; set: (k: keyof DanceCardData, v: unknown) => void }) {
  const updateCustomer = (i: number, field: keyof CustomerEntry, val: string) => {
    const updated = data.last_customers.map((c, idx) => idx === i ? { ...c, [field]: val } : c);
    set("last_customers", updated);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-xl px-4 py-3 text-sm" style={{ background: "#F9FAFB", border: "1px solid #E5E7EB" }}>
        <p style={{ color: "var(--color-gray)" }}>
          List your last 10 customers and make notes. This helps your dance partner understand how to find
          you more customers like these — were they in a certain industry, position, or company type?
        </p>
      </div>

      <div>
        <SectionTitle>Last 10 Customers</SectionTitle>
        <div className="flex flex-col gap-2 mt-3">
          {data.last_customers.map((cust, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className="w-6 text-xs text-right shrink-0 font-bold mt-3" style={{ color: "var(--color-gray)" }}>{i + 1}.</span>
              <div className="flex-1 grid sm:grid-cols-[180px_1fr] gap-2">
                <input type="text" value={cust.name} onChange={(e) => updateCustomer(i, "name", e.target.value)}
                  placeholder="Customer name / type" className={inputCls} style={border} />
                <input type="text" value={cust.notes} onChange={(e) => updateCustomer(i, "notes", e.target.value)}
                  placeholder="Notes (background, what you did…)" className={inputCls} style={border} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-5">
        <div>
          <label className="block text-xs font-semibold mb-1" style={{ color: "var(--color-dark)" }}>Other Referral Sources</label>
          <textarea value={data.referral_sources} onChange={(e) => set("referral_sources", e.target.value)}
            rows={4} placeholder="Where do other referrals come from?" className={inputCls} style={{ ...border, resize: "vertical" as const }} />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1" style={{ color: "var(--color-dark)" }}>Good Referrals</label>
          <textarea value={data.good_referrals} onChange={(e) => set("good_referrals", e.target.value)}
            rows={4} placeholder="What are the best referrals for you?" className={inputCls} style={{ ...border, resize: "vertical" as const }} />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1" style={{ color: "var(--color-dark)" }}>&quot;Bad&quot; Referrals</label>
          <textarea value={data.bad_referrals} onChange={(e) => set("bad_referrals", e.target.value)}
            rows={4} placeholder="What referrals should members avoid for you?" className={inputCls} style={{ ...border, resize: "vertical" as const }} />
        </div>
      </div>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-sm font-extrabold mb-1" style={{ color: "var(--color-dark)" }}>{children}</p>
  );
}
