import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export const metadata: Metadata = { title: "Gives & Asks Intelligence — BNI Miracles Admin" };

/* ══════════════════════════════════════════════════════════════════════════
   SIMILARITY ENGINE
   ══════════════════════════════════════════════════════════════════════════ */

const STOP_WORDS = new Set([
  "a","an","and","are","as","at","be","been","by","can","do","for","from",
  "get","give","have","i","in","is","it","its","me","my","need","new","not",
  "of","on","or","our","please","that","the","their","they","this","to","us",
  "was","we","who","with","you","your","any","all","help","looking","want",
  "like","also","just","more","other","own","some","such","than","then","they",
  "too","very","via","well","yet",
]);

// Domain semantic clusters — words in the same cluster boost match score
const CLUSTERS: string[][] = [
  // Real estate / construction / home
  ["home","house","residential","apartment","flat","villa","property","real estate",
   "construction","renovation","interior","building","architect","plot","realty",
   "cctv","solar","furniture","decor","birds","water"],
  // Marketing / branding / creative
  ["marketing","brand","advertising","digital","social","seo","content","campaign",
   "promotion","website","online","photography","video","print","design","graphic",
   "art","artist","photo","film","media","audio","av","event","makeup","artist"],
  // Finance / accounting / legal / hr
  ["finance","financial","loan","insurance","wealth","investment","tax","gst",
   "accounting","cfo","audit","legal","lawyer","advocate","compliance","hr",
   "payroll","salary","fund","money","bank","credit","mutual","business","consultant"],
  // Health / wellness / food
  ["health","dental","wellness","fitness","medical","pharma","nutrition","food",
   "organic","agri","rice","dhall","millets","pharmacy","drug","supplement"],
  // Technology / IT / software
  ["software","technology","it","tech","computer","programming","app","web",
   "network","server","cloud","erp","crm","training","python","fullstack","mobile"],
  // Trade / manufacturing / logistics
  ["export","import","textile","tshirt","logistics","shipping","transport",
   "manufacturing","supply chain","freight","cargo","cha","customs","warehouse",
   "goods","product"],
  // Travel / personal services / pets
  ["travel","tourism","hotel","pet","grooming","vet","wedding","catering","tour"],
];

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length >= 3 && !STOP_WORDS.has(w));
}

function jaccardSim(a: string, b: string): number {
  const tA = new Set(tokenize(a));
  const tB = new Set(tokenize(b));
  if (tA.size === 0 && tB.size === 0) return 0;
  const intersection = [...tA].filter((x) => tB.has(x)).length;
  const union = new Set([...tA, ...tB]).size;
  return union === 0 ? 0 : intersection / union;
}

function semanticCluster(text: string): number {
  const toks = tokenize(text);
  let best = -1;
  let bestScore = 0;
  CLUSTERS.forEach((cluster, ci) => {
    const score = toks.filter((t) =>
      cluster.some((kw) => kw.includes(t) || t.includes(kw))
    ).length;
    if (score > bestScore) { bestScore = score; best = ci; }
  });
  return best;
}

function combinedSim(a: string, b: string): number {
  const j = jaccardSim(a, b);
  const clusterBoost =
    semanticCluster(a) !== -1 && semanticCluster(a) === semanticCluster(b)
      ? 0.28
      : 0;
  return Math.min(1, j + clusterBoost * (1 - j));
}

/* ── Greedy clustering ─────────────────────────────────────────────────── */

type GiveAskRow = {
  member_id: string;
  member_name: string;
  member_slug: string;
  member_category: string;
  member_photo: string | null;
  type: "give" | "ask";
  item: string;
};

type Cluster = { label: string; items: GiveAskRow[] };

