import Plan121sClient from "@/components/members/Plan121sClient";
import JsonLd from "@/components/JsonLd";
import { getMemberSession } from "@/lib/member-session";
import { fetchPlan121Availability } from "@/lib/plan-121s";
import { breadcrumbJsonLd, createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Plan 1-2-1s — BNI Miracles Members",
  description:
    "Browse open one-to-one availability across BNI Miracles members and schedule your next 1-2-1 in one place.",
  path: "/members/plan-121s",
  keywords: ["BNI 1-2-1", "BNI Miracles meetings", "schedule one to one"],
});

export default async function Plan121sPage() {
  const session = await getMemberSession();
  const availability = await fetchPlan121Availability(session?.id ?? null);

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Members", path: "/members" },
          { name: "Plan 1-2-1s", path: "/members/plan-121s" },
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
        <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-3">Plan 1-2-1s</h1>
        <p className="text-white/60 text-sm max-w-xl mx-auto leading-relaxed">
          See who has open availability across the chapter and book a 1-2-1 without hopping
          between profiles.
        </p>
      </section>

      <section className="py-12 px-6" style={{ background: "var(--color-bg)" }}>
        <div style={{ maxWidth: 1080, margin: "0 auto" }}>
          <Plan121sClient initial={availability} />
        </div>
      </section>
    </>
  );
}
