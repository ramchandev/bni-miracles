import {
  Document,
  Page,
  View,
  Text,
  Image,
  StyleSheet,
} from "@react-pdf/renderer";
import {
  ROSTER_CARDS_PER_PAGE,
  ROSTER_CORE_VALUES,
  chunkMembers,
  emptyRosterLeadership,
  type RosterMember,
  type RosterPayload,
} from "@/lib/member-roster";
import { GlobeIcon, GroupIcon } from "@/components/roster/RosterIcons";
import { NetworkingNodes } from "@/components/roster/NetworkingNodes";
import {
  RosterLeadershipPages,
  RosterCrorepathiPage,
  RosterLvhTeamPage,
  ROSTER_LEADERSHIP_PAGE_COUNT,
  ROSTER_CROREPATHI_PAGE_COUNT,
  ROSTER_LVH_PAGE_COUNT,
} from "@/components/roster/RosterLeadershipPages";

const RED = "#C8102E";
const RED_SOFT = "#FECACA";
const RED_BORDER = "#F5B5BE";
const INK = "#1A1A1A";
const SLATE = "#374151";
const MUTED = "#6B7280";
const RULE = "#F3D4D8";
const GREY = "#94A3B8";
const DIVIDER = "#FCE7EA";

const s = StyleSheet.create({
  page: {
    backgroundColor: "#FFFFFF",
    paddingTop: 28,
    paddingHorizontal: 26,
    paddingBottom: 56,
    fontFamily: "Helvetica",
  },
  pageHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
    paddingBottom: 10,
    borderBottomWidth: 1.5,
    borderBottomColor: RED,
  },
  headerLeft: {
    flexDirection: "column",
  },
  headerBrandRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 5,
  },
  headerBrandMuted: {
    fontSize: 13,
    fontFamily: "Helvetica-Bold",
    color: "#374151",
    letterSpacing: 1.4,
  },
  headerBrandAccent: {
    fontSize: 13,
    fontFamily: "Helvetica-Bold",
    color: RED,
    letterSpacing: 1.4,
  },
  headerSub: {
    marginTop: 3,
    fontSize: 8,
    color: MUTED,
    letterSpacing: 1.1,
  },
  headerLogo: {
    width: 88,
    height: 36,
    objectFit: "contain",
  },
  stack: {
    flexDirection: "column",
    gap: 8,
  },
  groupHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 2,
    marginBottom: 2,
  },
  groupHeaderTitle: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: RED,
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  groupHeaderRule: {
    flex: 1,
    height: 1,
    backgroundColor: RED_SOFT,
  },

  /* ── Three-column card ── */
  card: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1.25,
    borderColor: RED_BORDER,
    borderRadius: 8,
    paddingVertical: 11,
    paddingHorizontal: 12,
    flexDirection: "row",
    minHeight: 132,
  },
  colPerson: {
    width: "30%",
    paddingRight: 10,
    borderRightWidth: 1,
    borderRightColor: DIVIDER,
    alignItems: "center",
  },
  photoFrame: {
    width: 88,
    height: 88,
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#F3F4F6",
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#000000",
  },
  photo: {
    width: 88,
    height: 88,
    objectFit: "cover",
  },
  photoFallback: {
    width: 88,
    height: 88,
    backgroundColor: RED,
    alignItems: "center",
    justifyContent: "center",
  },
  photoInitial: {
    color: "#FFFFFF",
    fontSize: 24,
    fontFamily: "Helvetica-Bold",
  },
  memberName: {
    fontSize: 9.5,
    fontFamily: "Helvetica-Bold",
    color: RED,
    textTransform: "uppercase",
    textAlign: "center",
    lineHeight: 1.2,
    marginBottom: 3,
  },
  category: {
    fontSize: 7.5,
    color: INK,
    textAlign: "center",
    lineHeight: 1.25,
  },
  colContact: {
    width: "36%",
    paddingHorizontal: 11,
    borderRightWidth: 1,
    borderRightColor: DIVIDER,
    justifyContent: "center",
  },
  company: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: RED,
    textTransform: "uppercase",
    marginBottom: 6,
    lineHeight: 1.2,
  },
  detailText: {
    fontSize: 8,
    color: SLATE,
    marginBottom: 3,
    lineHeight: 1.3,
  },
  detailMuted: {
    fontSize: 7.5,
    color: MUTED,
    marginBottom: 3,
  },
  crorepathiRow: {
    marginTop: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  crorepathiPin: {
    width: 11,
    height: 11,
    objectFit: "contain",
  },
  crorepathiText: {
    fontSize: 6.5,
    fontFamily: "Helvetica-Bold",
    color: INK,
  },
  colNotes: {
    width: "34%",
    paddingLeft: 11,
    justifyContent: "flex-start",
  },
  notesTitle: {
    fontSize: 7.5,
    fontFamily: "Helvetica-Bold",
    color: RED,
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginBottom: 6,
  },
  notesSectionLabel: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    color: MUTED,
    letterSpacing: 0.6,
    textTransform: "uppercase",
    marginBottom: 2,
    marginTop: 4,
  },
  ruleLine: {
    borderBottomWidth: 1,
    borderBottomColor: RULE,
    height: 11,
    marginBottom: 1,
  },

  /* ── Footer ── */
  pageFooter: {
    position: "absolute",
    left: 26,
    right: 26,
    bottom: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    borderTopWidth: 1,
    borderTopColor: RED_SOFT,
    paddingTop: 8,
  },
  coreValueBlock: {
    flex: 1,
    paddingRight: 16,
  },
  coreValueLabel: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    color: MUTED,
    letterSpacing: 1.4,
    textTransform: "uppercase",
    marginBottom: 2,
  },
  coreValueTitle: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: RED,
    marginBottom: 2,
  },
  coreValueLine: {
    fontSize: 8,
    color: SLATE,
    maxWidth: 340,
  },
  footerRight: {
    alignItems: "flex-end",
  },
  footerDate: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: INK,
    letterSpacing: 1.1,
  },
  footerPage: {
    marginTop: 3,
    fontSize: 8,
    color: MUTED,
  },

  /* ── Cover ── */
  cover: {
    backgroundColor: "#FFFFFF",
    paddingTop: 40,
    paddingHorizontal: 40,
    paddingBottom: 36,
    justifyContent: "space-between",
  },
  coverArtWrap: {
    position: "absolute",
    top: 48,
    right: 24,
  },
  coverLogo: {
    width: 160,
    height: 66,
    objectFit: "contain",
    alignSelf: "flex-start",
    marginBottom: 28,
  },
  coverEyebrow: {
    color: MUTED,
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 2.4,
    textTransform: "uppercase",
    marginBottom: 12,
  },
  coverTitle: {
    color: INK,
    fontSize: 40,
    fontFamily: "Helvetica-Bold",
    letterSpacing: -0.6,
    lineHeight: 1.05,
    marginBottom: 10,
  },
  coverChapter: {
    color: SLATE,
    fontSize: 15,
    marginBottom: 6,
  },
  coverTagline: {
    color: MUTED,
    fontSize: 11,
    marginBottom: 22,
    maxWidth: 280,
    lineHeight: 1.45,
  },
  coverMetaRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 22,
  },
  coverMetaCard: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    minWidth: 100,
  },
  coverMetaLabel: {
    color: MUTED,
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 1.2,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  coverMetaValue: {
    color: INK,
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
  },
  coverPillsLabel: {
    color: MUTED,
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 1.4,
    textTransform: "uppercase",
    marginBottom: 10,
  },
  coverPills: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 7,
    maxWidth: 340,
  },
  coverPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderWidth: 1,
    borderColor: RED_BORDER,
    backgroundColor: "#FFF8F8",
    borderRadius: 14,
    paddingVertical: 5,
    paddingHorizontal: 9,
  },
  coverPillText: {
    fontSize: 7.5,
    fontFamily: "Helvetica-Bold",
    color: INK,
  },
  coverFooter: {
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    paddingTop: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  coverFooterLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  coverFooterText: {
    color: MUTED,
    fontSize: 9,
  },
  coverAccentBar: {
    width: 40,
    height: 3,
    backgroundColor: RED,
  },

  /* ── Thank you (white) ── */
  thanks: {
    backgroundColor: "#FFFFFF",
    padding: 48,
    justifyContent: "center",
    alignItems: "center",
  },
  thanksArtWrap: {
    position: "absolute",
    top: 48,
    right: 28,
    opacity: 0.85,
  },
  thanksGlobe: {
    width: 200,
    height: 200,
    objectFit: "contain",
  },
  thanksRule: {
    width: 56,
    height: 3,
    backgroundColor: RED,
    marginBottom: 28,
  },
  thanksLogo: {
    width: 148,
    height: 60,
    objectFit: "contain",
    marginBottom: 28,
  },
  thanksTitle: {
    fontSize: 34,
    fontFamily: "Helvetica-Bold",
    color: INK,
    marginBottom: 12,
  },
  thanksBody: {
    fontSize: 12,
    color: SLATE,
    textAlign: "center",
    lineHeight: 1.55,
    maxWidth: 360,
    marginBottom: 18,
  },
  thanksMeta: {
    fontSize: 10,
    color: MUTED,
    textAlign: "center",
  },
  thanksDomain: {
    marginTop: 18,
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: RED,
  },
  thanksFooter: {
    position: "absolute",
    left: 28,
    right: 28,
    bottom: 18,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: RED_SOFT,
    paddingTop: 10,
  },
  thanksFooterText: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: RED,
  },
  thanksFooterDate: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: INK,
    letterSpacing: 1.2,
  },
});

