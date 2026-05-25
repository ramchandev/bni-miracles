import type { Metadata } from "next";
import Image from "next/image";
import InitiativeCard from "@/components/InitiativeCard";
import { initiatives } from "@/lib/initiatives";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Initiatives — ஆஹா ஆற்புதங்கள்! | BNI Miracles Chennai",
  description:
    "Discover the 10 unique chapter initiatives of BNI Miracles that make us one of Chennai's most active and innovative BNI chapters.",
};

export default function InitiativesPage() {
  return (
    <>
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
            Ten programs that keep BNI Miracles energised, connected, and growing.
          </p>
        </div>
      </section>

      <section className="py-16 px-6" style={{ background: "var(--color-bg)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
