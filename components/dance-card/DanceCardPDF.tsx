// Server-side only — imported exclusively from the API route.
import {
  Document,
  Page,
  View,
  Text,
  Image,
  StyleSheet,
} from "@react-pdf/renderer";
import type { DanceCardRow } from "@/lib/dance-card-types";

/* ── Palette ─────────────────────────────────────────────────────────── */
const RED  = "#C8102E";
const DARK = "#1A1A2E";
const GRAY = "#6B7280";
const LGRAY= "#F3F4F6";
const BORD = "#E5E7EB";

/* ── Styles ──────────────────────────────────────────────────────────── */
const s = StyleSheet.create({
  page: {
    paddingTop: 36, paddingHorizontal: 40, paddingBottom: 48,
    fontFamily: "Helvetica", fontSize: 9, color: DARK,
    backgroundColor: "#FFFFFF",
  },

  /* ── Full-page header (page 1) ── */
  header: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "center", marginBottom: 4,
    paddingBottom: 12, borderBottom: `2.5px solid ${RED}`,
  },
  logo:   { width: 110, height: 46, objectFit: "contain" },
  memberBlock: { flexDirection: "row", alignItems: "center" },
  memberInfo:  { alignItems: "flex-end", marginRight: 10 },
  memberName:  { fontSize: 13, fontFamily: "Helvetica-Bold", color: DARK },
  memberMeta:  { fontSize: 8.5, color: GRAY, marginTop: 1 },
  avatar: { width: 56, height: 56, borderRadius: 28, objectFit: "cover" },
  avatarFallback: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: RED, alignItems: "center", justifyContent: "center",
  },
  avatarInitial: { color: "#FFF", fontSize: 22, fontFamily: "Helvetica-Bold" },

  /* ── Mini header (pages 2 & 3) ── */
  miniHeader: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 8, marginBottom: 14, borderBottom: `1.5px solid ${RED}`,
  },
  miniLogoBlock: { flexDirection: "row", alignItems: "center" },
  miniLogo: { width: 70, height: 28, objectFit: "contain", marginRight: 8 },
  miniName: { fontSize: 10, fontFamily: "Helvetica-Bold", color: DARK },
  miniPage: { fontSize: 8, color: GRAY },

  /* ── Section header bar (no emojis — Helvetica doesn't support them) ── */
  secHead: {
    backgroundColor: RED, borderRadius: 3,
    paddingVertical: 6, paddingHorizontal: 12,
    marginTop: 14, marginBottom: 10,
  },
  secTitle: {
    color: "#FFF", fontSize: 10, fontFamily: "Helvetica-Bold",
    letterSpacing: 0.8,
  },

  /* ── Fields ── */
  row2: { flexDirection: "row", marginBottom: 7 },
  row3: { flexDirection: "row", marginBottom: 7 },
  col:  { flex: 1, marginRight: 8 },
  colLast: { flex: 1 },
  flabel: { fontSize: 7, color: GRAY, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 2 },
  fvalue: {
    fontSize: 9, color: DARK, minHeight: 15, paddingVertical: 3, paddingHorizontal: 5,
    backgroundColor: LGRAY, borderRadius: 3, border: `1px solid ${BORD}`,
  },
  fvalueEmpty: {
    fontSize: 9, color: "#C9CDD5", minHeight: 15, paddingVertical: 3, paddingHorizontal: 5,
    backgroundColor: LGRAY, borderRadius: 3, border: `1px solid ${BORD}`,
  },
  ftextarea: {
    fontSize: 9, color: DARK, minHeight: 40, paddingVertical: 4, paddingHorizontal: 5,
    backgroundColor: LGRAY, borderRadius: 3, border: `1px solid ${BORD}`, lineHeight: 1.5,
  },
  ftextareaEmpty: {
    fontSize: 9, color: "#C9CDD5", minHeight: 40, paddingVertical: 4, paddingHorizontal: 5,
    backgroundColor: LGRAY, borderRadius: 3, border: `1px solid ${BORD}`,
  },

  /* ── GAINS ── */
  gainsGrid: { flexDirection: "row", flexWrap: "wrap" },
  gainsCard: {
    width: "49%", marginRight: "1%", marginBottom: 10,
    border: `1px solid ${BORD}`, borderRadius: 5, padding: 10,
  },
  gainsCardFull: {
    width: "100%", marginBottom: 10,
    border: `1px solid ${BORD}`, borderRadius: 5, padding: 10,
  },
  gainsBadge: {
    width: 22, height: 22, borderRadius: 11, backgroundColor: RED,
    alignItems: "center", justifyContent: "center", marginBottom: 4,
  },
  gainsBadgeText: { color: "#FFF", fontSize: 12, fontFamily: "Helvetica-Bold" },
  gainsTitle:    { fontSize: 9, fontFamily: "Helvetica-Bold", marginBottom: 3 },
  gainsHint:     { fontSize: 7.5, color: GRAY, marginBottom: 6, fontStyle: "italic" },
  gainsContent:  { fontSize: 9, color: DARK, minHeight: 40, lineHeight: 1.5 },

  /* ── Contact Sphere ── */
  csGrid: { flexDirection: "row", flexWrap: "wrap" },
  csItem: {
    width: "50%", flexDirection: "row", alignItems: "flex-start",
    paddingVertical: 5, paddingRight: 8, borderBottom: `1px solid ${LGRAY}`,
  },
  csNum: {
    width: 16, height: 16, borderRadius: 8, backgroundColor: LGRAY,
    alignItems: "center", justifyContent: "center", marginRight: 6, flexShrink: 0, marginTop: 1,
  },
  csNumText:    { fontSize: 7, color: GRAY, fontFamily: "Helvetica-Bold" },
  csName:       { fontSize: 8.5, fontFamily: "Helvetica-Bold" },
  csProfession: { fontSize: 7.5, color: GRAY, marginTop: 1 },

  top3Box: {
    marginTop: 10, padding: 9, backgroundColor: "#FEFCE8",
    borderRadius: 4, border: `1px solid #FDE047`,
  },
  top3Title: { fontSize: 8, fontFamily: "Helvetica-Bold", color: "#92400E", marginBottom: 5 },
  top3Row:   { flexDirection: "row" },
  top3Item:  { flex: 1, fontSize: 8, color: "#92400E" },

  /* ── Last 10 Customers ── */
  custGrid: { flexDirection: "row", flexWrap: "wrap" },
  custItem: {
    width: "50%", flexDirection: "row", alignItems: "flex-start",
    paddingVertical: 4, paddingRight: 8, borderBottom: `1px solid ${LGRAY}`,
  },
  custNum: {
    width: 16, height: 16, borderRadius: 8, backgroundColor: LGRAY,
    alignItems: "center", justifyContent: "center", marginRight: 6, flexShrink: 0, marginTop: 1,
  },
  custNumText: { fontSize: 7, color: GRAY, fontFamily: "Helvetica-Bold" },
  custName:    { fontSize: 8.5, fontFamily: "Helvetica-Bold" },
  custNotes:   { fontSize: 7.5, color: GRAY, marginTop: 1 },

  notesRow: { flexDirection: "row", marginTop: 10 },
  notesCard: {
    flex: 1, marginRight: 8, padding: 8,
    border: `1px solid ${BORD}`, borderRadius: 4,
  },
  notesCardLast: { flex: 1, padding: 8, border: `1px solid ${BORD}`, borderRadius: 4 },
  notesTitle:   { fontSize: 8, fontFamily: "Helvetica-Bold", marginBottom: 4 },
  notesContent: { fontSize: 8, color: DARK, minHeight: 36, lineHeight: 1.5 },

  /* ── Footer ── */
  footer: {
    position: "absolute", bottom: 20, left: 40, right: 40,
    flexDirection: "row", justifyContent: "space-between",
    borderTop: `1px solid ${BORD}`, paddingTop: 6,
  },
  footerText: { fontSize: 7, color: "#9CA3AF" },
});

