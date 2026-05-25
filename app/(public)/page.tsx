import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import StatCounter from "@/components/StatCounter";
import InitiativeCard from "@/components/InitiativeCard";
import { initiatives } from "@/lib/initiatives";

export const metadata: Metadata = {
  title: "BNI Miracles — Hybrid Business Networking Chapter | Chennai",
  description:
    "BNI Miracles is a hybrid BNI chapter meeting every Thursday in Chennai. Connect with 36+ business categories, pass referrals, and grow your business.",
};

const globalStats = [
  { label: "Chapters Worldwide", value: "11,728", numericValue: 11728 },
  { label: "Countries", value: "76", numericValue: 76 },
  { label: "Members", value: "3,55,582", numericValue: 355582 },
  { label: "Referrals (Apr 25–Mar 26)", value: "1.79 Cr", numericValue: 179, suffix: "L+" },
  { label: "Business Value", value: "$26.09 Bn", numericValue: 26, prefix: "$", suffix: "Bn+" },
];

const indiaStats = [
  { label: "Chapters in India", value: "1,498", numericValue: 1498 },
  { label: "Cities", value: "143", numericValue: 143 },
  { label: "Members", value: "72,364", numericValue: 72364 },
  { label: "Referrals Passed", value: "49,31,926", numericValue: 4931926 },
  { label: "Business Generated", value: "₹55,770 Cr", numericValue: 55770, prefix: "₹", suffix: "Cr" },
  { label: "Avg Seat Value", value: "₹79.96 L/yr", numericValue: 80, prefix: "₹", suffix: "L/yr" },
];

