import Image from "next/image";
import Link from "next/link";
import ChapterLeadershipSection from "@/components/about/ChapterLeadershipSection";
import JsonLd from "@/components/JsonLd";
import { breadcrumbJsonLd, createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "About Us",
  description:
    "Learn about BNI Miracles, Chennai's hybrid BNI chapter. Discover our story, hybrid Thursday meetings, and why we're one of Tamil Nadu's most dynamic business networks.",
  path: "/about",
  keywords: ["about BNI Miracles", "BNI chapter Chennai", "hybrid BNI meeting"],
});

export default function AboutPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "About", path: "/about" },
        ])}
      />
      {/* Hero */}
      <section className="relative flex items-center justify-center py-32 px-6" style={{ background: "var(--color-dark)", paddingTop: 120 }}>
        <div className="absolute inset-0 opacity-20">
          <Image
            src="/About-Banner.JPG"
            alt="BNI Miracles chapter"
            fill
            style={{ objectFit: "cover" }}
          />
        </div>
        <div className="relative z-10 text-center" style={{ maxWidth: 700 }}>
          <p className="text-sm font-semibold tracking-widest uppercase mb-3" style={{ color: "var(--color-accent)" }}>
            Our Story
          </p>
          <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-4">About BNI Miracles</h1>
          <p className="text-lg text-white/70">
            Chennai&apos;s hybrid business networking chapter — where real business relationships are built.
          </p>
        </div>
      </section>

      {/* What is BNI */}
      <section className="py-20 px-6" style={{ background: "var(--color-bg)" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <h2 className="section-title mb-6">What is BNI?</h2>
          <p className="text-base mb-4" style={{ color: "var(--color-gray)", lineHeight: 1.85 }}>
            Business Network International (BNI) is the world&apos;s largest referral networking organisation, founded in 1985 by Dr. Ivan Misner. Today, BNI operates in 76 countries with over 11,728 chapters and 355,000+ members who pass millions of referrals to each other every year.
          </p>
          <p className="text-base mb-4" style={{ color: "var(--color-gray)", lineHeight: 1.85 }}>
            BNI&apos;s philosophy is simple and powerful: <strong>Givers Gain®</strong>. The more you give to others — in the form of referrals, support, and knowledge — the more you receive in return. This creates a culture of proactive, structured giving that translates directly into business growth.
          </p>
          <p className="text-base" style={{ color: "var(--color-gray)", lineHeight: 1.85 }}>
            Unlike casual networking events, BNI is a structured, weekly meeting where members make a commitment to each other. Each chapter allows only one member per business category, ensuring you&apos;re the exclusive representative of your profession in the room.
          </p>
        </div>
      </section>

      {/* About the Chapter */}
      <section className="py-20 px-6" style={{ background: "white" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }} className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <Image
              src="/About-BNI-Miracles.JPG"
              alt="BNI Miracles chapter meeting"
              width={600}
              height={440}
              className="rounded-2xl"
              style={{ objectFit: "cover", width: "100%", height: 440 }}
            />
          </div>
          <div>
            <p className="text-sm font-semibold tracking-widest uppercase mb-3" style={{ color: "var(--color-primary)" }}>
              Our Chapter
            </p>
            <h2 className="section-title mb-6">About BNI Miracles</h2>
            <p className="text-base mb-4" style={{ color: "var(--color-gray)", lineHeight: 1.85 }}>
              BNI Miracles is a chapter in Chennai, Tamil Nadu — part of BNI India&apos;s growing network of 1,498 chapters across 143 cities. Our chapter brings together 35+ professionals from diverse industries who meet every Thursday to pass referrals, share knowledge, and build genuine business partnerships.
            </p>
            <p className="text-base mb-4" style={{ color: "var(--color-gray)", lineHeight: 1.85 }}>
              The name &apos;Miracles&apos; reflects our belief: that when dedicated business professionals come together with a spirit of giving, remarkable things happen. Our Tamil tagline <span style={{ fontFamily: "Noto Sans Tamil, sans-serif", color: "var(--color-primary)" }}>ஆஹா ஆற்புதங்கள்!</span> — meaning &quot;Ahh, Miracles!&quot; — captures that spirit of wonder and achievement.
            </p>
            <p className="text-base" style={{ color: "var(--color-gray)", lineHeight: 1.85 }}>
              Our members have generated crores in business for each other through structured referral passing, and our innovative initiatives keep the chapter fresh, active, and deeply connected.
            </p>
          </div>
        </div>
      </section>

      {/* Hybrid Meeting Format */}
      <section className="py-20 px-6" style={{ background: "var(--color-bg)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div className="text-center mb-12">
            <p className="text-sm font-semibold tracking-widest uppercase mb-3" style={{ color: "var(--color-primary)" }}>
              Meeting Format
            </p>
            <h2 className="section-title mb-3">Why Hybrid?</h2>
            <p className="text-base max-w-xl mx-auto" style={{ color: "var(--color-gray)" }}>
              We&apos;re one of Chennai&apos;s hybrid chapters — members can attend physically or join online, every week.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: "🏢",
                title: "In-Person Energy",
                desc: "Physical attendees experience the full energy of a BNI meeting — face-to-face connections, handshakes, and the buzz of a room full of motivated entrepreneurs.",
              },
              {
                icon: "💻",
                title: "Online Flexibility",
                desc: "Can't make it to the venue? Join via Zoom. Every element of the meeting — 60-second infomercials, referral passing, presentations — runs seamlessly online.",
              },
              {
                icon: "🔗",
                title: "Fully Integrated",
                desc: "Physical and online members are equal participants. Referrals flow between them, 1-2-1 meetings happen across both formats, and the community is truly one chapter.",
              },
            ].map((item) => (
              <div key={item.title} className="card p-8 text-center">
                <div className="text-5xl mb-4">{item.icon}</div>
                <h3 className="text-lg font-bold mb-3" style={{ color: "var(--color-dark)" }}>{item.title}</h3>
                <p className="text-sm" style={{ color: "var(--color-gray)", lineHeight: 1.7 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Typical Meeting */}
      <section className="py-20 px-6" style={{ background: "white" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <h2 className="section-title mb-8 text-center">A Typical Thursday Meeting</h2>
          <div className="flex flex-col gap-4">
            {[
              { time: "7:30 AM", activity: "Networking & Open Networking", desc: "Members mingle, catch up, and build connections before the formal meeting begins." },
              { time: "8:00 AM", activity: "Formal Meeting Opens", desc: "Chapter President opens the meeting, welcomes visitors, and sets the agenda." },
              { time: "8:40 AM", activity: "30-Second Infomercials", desc: "Every member has 30 seconds to present their business and ask for a specific referral." },
              { time: "9:00 AM", activity: "Featured Presentation", desc: "Two members get 8 minutes each to deep-dive into their business." },
              { time: "9:16 AM", activity: "Referral & Testimony Round", desc: "Members pass referrals, share testimonials, and announce closed business (TYFCB)." },
              { time: "9:30 AM", activity: "Training & Announcements", desc: "A short training session followed by chapter announcements." },
              { time: "9:40 AM", activity: "Networking Continues", desc: "Post-meeting networking where the real connections deepen." },
            ].map((step, i) => (
              <div key={i} className="flex gap-4 items-start p-5 rounded-xl" style={{ background: i % 2 === 0 ? "var(--color-bg)" : "white", border: "1px solid #F3F4F6" }}>
                <div className="flex-shrink-0 w-20 text-sm font-bold" style={{ color: "var(--color-primary)" }}>{step.time}</div>
                <div>
                  <div className="font-semibold mb-1" style={{ color: "var(--color-dark)" }}>{step.activity}</div>
                  <div className="text-sm" style={{ color: "var(--color-gray)" }}>{step.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <ChapterLeadershipSection />

      {/* CTA */}
      <section className="py-16 px-6 text-center" style={{ background: "var(--color-primary)" }}>
        <h2 className="text-3xl font-extrabold text-white mb-4">Ready to Join the Miracles?</h2>
        <p className="text-white/80 text-lg mb-8 max-w-xl mx-auto">
          Visit us as a guest — no commitment. Just come and experience what BNI Miracles is all about.
        </p>
        <Link href="/attend-meeting" className="btn-secondary text-base">
          Book Your Free Visit
        </Link>
      </section>
    </>
  );
}