function clusterItems(items: GiveAskRow[], threshold = 0.14): Cluster[] {
  const used = new Set<number>();
  const groups: Cluster[] = [];

  for (let i = 0; i < items.length; i++) {
    if (used.has(i)) continue;
    const group: GiveAskRow[] = [items[i]];
    used.add(i);

    for (let j = i + 1; j < items.length; j++) {
      if (used.has(j)) continue;
      if (combinedSim(items[i].item, items[j].item) >= threshold) {
        group.push(items[j]);
        used.add(j);
      }
    }

    // Derive group label from most common tokens across all group items
    const freq = new Map<string, number>();
    group.forEach((g) =>
      tokenize(g.item).forEach((t) => freq.set(t, (freq.get(t) ?? 0) + 1))
    );
    const topTokens = [...freq.entries()]
      .filter(([, c]) => c > 1 || group.length === 1)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([t]) => t);

    const label = topTokens.length
      ? topTokens.map((t) => t.charAt(0).toUpperCase() + t.slice(1)).join(", ")
      : tokenize(items[i].item).slice(0, 2).join(" / ") || items[i].item;

    groups.push({ label, items: group });
  }

  return groups.sort((a, b) => b.items.length - a.items.length);
}

/* ── Cross-match: give ↔ ask from different members ──────────────────── */

type Match = { score: number; give: GiveAskRow; ask: GiveAskRow };

function findMatches(gives: GiveAskRow[], asks: GiveAskRow[], threshold = 0.13): Match[] {
  const pairs: Match[] = [];
  for (const give of gives) {
    for (const ask of asks) {
      if (give.member_id === ask.member_id) continue;
      const score = combinedSim(give.item, ask.item);
      if (score >= threshold) pairs.push({ score, give, ask });
    }
  }
  // Deduplicate: keep highest score per (give.item, ask.item) pair
  const seen = new Map<string, Match>();
  pairs.sort((a, b) => b.score - a.score).forEach((m) => {
    const key = `${m.give.member_id}:${m.give.item}|${m.ask.member_id}:${m.ask.item}`;
    if (!seen.has(key)) seen.set(key, m);
  });
  return [...seen.values()].slice(0, 40);
}

/* ══════════════════════════════════════════════════════════════════════════
   HELPERS / UI ATOMS
   ══════════════════════════════════════════════════════════════════════════ */

function scoreLabel(s: number): { label: string; bg: string; color: string } {
  if (s >= 0.55) return { label: "Strong", bg: "#DCFCE7", color: "#166534" };
  if (s >= 0.35) return { label: "Good",   bg: "#FEF9C3", color: "#854D0E" };
  return               { label: "Possible",bg: "#EFF6FF", color: "#1E40AF" };
}

