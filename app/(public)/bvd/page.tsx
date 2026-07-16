import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import BvdCountdown from "@/components/bvd/BvdCountdown";
import BvdRegisterForm from "@/components/bvd/BvdRegisterForm";
import BvdGallery from "@/components/bvd/BvdGallery";
import {
  BvdBulletList,
  BvdChairmenSection,
  BvdSection,
  BvdCard,
} from "@/components/bvd/BvdSections";
import { formatBvdEventDate } from "@/lib/bvd-format";
import { fetchBvdPublicPageData } from "@/lib/bvd-server";
import { createPageMetadata } from "@/lib/seo";
import { fetchLeadershipGroupsWithRoles, getRoleAssignee } from "@/lib/leadership-server";

export const metadata: Metadata = createPageMetadata({
  title: "Big Visitor Day (BVD) 2.0 — Reserve Your Seat",
  description:
    "Miracle Members' BVD 2.0 invites you to change the way you do business. Meet 37+ entrepreneurs under one roof. Date: 13 Aug. Venue texted after registration. Register, Participate, Grow!",
  path: "/bvd",
  keywords: [
    "Big Visitor Day Chennai",
    "BVD 2.0",
    "BVD BNI",
    "networking event Chennai",
    "Miracle Members",
  ],
  ogImage: "/api/og/bvd",
  ogImageAlt:
    "Miracle Members BVD 2.0 — Meet 37+ entrepreneurs on 13 Aug. Register, Participate, Grow!",
});

export const dynamic = "force-dynamic";

