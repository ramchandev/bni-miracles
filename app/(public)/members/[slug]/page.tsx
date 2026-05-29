import type { Metadata } from "next";
import { supabase, type Member, type GiveAsk } from "@/lib/supabase";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import JsonLd from "@/components/JsonLd";
import MemberLeadershipRoles from "@/components/members/MemberLeadershipRoles";
import { fetchMemberLeadershipRoles } from "@/lib/leadership-server";
import { breadcrumbJsonLd, createPageMetadata, personJsonLd } from "@/lib/seo";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { data: member } = await supabase
    .from("members")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!member) {
    return createPageMetadata({
      title: "Member Not Found",
      description: "This member profile could not be found on BNI Miracles Chennai.",
      path: `/members/${slug}`,
      noIndex: true,
    });
  }

  const description =
    member.services?.trim() ||
    `${member.name} is a ${member.category} professional at ${member.business_name}, member of BNI Miracles — Chennai's hybrid BNI chapter.`;

  return createPageMetadata({
    title: `${member.name} — ${member.business_name}`,
    description: description.slice(0, 160),
    path: `/members/${slug}`,
    keywords: [member.name, member.business_name, member.category, "BNI Miracles member"],
    ogImage: member.profile_picture_url ?? undefined,
    ogType: "profile",
  });
}

export const dynamicParams = true;

export async function generateStaticParams() {
  try {
    const { data } = await supabase.from("members").select("slug").eq("is_active", true);
    return (data || []).map((m: { slug: string }) => ({ slug: m.slug }));
  } catch {
    return [];
  }
}

function Initials({ name }: { name: string }) {
  const parts = name.trim().split(" ");
  const initials = parts.length >= 2 ? `${parts[0][0]}${parts[parts.length - 1][0]}` : parts[0].slice(0, 2);
  return (
    <div
      className="flex items-center justify-center w-40 h-40 rounded-full text-white text-5xl font-bold mx-auto"
      style={{ background: "var(--color-primary)" }}
    >
      {initials.toUpperCase()}
    </div>
  );
}

function whatsappHref(phone: string) {
  const digits = phone.replace(/\D/g, "");
  return `https://wa.me/${digits}`;
}

