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
import { SITE_DOMAIN } from "@/lib/seo";

/* ── Palette ─────────────────────────────────────────────────────────── */
const RED          = "#C8102E";
const RED_DARK     = "#990B22";
const RED_LIGHT    = "#FEF2F2";
const RED_BORDER   = "#FECACA";
const DARK         = "#0F172A";
const SLATE_DARK   = "#1E293B";
const SLATE_TEXT   = "#334155";
const GRAY         = "#64748B";
const GRAY_LIGHT   = "#94A3B8";
const BG_SIDEBAR   = "#F8FAFC";
const BG_CARD      = "#FFFFFF";
const BORDER_BASE  = "#E2E8F0";
const BORDER_LIGHT = "#F1F5F9";

/* ── Styles ──────────────────────────────────────────────────────────── */
const s = StyleSheet.create({
  page: {
    paddingTop: 32, paddingHorizontal: 36, paddingBottom: 36,
    fontFamily: "Helvetica", fontSize: 8.5, color: SLATE_TEXT,
    backgroundColor: "#FFFFFF",
  },

  /* ── Page 1: Hero Resume Header ── */
  heroHeader: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "center", paddingBottom: 14,
    borderBottom: `2.5px solid ${RED}`,
  },
  heroLeft: {
    flexDirection: "row", alignItems: "center", flex: 1,
  },
  avatar: {
    width: 64, height: 64, borderRadius: 32, objectFit: "cover",
    border: `2.5px solid ${RED}`, marginRight: 14,
  },
  avatarFallback: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: RED, alignItems: "center", justifyContent: "center",
    marginRight: 14, border: `2.5px solid ${RED_DARK}`,
  },
  avatarInitial: { color: "#FFF", fontSize: 26, fontFamily: "Helvetica-Bold" },
  heroDetails: { flex: 1 },
  heroName: {
    fontSize: 18, fontFamily: "Helvetica-Bold", color: DARK,
    letterSpacing: -0.3,
  },
  heroBadgeRow: {
    flexDirection: "row", alignItems: "center", flexWrap: "wrap",
    marginTop: 4, marginBottom: 3,
  },
  categoryBadge: {
    backgroundColor: RED_LIGHT, borderRadius: 3,
    border: `1px solid ${RED_BORDER}`,
    paddingVertical: 2, paddingHorizontal: 7, marginRight: 8,
  },
  categoryBadgeText: {
    color: RED, fontSize: 8, fontFamily: "Helvetica-Bold",
  },
  companyName: {
    fontSize: 9.5, fontFamily: "Helvetica-Bold", color: SLATE_DARK,
  },
  chapterTagline: {
    fontSize: 7.5, color: GRAY, marginTop: 2.5,
  },
  heroRight: {
    alignItems: "flex-end", marginLeft: 12,
  },
  logo: { width: 105, height: 44, objectFit: "contain" },
  docBadge: {
    marginTop: 5, backgroundColor: BG_SIDEBAR, borderRadius: 3,
    border: `1px solid ${BORDER_BASE}`,
    paddingVertical: 2.5, paddingHorizontal: 7,
  },
  docBadgeText: {
    fontSize: 7, fontFamily: "Helvetica-Bold", color: GRAY,
    letterSpacing: 0.8, textTransform: "uppercase",
  },

  /* ── Resume 2-Column Body Layout ── */
  resumeBody: {
    flexDirection: "row", marginTop: 14,
  },

  /* ── Sidebar (Left Column) ── */
  sidebar: {
    width: "36%", backgroundColor: BG_SIDEBAR,
    borderRadius: 7, border: `1px solid ${BORDER_BASE}`,
    padding: 12,
  },
  sidebarSectionHeader: {
    flexDirection: "row", alignItems: "center",
    marginBottom: 8, paddingBottom: 4,
    borderBottom: `1px solid ${BORDER_BASE}`,
  },
  sidebarSectionDot: {
    width: 4.5, height: 4.5, borderRadius: 2.5, backgroundColor: RED, marginRight: 6,
  },
  sidebarSectionTitle: {
    fontSize: 8, fontFamily: "Helvetica-Bold", color: DARK,
    letterSpacing: 0.8, textTransform: "uppercase",
  },
  metaItem: {
    marginBottom: 8,
  },
  metaLabel: {
    fontSize: 6.8, fontFamily: "Helvetica-Bold", color: GRAY,
    textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 2,
  },
  metaValue: {
    fontSize: 8.2, fontFamily: "Helvetica-Bold", color: DARK, lineHeight: 1.3,
  },
  metaValueRegular: {
    fontSize: 8, color: SLATE_TEXT, lineHeight: 1.35,
  },
  metaValueMuted: {
    fontSize: 8, color: GRAY_LIGHT, fontStyle: "italic",
  },

  /* Experience highlight card inside sidebar */
  statBox: {
    backgroundColor: "#FFFFFF", borderRadius: 5,
    border: `1px solid ${BORDER_BASE}`,
    paddingVertical: 8, paddingHorizontal: 6, marginVertical: 6, alignItems: "center",
  },
  statNumber: {
    fontSize: 16, fontFamily: "Helvetica-Bold", color: RED,
  },
  statLabel: {
    fontSize: 7, color: GRAY, textTransform: "uppercase", letterSpacing: 0.5, marginTop: 1,
  },

  sidebarDivider: {
    height: 1, backgroundColor: BORDER_BASE, marginVertical: 10,
  },

  sidebarTipBox: {
    marginTop: 10, paddingTop: 8,
    borderTop: `1px dashed ${BORDER_BASE}`,
  },
  sidebarTip: {
    fontSize: 6.8, color: GRAY, fontStyle: "italic",
    lineHeight: 1.35,
  },

  /* ── Main Content (Right Column) ── */
  mainContent: {
    width: "64%", paddingLeft: 12,
  },

  /* Resume Section Headers */
  sectionHeader: {
    flexDirection: "row", alignItems: "center",
    marginTop: 6, marginBottom: 6,
  },
  sectionAccentBar: {
    width: 3.5, height: 12, backgroundColor: RED, borderRadius: 1.5,
    marginRight: 6,
  },
  sectionHeadingText: {
    fontSize: 9, fontFamily: "Helvetica-Bold", color: DARK,
    letterSpacing: 0.6, textTransform: "uppercase",
  },
  sectionLine: {
    flex: 1, height: 1, backgroundColor: BORDER_BASE, marginLeft: 8,
  },

  /* Resume Content Cards */
  cardBox: {
    backgroundColor: BG_CARD, borderRadius: 6,
    border: `1px solid ${BORDER_BASE}`, padding: 10,
    marginBottom: 10, minHeight: 70,
  },
  cardParagraph: {
    fontSize: 8.8, color: SLATE_TEXT, lineHeight: 1.5,
  },
  cardParagraphEmpty: {
    fontSize: 8.5, color: GRAY_LIGHT, fontStyle: "italic",
  },

  /* 2-Col cards within main content */
  cardRow: {
    flexDirection: "row", marginBottom: 10,
  },
  cardColLeft: {
    flex: 1, marginRight: 6, backgroundColor: BG_SIDEBAR,
    borderRadius: 6, border: `1px solid ${BORDER_BASE}`, padding: 9,
    minHeight: 68,
  },
  cardColRight: {
    flex: 1, backgroundColor: BG_SIDEBAR,
    borderRadius: 6, border: `1px solid ${BORDER_BASE}`, padding: 9,
    minHeight: 68,
  },
  cardColTitle: {
    fontSize: 7.2, fontFamily: "Helvetica-Bold", color: RED_DARK,
    textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4,
  },

  /* Feature Quote: Burning Desire */
  quoteBox: {
    backgroundColor: RED_LIGHT, borderRadius: 6,
    borderLeft: `4px solid ${RED}`,
    borderTop: `1px solid ${RED_BORDER}`,
    borderRight: `1px solid ${RED_BORDER}`,
    borderBottom: `1px solid ${RED_BORDER}`,
    paddingVertical: 9, paddingHorizontal: 11,
    marginBottom: 10, minHeight: 52,
  },
  quoteLabel: {
    fontSize: 7.2, fontFamily: "Helvetica-Bold", color: RED,
    textTransform: "uppercase", letterSpacing: 0.7, marginBottom: 3,
  },
  quoteText: {
    fontSize: 9, fontFamily: "Helvetica-Oblique", color: SLATE_DARK,
    lineHeight: 1.45,
  },

  /* Success & Trivia mini cards */
  triviaCard: {
    flex: 1, backgroundColor: BG_CARD, borderRadius: 6,
    border: `1px solid ${BORDER_BASE}`, padding: 9,
    minHeight: 68,
  },
  triviaTitle: {
    fontSize: 7.2, fontFamily: "Helvetica-Bold", color: DARK,
    textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4,
  },

  /* ── Mini header (pages 2 & 3) ── */
  miniHeader: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "center", paddingBottom: 8, marginBottom: 12,
    borderBottom: `1.5px solid ${RED}`,
  },
  miniLogoBlock: { flexDirection: "row", alignItems: "center" },
  miniLogo: { width: 70, height: 28, objectFit: "contain", marginRight: 8 },
  miniName: { fontSize: 9.5, fontFamily: "Helvetica-Bold", color: DARK },
  miniSubtitle: { fontSize: 7.5, color: GRAY, marginLeft: 6 },
  miniPage: { fontSize: 7.5, color: GRAY, fontFamily: "Helvetica-Bold" },

  /* ── Section header bar for Pages 2 & 3 ── */
  secHead: {
    backgroundColor: RED, borderRadius: 3,
    paddingVertical: 5, paddingHorizontal: 10,
    marginTop: 10, marginBottom: 9,
  },
  secTitle: {
    color: "#FFF", fontSize: 9.5, fontFamily: "Helvetica-Bold",
    letterSpacing: 0.8,
  },

  /* ── GAINS (Page 2) ── */
  gainsGrid: { flexDirection: "row", flexWrap: "wrap" },
  gainsCard: {
    width: "49%", marginRight: "1%", marginBottom: 9,
    border: `1px solid ${BORDER_BASE}`, borderRadius: 5, padding: 9,
    backgroundColor: "#FFFFFF",
  },
  gainsCardFull: {
    width: "100%", marginBottom: 9,
    border: `1px solid ${BORDER_BASE}`, borderRadius: 5, padding: 9,
    backgroundColor: "#FFFFFF",
  },
  gainsBadge: {
    width: 20, height: 20, borderRadius: 10, backgroundColor: RED,
    alignItems: "center", justifyContent: "center", marginBottom: 3,
  },
  gainsBadgeText: { color: "#FFF", fontSize: 11, fontFamily: "Helvetica-Bold" },
  gainsTitle:    { fontSize: 8.5, fontFamily: "Helvetica-Bold", color: DARK, marginBottom: 2 },
  gainsHint:     { fontSize: 7, color: GRAY, marginBottom: 5, fontStyle: "italic" },
  gainsContent:  { fontSize: 8.5, color: SLATE_TEXT, minHeight: 38, lineHeight: 1.45 },

  /* ── Contact Sphere (Page 3) ── */
  csGrid: { flexDirection: "row", flexWrap: "wrap" },
  csItem: {
    width: "50%", flexDirection: "row", alignItems: "flex-start",
    paddingVertical: 4.5, paddingRight: 8, borderBottom: `1px solid ${BORDER_LIGHT}`,
  },
  csNum: {
    width: 15, height: 15, borderRadius: 7.5, backgroundColor: BG_SIDEBAR,
    border: `1px solid ${BORDER_BASE}`,
    alignItems: "center", justifyContent: "center", marginRight: 6, flexShrink: 0, marginTop: 1,
  },
  csNumText:    { fontSize: 6.5, color: GRAY, fontFamily: "Helvetica-Bold" },
  csName:       { fontSize: 8, fontFamily: "Helvetica-Bold", color: DARK },
  csProfession: { fontSize: 7, color: GRAY, marginTop: 0.5 },

  top3Box: {
    marginTop: 8, padding: 8, backgroundColor: "#FEFCE8",
    borderRadius: 4, border: `1px solid #FDE047`,
  },
  top3Title: { fontSize: 7.5, fontFamily: "Helvetica-Bold", color: "#92400E", marginBottom: 4 },
  top3Row:   { flexDirection: "row" },
  top3Item:  { flex: 1, fontSize: 7.5, color: "#92400E" },

  /* ── Last 10 Customers (Page 3) ── */
  custGrid: { flexDirection: "row", flexWrap: "wrap" },
  custItem: {
    width: "50%", flexDirection: "row", alignItems: "flex-start",
    paddingVertical: 4, paddingRight: 8, borderBottom: `1px solid ${BORDER_LIGHT}`,
  },
  custNum: {
    width: 15, height: 15, borderRadius: 7.5, backgroundColor: BG_SIDEBAR,
    border: `1px solid ${BORDER_BASE}`,
    alignItems: "center", justifyContent: "center", marginRight: 6, flexShrink: 0, marginTop: 1,
  },
  custNumText: { fontSize: 6.5, color: GRAY, fontFamily: "Helvetica-Bold" },
  custName:    { fontSize: 8, fontFamily: "Helvetica-Bold", color: DARK },
  custNotes:   { fontSize: 7, color: GRAY, marginTop: 0.5 },

  notesRow: { flexDirection: "row", marginTop: 8 },
  notesCard: {
    flex: 1, marginRight: 6, padding: 7,
    border: `1px solid ${BORDER_BASE}`, borderRadius: 4, backgroundColor: BG_SIDEBAR,
  },
  notesCardLast: {
    flex: 1, padding: 7,
    border: `1px solid ${BORDER_BASE}`, borderRadius: 4, backgroundColor: BG_SIDEBAR,
  },
  notesTitle:   { fontSize: 7.5, fontFamily: "Helvetica-Bold", color: DARK, marginBottom: 3 },
  notesContent: { fontSize: 7.5, color: SLATE_TEXT, minHeight: 32, lineHeight: 1.4 },

  /* ── Footer ── */
  footer: {
    position: "absolute", bottom: 18, left: 36, right: 36,
    flexDirection: "row", justifyContent: "space-between",
    borderTop: `1px solid ${BORDER_BASE}`, paddingTop: 5,
  },
  footerText: { fontSize: 6.5, color: GRAY_LIGHT },
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