/* ── Props ───────────────────────────────────────────────────────────── */
export type PDFProps = {
  memberName:    string;
  memberInitial: string;
  category:      string;
  businessName:  string;
  avatarUrl:     string | null;
  logoBase64:    string;
  card:          DanceCardRow | null;
  generatedAt:   string;
  totalPages:    number;
};

/* ── Helpers ─────────────────────────────────────────────────────────── */
function Field({ label, value, textarea = false }: {
  label: string; value?: string | number | null; textarea?: boolean;
}) {
  const empty = !value && value !== 0;
  if (textarea) {
    return (
      <View>
        <Text style={s.flabel}>{label}</Text>
        <Text style={empty ? s.ftextareaEmpty : s.ftextarea}>{empty ? "—" : String(value)}</Text>
      </View>
    );
  }
  return (
    <View>
      <Text style={s.flabel}>{label}</Text>
      <Text style={empty ? s.fvalueEmpty : s.fvalue}>{empty ? "—" : String(value)}</Text>
    </View>
  );
}

const GAINS_CONFIG = [
  { letter: "G", title: "Goals",           hint: "Business or personal objectives you want to achieve",                    key: "gains_goals"           },
  { letter: "A", title: "Accomplishments", hint: "Things you are proud of — past achievements and milestones",             key: "gains_accomplishments" },
  { letter: "I", title: "Interests",       hint: "Sports, books, music and other personal interests you share",            key: "gains_interests"       },
  { letter: "N", title: "Networks",        hint: "Organisations, institutions or individuals you associate with",          key: "gains_networks"        },
  { letter: "S", title: "Skills",          hint: "Your talents and abilities that others in your network should know about",key: "gains_skills"          },
] as const;