function formatPhone(phone: string | null | undefined): string | null {
  if (!phone?.trim()) return null;
  const raw = phone.trim();
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 10) return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
  if (digits.length === 12 && digits.startsWith("91")) {
    return `+91 ${digits.slice(2, 7)} ${digits.slice(7)}`;
  }
  if (raw.startsWith("+")) return raw;
  return raw;
}

function RuledBlock({ lines = 3 }: { lines?: number }) {
  return (
    <View>
      {Array.from({ length: lines }).map((_, i) => (
        <View key={i} style={s.ruleLine} />
      ))}
    </View>
  );
}

function MemberCard({
  member,
  crorepathiPin,
}: {
  member: RosterMember;
  crorepathiPin: string;
}) {
  const phone = formatPhone(member.phone);

  return (
    <View style={s.card} wrap={false}>
      {/* Col 1 — person */}
      <View style={s.colPerson}>
        <View style={s.photoFrame}>
          {member.photoDataUrl ? (
            <Image src={member.photoDataUrl} style={s.photo} />
          ) : (
            <View style={s.photoFallback}>
              <Text style={s.photoInitial}>{member.initial}</Text>
            </View>
          )}
        </View>
        <Text style={s.memberName}>{member.name}</Text>
        <Text style={s.category}>{member.category}</Text>
      </View>

      {/* Col 2 — contact */}
      <View style={s.colContact}>
        <Text style={s.company}>{member.businessName}</Text>
        {member.location?.trim() ? (
          <Text style={s.detailText}>{member.location.trim()}</Text>
        ) : null}
        {member.email?.trim() ? (
          <Text style={s.detailText}>{member.email.trim()}</Text>
        ) : null}
        {phone ? <Text style={s.detailText}>{phone}</Text> : null}
        {member.website?.trim() ? (
          <Text style={s.detailMuted}>{member.website.trim()}</Text>
        ) : null}
        {member.crorepathiGiver ? (
          <View style={s.crorepathiRow}>
            <Image src={crorepathiPin} style={s.crorepathiPin} />
            <Text style={s.crorepathiText}>Crorepathi Club Member</Text>
          </View>
        ) : null}
      </View>

      {/* Col 3 — Gives & Ask notes */}
      <View style={s.colNotes}>
        <Text style={s.notesTitle}>Gives & Ask</Text>
        <Text style={s.notesSectionLabel}>Give</Text>
        <RuledBlock lines={3} />
        <Text style={s.notesSectionLabel}>Ask</Text>
        <RuledBlock lines={3} />
      </View>
    </View>
  );
}

