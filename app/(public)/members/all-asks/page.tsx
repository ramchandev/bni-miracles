import ChapterGivesAsksBrowse from "@/components/ChapterGivesAsksBrowse";
import JsonLd from "@/components/JsonLd";
import { fetchChapterGivesAsksGrouped } from "@/lib/gives-asks-chapter";
import { breadcrumbJsonLd, createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "All Asks — BNI Miracles Members",
  description:
    "Browse every referral ask from BNI Miracles members, grouped by category — see what types of leads members are looking for.",
  path: "/members/all-asks",
  keywords: ["BNI asks", "BNI Miracles referrals", "member asks Chennai"],
});

export default async function AllAsksPage() {
  const { askGroups } = await fetchChapterGivesAsksGrouped();

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Members", path: "/members" },
          { name: "All Asks", path: "/members/all-asks" },
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
        <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-3">All Asks</h1>
        <p className="text-white/60 text-sm max-w-lg mx-auto leading-relaxed">
          Referrals chapter members are actively looking for — grouped by category so you
          can spot opportunities to connect.
        </p>
      </section>

      <section className="py-12 px-6" style={{ background: "var(--color-bg)" }}>
        <div style={{ maxWidth: 1080, margin: "0 auto" }}>
          <ChapterGivesAsksBrowse kind="ask" groups={askGroups} />
        </div>
      </section>
    </>
  );
}
