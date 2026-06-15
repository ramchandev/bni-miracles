import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import ReferralPairsSection from "@/components/admin/ReferralPairsSection";
import AllGivesAsksTable from "@/components/admin/AllGivesAsksTable";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export const metadata: Metadata = { title: "Gives & Asks Intelligence — Miracle Members Admin" };

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

/* ── Group by GA category ─────────────────────────────────────────────── */

type GiveAskRow = {
  id: string;
  member_id: string;
  member_name: string;
  member_slug: string;
  member_category: string;
  member_photo: string | null;
  type: "give" | "ask";
  item: string;
  category_id: string | null;
  category_name: string | null;
};

type CategoryGroup = { label: string; items: GiveAskRow[] };

function groupByCategory(items: GiveAskRow[]): CategoryGroup[] {
  const byCategory = new Map<string, GiveAskRow[]>();
  const uncategorized: GiveAskRow[] = [];

  for (const item of items) {
    if (item.category_id && item.category_name) {
      const bucket = byCategory.get(item.category_id) ?? [];
      bucket.push(item);
      byCategory.set(item.category_id, bucket);
    } else {
      uncategorized.push(item);
    }
  }

  const groups: CategoryGroup[] = [...byCategory.entries()]
    .map(([, rows]) => ({
      label: rows[0].category_name!,
      items: rows.sort((a, b) => a.member_name.localeCompare(b.member_name)),
    }))
    .sort((a, b) => a.label.localeCompare(b.label, undefined, { sensitivity: "base" }));

  if (uncategorized.length > 0) {
    groups.push({
      label: "Uncategorized",
      items: uncategorized.sort((a, b) => a.member_name.localeCompare(b.member_name)),
    });
  }

  return groups;
}

/* ── Cross-match: give ↔ ask from different members ──────────────────── */

type Match = { score: number; give: GiveAskRow; ask: GiveAskRow };

function matchScore(give: GiveAskRow, ask: GiveAskRow): number {
  if (give.category_id && ask.category_id && give.category_id === ask.category_id) {
    return 1;
  }
  return combinedSim(give.item, ask.item);
}

