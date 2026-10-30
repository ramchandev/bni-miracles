import type { ReactNode } from "react";
import { Page, View, Text, Image, StyleSheet } from "@react-pdf/renderer";
import type { RosterLeader, RosterLeadership } from "@/lib/member-roster";

const RED = "#C8102E";
const INK = "#1A1A1A";
const MUTED = "#6B7280";
const LINE = "#E5E7EB";
const FRAME = "#000000";

const s = StyleSheet.create({
  page: {
    backgroundColor: "#FFFFFF",
    paddingTop: 40,
    paddingHorizontal: 40,
    paddingBottom: 48,
    fontFamily: "Helvetica",
  },
  pageFooter: {
    position: "absolute",
    left: 40,
    right: 40,
    bottom: 18,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#FECACA",
    paddingTop: 8,
  },
  footerLeft: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: RED,
  },
  footerRight: {
    fontSize: 8,
    color: MUTED,
  },

  /* Region pill */
  regionWrap: {
    alignItems: "center",
    marginBottom: 48,
    marginTop: 24,
  },
  regionPill: {
    borderWidth: 2,
    borderColor: FRAME,
    borderRadius: 24,
    paddingVertical: 10,
    paddingHorizontal: 28,
  },
  regionPillText: {
    fontSize: 13,
    fontFamily: "Helvetica-Bold",
    color: FRAME,
    letterSpacing: 1.4,
  },
  edRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 20,
    marginTop: 20,
  },
  edCard: {
    width: "42%",
    alignItems: "center",
  },
  edPhoto: {
    width: 150,
    height: 150,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: FRAME,
    objectFit: "cover",
    marginBottom: 14,
  },
  edPhotoFallback: {
    width: 150,
    height: 150,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: FRAME,
    backgroundColor: RED,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  edInitial: {
    color: "#FFFFFF",
    fontSize: 36,
    fontFamily: "Helvetica-Bold",
  },
  edName: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    color: RED,
    textAlign: "center",
    textTransform: "uppercase",
    marginBottom: 4,
  },
  edRole: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: INK,
    textAlign: "center",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },

  /* RST */
  sectionTitle: {
    fontSize: 22,
    fontFamily: "Helvetica-Bold",
    color: RED,
    textAlign: "center",
    letterSpacing: 1.2,
    marginBottom: 28,
    marginTop: 8,
  },
  rstTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 22,
    paddingHorizontal: 4,
  },
  rstBottomRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 28,
    paddingHorizontal: 4,
  },
  rstCard: {
    width: "23%",
    alignItems: "center",
  },
  rstCardBottom: {
    width: "23%",
    alignItems: "center",
  },
  rstPhoto: {
    width: 100,
    height: 100,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: FRAME,
    objectFit: "cover",
    marginBottom: 8,
  },
  rstPhotoFallback: {
    width: 100,
    height: 100,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: FRAME,
    backgroundColor: RED,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  rstInitial: {
    color: "#FFFFFF",
    fontSize: 22,
    fontFamily: "Helvetica-Bold",
  },
  rstName: {
    fontSize: 8.5,
    fontFamily: "Helvetica-Bold",
    color: RED,
    textAlign: "center",
    textTransform: "uppercase",
    marginBottom: 2,
  },
  rstRole: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    color: INK,
    textAlign: "center",
    textTransform: "uppercase",
    lineHeight: 1.25,
  },

  /* Head Table */
  headTitle: {
    fontSize: 26,
    fontFamily: "Helvetica-Bold",
    color: RED,
    textAlign: "center",
    letterSpacing: 1.6,
    marginBottom: 28,
    marginTop: 6,
  },
  headTop: {
    alignItems: "center",
    marginBottom: 28,
  },
  headBottom: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 10,
  },
  headCard: {
    width: "40%",
    alignItems: "center",
  },
  headCardWide: {
    width: "46%",
    alignItems: "center",
  },
  headPhotoLg: {
    width: 130,
    height: 130,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: FRAME,
    objectFit: "cover",
    marginBottom: 10,
  },
  headPhoto: {
    width: 110,
    height: 110,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: FRAME,
    objectFit: "cover",
    marginBottom: 10,
  },
  headPhotoFallbackLg: {
    width: 130,
    height: 130,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: FRAME,
    backgroundColor: RED,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  headPhotoFallback: {
    width: 110,
    height: 110,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: FRAME,
    backgroundColor: RED,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  headInitial: {
    color: "#FFFFFF",
    fontSize: 28,
    fontFamily: "Helvetica-Bold",
  },
  headName: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: RED,
    textAlign: "center",
    textTransform: "uppercase",
    marginBottom: 3,
  },
  headRole: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: INK,
    textAlign: "center",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  headMeta: {
    fontSize: 7.5,
    color: MUTED,
    textAlign: "center",
    marginBottom: 2,
    lineHeight: 1.3,
  },
  headMetaStrong: {
    fontSize: 8,
    color: INK,
    textAlign: "center",
    marginBottom: 2,
  },
  emptyHint: {
    fontSize: 11,
    color: MUTED,
    textAlign: "center",
    marginTop: 80,
  },
});

