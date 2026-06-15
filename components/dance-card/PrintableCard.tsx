import type { DanceCardRow } from "@/lib/dance-card-types";
import type { SessionMember } from "@/lib/supabase";

type Props = {
  member: SessionMember & { business_name?: string; category?: string };
  card: DanceCardRow | null;
};

const GAINS = [
  { key: "gains_goals",           letter: "G", title: "Goals",           hint: "Business or personal objectives you want to achieve" },
  { key: "gains_accomplishments", letter: "A", title: "Accomplishments",  hint: "Things you are proud of; past achievements" },
  { key: "gains_interests",       letter: "I", title: "Interests",        hint: "Sports, books, music and other personal interests" },
  { key: "gains_networks",        letter: "N", title: "Networks",         hint: "Organisations, institutions or individuals you associate with" },
  { key: "gains_skills",          letter: "S", title: "Skills",           hint: "Your talents and abilities that others should know about" },
] as const;

export default function PrintableCard({ member, card }: Props) {
  const c = card;

  return (
    <div id="dance-card-print" style={{ fontFamily: "Arial, Helvetica, sans-serif", fontSize: 11, color: "#111", maxWidth: 780, margin: "0 auto", padding: "0 8px" }}>

      {/* ── Header ──────────────────────────────────────────────────── */}
      <div style={{ borderBottom: "3px solid #C8102E", paddingBottom: 12, marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 800, color: "#1A1A2E", letterSpacing: -0.5 }}>
              Miracle Members Dance Card
            </div>
            <div style={{ fontSize: 13, color: "#6B7280", marginTop: 2 }}>
              One-on-One Planner · Chennai Chapter
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontWeight: 700, fontSize: 13 }}>{member.name}</div>
            {member.category && <div style={{ color: "#6B7280", fontSize: 11 }}>{member.category}</div>}
            {c?.pdf_generated_at && (
              <div style={{ color: "#9CA3AF", fontSize: 10, marginTop: 4 }}>
                Generated: {new Date(c.pdf_generated_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── BIO Sheet ───────────────────────────────────────────────── */}
      <SectionHead title="BIO Sheet" />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 20px", marginBottom: 16 }}>
        <Field label="Profession"         value={c?.bio_profession} />
        <Field label="Location"           value={c?.bio_location} />
        <Field label="Years in Business"  value={c?.bio_years} />
        <Field label="City of Residence"  value={c?.bio_city} />
        <Field label="How Long?"          value={c?.bio_city_duration} />
        <Field label="Spouse"             value={c?.bio_spouse} />
        <Field label="Children"           value={c?.bio_children} />
        <Field label="Animals"            value={c?.bio_animals} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 20px", marginBottom: 16 }}>
        <FieldBlock label="Previous Types of Jobs" value={c?.bio_previous_jobs} />
        <FieldBlock label="Hobbies"                value={c?.bio_hobbies} />
        <FieldBlock label="Activities of Interest" value={c?.bio_activities} />
      </div>
      <div style={{ display: "grid", gap: 6, marginBottom: 20 }}>
        <FieldBlock label="My burning desire is to…"         value={c?.bio_burning_desire} />
        <FieldBlock label="Something no one knows about me"  value={c?.bio_secret} />
        <FieldBlock label="My key to success"                value={c?.bio_key_to_success} />
      </div>

      <Divider />

      {/* ── GAINS ───────────────────────────────────────────────────── */}
      <SectionHead title="GAINS Worksheet" />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 20px", marginBottom: 20 }}>
        {GAINS.map((g) => (
          <div key={g.key} style={{ border: "1px solid #E5E7EB", borderRadius: 6, padding: "8px 10px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
              <span style={{ width: 22, height: 22, borderRadius: "50%", background: "#C8102E", color: "#fff", fontWeight: 800, fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center" }}>
                {g.letter}
              </span>
              <span style={{ fontWeight: 700, fontSize: 12 }}>{g.title}</span>
            </div>
            <div style={{ fontSize: 10, color: "#6B7280", marginBottom: 6, fontStyle: "italic" }}>{g.hint}</div>
            <div style={{ minHeight: 48, fontSize: 11, color: "#111", whiteSpace: "pre-wrap", lineHeight: 1.5 }}>
              {c?.[g.key] || <span style={{ color: "#D1D5DB" }}>—</span>}
            </div>
          </div>
        ))}
      </div>

      <Divider />

      {/* ── Contact Sphere ──────────────────────────────────────────── */}
      <SectionHead title="Contact Sphere Planning" />
      <p style={{ fontSize: 10, color: "#6B7280", marginBottom: 10, fontStyle: "italic" }}>
        Businesses that naturally provide referrals for one another — related but non-competitive.
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 20px", marginBottom: 12 }}>
        {(c?.contact_sphere ?? []).map((entry, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, borderBottom: "1px solid #F3F4F6", paddingBottom: 4 }}>
            <span style={{ width: 18, height: 18, borderRadius: "50%", background: "#F3F4F6", color: "#6B7280", fontSize: 10, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{i + 1}</span>
            <div style={{ flex: 1 }}>
              <span style={{ fontWeight: 600 }}>{entry.name || "—"}</span>
              {entry.profession && <span style={{ color: "#6B7280", marginLeft: 6, fontSize: 10 }}>({entry.profession})</span>}
            </div>
          </div>
        ))}
      </div>
      {(c?.top_3_professions ?? []).some(Boolean) && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontWeight: 700, fontSize: 11, marginBottom: 4 }}>Top 3 Professions to Add to My Contact Sphere:</div>
          {c?.top_3_professions.filter(Boolean).map((p, i) => (
            <div key={i} style={{ paddingLeft: 12, marginBottom: 2 }}>📌 {p}</div>
          ))}
        </div>
      )}

      <Divider />

      {/* ── Last 10 Customers ───────────────────────────────────────── */}
      <SectionHead title="Last 10 Customers" />
      <p style={{ fontSize: 10, color: "#6B7280", marginBottom: 10, fontStyle: "italic" }}>
        List your last 10 customers. Help your dance partner understand how to find you more customers like these.
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 20px", marginBottom: 12 }}>
        {(c?.last_customers ?? []).map((cust, i) => (
          <div key={i} style={{ borderBottom: "1px solid #F3F4F6", paddingBottom: 6 }}>
            <div style={{ display: "flex", gap: 8 }}>
              <span style={{ width: 18, height: 18, borderRadius: "50%", background: "#F3F4F6", color: "#6B7280", fontSize: 10, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>{i + 1}</span>
              <div>
                <div style={{ fontWeight: 600 }}>{cust.name || "—"}</div>
                {cust.notes && <div style={{ color: "#6B7280", fontSize: 10 }}>{cust.notes}</div>}
              </div>
            </div>
          </div>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "6px 20px", marginTop: 8 }}>
        <FieldBlock label="Other Referral Sources"  value={c?.referral_sources} />
        <FieldBlock label="Good Referrals"          value={c?.good_referrals} />
        <FieldBlock label="&ldquo;Bad&rdquo; Referrals" value={c?.bad_referrals} />
      </div>

      {/* ── Footer ──────────────────────────────────────────────────── */}
      <div style={{ marginTop: 24, paddingTop: 12, borderTop: "1px solid #E5E7EB", display: "flex", justifyContent: "space-between", color: "#9CA3AF", fontSize: 9 }}>
        <span>Miracle Members · Chennai · bnimiracles.in</span>
        <span>© Miracle Members Chapter · Chennai</span>
      </div>
    </div>
  );
}

/* ── Mini helpers ───────────────────────────────────────────────────── */

function SectionHead({ title }: { title: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
      <div style={{ fontWeight: 800, fontSize: 13, color: "#1A1A2E" }}>{title}</div>
      <div style={{ flex: 1, height: 1, background: "#C8102E", opacity: 0.3 }} />
    </div>
  );
}

function Divider() {
  return <div style={{ height: 1, background: "#E5E7EB", margin: "16px 0" }} />;
}

function Field({ label, value }: { label: string; value: string | number | null | undefined }) {
  return (
    <div style={{ display: "flex", gap: 6, alignItems: "baseline", borderBottom: "1px dotted #E5E7EB", paddingBottom: 3 }}>
      <span style={{ color: "#6B7280", fontSize: 10, whiteSpace: "nowrap", minWidth: 120 }}>{label}:</span>
      <span style={{ fontWeight: 600, fontSize: 11 }}>{value || "—"}</span>
    </div>
  );
}

function FieldBlock({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div style={{ marginBottom: 6 }}>
      <div style={{ color: "#6B7280", fontSize: 10, marginBottom: 2 }} dangerouslySetInnerHTML={{ __html: label }} />
      <div style={{ minHeight: 32, border: "1px solid #E5E7EB", borderRadius: 4, padding: "4px 8px", fontSize: 11, whiteSpace: "pre-wrap", lineHeight: 1.5, color: value ? "#111" : "#D1D5DB" }}>
        {value || "—"}
      </div>
    </div>
  );
}