export function MemberRosterPDF({
  payload,
  logoBase64,
  crorepathiPinBase64,
  globeBase64,
}: {
  payload: RosterPayload;
  logoBase64: string;
  crorepathiPinBase64: string;
  globeBase64: string;
}) {
  const memberPages = chunkMembers(payload.members, ROSTER_CARDS_PER_PAGE);
  const leadership = payload.leadership ?? emptyRosterLeadership();
  const now = new Date();
  const year = now.getFullYear();
  const monthYear = now
    .toLocaleDateString("en-IN", { month: "long", year: "numeric" })
    .toUpperCase();
  const crorepathiMembers = payload.members
    .filter((m) => m.crorepathiGiver)
    .sort((a, b) => a.name.localeCompare(b.name, "en", { sensitivity: "base" }));

  // Cover + leadership + member grids + Crorepathi + LVH + thank you
  const totalPages =
    1 +
    ROSTER_LEADERSHIP_PAGE_COUNT +
    memberPages.length +
    ROSTER_CROREPATHI_PAGE_COUNT +
    ROSTER_LVH_PAGE_COUNT +
    1;
  const memberStartPage = 1 + ROSTER_LEADERSHIP_PAGE_COUNT + 1;
  const crorepathiPageNumber = memberStartPage + memberPages.length;
  const lvhPageNumber = crorepathiPageNumber + 1;

  return (
    <Document
      title={`${payload.chapterName} Member Roster ${year}`}
      author={payload.chapterName}
      subject="Member Roster"
      creator={payload.chapterName}
    >
      <Page size="A4" style={s.cover}>
        <View style={s.coverArtWrap}>
          <NetworkingNodes size={250} />
        </View>
        <View>
          <Image src={logoBase64} style={s.coverLogo} />
          <Text style={s.coverEyebrow}>Chapter Directory</Text>
          <Text style={s.coverTitle}>Member{"\n"}Roster</Text>
          <Text style={s.coverChapter}>{payload.chapterName}</Text>
          <Text style={s.coverTagline}>{payload.tagline}</Text>
          <View style={s.coverMetaRow}>
            <View style={s.coverMetaCard}>
              <Text style={s.coverMetaLabel}>Members</Text>
              <Text style={s.coverMetaValue}>{payload.memberCount}</Text>
            </View>
            <View style={s.coverMetaCard}>
              <Text style={s.coverMetaLabel}>Edition</Text>
              <Text style={s.coverMetaValue}>{monthYear}</Text>
            </View>
          </View>
          {(payload.categoryGroups?.length ?? 0) > 0 ? (
            <View>
              <Text style={s.coverPillsLabel}>Category Groups</Text>
              <View style={s.coverPills}>
                {payload.categoryGroups.map((group) => (
                  <View key={group} style={s.coverPill}>
                    <GroupIcon name={group} size={10} color={RED} />
                    <Text style={s.coverPillText}>{group}</Text>
                  </View>
                ))}
              </View>
            </View>
          ) : null}
        </View>
        <View style={s.coverFooter}>
          <View style={s.coverFooterLeft}>
            <GlobeIcon size={11} color={GREY} />
            <Text style={s.coverFooterText}>Prepared for trusted chapter sharing</Text>
          </View>
          <View style={s.coverAccentBar} />
          <Text style={s.coverFooterText}>{payload.siteDomain}</Text>
        </View>
      </Page>

      <RosterLeadershipPages
        leadership={leadership}
        startPage={2}
        totalPages={totalPages}
      />

      {memberPages.map((pageMembers, index) => {
        const core = ROSTER_CORE_VALUES[index % ROSTER_CORE_VALUES.length];
        const pageNumber = memberStartPage + index;
        return (
          <Page key={`roster-${index}`} size="A4" style={s.page}>
            <View style={s.pageHeader}>
              <View style={s.headerLeft}>
                <View style={s.headerBrandRow}>
                  <Text style={s.headerBrandMuted}>MIRACLE</Text>
                  <Text style={s.headerBrandAccent}>MEMBERS</Text>
                </View>
                <Text style={s.headerSub}>MEMBER ROSTER · {year}</Text>
              </View>
              <Image src={logoBase64} style={s.headerLogo} />
            </View>

            <View style={s.stack}>
              {pageMembers.map((member, memberIndex) => {
                const absoluteIndex = index * ROSTER_CARDS_PER_PAGE + memberIndex;
                const absolutePrev =
                  absoluteIndex > 0 ? payload.members[absoluteIndex - 1] : null;
                const showGroupHeader =
                  !absolutePrev || absolutePrev.categoryGroup !== member.categoryGroup;

                return (
                  <View key={member.id}>
                    {showGroupHeader ? (
                      <View style={s.groupHeader}>
                        <Text style={s.groupHeaderTitle}>{member.categoryGroup}</Text>
                        <View style={s.groupHeaderRule} />
                      </View>
                    ) : null}
                    <MemberCard
                      member={member}
                      crorepathiPin={crorepathiPinBase64}
                    />
                  </View>
                );
              })}
            </View>

            <View style={s.pageFooter} fixed>
              <View style={s.coreValueBlock}>
                <Text style={s.coreValueLabel}>Core Value</Text>
                <Text style={s.coreValueTitle}>{core.title}</Text>
                <Text style={s.coreValueLine}>{core.line}</Text>
              </View>
              <View style={s.footerRight}>
                <Text style={s.footerDate}>{monthYear}</Text>
                <Text style={s.footerPage}>
                  {String(pageNumber).padStart(2, "0")} / {String(totalPages).padStart(2, "0")}
                </Text>
              </View>
            </View>
          </Page>
        );
      })}

      <RosterCrorepathiPage
        members={crorepathiMembers}
        pinBase64={crorepathiPinBase64}
        pageNumber={crorepathiPageNumber}
        totalPages={totalPages}
      />

      <RosterLvhTeamPage
        leaders={leadership.lvhTeam}
        pageNumber={lvhPageNumber}
        totalPages={totalPages}
      />

      <Page size="A4" style={s.thanks}>
        <View style={s.thanksArtWrap}>
          <Image src={globeBase64} style={s.thanksGlobe} />
        </View>
        <View style={s.thanksRule} />
        <Image src={logoBase64} style={s.thanksLogo} />
        <Text style={s.thanksTitle}>Thank You</Text>
        <Text style={s.thanksBody}>
          Thank you for connecting with {payload.chapterName}. We look forward to growing
          together through trusted referrals, meaningful relationships, and shared success.
        </Text>
        <Text style={s.thanksMeta}>{payload.tagline}</Text>
        <Text style={s.thanksDomain}>{payload.siteDomain}</Text>
        <View style={s.thanksFooter} fixed>
          <Text style={s.thanksFooterText}>Givers Gain</Text>
          <Text style={s.thanksFooterDate}>{monthYear}</Text>
        </View>
      </Page>
    </Document>
  );
}
