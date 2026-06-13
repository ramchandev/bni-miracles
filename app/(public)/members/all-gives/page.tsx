import ChapterGivesAsksBrowse from "@/components/ChapterGivesAsksBrowse";
import JsonLd from "@/components/JsonLd";
import MemberPageGate from "@/components/MemberPageGate";
import { fetchChapterGivesAsksGrouped } from "@/lib/gives-asks-chapter";
import { getMemberSession } from "@/lib/member-session";
import { breadcrumbJsonLd, createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "All Gives — BNI Miracles Members",
  description: "BNI Miracles members: browse chapter gives grouped by category.",
  path: "/members/all-gives",
  noIndex: true,
});

export default async function AllGivesPage() {
  const session = await getMemberSession();

  if (!session) {
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
            BNI Miracles Members
          </p>
          <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-3">All Gives</h1>
          <p className="text-white/60 text-sm max-w-lg mx-auto leading-relaxed">
            Log in to browse referral gives from chapter members, grouped by category.
          </p>
        </section>
        <MemberPageGate
          title="All Gives"
          description="Log in with your phone number and meeting place to browse chapter gives."
        />
      </>
    );
  }

  const { giveGroups } = await fetchChapterGivesAsksGrouped();

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Members", path: "/members" },
          { name: "All Gives", path: "/members/all-gives" },
        ])}
      />
      <section
        className="px-6 text-center"
        style={{ background: "var(--color-dark)", paddingTop: 100, paddingBottom: 48 }}
      >
        <p
          className="text-sm font-semibold tracking-widest uppercase mb-3"
          style={{ color: "var(--color-accent)" }}
        >
          BNI Miracles Members
        </p>
        <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-3">All Gives</h1>
        <p className="text-white/60 text-sm max-w-lg mx-auto leading-relaxed">
          Referrals chapter members can pass on — grouped by category so you can quickly see
          who can help in each area.
        </p>
      </section>

      <section className="py-12 px-6" style={{ background: "var(--color-bg)" }}>
        <div style={{ maxWidth: 1080, margin: "0 auto" }}>
          <ChapterGivesAsksBrowse kind="give" groups={giveGroups} />
        </div>
      </section>
    </>
  );
}
