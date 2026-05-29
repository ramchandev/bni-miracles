import Link from "next/link";
import { notFound } from "next/navigation";
import JsonLd from "@/components/JsonLd";
import PowerTeamMemberCards from "@/components/power-team/PowerTeamMemberCards";
import RichTextContent from "@/components/RichTextContent";
import {
  countTeamMembers,
  fetchCategoryIconMap,
  fetchGivesAsksForMembers,
  fetchPowerTeamBySlug,
  fetchPowerTeamsWithMembers,
  sortTeamMembers,
} from "@/lib/power-teams-server";
import { teamLightBg } from "@/lib/power-teams";
import { breadcrumbJsonLd, createPageMetadata } from "@/lib/seo";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const teams = await fetchPowerTeamsWithMembers();
  return teams.filter((t) => t.slug).map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const team = await fetchPowerTeamBySlug(slug);
  if (!team) return { title: "Team Not Found" };

  return createPageMetadata({
    title: team.name,
    description: team.focus_area ?? `Meet the ${team.name} Power Team at BNI Miracles Chennai.`,
    path: `/power-team/${team.slug}`,
    keywords: ["BNI Power Team", team.name, "BNI Miracles"],
  });
}

export default async function PowerTeamDetailPage({ params }: Props) {
  const { slug } = await params;
  const team = await fetchPowerTeamBySlug(slug);
  if (!team) notFound();

  const members = sortTeamMembers(team);
  const memberIds = members.map((r) => r.members!.id);
  const [givesAsksByMemberId, categoryIcons] = await Promise.all([
    fetchGivesAsksForMembers(memberIds),
    fetchCategoryIconMap(),
  ]);
  const memberCount = countTeamMembers(team);
  const captainMember = team.captain_member_id
    ? members.find((r) => r.members!.id === team.captain_member_id)?.members
    : null;
  const lightBg = teamLightBg(team.color);

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Power Team", path: "/power-team" },
          { name: team.name, path: `/power-team/${team.slug}` },
        ])}
      />

      <div className="pt-24 pb-4 px-6" style={{ background: "var(--color-dark)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <nav className="flex items-center gap-2 text-sm flex-wrap" style={{ color: "rgba(255,255,255,0.5)" }}>
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <span>/</span>
            <Link href="/power-team" className="hover:text-white transition-colors">Power Team</Link>
            <span>/</span>
            <span style={{ color: "white" }}>{team.name}</span>
          </nav>
        </div>
      </div>

      <section className="pb-12 pt-8 px-6" style={{ background: "var(--color-dark)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div
            className="rounded-2xl overflow-hidden"
            style={{ border: `1.5px solid ${team.color}44`, background: "rgba(255,255,255,0.04)" }}
          >
            <div
              className="px-8 py-6 flex flex-wrap items-center gap-4"
              style={{
                background: `linear-gradient(135deg, ${team.color}22 0%, transparent 100%)`,
              }}
            >
              <div
                className="w-16 h-16 rounded-xl flex items-center justify-center text-4xl shrink-0"
                style={{ background: team.color + "25" }}
              >
                {team.emoji}
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-2xl md:text-4xl font-extrabold text-white mb-2">{team.name}</h1>
                {team.focus_area && (
                  <p className="text-base font-medium" style={{ color: team.color }}>
                    {team.focus_area}
                  </p>
                )}
                {captainMember && (
                  <p className="text-sm mt-2 font-semibold" style={{ color: "var(--color-accent)" }}>
                    ⭐ Team Captain: {captainMember.name}
                  </p>
                )}
                <p className="text-sm mt-2 text-white/50">{memberCount} members</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {team.description && (
        <section className="px-6 py-8" style={{ background: lightBg }}>
          <div style={{ maxWidth: 820, margin: "0 auto" }}>
            <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: team.color }}>
              💡 Why This Team Works
            </p>
            <RichTextContent html={team.description} className="text-base leading-relaxed" style={{ color: "var(--color-gray)" }} />
          </div>
        </section>
      )}

      <section className="py-10 px-6" style={{ background: "var(--color-bg)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <h2 className="text-xl font-extrabold mb-6" style={{ color: "var(--color-dark)" }}>
            Team Members
          </h2>
          <PowerTeamMemberCards
            members={members}
            captainMemberId={team.captain_member_id}
            teamColor={team.color}
            categoryIcons={categoryIcons}
            givesAsksByMemberId={givesAsksByMemberId}
          />
        </div>
      </section>

      <section className="py-10 px-6" style={{ background: "white" }}>
        <div
          style={{ maxWidth: 820, margin: "0 auto" }}
          className="flex flex-col sm:flex-row gap-4 justify-between items-center"
        >
          <Link href="/power-team" className="flex items-center gap-2 text-sm font-semibold" style={{ color: "var(--color-primary)" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
            All Power Teams
          </Link>
          <Link href="/attend-meeting" className="btn-primary text-sm">
            Attend a Meeting
          </Link>
        </div>
      </section>
    </>
  );
}