/* ── Shared mini-header for pages 2 & 3 ─────────────────────────────── */
function MiniHeader({ memberName, logoBase64, pageLabel }: {
  memberName: string; logoBase64: string; pageLabel: string;
}) {
  return (
    <View style={s.miniHeader}>
      <View style={s.miniLogoBlock}>
        <Image src={logoBase64} style={s.miniLogo} />
        <Text style={s.miniName}>{memberName} — Dance Card</Text>
      </View>
      <Text style={s.miniPage}>{pageLabel}</Text>
    </View>
  );
}

/* ── Document ────────────────────────────────────────────────────────── */
export function DanceCardPDF({
  memberName, memberInitial, category, businessName,
  avatarUrl, logoBase64, card, generatedAt,
}: PDFProps) {
  const c         = card;
  const contacts  = c?.contact_sphere  ?? [];
  const customers = c?.last_customers  ?? [];
  const top3      = (c?.top_3_professions ?? []).filter(Boolean);

  return (
    <Document
      title={`BNI Dance Card — ${memberName}`}
      author="BNI Miracles Chennai"
      subject="One-on-One Dance Card Planner"
    >

      {/* ═══ PAGE 1 — BIO SHEET ════════════════════════════════════════ */}
      <Page size="A4" style={s.page}>

        {/* Full header with logo + avatar */}
        <View style={s.header}>
          <Image src={logoBase64} style={s.logo} />
          <View style={s.memberBlock}>
            <View style={s.memberInfo}>
              <Text style={s.memberName}>{memberName}</Text>
              {category     && <Text style={s.memberMeta}>{category}</Text>}
              {businessName && <Text style={s.memberMeta}>{businessName}</Text>}
            </View>
            {avatarUrl ? (
              <Image src={avatarUrl} style={s.avatar} />
            ) : (
              <View style={s.avatarFallback}>
                <Text style={s.avatarInitial}>{memberInitial}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Section */}
        <View style={s.secHead}><Text style={s.secTitle}>BIO SHEET</Text></View>

        <View style={s.row3}>
          <View style={s.col}><Field label="Profession"          value={c?.bio_profession} /></View>
          <View style={s.col}><Field label="Location"            value={c?.bio_location} /></View>
          <View style={s.colLast}><Field label="Years in Business" value={c?.bio_years} /></View>
        </View>
        <View style={s.row3}>
          <View style={s.col}><Field label="Spouse"              value={c?.bio_spouse} /></View>
          <View style={s.col}><Field label="Children"            value={c?.bio_children} /></View>
          <View style={s.colLast}><Field label="Animals"         value={c?.bio_animals} /></View>
        </View>
        <View style={s.row2}>
          <View style={s.col}><Field label="City of Residence"   value={c?.bio_city} /></View>
          <View style={s.colLast}><Field label="How Long?"       value={c?.bio_city_duration} /></View>
        </View>
        <View style={{ marginBottom: 7 }}>
          <Field label="Previous Types of Jobs" value={c?.bio_previous_jobs} textarea />
        </View>
        <View style={s.row2}>
          <View style={s.col}><Field label="Hobbies"              value={c?.bio_hobbies}     textarea /></View>
          <View style={s.colLast}><Field label="Activities of Interest" value={c?.bio_activities} textarea /></View>
        </View>
        <View style={{ marginBottom: 7 }}>
          <Field label="My burning desire is to..." value={c?.bio_burning_desire} textarea />
        </View>
        <View style={s.row2}>
          <View style={s.col}>
            <Field label="Something no one knows about me" value={c?.bio_secret}         textarea />
          </View>
          <View style={s.colLast}>
            <Field label="My key to success"               value={c?.bio_key_to_success} textarea />
          </View>
        </View>

        <View style={s.footer}>
          <Text style={s.footerText}>BNI Miracles · Chennai · bnimiracles.in</Text>
          <Text style={s.footerText}>Page 1 of 3 · {generatedAt}</Text>
        </View>
      </Page>

      {/* ═══ PAGE 2 — GAINS WORKSHEET ══════════════════════════════════ */}
      <Page size="A4" style={s.page}>
        <MiniHeader memberName={memberName} logoBase64={logoBase64} pageLabel="Page 2 of 3" />

        <View style={s.secHead}><Text style={s.secTitle}>GAINS WORKSHEET</Text></View>

        <View style={s.gainsGrid}>
          {GAINS_CONFIG.map((g, i) => {
            const val      = c?.[g.key] ?? "";
            const cardSt   = i === 4 ? s.gainsCardFull : s.gainsCard;
            return (
              <View key={g.key} style={cardSt}>
                <View style={s.gainsBadge}>
                  <Text style={s.gainsBadgeText}>{g.letter}</Text>
                </View>
                <Text style={s.gainsTitle}>{g.title}</Text>
                <Text style={s.gainsHint}>{g.hint}</Text>
                <Text style={s.gainsContent}>{val || "—"}</Text>
              </View>
            );
          })}
        </View>

        <View style={s.footer}>
          <Text style={s.footerText}>BNI Miracles · Chennai · bnimiracles.in</Text>
          <Text style={s.footerText}>Page 2 of 3 · {generatedAt}</Text>
        </View>
      </Page>

      {/* ═══ PAGE 3 — CONTACT SPHERE + LAST 10 CUSTOMERS ══════════════ */}
      <Page size="A4" style={s.page}>
        <MiniHeader memberName={memberName} logoBase64={logoBase64} pageLabel="Page 3 of 3" />

        {/* Contact Sphere */}
        <View style={s.secHead}><Text style={s.secTitle}>CONTACT SPHERE</Text></View>

        <View style={s.csGrid}>
          {contacts.map((entry, i) => (
            <View key={i} style={s.csItem}>
              <View style={s.csNum}><Text style={s.csNumText}>{i + 1}</Text></View>
              <View style={{ flex: 1 }}>
                <Text style={s.csName}>{entry.name || "—"}</Text>
                {entry.profession
                  ? <Text style={s.csProfession}>{entry.profession}</Text>
                  : null}
              </View>
            </View>
          ))}
        </View>

        {top3.length > 0 && (
          <View style={s.top3Box}>
            <Text style={s.top3Title}>Top 3 Professions to Add to My Sphere:</Text>
            <View style={s.top3Row}>
              {top3.slice(0, 3).map((p, i) => (
                <Text key={i} style={s.top3Item}>{i + 1}. {p}</Text>
              ))}
            </View>
          </View>
        )}

        {/* Last 10 Customers */}
        <View style={s.secHead}><Text style={s.secTitle}>LAST 10 CUSTOMERS</Text></View>

        <View style={s.custGrid}>
          {customers.map((cust, i) => (
            <View key={i} style={s.custItem}>
              <View style={s.custNum}><Text style={s.custNumText}>{i + 1}</Text></View>
              <View style={{ flex: 1 }}>
                <Text style={s.custName}>{cust.name || "—"}</Text>
                {cust.notes ? <Text style={s.custNotes}>{cust.notes}</Text> : null}
              </View>
            </View>
          ))}
        </View>

        <View style={s.notesRow}>
          <View style={s.notesCard}>
            <Text style={s.notesTitle}>Other Referral Sources</Text>
            <Text style={s.notesContent}>{c?.referral_sources || "—"}</Text>
          </View>
          <View style={s.notesCard}>
            <Text style={s.notesTitle}>Good Referrals</Text>
            <Text style={s.notesContent}>{c?.good_referrals || "—"}</Text>
          </View>
          <View style={s.notesCardLast}>
            <Text style={s.notesTitle}>"Bad" Referrals</Text>
            <Text style={s.notesContent}>{c?.bad_referrals || "—"}</Text>
          </View>
        </View>

        <View style={s.footer}>
          <Text style={s.footerText}>BNI Miracles · One-on-One Dance Card Planner · Chennai Chapter</Text>
          <Text style={s.footerText}>Page 3 of 3 · {generatedAt}</Text>
        </View>
      </Page>

    </Document>
  );
}