function Portrait({
  leader,
  size,
}: {
  leader: RosterLeader;
  size: "ed" | "rst" | "head" | "headLg";
}) {
  const photoStyle =
    size === "ed"
      ? s.edPhoto
      : size === "rst"
        ? s.rstPhoto
        : size === "headLg"
          ? s.headPhotoLg
          : s.headPhoto;
  const fallbackStyle =
    size === "ed"
      ? s.edPhotoFallback
      : size === "rst"
        ? s.rstPhotoFallback
        : size === "headLg"
          ? s.headPhotoFallbackLg
          : s.headPhotoFallback;
  const initialStyle = size === "rst" ? s.rstInitial : size === "ed" ? s.edInitial : s.headInitial;

  if (leader.photoDataUrl) {
    return <Image src={leader.photoDataUrl} style={photoStyle} />;
  }
  return (
    <View style={fallbackStyle}>
      <Text style={initialStyle}>{leader.initial}</Text>
    </View>
  );
}

function PageChrome({
  pageNumber,
  totalPages,
  children,
  footerLabel,
}: {
  pageNumber: number;
  totalPages: number;
  children: ReactNode;
  footerLabel: string;
}) {
  return (
    <Page size="A4" style={s.page}>
      {children}
      <View style={s.pageFooter} fixed>
        <Text style={s.footerLeft}>{footerLabel}</Text>
        <Text style={s.footerRight}>
          {String(pageNumber).padStart(2, "0")} / {String(totalPages).padStart(2, "0")}
        </Text>
      </View>
    </Page>
  );
}

