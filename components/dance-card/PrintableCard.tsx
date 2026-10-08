import type { DanceCardRow } from "@/lib/dance-card-types";
import { SITE_DOMAIN } from "@/lib/seo";
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
    <div id="dance-card-print" style={{ fontFamily: "Arial, Helvetica, sans-serif", fontSize: 11, color: "#1E293B", maxWidth: 780, margin: "0 auto", padding: "0 8px" }}>

      {/* ── Executive Header (Page 1) ─────────────────────────────────── */}
      <div style={{ borderBottom: "2.5px solid #C8102E", paddingBottom: 14, marginBottom: 18 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            {member.profile_picture_url ? (
              <img
                src={member.profile_picture_url}
                alt={member.name}
                style={{ width: 62, height: 62, borderRadius: "50%", objectFit: "cover", border: "2px solid #C8102E" }}
              />
            ) : (
              <div style={{ width: 62, height: 62, borderRadius: "50%", background: "#C8102E", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, fontWeight: 800 }}>
                {member.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <div style={{ fontSize: 20, fontWeight: 800, color: "#0F172A", letterSpacing: -0.4 }}>
                {member.name}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4, flexWrap: "wrap" }}>
                {member.category && (
                  <span style={{ background: "#FEF2F2", border: "1px solid #FECACA", color: "#C8102E", fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 4 }}>
                    {member.category}
                  </span>
                )}
                {member.business_name && (
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#334155" }}>
                    {member.business_name}
                  </span>
                )}
              </div>
              <div style={{ fontSize: 10, color: "#64748B", marginTop: 4 }}>
                BNI Miracles Chapter · Chennai · 1-to-1 Dance Card Planner
              </div>
            </div>
          </div>

          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: "#64748B", textTransform: "uppercase", letterSpacing: 0.8, background: "#F8FAFC", border: "1px solid #E2E8F0", padding: "4px 8px", borderRadius: 4 }}>
              MEMBER BIO SHEET
            </div>
            {c?.pdf_generated_at && (
              <div style={{ color: "#94A3B8", fontSize: 10, marginTop: 6 }}>
                Generated: {new Date(c.pdf_generated_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── BIO Sheet Resume 2-Column Layout ─────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: 18, marginBottom: 24, alignItems: "start" }}>
        
        {/* Left Sidebar: Profile Snapshot & Family */}
        <div style={{ background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 8, padding: 14 }}>
          {/* Snapshot */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10, paddingBottom: 6, borderBottom: "1px solid #E2E8F0" }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#C8102E" }} />
            <div style={{ fontWeight: 800, fontSize: 10, textTransform: "uppercase", letterSpacing: 0.8, color: "#0F172A" }}>
              Profile Snapshot
            </div>
          </div>

          <div style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 2 }}>Profession</div>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#0F172A" }}>{c?.bio_profession || "Not specified"}</div>
          </div>

          <div style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 2 }}>Business Location</div>
            <div style={{ fontSize: 11, color: "#334155" }}>{c?.bio_location || "Not specified"}</div>
          </div>

          {c?.bio_years ? (
            <div style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: 6, padding: "8px 10px", textAlign: "center", margin: "10px 0" }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: "#C8102E" }}>{c.bio_years}</div>
              <div style={{ fontSize: 9, fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: 0.5 }}>Years in Business</div>
            </div>
          ) : null}

          <div style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 2 }}>City of Residence</div>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#0F172A" }}>
              {c?.bio_city || "Chennai"}
              {c?.bio_city_duration ? <span style={{ fontWeight: 400, color: "#64748B", fontSize: 10 }}> ({c.bio_city_duration})</span> : null}
            </div>
          </div>

          <div style={{ height: 1, background: "#E2E8F0", margin: "12px 0" }} />

          {/* Family & Life */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10, paddingBottom: 6, borderBottom: "1px solid #E2E8F0" }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#C8102E" }} />
            <div style={{ fontWeight: 800, fontSize: 10, textTransform: "uppercase", letterSpacing: 0.8, color: "#0F172A" }}>
              Family & Life
            </div>
          </div>

          <div style={{ marginBottom: 8 }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 2 }}>Spouse / Partner</div>
            <div style={{ fontSize: 10.5, color: c?.bio_spouse ? "#1E293B" : "#94A3B8" }}>{c?.bio_spouse || "—"}</div>
          </div>

          <div style={{ marginBottom: 8 }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 2 }}>Children</div>
            <div style={{ fontSize: 10.5, color: c?.bio_children ? "#1E293B" : "#94A3B8" }}>{c?.bio_children || "—"}</div>
          </div>

          <div style={{ marginBottom: 8 }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 2 }}>Animals / Pets</div>
            <div style={{ fontSize: 10.5, color: c?.bio_animals ? "#1E293B" : "#94A3B8" }}>{c?.bio_animals || "—"}</div>
          </div>

          <div style={{ marginTop: 14, paddingTop: 10, borderTop: "1px dashed #E2E8F0", fontSize: 9, color: "#64748B", fontStyle: "italic", lineHeight: 1.4 }}>
            Tip: Use these bio details during your 1-to-1 to build meaningful rapport and find common ground.
          </div>
        </div>

        {/* Right Main Column: Career, Passions, Philosophy */}
        <div>
          {/* Section 1: Career */}
          <ResumeSectionHeader title="Career Background & Previous Roles" />
          <div style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: 6, padding: "10px 12px", marginBottom: 14, fontSize: 11, lineHeight: 1.5, color: c?.bio_previous_jobs ? "#334155" : "#94A3B8" }}>
            {c?.bio_previous_jobs || "No previous career background specified."}
          </div>

          {/* Section 2: Passions */}
          <ResumeSectionHeader title="Passions & Personal Interests" />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
            <div style={{ background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 6, padding: "8px 10px" }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: "#990B22", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>
                Hobbies & Leisure
              </div>
              <div style={{ fontSize: 10.5, color: c?.bio_hobbies ? "#334155" : "#94A3B8", lineHeight: 1.45 }}>
                {c?.bio_hobbies || "—"}
              </div>
            </div>
            <div style={{ background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 6, padding: "8px 10px" }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: "#990B22", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>
                Activities & Community
              </div>
              <div style={{ fontSize: 10.5, color: c?.bio_activities ? "#334155" : "#94A3B8", lineHeight: 1.45 }}>
                {c?.bio_activities || "—"}
              </div>
            </div>
          </div>

          {/* Section 3: Philosophy */}
          <ResumeSectionHeader title="Core Philosophy & Key Insights" />
          <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderLeft: "4px solid #C8102E", borderRadius: 6, padding: "10px 12px", marginBottom: 10 }}>
            <div style={{ fontSize: 9, fontWeight: 800, color: "#C8102E", textTransform: "uppercase", letterSpacing: 0.7, marginBottom: 4 }}>
              My Burning Desire
            </div>
            <div style={{ fontSize: 11, fontStyle: "italic", color: c?.bio_burning_desire ? "#0F172A" : "#94A3B8", lineHeight: 1.45 }}>
              {c?.bio_burning_desire ? `"${c.bio_burning_desire}"` : "Not specified"}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: 6, padding: "8px 10px" }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: "#0F172A", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>
                My Key to Success
              </div>
              <div style={{ fontSize: 10.5, color: c?.bio_key_to_success ? "#334155" : "#94A3B8", lineHeight: 1.45 }}>
                {c?.bio_key_to_success || "—"}
              </div>
            </div>
            <div style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: 6, padding: "8px 10px" }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: "#0F172A", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>
                Something No One Knows
              </div>
              <div style={{ fontSize: 10.5, color: c?.bio_secret ? "#334155" : "#94A3B8", lineHeight: 1.45 }}>
                {c?.bio_secret || "—"}
              </div>
            </div>
          </div>
        </div>

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
        <span>Miracle Members · Chennai · {SITE_DOMAIN}</span>
        <span>© Miracle Members Chapter · Chennai</span>
      </div>
    </div>
  );
}

/* ── Mini helpers ───────────────────────────────────────────────────── */

function ResumeSectionHeader({ title }: { title: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, marginTop: 6 }}>
      <div style={{ width: 3.5, height: 13, background: "#C8102E", borderRadius: 2 }} />
      <div style={{ fontWeight: 800, fontSize: 11, color: "#0F172A", textTransform: "uppercase", letterSpacing: 0.5 }}>{title}</div>
      <div style={{ flex: 1, height: 1, background: "#E2E8F0" }} />
    </div>
  );
}

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