function LeadershipCard({ 
  roleName, 
  assignee 
}: { 
  roleName: string; 
  assignee: any 
}) {
  if (!assignee) return null;
  
  const initials = assignee.name.charAt(0);
  const cardContent = (
    <div className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-gray-100 hover:border-red-200 transition-all duration-300 shadow-sm hover:shadow-md h-full">
      <div className="shrink-0 relative">
        {assignee.profile_picture_url ? (
          <Image
            src={assignee.profile_picture_url}
            alt={assignee.name}
            width={64}
            height={64}
            className="rounded-full object-cover ring-2 ring-gray-100"
            style={{ width: 64, height: 64 }}
          />
        ) : (
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold text-white ring-2 ring-gray-100"
            style={{ background: "linear-gradient(135deg, var(--color-primary) 0%, #9e0c24 100%)" }}
          >
            {initials}
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <span className="inline-block text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-red-50 text-red-600 border border-red-100 mb-1">
          {roleName}
        </span>
        <h4 className="font-extrabold text-sm text-gray-900 truncate">
          {assignee.name}
        </h4>
        {assignee.category && (
          <p className="text-xs text-gray-500 truncate mt-0.5 font-medium">
            {assignee.category}
          </p>
        )}
        {assignee.business_name && (
          <p className="text-[11px] text-gray-400 truncate mt-0.5">
            {assignee.business_name}
          </p>
        )}
      </div>
    </div>
  );

  if (assignee.kind === "member" && assignee.slug) {
    return (
      <Link href={`/members/${assignee.slug}`} className="block no-underline">
        {cardContent}
      </Link>
    );
  }

  return cardContent;
}

export default async function BvdPage() {
  const [data, groups] = await Promise.all([
    fetchBvdPublicPageData(),
    fetchLeadershipGroupsWithRoles(),
  ]);

  const eventDate = data?.settings.event_date ?? "2026-08-13";
  const amount = Number(data?.settings.breakfast_amount ?? 500);
  const qrUrl = data?.settings.payment_qr_url ?? null;
  const lvhPhone = data?.lvhPhone ?? null;

  const headTableGroup = groups.find((g) => g.name === "Head Table");
  const regionalSupportGroup = groups.find((g) => g.name === "Regional Support Team");

  // Custom BNI order: President, Vice President, Secretary & Treasurer
  const headRoles = [...(headTableGroup?.leadership_roles ?? [])].sort((a, b) => {
    const order: Record<string, number> = {
      President: 1,
      "Vice President": 2,
      "Secretary & Treasurer": 3,
    };
    return (order[a.name] || 99) - (order[b.name] || 99);
  });

  return (
    <>
      {/* Hero Section */}
      <section
        className="relative px-6 text-center overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #09090e 0%, #150a1b 45%, #1A1A2E 100%)",
          paddingTop: 130,
          paddingBottom: 90,
        }}
      >
        {/* Decorative glowing orbs */}
        <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-red-600/10 blur-[90px] pointer-events-none" />
        <div className="absolute bottom-10 right-1/4 w-96 h-96 rounded-full bg-amber-500/5 blur-[100px] pointer-events-none" />
        
        {/* Subtle grid pattern overlay */}
        <div 
          className="absolute inset-0 opacity-[0.03] pointer-events-none" 
          style={{
            backgroundImage: "radial-gradient(rgba(255,255,255,0.15) 1px, transparent 0)",
            backgroundSize: "24px 24px",
          }}
        />

        <div className="relative z-10 max-w-4xl mx-auto">
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold mb-6 border backdrop-blur-md"
            style={{
              background: "rgba(200,16,46,0.12)",
              color: "#FCA5A5",
              borderColor: "rgba(248,113,113,0.25)",
            }}
          >
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
            Big Visitor Day · {formatBvdEventDate(eventDate)}
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white mb-6 leading-tight tracking-tight max-w-3xl mx-auto">
            One morning can <span className="bg-gradient-to-r from-red-500 to-amber-400 bg-clip-text text-transparent">change</span> how you do business.
          </h1>
          
          <p className="text-white/70 max-w-xl mx-auto text-sm sm:text-base md:text-lg leading-relaxed mb-8">
            Join entrepreneurs across Chennai for Miracle Members Big Visitor Day —
            structured networking, real conversations, and connections that open doors.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a 
              href="#register" 
              className="btn-primary text-base px-8 py-4 rounded-xl shadow-lg shadow-red-600/20 hover:shadow-red-600/35 hover:-translate-y-0.5 transition-all duration-150 font-bold"
            >
              Reserve my seat
            </a>
          </div>

          <BvdCountdown eventDate={eventDate} />
        </div>
      </section>

      {/* "What is BVD?" Section */}
      <BvdSection 
        eyebrow="Introduction" 
        title="What is Big Visitor Day (BVD)?"
        style={{ background: "var(--color-bg)" }}
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          <div className="lg:col-span-7 flex flex-col justify-center space-y-4">
            <p className="text-base sm:text-lg leading-relaxed font-bold text-slate-700">
              Big Visitor Day (BVD) is Miracle Members&apos; flagship open morning for business owners and professionals who want to experience structured referral networking.
            </p>
            <p className="text-sm sm:text-base leading-relaxed text-gray-500">
              In one session you&apos;ll meet chapter members, hear how referrals really move, and discover whether Miracle Members is the right growth room for your business.
            </p>
            <p className="text-sm sm:text-base leading-relaxed text-gray-500">
              Expect a warm welcome, clear presentations, and focused networking — not a sales pitch marathon. Come curious; leave with contacts and clarity.
            </p>
          </div>
          
          <div className="lg:col-span-5 grid grid-cols-1 gap-4">
            <div className="p-5 rounded-2xl bg-white border border-gray-100 shadow-sm flex items-start gap-4 hover:shadow-md transition-shadow duration-200">
              <div className="p-3 rounded-xl bg-red-50 text-red-600 shrink-0">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <div>
                <h4 className="font-extrabold text-slate-800 text-sm">Structured Networking</h4>
                <p className="text-xs text-gray-500 mt-1">A highly organized meeting flow designed to maximize connections.</p>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-gray-100 shadow-sm flex items-start gap-4 hover:shadow-md transition-shadow duration-200">
              <div className="p-3 rounded-xl bg-amber-50 text-amber-600 shrink-0">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                  <line x1="8" y1="21" x2="16" y2="21" />
                  <line x1="12" y1="17" x2="12" y2="21" />
                </svg>
              </div>
              <div>
                <h4 className="font-extrabold text-slate-800 text-sm">Real Referrals</h4>
                <p className="text-xs text-gray-500 mt-1">Learn how members exchange high-quality business leads daily.</p>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-gray-100 shadow-sm flex items-start gap-4 hover:shadow-md transition-shadow duration-200">
              <div className="p-3 rounded-xl bg-blue-50 text-blue-600 shrink-0">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              </div>
              <div>
                <h4 className="font-extrabold text-slate-800 text-sm">Chennai Business Leaders</h4>
                <p className="text-xs text-gray-500 mt-1">Connect with established entrepreneurs and decision-makers.</p>
              </div>
            </div>
          </div>
        </div>
      </BvdSection>

      {/* "Who should Attend?" Section */}
      <section className="py-16 px-6 bg-white border-y border-gray-100">
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <span
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4 border"
            style={{
              background: "rgba(245,166,35,0.06)",
              color: "var(--color-accent)",
              borderColor: "rgba(245,166,35,0.25)",
            }}
          >
            Audience
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold mb-8 tracking-tight" style={{ color: "var(--color-dark)" }}>
            Who should Attend this Event?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <BvdCard 
              title="Business Owners & Founders"
              description="Entrepreneurs and decision-makers in Chennai looking for warm business referrals and introductions."
              icon={
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              }
            />

            <BvdCard 
              title="Professionals Seeking Growth"
              description="Service professionals (CAs, lawyers, digital agencies) who want high-value trusted client introductions without cold calling."
              icon={
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              }
            />

            <BvdCard 
              title="Networking Enthusiasts"
              description="Professionals curious about how structured business networking operates and looking to join a high-performing chapter."
              icon={
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                  <polyline points="2 9 12 2 22 9" />
                </svg>
              }
            />

            <BvdCard 
              title="Invited Special Guests"
              description="Anyone invited by a current Miracle Members member who wants a first-hand look at our business network and culture."
              icon={
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
              }
            />
          </div>
        </div>
      </section>

      {/* "Benefits" Section */}
      <BvdSection 
        eyebrow="Benefits" 
        title="What you get from Attending"
        style={{ background: "var(--color-bg)" }}
      >
        <BvdBulletList
          items={[
            "Meet decision-makers and business owners across various industries in a single morning.",
            "See how structured referral networking works in practice, rather than theory.",
            "Build deep, lasting connections over networking breakfast session.",
            "Gain clarity on whether BNI and Miracle Members fits your growth goals.",
            "Leave the venue with actionable next steps and new, warm business contacts.",
          ]}
        />
      </BvdSection>

      {/* "Types of Entrepreneurs" Section */}
      <section className="py-16 px-6 bg-white border-b border-gray-100">
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <span
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4 border"
            style={{
              background: "rgba(37,99,235,0.06)",
              color: "#2563EB",
              borderColor: "rgba(37,99,235,0.15)",
            }}
          >
            Network
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4 tracking-tight" style={{ color: "var(--color-dark)" }}>
            Types of Entrepreneurs you will meet
          </h2>
          <p className="text-sm text-gray-500 mb-8 max-w-xl">
            We cover a broad ecosystem of businesses. Connect with founders, service providers, and craftspeople from various spheres.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {[
              {
                title: "Professional Services",
                desc: "Chartered Accountants, Corporate Lawyers, Business Consultants.",
                color: "rgba(59, 130, 246, 0.05)",
                borderColor: "rgba(59, 130, 246, 0.15)",
                textColor: "#1D4ED8",
                icon: "👔",
              },
              {
                title: "Home & Interiors",
                desc: "Interior Designers, Architects, Builders, Materials Suppliers.",
                color: "rgba(245, 158, 11, 0.05)",
                borderColor: "rgba(245, 158, 11, 0.15)",
                textColor: "#B45309",
                icon: "🏡",
              },
              {
                title: "Health & Lifestyle",
                desc: "Wellness Doctors, Fitness Specialists, Lifestyle Product Brands.",
                color: "rgba(16, 185, 129, 0.05)",
                borderColor: "rgba(16, 185, 129, 0.15)",
                textColor: "#047857",
                icon: "🍎",
              },
              {
                title: "Marketing & Digital",
                desc: "Software Developers, Digital Marketers, Video Producers.",
                color: "rgba(139, 92, 246, 0.05)",
                borderColor: "rgba(139, 92, 246, 0.15)",
                textColor: "#6D28D9",
                icon: "💻",
              },
              {
                title: "Finance & Real Estate",
                desc: "Investment Advisors, Wealth Managers, Property Developers.",
                color: "rgba(236, 72, 153, 0.05)",
                borderColor: "rgba(236, 72, 153, 0.15)",
                textColor: "#BE185D",
                icon: "📈",
              },
              {
                title: "Education & Coaching",
                desc: "Corporate Trainers, Skill Mentors, Educational Founders.",
                color: "rgba(20, 184, 166, 0.05)",
                borderColor: "rgba(20, 184, 166, 0.15)",
                textColor: "#0F766E",
                icon: "🎓",
              },
            ].map((t) => (
              <div
                key={t.title}
                className="group p-5 rounded-2xl border transition-all duration-300 hover:shadow-md hover:-translate-y-0.5"
                style={{ background: t.color, borderColor: t.borderColor }}
              >
                <div className="flex items-center gap-2.5 mb-2">
                  <span className="text-xl">{t.icon}</span>
                  <h4 className="font-extrabold text-slate-800 text-sm" style={{ color: t.textColor }}>{t.title}</h4>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed font-medium">
                  {t.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Leadership Section */}
      <BvdChairmenSection
        chairman={data?.chairman ?? null}
        coChairman={data?.coChairman ?? null}
      />

      {/* Head Table & Support Team Section */}
      <section className="py-20 px-6 bg-white border-y border-gray-100">
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Head Table Column */}
            <div className="flex flex-col space-y-6">
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-3 border border-red-100 bg-red-50 text-red-600">
                  Leadership
                </span>
                <h3 className="text-3xl font-black text-slate-800 tracking-tight mb-3">
                  The Head Table
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  Our chapter is guided by the Executive Committee who orchestrate the weekly meetings, coordinate member support, and manage chapter growth operations.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-1">
                {headRoles.map((role) => {
                  const assignee = getRoleAssignee(role);
                  return (
                    <LeadershipCard
                      key={role.id}
                      roleName={role.name}
                      assignee={assignee}
                    />
                  );
                })}
              </div>
            </div>

            {/* Regional Support Column */}
            <div className="flex flex-col space-y-6">
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-3 border border-blue-100 bg-blue-50 text-blue-600">
                  Regional Office
                </span>
                <h3 className="text-3xl font-black text-slate-800 tracking-tight mb-3">
                  Regional Support Team
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  Supported by BNI Regional leadership, providing training resources, chapter growth strategic planning, and structural network oversight.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-1">
                {regionalSupportGroup?.leadership_roles.map((role) => {
                  const assignee = getRoleAssignee(role);
                  return (
                    <LeadershipCard
                      key={role.id}
                      roleName={role.name}
                      assignee={assignee}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <BvdGallery />

      {/* Registration Section */}
      <section
        id="register"
        className="relative py-20 px-6 overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #1A1A2E 0%, #110d1c 60%, #09090e 100%)"
        }}
      >
        {/* Glow orbs */}
        <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-80 h-80 rounded-full bg-red-600/5 blur-[90px] pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 rounded-full bg-amber-500/5 blur-[90px] pointer-events-none" />

        <div className="relative z-10 max-w-2xl mx-auto">
          <div className="text-center mb-10">
            <span
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-3.5 border border-red-500/20 bg-red-500/10 text-red-300"
            >
              Secure Your Pass
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-3 tracking-tight">
              Ready to grow your network?
            </h2>
            <p className="text-sm text-white/50 max-w-sm mx-auto">
              Choose your ticket, complete your details, and reserve your seat. Location details will be shared on WhatsApp.
            </p>
          </div>
          
          <BvdRegisterForm
            breakfastAmount={amount}
            paymentQrUrl={qrUrl}
            lvhPhone={lvhPhone}
          />
        </div>
      </section>
    </>
  );
}