export function RosterLeadershipPages({
  leadership,
  startPage,
  totalPages,
}: {
  leadership: RosterLeadership;
  startPage: number;
  totalPages: number;
}) {
  const eds = leadership.executiveDirectors;
  const rst = leadership.regionalSupportTeam;
  const head = leadership.headTable;

  const president = head.find((h) => /president/i.test(h.roleName) && !/vice/i.test(h.roleName));
  const vice = head.find((h) => /vice\s*president/i.test(h.roleName));
  const secretary = head.find((h) => /secretary/i.test(h.roleName));
  const others = head.filter(
    (h) => h !== president && h !== vice && h !== secretary
  );

  let page = startPage;

  const regionPage = page++;
  const rstPage = page++;
  const headPage = page++;

  return (
    <>
      {/* Page: Chennai North Region — Executive Directors */}
      <PageChrome
        pageNumber={regionPage}
        totalPages={totalPages}
        footerLabel="CHENNAI NORTH REGION"
      >
        <View style={s.regionWrap}>
          <View style={s.regionPill}>
            <Text style={s.regionPillText}>BNI CHENNAI NORTH REGION</Text>
          </View>
        </View>
        {eds.length === 0 ? (
          <Text style={s.emptyHint}>Executive Directors to be announced</Text>
        ) : (
          <View style={s.edRow}>
            {eds.slice(0, 2).map((leader) => (
              <View key={`${leader.roleName}-${leader.name}`} style={s.edCard}>
                <Portrait leader={leader} size="ed" />
                <Text style={s.edName}>{leader.name}</Text>
                <Text style={s.edRole}>{leader.roleName}</Text>
              </View>
            ))}
          </View>
        )}
      </PageChrome>

      {/* Page: Regional Support Team */}
      <PageChrome
        pageNumber={rstPage}
        totalPages={totalPages}
        footerLabel="REGIONAL SUPPORT TEAM"
      >
        <Text style={s.sectionTitle}>REGIONAL SUPPORT TEAM</Text>
        {rst.length === 0 ? (
          <Text style={s.emptyHint}>Regional Support Team to be announced</Text>
        ) : (
          <View>
            <View style={s.rstTopRow}>
              {rst.slice(0, 4).map((leader) => (
                <View key={`${leader.roleName}-${leader.name}`} style={s.rstCard}>
                  <Portrait leader={leader} size="rst" />
                  <Text style={s.rstName}>{leader.name}</Text>
                  <Text style={s.rstRole}>{leader.roleName}</Text>
                </View>
              ))}
            </View>
            {rst.length > 4 ? (
              <View style={s.rstBottomRow}>
                {rst.slice(4).map((leader) => (
                  <View key={`${leader.roleName}-${leader.name}`} style={s.rstCardBottom}>
                    <Portrait leader={leader} size="rst" />
                    <Text style={s.rstName}>{leader.name}</Text>
                    <Text style={s.rstRole}>{leader.roleName}</Text>
                  </View>
                ))}
              </View>
            ) : null}
          </View>
        )}
      </PageChrome>

      {/* Page: Head Table */}
      <PageChrome pageNumber={headPage} totalPages={totalPages} footerLabel="HEAD TABLE">
        <Text style={s.headTitle}>HEAD TABLE</Text>
        {head.length === 0 ? (
          <Text style={s.emptyHint}>Head Table to be announced</Text>
        ) : (
          <>
            {president ? (
              <View style={s.headTop}>
                <Portrait leader={president} size="headLg" />
                <Text style={s.headName}>{president.name}</Text>
                <Text style={s.headRole}>{president.roleName}</Text>
                {president.responsibility ? (
                  <Text style={s.headMeta}>{president.responsibility}</Text>
                ) : null}
                {president.category ? (
                  <Text style={s.headMetaStrong}>{president.category}</Text>
                ) : null}
                {president.businessName ? (
                  <Text style={s.headMeta}>{president.businessName}</Text>
                ) : null}
              </View>
            ) : null}

            <View style={s.headBottom}>
              {[vice, secretary, ...others].filter(Boolean).map((leader) => (
                <View key={`${leader!.roleName}-${leader!.name}`} style={s.headCardWide}>
                  <Portrait leader={leader!} size="head" />
                  <Text style={s.headName}>{leader!.name}</Text>
                  <Text style={s.headRole}>{leader!.roleName}</Text>
                  {leader!.responsibility ? (
                    <Text style={s.headMeta}>{leader!.responsibility}</Text>
                  ) : null}
                  {leader!.category ? (
                    <Text style={s.headMetaStrong}>{leader!.category}</Text>
                  ) : null}
                  {leader!.businessName ? (
                    <Text style={s.headMeta}>{leader!.businessName}</Text>
                  ) : null}
                </View>
              ))}
            </View>
          </>
        )}
      </PageChrome>
    </>
  );
}

export const ROSTER_LEADERSHIP_PAGE_COUNT = 3;
export const ROSTER_CROREPATHI_PAGE_COUNT = 1;
export const ROSTER_LVH_PAGE_COUNT = 1;

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

