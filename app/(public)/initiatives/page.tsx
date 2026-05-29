import Image from "next/image";
import InitiativeCard from "@/components/InitiativeCard";
import JsonLd from "@/components/JsonLd";
import { initiatives } from "@/lib/initiatives";
import { POWER_TEAM_PROGRAM } from "@/lib/power-teams-content";
import Link from "next/link";
import { breadcrumbJsonLd, createPageMetadata, initiativesListJsonLd } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Chapter Initiatives — ஆஹா ஆற்புதங்கள்!",
  description:
    "Discover the unique chapter initiatives of BNI Miracles that keep our Chennai BNI chapter active, connected, and growing through referrals and community programs.",
  path: "/initiatives",
  keywords: ["BNI initiatives", "BNI Miracles programs", "chapter activities Chennai"],
});

export default function InitiativesPage() {
  return (
    <>
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Initiatives", path: "/initiatives" },
          ]),
          initiativesListJsonLd(initiatives),
        ]}
      />
      <section className="relative flex items-center justify-center py-32 px-6 text-center" style={{ background: "var(--color-dark)", paddingTop: 120 }}>
        <div className="absolute inset-0 opacity-20">
          <Image
            src="/Initiative-Banner.JPG"
            alt="BNI Miracles initiatives"
            fill
            style={{ objectFit: "cover" }}
            priority
          />
        </div>
        <div className="relative z-10" style={{ maxWidth: 700 }}>
          <p
            className="text-3xl font-bold mb-3"
            style={{ color: "var(--color-accent)", fontFamily: "Noto Sans Tamil, sans-serif" }}
          >
            ஆஹா ஆற்புதங்கள்!
          </p>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
            Our Chapter Initiatives
          </h1>
          <p className="text-lg text-white/70 max-w-xl mx-auto">
            Chapter programs that keep BNI Miracles energised, connected, and growing.
          </p>
        </div>
      </section>

      <section className="py-16 px-6" style={{ background: "var(--color-bg)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <article
              className="card p-6 flex flex-col md:col-span-2 lg:col-span-1"
              style={{ border: "2px solid var(--color-accent)" }}
            >
              <div className="text-4xl mb-4">{POWER_TEAM_PROGRAM.icon}</div>
              <h3
                className="text-base font-bold mb-1"
                style={{ color: "var(--color-dark)", fontFamily: "Noto Sans Tamil, sans-serif" }}
              >
                {POWER_TEAM_PROGRAM.tamilName}
              </h3>
              <p className="text-xs font-semibold mb-3" style={{ color: "var(--color-primary)" }}>
                {POWER_TEAM_PROGRAM.englishName}
              </p>
              <p className="text-sm flex-1" style={{ color: "var(--color-gray)", lineHeight: 1.65 }}>
                {POWER_TEAM_PROGRAM.tagline}
              </p>
              <Link
                href="/power-team"
                className="mt-4 text-sm font-semibold inline-flex items-center gap-1 transition-colors hover:gap-2"
                style={{ color: "var(--color-primary)" }}
              >
                View Power Teams
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
            </article>
            {initiatives.map((init) => (
              <InitiativeCard key={init.slug} initiative={init} />
            ))}
          </div>
        </div>
      </section>

      <section className="py-14 px-6 text-center" style={{ background: "var(--color-primary)" }}>
        <h2 className="text-2xl font-extrabold text-white mb-3">Want to experience this in person?</h2>
        <p className="text-white/80 mb-6">Join us at our next Thursday meeting — free for visitors.</p>
        <Link href="/attend-meeting" className="btn-secondary">
          Book Your Seat
        </Link>
      </section>
    </>
  );
}