function Avatar({ name, photo, size = 36 }: { name: string; photo: string | null; size?: number }) {
  if (photo) {
    return (
      <Image src={photo} alt={name} width={size} height={size}
        className="rounded-full object-cover shrink-0"
        style={{ width: size, height: size }} />
    );
  }
  return (
    <div className="flex items-center justify-center rounded-full shrink-0 text-white font-bold"
      style={{ width: size, height: size, background: "var(--color-primary)", fontSize: size * 0.35 }}>
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

function MemberChip({ row, side }: { row: GiveAskRow; side: "give" | "ask" }) {
  const color = side === "give" ? "#16A34A" : "#DC2626";
  return (
    <div className="flex items-start gap-3 p-3 rounded-xl flex-1 min-w-0"
      style={{ background: color + "0C", border: `1px solid ${color}25` }}>
      <Avatar name={row.member_name} photo={row.member_photo} size={36} />
      <div className="min-w-0">
        <p className="text-xs font-bold truncate" style={{ color: "var(--color-dark)" }}>
          {row.member_name}
        </p>
        <p className="text-xs truncate" style={{ color }}>
          {row.member_category}
        </p>
        <p className="text-xs mt-1 leading-relaxed line-clamp-2"
          style={{ color: "var(--color-gray)" }}>
          {side === "give" ? "✅" : "🙏"} {row.item}
        </p>
      </div>
      <Link href={`/members/${row.member_slug}`}
        className="shrink-0 text-xs px-2 py-1 rounded font-semibold"
        style={{ background: color + "20", color }}>
        →
      </Link>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   PAGE
   ══════════════════════════════════════════════════════════════════════════ */

export default async function AdminGivesAsksPage() {
  const supabase = await createSupabaseServerClient();

  // Fetch all members (for photo + name lookups)
  const { data: members } = await supabase
    .from("members")
    .select("id, name, slug, category, profile_picture_url")
    .eq("is_active", true);

  // Fetch all gives & asks
  const { data: gaRows } = await supabase
    .from("member_gives_asks")
    .select("member_id, type, item")
    .order("sort_order");

  const memberMap = new Map(
    (members ?? []).map((m) => [m.id, m])
  );

  const allRows: GiveAskRow[] = (gaRows ?? [])
    .filter((r) => memberMap.has(r.member_id))
    .map((r) => {
      const m = memberMap.get(r.member_id)!;
      return {
        member_id:       m.id,
        member_name:     m.name,
        member_slug:     m.slug,
        member_category: m.category,
        member_photo:    m.profile_picture_url,
        type:            r.type as "give" | "ask",
        item:            r.item as string,
      };
    });

  const gives = allRows.filter((r) => r.type === "give");
  const asks  = allRows.filter((r) => r.type === "ask");

  // Run intelligence
  const matches     = findMatches(gives, asks);
  const giveClusters = clusterItems(gives);
  const askClusters  = clusterItems(asks);

  // Stats
  const membersWithGives = new Set(gives.map((g) => g.member_id)).size;
  const membersWithAsks  = new Set(asks.map((a) => a.member_id)).size;
  const totalMembers     = members?.length ?? 0;
  const strongMatches    = matches.filter((m) => m.score >= 0.55).length;

  return (
    <div className="p-8">
      {/* ── Page header ──────────────────────────────────────────────── */}
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold mb-1" style={{ color: "var(--color-dark)" }}>
          🤝 Gives &amp; Asks Intelligence
        </h1>
        <p className="text-sm" style={{ color: "var(--color-gray)" }}>
          AI-powered matching of what members can give with what others are asking for.
        </p>
      </div>

      {/* ── Summary stats ────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-10">
        {[
          { label: "Total Gives",      value: gives.length,         color: "#16A34A", bg: "#DCFCE7" },
          { label: "Total Asks",       value: asks.length,          color: "#DC2626", bg: "#FEE2E2" },
          { label: "Referral Pairs",   value: matches.length,       color: "#7C3AED", bg: "#EDE9FE" },
          { label: "Strong Matches",   value: strongMatches,        color: "#D97706", bg: "#FEF9C3" },
          { label: "No Gives/Asks",    value: totalMembers - Math.max(membersWithGives, membersWithAsks),
                                                                    color: "#6B7280", bg: "#F3F4F6" },
        ].map(({ label, value, color, bg }) => (
          <div key={label} className="rounded-xl p-4 text-center"
            style={{ background: bg, border: `1px solid ${color}30` }}>
            <p className="text-2xl font-extrabold" style={{ color }}>{value}</p>
            <p className="text-xs font-semibold mt-0.5" style={{ color }}>{label}</p>
          </div>
        ))}
      </div>

      {/* Quick-nav */}
      <div className="flex flex-wrap gap-2 mb-8">
        {[
          { href: "#matches",    label: "🎯 Referral Pairs" },
          { href: "#gives",      label: "✅ Gives Clusters" },
          { href: "#asks",       label: "🙏 Asks Clusters" },
          { href: "#all-gives",  label: "📋 All Gives" },
          { href: "#all-asks",   label: "📋 All Asks" },
        ].map(({ href, label }) => (
          <a key={href} href={href}
            className="text-xs font-semibold px-3 py-1.5 rounded-full transition-opacity hover:opacity-80"
            style={{ background: "#F3F4F6", color: "var(--color-gray)", border: "1px solid #E5E7EB" }}>
            {label}
          </a>
        ))}
      </div>

      {/* ══ SECTION 1: Potential Referral Pairs ══════════════════════════ */}
      <section id="matches" className="mb-14">
        <div className="flex items-center gap-3 mb-5">
          <h2 className="text-lg font-extrabold" style={{ color: "var(--color-dark)" }}>
            🎯 Potential Referral Pairs
          </h2>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
            style={{ background: "#EDE9FE", color: "#7C3AED" }}>
            {matches.length} pairs
          </span>
        </div>
        <p className="text-sm mb-5" style={{ color: "var(--color-gray)" }}>
          Member A&apos;s <strong>give</strong> closely matches Member B&apos;s <strong>ask</strong>.
          Connect them — this is where referrals happen.
        </p>

        {matches.length === 0 ? (
          <div className="text-center py-12 rounded-xl" style={{ background: "#F9FAFB", border: "1px dashed #E5E7EB" }}>
            <p className="text-4xl mb-3">🔍</p>
            <p className="text-sm font-semibold" style={{ color: "var(--color-gray)" }}>
              No strong matches yet — encourage members to add more specific gives &amp; asks.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {matches.map((m, i) => {
              const { label: sl, bg, color } = scoreLabel(m.score);
              return (
                <div key={i} className="rounded-2xl overflow-hidden"
                  style={{ border: `1.5px solid ${color}30`, background: "white" }}>
                  {/* Match header */}
                  <div className="flex items-center gap-3 px-5 py-3"
                    style={{ background: bg, borderBottom: `1px solid ${color}25` }}>
                    <span
                      className="text-xs font-extrabold px-2.5 py-1 rounded-full"
                      style={{ background: color + "20", color }}>
                      {sl} — {Math.round(m.score * 100)}% match
                    </span>
                    <span className="text-xs" style={{ color }}>
                      {m.give.member_name.split(" ")[0]} can refer to {m.ask.member_name.split(" ")[0]}
                    </span>
                  </div>

                  {/* Give ↔ Ask chips */}
                  <div className="flex flex-col sm:flex-row gap-3 p-4 items-stretch">
                    <MemberChip row={m.give} side="give" />
                    <div className="flex items-center justify-center text-lg shrink-0">⟷</div>
                    <MemberChip row={m.ask} side="ask" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ══ SECTION 2: Gives — Clusters ══════════════════════════════════ */}
      <section id="gives" className="mb-14">
        <div className="flex items-center gap-3 mb-5">
          <h2 className="text-lg font-extrabold" style={{ color: "var(--color-dark)" }}>
            ✅ Gives — Grouped by Topic
          </h2>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
            style={{ background: "#DCFCE7", color: "#166534" }}>
            {giveClusters.length} clusters
          </span>
        </div>
        <p className="text-sm mb-5" style={{ color: "var(--color-gray)" }}>
          Members whose gives are in similar domains — they naturally refer to the same pool of contacts.
        </p>

        <div className="grid md:grid-cols-2 gap-4">
          {giveClusters.map((cluster, ci) => (
            <div key={ci} className="rounded-xl overflow-hidden"
              style={{ border: "1px solid #D1FAE5", background: "white" }}>
              <div className="px-4 py-3 flex items-center gap-2"
                style={{ background: "#ECFDF5", borderBottom: "1px solid #D1FAE5" }}>
                <p className="text-sm font-extrabold truncate flex-1" style={{ color: "#065F46" }}>
                  {cluster.label}
                </p>
                <span className="shrink-0 text-xs font-bold px-2 py-0.5 rounded-full"
                  style={{ background: "#16A34A", color: "white" }}>
                  {cluster.items.length}
                </span>
              </div>
              <div className="p-3 flex flex-col gap-2">
                {cluster.items.map((row, ri) => (
                  <div key={ri} className="flex items-center gap-2.5">
                    <Avatar name={row.member_name} photo={row.member_photo} size={28} />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold truncate" style={{ color: "var(--color-dark)" }}>
                        {row.member_name}
                      </p>
                      <p className="text-xs truncate" style={{ color: "var(--color-gray)" }}>
                        {row.item}
                      </p>
                    </div>
                    <Link href={`/members/${row.member_slug}`}
                      className="text-xs shrink-0" style={{ color: "#16A34A" }}>
                      ↗
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ══ SECTION 3: Asks — Clusters ═══════════════════════════════════ */}
      <section id="asks" className="mb-14">
        <div className="flex items-center gap-3 mb-5">
          <h2 className="text-lg font-extrabold" style={{ color: "var(--color-dark)" }}>
            🙏 Asks — Grouped by Topic
          </h2>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
            style={{ background: "#FEE2E2", color: "#991B1B" }}>
            {askClusters.length} clusters
          </span>
        </div>
        <p className="text-sm mb-5" style={{ color: "var(--color-gray)" }}>
          Members who are looking for similar types of referrals — they likely share the same target audience.
        </p>

        <div className="grid md:grid-cols-2 gap-4">
          {askClusters.map((cluster, ci) => (
            <div key={ci} className="rounded-xl overflow-hidden"
              style={{ border: "1px solid #FECACA", background: "white" }}>
              <div className="px-4 py-3 flex items-center gap-2"
                style={{ background: "#FEF2F2", borderBottom: "1px solid #FECACA" }}>
                <p className="text-sm font-extrabold truncate flex-1" style={{ color: "#991B1B" }}>
                  {cluster.label}
                </p>
                <span className="shrink-0 text-xs font-bold px-2 py-0.5 rounded-full"
                  style={{ background: "#DC2626", color: "white" }}>
                  {cluster.items.length}
                </span>
              </div>
              <div className="p-3 flex flex-col gap-2">
                {cluster.items.map((row, ri) => (
                  <div key={ri} className="flex items-center gap-2.5">
                    <Avatar name={row.member_name} photo={row.member_photo} size={28} />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold truncate" style={{ color: "var(--color-dark)" }}>
                        {row.member_name}
                      </p>
                      <p className="text-xs truncate" style={{ color: "var(--color-gray)" }}>
                        {row.item}
                      </p>
                    </div>
                    <Link href={`/members/${row.member_slug}`}
                      className="text-xs shrink-0" style={{ color: "#DC2626" }}>
                      ↗
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ══ SECTION 4: All Gives (flat list) ═════════════════════════════ */}
      <section id="all-gives" className="mb-14">
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-lg font-extrabold" style={{ color: "var(--color-dark)" }}>
            📋 All Gives
          </h2>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
            style={{ background: "#DCFCE7", color: "#166534" }}>
            {gives.length} items
          </span>
        </div>
        <div className="rounded-xl overflow-hidden" style={{ border: "1px solid #E5E7EB" }}>
          {gives.length === 0 ? (
            <p className="text-sm text-center py-8" style={{ color: "var(--color-gray)" }}>
              No gives recorded yet.
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: "#F9FAFB", borderBottom: "1px solid #E5E7EB" }}>
                  <th className="text-left px-4 py-3 text-xs font-semibold" style={{ color: "var(--color-gray)" }}>Member</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold" style={{ color: "var(--color-gray)" }}>Category</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold" style={{ color: "var(--color-gray)" }}>Give</th>
                </tr>
              </thead>
              <tbody>
                {gives.map((row, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid #F3F4F6" }}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Avatar name={row.member_name} photo={row.member_photo} size={28} />
                        <Link href={`/members/${row.member_slug}`}
                          className="font-semibold hover:underline text-xs"
                          style={{ color: "var(--color-dark)" }}>
                          {row.member_name}
                        </Link>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs" style={{ color: "var(--color-gray)" }}>
                      {row.member_category}
                    </td>
                    <td className="px-4 py-3 text-xs" style={{ color: "var(--color-dark)" }}>
                      ✅ {row.item}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>

      {/* ══ SECTION 5: All Asks (flat list) ══════════════════════════════ */}
      <section id="all-asks" className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-lg font-extrabold" style={{ color: "var(--color-dark)" }}>
            📋 All Asks
          </h2>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
            style={{ background: "#FEE2E2", color: "#991B1B" }}>
            {asks.length} items
          </span>
        </div>
        <div className="rounded-xl overflow-hidden" style={{ border: "1px solid #E5E7EB" }}>
          {asks.length === 0 ? (
            <p className="text-sm text-center py-8" style={{ color: "var(--color-gray)" }}>
              No asks recorded yet.
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: "#F9FAFB", borderBottom: "1px solid #E5E7EB" }}>
                  <th className="text-left px-4 py-3 text-xs font-semibold" style={{ color: "var(--color-gray)" }}>Member</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold" style={{ color: "var(--color-gray)" }}>Category</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold" style={{ color: "var(--color-gray)" }}>Ask</th>
                </tr>
              </thead>
              <tbody>
                {asks.map((row, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid #F3F4F6" }}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Avatar name={row.member_name} photo={row.member_photo} size={28} />
                        <Link href={`/members/${row.member_slug}`}
                          className="font-semibold hover:underline text-xs"
                          style={{ color: "var(--color-dark)" }}>
                          {row.member_name}
                        </Link>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs" style={{ color: "var(--color-gray)" }}>
                      {row.member_category}
                    </td>
                    <td className="px-4 py-3 text-xs" style={{ color: "var(--color-dark)" }}>
                      🙏 {row.item}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  );
}
