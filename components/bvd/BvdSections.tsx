import Image from "next/image";
import Link from "next/link";
import type { BvdChairMember } from "@/lib/supabase";

export function BvdSection({
  eyebrow,
  title,
  children,
  className = "",
  style = {},
  containerStyle = {},
}: {
  eyebrow?: string;
  title: string;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  containerStyle?: React.CSSProperties;
}) {
  return (
    <section className={`py-16 px-6 ${className}`} style={{ background: "var(--color-bg)", ...style }}>
      <div style={{ maxWidth: 1000, margin: "0 auto", ...containerStyle }}>
        {eyebrow && (
          <span
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4 border"
            style={{
              background: "rgba(200,16,46,0.06)",
              color: "var(--color-primary)",
              borderColor: "rgba(200,16,46,0.15)",
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse"></span>
            {eyebrow}
          </span>
        )}
        <h2 className="text-3xl md:text-4xl font-extrabold mb-8 tracking-tight" style={{ color: "var(--color-dark)" }}>
          {title}
        </h2>
        {children}
      </div>
    </section>
  );
}

export function BvdBulletList({ items }: { items: string[] }) {
  return (
    <ul className="grid gap-3 sm:grid-cols-1 md:grid-cols-2">
      {items.map((item) => (
        <li
          key={item}
          className="flex items-start gap-3.5 p-4 rounded-xl bg-white border border-gray-100 hover:border-red-100 hover:shadow-sm transition-all duration-200 text-sm leading-relaxed"
          style={{ color: "var(--color-dark)" }}
        >
          <div className="shrink-0 w-6 h-6 rounded-full bg-red-50 border border-red-100 flex items-center justify-center mt-0.5">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--color-primary)"
              strokeWidth="3"
            >
              <path d="M20 6L9 17l-5-5" />
            </svg>
          </div>
          <span className="text-gray-700 font-medium">{item}</span>
        </li>
      ))}
    </ul>
  );
}

export function BvdCard({
  title,
  description,
  icon,
  className = "",
  style = {},
}: {
  title: string;
  description: string;
  icon?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={`p-6 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 ${className}`}
      style={style}
    >
      {icon && (
        <div 
          className="mb-4 w-12 h-12 rounded-xl flex items-center justify-center border"
          style={{
            background: "rgba(200,16,46,0.05)",
            borderColor: "rgba(200,16,46,0.1)",
            color: "var(--color-primary)"
          }}
        >
          {icon}
        </div>
      )}
      <h3 className="text-lg font-bold mb-2 text-slate-800">{title}</h3>
      <p className="text-sm text-slate-500 leading-relaxed">{description}</p>
    </div>
  );
}

function ChairCard({ member, role }: { member: BvdChairMember; role: string }) {
  const initials = member.name.charAt(0);
  return (
    <Link
      href={`/members/${member.slug}`}
      className="group flex items-center gap-5 p-5 rounded-2xl bg-white border border-gray-100 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-red-200"
    >
      <div className="relative shrink-0">
        {/* Soft decorative glow ring */}
        <div className="absolute inset-0 -m-1 rounded-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 blur-sm" />
        
        {member.profile_picture_url ? (
          <Image
            src={member.profile_picture_url}
            alt={member.name}
            width={76}
            height={76}
            className="rounded-full object-cover ring-2 ring-gray-100 group-hover:ring-transparent transition-all duration-300"
            style={{ width: 76, height: 76 }}
          />
        ) : (
          <div
            className="w-[76px] h-[76px] rounded-full flex items-center justify-center text-2xl font-bold text-white ring-2 ring-gray-100 group-hover:ring-transparent transition-all duration-300"
            style={{ background: "linear-gradient(135deg, var(--color-primary) 0%, #9e0c24 100%)" }}
          >
            {initials}
          </div>
        )}
      </div>
      
      <div className="min-w-0 flex-1">
        <span 
          className="inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-red-50 text-red-600 border border-red-100 mb-1"
        >
          {role}
        </span>
        <p className="font-extrabold text-base text-gray-900 group-hover:text-[var(--color-primary)] transition-colors duration-200 truncate">
          {member.name}
        </p>
        <p className="text-sm font-semibold text-gray-500 truncate mt-0.5">
          {member.business_name || "Business Expert"}
        </p>
        <p className="text-xs text-gray-400 truncate mt-0.5">
          {member.category}
        </p>
      </div>

      {/* Decorative indicator icon */}
      <div className="shrink-0 w-8 h-8 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 group-hover:bg-red-50 group-hover:border-red-100 group-hover:text-[var(--color-primary)] transition-all duration-300">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </div>
    </Link>
  );
}

export function BvdChairmenSection({
  chairman,
  coChairman,
}: {
  chairman: BvdChairMember | null;
  coChairman: BvdChairMember | null;
}) {
  if (!chairman && !coChairman) {
    return (
      <BvdSection title="Meet the BVD Chairmen">
        <p className="text-sm text-gray-500">
          Chairman details will be announced soon.
        </p>
      </BvdSection>
    );
  }

  return (
    <BvdSection eyebrow="Leadership" title="Meet the BVD Chairmen">
      <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-6">
        {chairman && <ChairCard member={chairman} role="BVD Chairman" />}
        {coChairman && <ChairCard member={coChairman} role="BVD Co-Chairman" />}
      </div>
    </BvdSection>
  );
}