const categories = [
  "Printing", "T-Shirt Manufacturing", "Designer Boutique", "Graphic Design",
  "Photography & Videography", "Art Therapy", "Idols Manufacturing", "Furniture Manufacturing",
  "Solar Panels", "Agri Products", "Pharma Distributor", "Water & Waste Water Treatment",
  "Birds Net", "Makeup Artist", "Pet Industry", "Tours & Travels", "Business & Finance",
  "Loans", "GST Consultant", "HR Process Audit", "Wealth Management",
  "Insurance", "Business Consultant", "Custom Software Dev", "Software Training",
  "Digital Marketing", "AV & Media", "IT Hardware", "Residential Interiors",
  "Residential Architect", "Commercial Real Estate", "Logistics", "CCTV",
  "Legal & Professional", "Intellectual Property", "Money Recovery", "Specialist Dentist",
];

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative flex items-center justify-center" style={{ minHeight: "100vh" }}>
        <Image
          src="/hero.jpg"
          alt="BNI Miracles chapter members — Chennai"
          fill
          sizes="100vw"
          style={{ objectFit: "cover", objectPosition: "center 30%" }}
          priority
        />
        {/* Dark gradient overlay — bottom is heavier so text sits above the crowd */}
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(to bottom, rgba(26,26,46,0.72) 0%, rgba(26,26,46,0.55) 45%, rgba(26,26,46,0.80) 100%)",
          }}
        />
        {/* Subtle red tint strip at the very bottom */}
        <div
          className="absolute bottom-0 left-0 right-0 h-40"
          style={{ background: "linear-gradient(to top, rgba(200,16,46,0.35), transparent)" }}
        />
        <div className="relative z-10 text-center px-6" style={{ maxWidth: 800 }}>
          <p
            className="text-sm font-semibold tracking-widest mb-4 uppercase"
            style={{ color: "var(--color-accent)" }}
          >
            Chennai North Hybrid BNI Chapter
          </p>
          <h1
            className="text-5xl md:text-7xl font-extrabold text-white mb-4"
            style={{ lineHeight: 1.1 }}
          >
            BNI Miracles
          </h1>
          <p
            className="text-2xl md:text-3xl font-bold mb-4"
            style={{ color: "var(--color-accent)", fontFamily: "Noto Sans Tamil, sans-serif" }}
          >
            ஆஹா ஆற்புதங்கள்!
          </p>
          <p className="text-lg text-white/80 mb-10">
            A hybrid BNI chapter — meeting every Thursday in Chennai
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/attend-meeting" className="btn-primary text-base" style={{ padding: "1rem 2rem" }}>
              Attend a Meeting
            </Link>
            <Link href="/members" className="btn-secondary text-base" style={{ padding: "1rem 2rem" }}>
              Meet Our Members
            </Link>
          </div>
        </div>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/50 animate-bounce">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M7 13l5 5 5-5M7 7l5 5 5-5" />
          </svg>
        </div>
      </section>

      {/* BNI Global Stats */}
      <StatCounter stats={globalStats} title="BNI — Building Business Globally" />

      {/* BNI India Stats */}
      <StatCounter stats={indiaStats} title="BNI India — A Powerhouse Network" />

      {/* About BNI Miracles */}
      <section className="py-20 px-6" style={{ background: "var(--color-bg)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }} className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-sm font-semibold tracking-widest uppercase mb-3" style={{ color: "var(--color-primary)" }}>
              About Us
            </p>
            <h2 className="section-title mb-6">
              Where Chennai&apos;s Best Businesses Connect
            </h2>
            <p className="text-base mb-4" style={{ color: "var(--color-gray)", lineHeight: 1.8 }}>
              BNI Miracles is a vibrant, hybrid BNI chapter based in Chennai, Tamil Nadu. We bring together entrepreneurs, business owners, and professionals from 36 diverse categories every Thursday — both in-person and online — to build genuine business relationships.
            </p>
            <p className="text-base mb-4" style={{ color: "var(--color-gray)", lineHeight: 1.8 }}>
              Our chapter is built on the foundation of BNI&apos;s core philosophy: <strong>Givers Gain®</strong>. Members don&apos;t just network — they actively refer, support, and grow each other&apos;s businesses.
            </p>
            <p className="text-base mb-8" style={{ color: "var(--color-gray)", lineHeight: 1.8 }}>
              Whether you&apos;re a seasoned entrepreneur or just starting your business journey, BNI Miracles offers the community, structure, and tools to help you grow systematically.
            </p>
            <Link href="/about" className="btn-primary">
              Learn More About Us
            </Link>
          </div>
          <div className="relative">
            <Image
              src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&q=80"
              alt="Business handshake"
              width={600}
              height={420}
              className="rounded-2xl"
              style={{ objectFit: "cover", width: "100%", height: 420 }}
            />
            <div
              className="absolute -bottom-4 -left-4 p-5 rounded-xl text-white shadow-xl"
              style={{ background: "var(--color-primary)" }}
            >
              <div className="text-3xl font-extrabold">Every</div>
              <div className="text-sm font-semibold">Thursday</div>
              <div className="text-xs opacity-80">Hybrid Meeting</div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-20 px-6" style={{ background: "white" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div className="text-center mb-12">
            <p className="text-sm font-semibold tracking-widest uppercase mb-3" style={{ color: "var(--color-primary)" }}>
              Diverse Industries
            </p>
            <h2 className="section-title mb-3">36 Business Categories Under One Roof</h2>
            <p className="text-base max-w-xl mx-auto" style={{ color: "var(--color-gray)" }}>
              One member per category — so you&apos;re always the only representative of your business in the room.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 justify-center mb-10">
            {categories.map((cat) => (
              <span
                key={cat}
                className="px-3 py-1.5 rounded-full text-xs font-semibold"
                style={{ background: "#FEF3C7", color: "#92400E" }}
              >
                {cat}
              </span>
            ))}
          </div>
          <div className="text-center">
            <Link href="/members" className="btn-primary">
              Meet the Members
            </Link>
          </div>
        </div>
      </section>

      {/* Initiatives */}
      <section className="py-20 px-6" style={{ background: "var(--color-bg)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div className="text-center mb-12">
            <p
              className="text-2xl font-bold mb-2"
              style={{ color: "var(--color-accent)", fontFamily: "Noto Sans Tamil, sans-serif" }}
            >
              ஆஹா ஆற்புதங்கள்!
            </p>
            <h2 className="section-title mb-3">Our Chapter Initiatives</h2>
            <p className="text-base max-w-xl mx-auto" style={{ color: "var(--color-gray)" }}>
              Ten unique programs that make BNI Miracles one of Chennai&apos;s most active and innovative chapters.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {initiatives.map((init) => (
              <InitiativeCard key={init.slug} initiative={init} />
            ))}
          </div>
          <div className="text-center mt-10">
            <Link href="/initiatives" className="btn-outline">
              View All Initiatives
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-16 px-6 text-center" style={{ background: "var(--color-primary)" }}>
        <div style={{ maxWidth: 700, margin: "0 auto" }}>
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
            Ready to grow your business?
          </h2>
          <p className="text-white/80 text-lg mb-8">
            Attend a Thursday meeting and experience the BNI Miracles difference.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/attend-meeting" className="btn-secondary text-base">
              Book Your Seat
            </Link>
            <a
              href="https://wa.me/919841767641"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary text-base flex items-center gap-2"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              WhatsApp Us
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