const GAINS_CONFIG = [
  { letter: "G", title: "Goals",           hint: "Business or personal objectives you want to achieve",                    key: "gains_goals"           },
  { letter: "A", title: "Accomplishments", hint: "Things you are proud of — past achievements and milestones",             key: "gains_accomplishments" },
  { letter: "I", title: "Interests",       hint: "Sports, books, music and other personal interests you share",            key: "gains_interests"       },
  { letter: "N", title: "Networks",        hint: "Organisations, institutions or individuals you associate with",          key: "gains_networks"        },
  { letter: "S", title: "Skills",          hint: "Your talents and abilities that others in your network should know about",key: "gains_skills"          },
] as const;

/* ── Shared mini-header for pages 2 & 3 ─────────────────────────────── */
function MiniHeader({ memberName, category, logoBase64, pageLabel }: {
  memberName: string; category?: string; logoBase64: string; pageLabel: string;
}) {
  return (
    <View style={s.miniHeader}>
      <View style={s.miniLogoBlock}>
        <Image src={logoBase64} style={s.miniLogo} />
        <View>
          <Text style={s.miniName}>{memberName}</Text>
          {category ? <Text style={s.miniSubtitle}>{category} · Dance Card</Text> : null}
        </View>
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
      title={`Dance Card — ${memberName}`}
      author="Miracle Members Chennai"
      subject="One-on-One Dance Card Planner"
    >

      {/* ═══ PAGE 1 — BIO SHEET (EXECUTIVE RESUME LAYOUT) ═══════════════ */}
      <Page size="A4" style={s.page}>

        {/* ── Executive Profile Header (Hero) ── */}
        <View style={s.heroHeader}>
          <View style={s.heroLeft}>
            {avatarUrl ? (
              <Image src={avatarUrl} style={s.avatar} />
            ) : (
              <View style={s.avatarFallback}>
                <Text style={s.avatarInitial}>{memberInitial}</Text>
              </View>
            )}
            <View style={s.heroDetails}>
              <Text style={s.heroName}>{memberName}</Text>
              <View style={s.heroBadgeRow}>
                {category ? (
                  <View style={s.categoryBadge}>
                    <Text style={s.categoryBadgeText}>{category}</Text>
                  </View>
                ) : null}
                {businessName ? (
                  <Text style={s.companyName}>{businessName}</Text>
                ) : null}
              </View>
              <Text style={s.chapterTagline}>BNI Miracles Chapter · Chennai · 1-to-1 Dance Card Planner</Text>
            </View>
          </View>

          <View style={s.heroRight}>
            <Image src={logoBase64} style={s.logo} />
            <View style={s.docBadge}>
              <Text style={s.docBadgeText}>MEMBER BIO SHEET</Text>
            </View>
          </View>
        </View>

        {/* ── 2-Column Resume Body ── */}
        <View style={s.resumeBody}>

          {/* ── LEFT SIDEBAR: Snapshot & Personal ── */}
          <View style={s.sidebar}>
            
            {/* Snapshot */}
            <View style={s.sidebarSectionHeader}>
              <View style={s.sidebarSectionDot} />
              <Text style={s.sidebarSectionTitle}>Profile Snapshot</Text>
            </View>

            <View style={s.metaItem}>
              <Text style={s.metaLabel}>Profession</Text>
              <Text style={s.metaValue}>{c?.bio_profession || "Not specified"}</Text>
            </View>

            <View style={s.metaItem}>
              <Text style={s.metaLabel}>Business Location</Text>
              <Text style={s.metaValueRegular}>{c?.bio_location || "Not specified"}</Text>
            </View>

            {/* Experience Card */}
            {c?.bio_years ? (
              <View style={s.statBox}>
                <Text style={s.statNumber}>{c.bio_years}</Text>
                <Text style={s.statLabel}>Years in Business</Text>
              </View>
            ) : (
              <View style={s.metaItem}>
                <Text style={s.metaLabel}>Experience</Text>
                <Text style={s.metaValueMuted}>Years not specified</Text>
              </View>
            )}

            <View style={s.metaItem}>
              <Text style={s.metaLabel}>City of Residence</Text>
              <Text style={s.metaValue}>
                {c?.bio_city || "Chennai"}
              </Text>
              {c?.bio_city_duration ? (
                <Text style={[s.metaValueRegular, { marginTop: 1, color: GRAY }]}>
                  {c.bio_city_duration.toLowerCase().includes("year") ? c.bio_city_duration : `${c.bio_city_duration} in city`}
                </Text>
              ) : null}
            </View>

            <View style={s.sidebarDivider} />

            {/* Family & Personal */}
            <View style={s.sidebarSectionHeader}>
              <View style={s.sidebarSectionDot} />
              <Text style={s.sidebarSectionTitle}>Family & Life</Text>
            </View>

            <View style={s.metaItem}>
              <Text style={s.metaLabel}>Spouse / Partner</Text>
              <Text style={c?.bio_spouse ? s.metaValueRegular : s.metaValueMuted}>
                {c?.bio_spouse || "—"}
              </Text>
            </View>

            <View style={s.metaItem}>
              <Text style={s.metaLabel}>Children</Text>
              <Text style={c?.bio_children ? s.metaValueRegular : s.metaValueMuted}>
                {c?.bio_children || "—"}
              </Text>
            </View>

            <View style={s.metaItem}>
              <Text style={s.metaLabel}>Animals / Pets</Text>
              <Text style={c?.bio_animals ? s.metaValueRegular : s.metaValueMuted}>
                {c?.bio_animals || "—"}
              </Text>
            </View>

            <View style={s.sidebarTipBox}>
              <Text style={s.sidebarTip}>
                Tip: Use these bio details in 1-to-1s to discover common ground and build lasting personal rapport.
              </Text>
            </View>
          </View>

          {/* ── RIGHT MAIN COLUMN: Career, Passions, Philosophy ── */}
          <View style={s.mainContent}>

            {/* Section 1: Career History */}
            <View style={s.sectionHeader}>
              <View style={s.sectionAccentBar} />
              <Text style={s.sectionHeadingText}>Career Background & Previous Roles</Text>
              <View style={s.sectionLine} />
            </View>
            <View style={s.cardBox}>
              <Text style={c?.bio_previous_jobs ? s.cardParagraph : s.cardParagraphEmpty}>
                {c?.bio_previous_jobs || "No previous career background specified."}
              </Text>
            </View>

            {/* Section 2: Passions & Interests */}
            <View style={s.sectionHeader}>
              <View style={s.sectionAccentBar} />
              <Text style={s.sectionHeadingText}>Passions & Personal Interests</Text>
              <View style={s.sectionLine} />
            </View>
            <View style={s.cardRow}>
              <View style={s.cardColLeft}>
                <Text style={s.cardColTitle}>Hobbies & Leisure</Text>
                <Text style={c?.bio_hobbies ? s.cardParagraph : s.cardParagraphEmpty}>
                  {c?.bio_hobbies || "—"}
                </Text>
              </View>
              <View style={s.cardColRight}>
                <Text style={s.cardColTitle}>Activities & Community</Text>
                <Text style={c?.bio_activities ? s.cardParagraph : s.cardParagraphEmpty}>
                  {c?.bio_activities || "—"}
                </Text>
              </View>
            </View>

            {/* Section 3: Core Philosophy & Key Insights */}
            <View style={s.sectionHeader}>
              <View style={s.sectionAccentBar} />
              <Text style={s.sectionHeadingText}>Core Philosophy & Key Insights</Text>
              <View style={s.sectionLine} />
            </View>

            {/* Burning Desire Quote Banner */}
            <View style={s.quoteBox}>
              <Text style={s.quoteLabel}>My Burning Desire</Text>
              <Text style={c?.bio_burning_desire ? s.quoteText : s.cardParagraphEmpty}>
                {c?.bio_burning_desire ? `"${c.bio_burning_desire}"` : "Not specified"}
              </Text>
            </View>

            {/* Key to Success & Personal Trivia */}
            <View style={s.cardRow}>
              <View style={[s.triviaCard, { marginRight: 6 }]}>
                <Text style={s.triviaTitle}>My Key to Success</Text>
                <Text style={c?.bio_key_to_success ? s.cardParagraph : s.cardParagraphEmpty}>
                  {c?.bio_key_to_success || "—"}
                </Text>
              </View>
              <View style={s.triviaCard}>
                <Text style={s.triviaTitle}>Something No One Knows</Text>
                <Text style={c?.bio_secret ? s.cardParagraph : s.cardParagraphEmpty}>
                  {c?.bio_secret || "—"}
                </Text>
              </View>
            </View>

          </View>
        </View>

        {/* ── Footer ── */}
        <View style={s.footer}>
          <Text style={s.footerText}>Miracle Members · Chennai · {SITE_DOMAIN}</Text>
          <Text style={s.footerText}>Page 1 of 3 · Bio Sheet · Generated {generatedAt}</Text>
        </View>
      </Page>

      {/* ═══ PAGE 2 — GAINS WORKSHEET ══════════════════════════════════ */}
      <Page size="A4" style={s.page}>
        <MiniHeader
          memberName={memberName}
          category={category}
          logoBase64={logoBase64}
          pageLabel="Page 2 of 3 · GAINS"
        />

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
          <Text style={s.footerText}>Miracle Members · Chennai · {SITE_DOMAIN}</Text>
          <Text style={s.footerText}>Page 2 of 3 · GAINS Worksheet · {generatedAt}</Text>
        </View>
      </Page>

      {/* ═══ PAGE 3 — CONTACT SPHERE + LAST 10 CUSTOMERS ══════════════ */}
      <Page size="A4" style={s.page}>
        <MiniHeader
          memberName={memberName}
          category={category}
          logoBase64={logoBase64}
          pageLabel="Page 3 of 3 · Sphere & Referrals"
        />

        {/* Contact Sphere */}
        <View style={s.secHead}><Text style={s.secTitle}>CONTACT SPHERE PLANNING</Text></View>

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
            <Text style={s.top3Title}>Top 3 Professions to Add to My Contact Sphere:</Text>
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
            <Text style={s.notesTitle}>{"\"Bad\" Referrals"}</Text>
            <Text style={s.notesContent}>{c?.bad_referrals || "—"}</Text>
          </View>
        </View>

        <View style={s.footer}>
          <Text style={s.footerText}>Miracle Members · One-on-One Dance Card Planner · Chennai Chapter</Text>
          <Text style={s.footerText}>Page 3 of 3 · Sphere & Customers · {generatedAt}</Text>
        </View>
      </Page>

    </Document>
  );
}