export default async function MemberDetailPage({ params }: Props) {
  const { slug } = await params;

  const { data: member } = await supabase
    .from("members")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .single<Member>();

  if (!member) notFound();

  const [{ data: givesAsksData }, leadershipRoles] = await Promise.all([
    supabase.from("member_gives_asks").select("*").eq("member_id", member.id).order("sort_order"),
    fetchMemberLeadershipRoles(member.id),
  ]);

  const allItems = (givesAsksData as GiveAsk[] | null) ?? [];
  const gives = allItems.filter((r) => r.type === "give");
  const asks = allItems.filter((r) => r.type === "ask");
  const hasGivesAsks = gives.length > 0 || asks.length > 0;

  return (
    <>
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Members", path: "/members" },
            { name: member.name, path: `/members/${member.slug}` },
          ]),
          personJsonLd(member),
        ]}
      />
      {/* Breadcrumb */}
      <div className="pt-24 pb-4 px-6" style={{ background: "var(--color-dark)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <nav className="flex items-center gap-2 text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <span>/</span>
            <Link href="/members" className="hover:text-white transition-colors">Members</Link>
            <span>/</span>
            <span style={{ color: "white" }}>{member.name}</span>
          </nav>
        </div>
      </div>

      {/* Profile Header */}
      <section className="py-16 px-6" style={{ background: "var(--color-dark)" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }} className="text-center">
          {member.profile_picture_url ? (
            <Image
              src={member.profile_picture_url}
              alt={`${member.name} profile picture`}
              width={160}
              height={160}
              className="rounded-full mx-auto mb-6 object-cover"
              style={{ width: 160, height: 160 }}
            />
          ) : (
            <div className="mb-6"><Initials name={member.name} /></div>
          )}

          <span
            className="inline-block px-4 py-1.5 rounded-full text-sm font-semibold mb-4"
            style={{ background: "rgba(200,16,46,0.15)", color: "#FF6B8A" }}
          >
            {member.category}
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-2">{member.name}</h1>
          <p className="text-xl font-semibold mb-3" style={{ color: "var(--color-accent)" }}>
            {member.business_name}
          </p>

          {/* Location */}
          {member.business_location && (
            <p className="flex items-center justify-center gap-1.5 text-sm mb-2" style={{ color: "rgba(255,255,255,0.6)" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
              </svg>
              {member.business_location}
            </p>
          )}

          {/* Phone */}
          {member.phone && (
            <p className="flex items-center justify-center gap-1.5 text-sm mb-2" style={{ color: "rgba(255,255,255,0.6)" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.67A2 2 0 012 .18h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92v2z" />
              </svg>
              {member.phone}
            </p>
          )}

          {/* Email */}
          {member.email && (
            <p className="flex items-center justify-center gap-1.5 text-sm mb-2" style={{ color: "rgba(255,255,255,0.6)" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
              <a
                href={`mailto:${member.email}`}
                className="hover:underline"
                style={{ color: "inherit" }}
              >
                {member.email}
              </a>
            </p>
          )}

          {/* Website */}
          {member.website && (
            <a
              href={member.website.startsWith("http") ? member.website : `https://${member.website}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium underline block mb-4"
              style={{ color: "var(--color-accent)" }}
            >
              {member.website}
            </a>
          )}

          {/* CTA Buttons */}
          <div className="flex flex-wrap gap-3 justify-center mt-8">
            {member.email && (
              <a
                href={`mailto:${member.email}`}
                className="btn-outline flex items-center gap-2"
                style={{ borderColor: "rgba(255,255,255,0.4)", color: "white" }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                Email
              </a>
            )}
            {member.phone ? (
              <a
                href={whatsappHref(member.phone)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary flex items-center gap-2"
                style={{ background: "#25D366" }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                Chat on WhatsApp
              </a>
            ) : (
              <a
                href="https://wa.me/919841767641"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary flex items-center gap-2"
                style={{ background: "#25D366" }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                Chat on WhatsApp
              </a>
            )}
          </div>
        </div>
      </section>

      {/* Details */}
      <section className="py-16 px-6" style={{ background: "var(--color-bg)" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }} className="flex flex-col gap-10">

          <MemberLeadershipRoles roles={leadershipRoles} />

          {/* Gives & Asks */}
          {hasGivesAsks && (
            <div className="grid md:grid-cols-2 gap-6">
              {/* Gives */}
              <div
                className="rounded-2xl p-6"
                style={{ border: "1.5px solid #16A34A33", background: "#16A34A08" }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
                    style={{ background: "#16A34A" }}
                  >
                    G
                  </div>
                  <div>
                    <h2 className="font-bold text-base" style={{ color: "var(--color-dark)" }}>Gives</h2>
                    <p className="text-xs" style={{ color: "var(--color-gray)" }}>What I can refer to others</p>
                  </div>
                </div>
                {gives.length > 0 ? (
                  <ul className="flex flex-col gap-2">
                    {gives.map((g) => (
                      <li key={g.id} className="flex items-start gap-2 text-sm" style={{ color: "var(--color-dark)" }}>
                        <span className="mt-1 w-4 h-4 rounded-full flex items-center justify-center shrink-0 text-white text-xs" style={{ background: "#16A34A" }}>✓</span>
                        {g.item}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm" style={{ color: "var(--color-gray)" }}>Nothing listed yet.</p>
                )}
              </div>

              {/* Asks */}
              <div
                className="rounded-2xl p-6"
                style={{ border: "1.5px solid #C8102E33", background: "#C8102E08" }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
                    style={{ background: "var(--color-primary)" }}
                  >
                    A
                  </div>
                  <div>
                    <h2 className="font-bold text-base" style={{ color: "var(--color-dark)" }}>Asks</h2>
                    <p className="text-xs" style={{ color: "var(--color-gray)" }}>Referrals I&apos;m looking for</p>
                  </div>
                </div>
                {asks.length > 0 ? (
                  <ul className="flex flex-col gap-2">
                    {asks.map((a) => (
                      <li key={a.id} className="flex items-start gap-2 text-sm" style={{ color: "var(--color-dark)" }}>
                        <span className="mt-1 w-4 h-4 rounded-full flex items-center justify-center shrink-0 text-white text-xs" style={{ background: "var(--color-primary)" }}>→</span>
                        {a.item}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm" style={{ color: "var(--color-gray)" }}>Nothing listed yet.</p>
                )}
              </div>
            </div>
          )}

          {member.services && (
            <div className="card p-8">
              <h2 className="text-xl font-bold mb-4" style={{ color: "var(--color-dark)" }}>
                Services &amp; Products
              </h2>
              <p className="text-base" style={{ color: "var(--color-gray)", lineHeight: 1.85, whiteSpace: "pre-wrap" }}>
                {member.services}
              </p>
            </div>
          )}
          {member.why_choose_us && (
            <div className="card p-8">
              <h2 className="text-xl font-bold mb-4" style={{ color: "var(--color-dark)" }}>
                Why Choose Us
              </h2>
              <p className="text-base" style={{ color: "var(--color-gray)", lineHeight: 1.85, whiteSpace: "pre-wrap" }}>
                {member.why_choose_us}
              </p>
            </div>
          )}
          {member.success_stories && (
            <div className="card p-8">
              <h2 className="text-xl font-bold mb-4" style={{ color: "var(--color-dark)" }}>
                Success Stories
              </h2>
              <p className="text-base" style={{ color: "var(--color-gray)", lineHeight: 1.85, whiteSpace: "pre-wrap" }}>
                {member.success_stories}
              </p>
            </div>
          )}
        </div>
        <div style={{ maxWidth: 900, margin: "2rem auto 0" }}>
          <Link href="/members" className="flex items-center gap-2 text-sm font-semibold" style={{ color: "var(--color-primary)" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
            Back to Members
          </Link>
        </div>
      </section>
    </>
  );
}
