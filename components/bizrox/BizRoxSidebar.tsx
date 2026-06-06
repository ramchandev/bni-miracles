import Image from "next/image";
import Link from "next/link";
import { fetchBizRoxSidebarAction, type SidebarMember } from "@/app/actions/bizrox";

function Avatar({ name, photo }: { name: string; photo: string | null }) {
  if (photo) return (
    <Image src={photo} alt={name} width={36} height={36}
      className="rounded-full object-cover shrink-0" style={{ width: 36, height: 36 }} />
  );
  return (
    <div className="flex items-center justify-center w-9 h-9 rounded-full shrink-0 text-white text-sm font-bold"
      style={{ background: "var(--color-primary)" }}>
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

function LeaderCard({
  title, emoji, color, bg, members, unit,
}: {
  title: string;
  emoji: string;
  color: string;
  bg: string;
  members: SidebarMember[];
  unit: string;
}) {
  if (members.length === 0) return null;
  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: "white", border: "1px solid #E5E7EB" }}>
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3" style={{ background: bg, borderBottom: `1px solid ${color}30` }}>
        <span className="text-lg">{emoji}</span>
        <p className="text-sm font-extrabold flex-1" style={{ color }}>{title}</p>
      </div>
      {/* Members */}
      <div className="p-3 flex flex-col gap-2">
        {members.map((m, i) => (
          <Link
            key={m.id}
            href={`/members/${m.slug}`}
            className="flex items-center gap-2.5 p-2 rounded-xl transition-colors hover:bg-gray-50"
          >
            {/* Rank */}
            <span
              className="shrink-0 w-5 h-5 flex items-center justify-center rounded-full text-xs font-extrabold"
              style={{ background: i === 0 ? "#FDE047" : "#F3F4F6", color: i === 0 ? "#92400E" : "#6B7280" }}
            >
              {i + 1}
            </span>
            <Avatar name={m.name} photo={m.profile_picture_url} />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold truncate" style={{ color: "var(--color-dark)" }}>
                {m.name}
              </p>
              <p className="text-xs" style={{ color }}>
                {m.count} {unit}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default async function BizRoxSidebar() {
  const data = await fetchBizRoxSidebarAction();

  const hasAnyData =
    data.topGivers.length + data.topPromos.length +
    data.topSeekers.length + data.topContributors.length > 0;

  return (
    <aside className="flex flex-col gap-4">
      {/* Sticky container */}
      <div className="sticky top-24 flex flex-col gap-4">
        {/* Header */}
        <div
          className="rounded-2xl px-4 py-3"
          style={{ background: "var(--color-dark)" }}
        >
          <p className="text-xs font-bold uppercase tracking-widest mb-0.5"
            style={{ color: "rgba(255,255,255,0.4)" }}>BizRox</p>
          <p className="text-base font-extrabold text-white">🏆 Leaderboard</p>
          <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.5)" }}>
            Most active this month
          </p>
        </div>

        {!hasAnyData ? (
          <div className="rounded-2xl p-5 text-center" style={{ background: "white", border: "1px solid #E5E7EB" }}>
            <p className="text-2xl mb-2">📭</p>
            <p className="text-xs" style={{ color: "var(--color-gray)" }}>
              No posts yet. Be the first to post!
            </p>
          </div>
        ) : (
          <>
            <LeaderCard
              title="Top Givers"
              emoji="✅"
              color="#16A34A"
              bg="#ECFDF5"
              members={data.topGivers}
              unit="gives"
            />
            <LeaderCard
              title="Top Promo Circulators"
              emoji="📣"
              color="#7C3AED"
              bg="#EDE9FE"
              members={data.topPromos}
              unit="promos"
            />
            <LeaderCard
              title="Top Seekers"
              emoji="🙏"
              color="#DC2626"
              bg="#FEF2F2"
              members={data.topSeekers}
              unit="asks"
            />
            <LeaderCard
              title="Top Contributors"
              emoji="💬"
              color="#2563EB"
              bg="#EFF6FF"
              members={data.topContributors}
              unit="comments"
            />
          </>
        )}

        {/* CTA */}
        <div className="rounded-2xl p-4 text-center"
          style={{ background: "linear-gradient(135deg,rgba(124,58,237,0.12),rgba(200,16,46,0.08))", border: "1px solid rgba(124,58,237,0.2)" }}>
          <p className="text-xs font-bold mb-1" style={{ color: "var(--color-dark)" }}>
            Want to appear here?
          </p>
          <p className="text-xs mb-3" style={{ color: "var(--color-gray)" }}>
            Log in and start posting your gives, asks, and promos.
          </p>
          <Link href="/bizrox" className="btn-primary text-xs px-4 py-2 inline-block">
            Post Now
          </Link>
        </div>
      </div>
    </aside>
  );
}