function findMatches(gives: GiveAskRow[], asks: GiveAskRow[], threshold = 0.13): Match[] {
  const pairs: Match[] = [];
  for (const give of gives) {
    for (const ask of asks) {
      if (give.member_id === ask.member_id) continue;
      const score = matchScore(give, ask);
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
  const [{ data: gaRows }, { data: gaCategories }] = await Promise.all([
    supabase
      .from("member_gives_asks")
      .select("id, member_id, type, item, category_id, gives_asks_categories(name)")
      .order("sort_order"),
    supabase.from("gives_asks_categories").select("*").order("sort_order"),
  ]);

  const categoryNameFromRow = (raw: unknown): string | null => {
    if (!raw || typeof raw !== "object") return null;
    if (Array.isArray(raw)) return (raw[0] as { name?: string })?.name ?? null;
    return (raw as { name?: string }).name ?? null;
  };

  const memberMap = new Map(
    (members ?? []).map((m) => [m.id, m])
  );

  const allRows: GiveAskRow[] = (gaRows ?? [])
    .filter((r) => memberMap.has(r.member_id))
    .map((r) => {
      const m = memberMap.get(r.member_id)!;
      return {
        id:              r.id as string,
        member_id:       m.id,
        member_name:     m.name,
        member_slug:     m.slug,
        member_category: m.category,
        member_photo:    m.profile_picture_url,
        type:            r.type as "give" | "ask",
        item:            r.item as string,
        category_id:     (r.category_id as string | null) ?? null,
        category_name:   categoryNameFromRow((r as { gives_asks_categories?: unknown }).gives_asks_categories),
      };
    });

  const gives = allRows.filter((r) => r.type === "give");
  const asks  = allRows.filter((r) => r.type === "ask");

  // Run intelligence
  const matches      = findMatches(gives, asks);
  const giveGroups   = groupByCategory(gives);
  const askGroups    = groupByCategory(asks);
  const categories   = gaCategories ?? [];

  // Stats
  const membersWithGives = new Set(gives.map((g) => g.member_id)).size;
  const membersWithAsks  = new Set(asks.map((a) => a.member_id)).size;
  const totalMembers     = members?.length ?? 0;
  const strongMatches    = matches.filter((m) => m.score >= 0.55).length;

  const memberIdsWithGivesOrAsks = new Set([
    ...gives.map((g) => g.member_id),
    ...asks.map((a) => a.member_id),
  ]);
  const filterMembers = (members ?? [])
    .filter((m) => memberIdsWithGivesOrAsks.has(m.id))
    .map((m) => ({
      id: m.id,
      name: m.name,
      category: m.category,
      profile_picture_url: m.profile_picture_url,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="p-8">
      {/* ── Page header ──────────────────────────────────────────────── */}
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold mb-1" style={{ color: "var(--color-dark)" }}>
            🤝 Gives &amp; Asks Intelligence
          </h1>
          <p className="text-sm" style={{ color: "var(--color-gray)" }}>
            AI-powered matching of what members can give with what others are asking for.
          </p>
        </div>
        <Link href="/admin/gives-asks/categories" className="btn-outline text-sm">
          Manage Categories
        </Link>
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
          { href: "#gives",      label: "✅ Gives by Category" },
          { href: "#asks",       label: "🙏 Asks by Category" },
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

      <ReferralPairsSection matches={matches} members={filterMembers} />

      {/* ══ SECTION 2: Gives — by Category ═════════════════════════════ */}
      <section id="gives" className="mb-14">
        <div className="flex items-center gap-3 mb-5">
          <h2 className="text-lg font-extrabold" style={{ color: "var(--color-dark)" }}>
            ✅ Gives — Grouped by Category
          </h2>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
            style={{ background: "#DCFCE7", color: "#166534" }}>
            {giveGroups.length} categories
          </span>
        </div>
        <p className="text-sm mb-5" style={{ color: "var(--color-gray)" }}>
          Members grouped by their give category — assign categories in All Gives below to organise this view.
        </p>

        <div className="grid md:grid-cols-2 gap-4">
          {giveGroups.length === 0 ? (
            <p className="text-sm" style={{ color: "var(--color-gray)" }}>No gives recorded yet.</p>
          ) : (
          giveGroups.map((group, ci) => (
            <div key={ci} className="rounded-xl overflow-hidden"
              style={{ border: "1px solid #D1FAE5", background: "white" }}>
              <div className="px-4 py-3 flex items-center gap-2"
                style={{ background: "#ECFDF5", borderBottom: "1px solid #D1FAE5" }}>
                <p className="text-sm font-extrabold truncate flex-1" style={{ color: "#065F46" }}>
                  {group.label}
                </p>
                <span className="shrink-0 text-xs font-bold px-2 py-0.5 rounded-full"
                  style={{ background: "#16A34A", color: "white" }}>
                  {group.items.length}
                </span>
              </div>
              <div className="p-3 flex flex-col gap-2">
                {group.items.map((row) => (
                  <div key={row.id} className="flex items-center gap-2.5">
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
          )))}
        </div>
      </section>

      {/* ══ SECTION 3: Asks — by Category ════════════════════════════════ */}
      <section id="asks" className="mb-14">
        <div className="flex items-center gap-3 mb-5">
          <h2 className="text-lg font-extrabold" style={{ color: "var(--color-dark)" }}>
            🙏 Asks — Grouped by Category
          </h2>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
            style={{ background: "#FEE2E2", color: "#991B1B" }}>
            {askGroups.length} categories
          </span>
        </div>
        <p className="text-sm mb-5" style={{ color: "var(--color-gray)" }}>
          Members grouped by their ask category — assign categories in All Asks below to organise this view.
        </p>

        <div className="grid md:grid-cols-2 gap-4">
          {askGroups.length === 0 ? (
            <p className="text-sm" style={{ color: "var(--color-gray)" }}>No asks recorded yet.</p>
          ) : (
          askGroups.map((group, ci) => (
            <div key={ci} className="rounded-xl overflow-hidden"
              style={{ border: "1px solid #FECACA", background: "white" }}>
              <div className="px-4 py-3 flex items-center gap-2"
                style={{ background: "#FEF2F2", borderBottom: "1px solid #FECACA" }}>
                <p className="text-sm font-extrabold truncate flex-1" style={{ color: "#991B1B" }}>
                  {group.label}
                </p>
                <span className="shrink-0 text-xs font-bold px-2 py-0.5 rounded-full"
                  style={{ background: "#DC2626", color: "white" }}>
                  {group.items.length}
                </span>
              </div>
              <div className="p-3 flex flex-col gap-2">
                {group.items.map((row) => (
                  <div key={row.id} className="flex items-center gap-2.5">
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
          )))}
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
          <AllGivesAsksTable kind="give" rows={gives} categories={categories} />
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
          <AllGivesAsksTable kind="ask" rows={asks} categories={categories} />
        </div>
      </section>
    </div>
  );
}