/** Crorepathi Club — all members on one page, before LVH. */
export function RosterCrorepathiPage({
  members,
  pinBase64,
  pageNumber,
  totalPages,
}: {
  members: { name: string; category: string; photoDataUrl: string | null; initial: string }[];
  pinBase64: string;
  pageNumber: number;
  totalPages: number;
}) {
  return (
    <PageChrome pageNumber={pageNumber} totalPages={totalPages} footerLabel="CROREPATHI CLUB">
      <View style={{ alignItems: "center", marginBottom: 18, marginTop: 4 }}>
        <Image
          src={pinBase64}
          style={{ width: 72, height: 72, objectFit: "contain", marginBottom: 10 }}
        />
        <Text style={s.sectionTitle}>CROREPATHI CLUB MEMBERS</Text>
      </View>
      {members.length === 0 ? (
        <Text style={s.emptyHint}>Crorepathi Club members to be announced</Text>
      ) : (
        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: 12,
          }}
        >
          {members.map((m) => (
            <View
              key={m.name}
              style={{ width: "30%", alignItems: "center", marginBottom: 14 }}
            >
              {m.photoDataUrl ? (
                <Image
                  src={m.photoDataUrl}
                  style={{
                    width: 92,
                    height: 92,
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: FRAME,
                    objectFit: "cover",
                    marginBottom: 8,
                  }}
                />
              ) : (
                <View
                  style={{
                    width: 92,
                    height: 92,
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: FRAME,
                    backgroundColor: RED,
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 8,
                  }}
                >
                  <Text style={{ color: "#FFFFFF", fontSize: 22, fontFamily: "Helvetica-Bold" }}>
                    {m.initial}
                  </Text>
                </View>
              )}
              <Text style={s.rstName}>{m.name}</Text>
              <Text style={s.rstRole}>{m.category}</Text>
            </View>
          ))}
        </View>
      )}
    </PageChrome>
  );
}

/** Visitors Host Team (LVH) — placed after Crorepathi, before thank you. */
export function RosterLvhTeamPage({
  leaders,
  pageNumber,
  totalPages,
}: {
  leaders: RosterLeader[];
  pageNumber: number;
  totalPages: number;
}) {
  const lead = leaders.find((l) => /lead\s*visitor\s*host/i.test(l.roleName));
  const hosts = leaders.filter((l) => l !== lead);

  return (
    <PageChrome pageNumber={pageNumber} totalPages={totalPages} footerLabel="VISITORS HOST TEAM">
      <Text style={s.sectionTitle}>VISITORS HOST TEAM</Text>
      {leaders.length === 0 ? (
        <Text style={s.emptyHint}>Visitors Host Team to be announced</Text>
      ) : (
        <View>
          {lead ? (
            <View style={s.headTop}>
              <Portrait leader={lead} size="headLg" />
              <Text style={s.headName}>{lead.name}</Text>
              <Text style={s.headRole}>{lead.roleName}</Text>
              {formatPhone(lead.phone) ? (
                <Text style={s.headMetaStrong}>{formatPhone(lead.phone)}</Text>
              ) : null}
              {lead.category ? <Text style={s.headMeta}>{lead.category}</Text> : null}
            </View>
          ) : null}
          {hosts.length > 0 ? (
            <View style={s.headBottom}>
              {hosts.map((leader) => (
                <View key={`${leader.roleName}-${leader.name}`} style={s.headCardWide}>
                  <Portrait leader={leader} size="head" />
                  <Text style={s.headName}>{leader.name}</Text>
                  <Text style={s.headRole}>{leader.roleName}</Text>
                  {formatPhone(leader.phone) ? (
                    <Text style={s.headMetaStrong}>{formatPhone(leader.phone)}</Text>
                  ) : null}
                  {leader.category ? <Text style={s.headMeta}>{leader.category}</Text> : null}
                </View>
              ))}
            </View>
          ) : null}
        </View>
      )}
    </PageChrome>
  );
}
