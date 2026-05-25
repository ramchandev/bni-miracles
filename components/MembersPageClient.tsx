"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase, type Member } from "@/lib/supabase";
import MemberCard from "@/components/MemberCard";

type GroupedMembers = { name: string; members: Member[] };
type GivesAsksMap = Map<string, { gives: string[]; asks: string[] }>;
type CatIconMap   = Map<string, string>;

/** Fisher-Yates shuffle — returns a new array */
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function MembersPageClient() {
  const [allMembers, setAllMembers]   = useState<Member[]>([]);
  const [groups, setGroups]           = useState<GroupedMembers[]>([]);
  const [catIcons, setCatIcons]       = useState<CatIconMap>(new Map());
  const [givesAsksMap, setGivesAsks]  = useState<GivesAsksMap>(new Map());
  const [loading, setLoading]         = useState(true);
  const [search, setSearch]           = useState("");

  useEffect(() => {
    async function load() {
      const [{ data: membersData }, { data: catData }, { data: gaData }] = await Promise.all([
        supabase.from("members").select("*").eq("is_active", true).order("name"),
        supabase
          .from("business_categories")
          .select("name, icon, category_groups(name, sort_order)")
          .order("sort_order"),
        supabase
          .from("member_gives_asks")
          .select("member_id, type, item")
          .order("sort_order"),
      ]);

      const memberList = membersData ?? [];

      // category name → group name  +  category name → icon
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const catToGroup = new Map<string, string>();
      const iconMap    = new Map<string, string>();
      for (const c of (catData ?? []) as any[]) {
        const g = Array.isArray(c.category_groups) ? c.category_groups[0] : c.category_groups;
        catToGroup.set(c.name, g?.name ?? "Other");
        if (c.icon) iconMap.set(c.name, c.icon as string);
      }

      // member_id → { gives, asks }
      const gaMap = new Map<string, { gives: string[]; asks: string[] }>();
      for (const row of (gaData ?? []) as { member_id: string; type: string; item: string }[]) {
        if (!gaMap.has(row.member_id)) gaMap.set(row.member_id, { gives: [], asks: [] });
        const bucket = gaMap.get(row.member_id)!;
        if (row.type === "give") bucket.gives.push(row.item);
        else                     bucket.asks.push(row.item);
      }

      // bucket members into their group
      const groupMap = new Map<string, Member[]>();
      for (const m of memberList) {
        const gName = catToGroup.get(m.category) ?? "Other";
        if (!groupMap.has(gName)) groupMap.set(gName, []);
        groupMap.get(gName)!.push(m);
      }

      // shuffle named groups; keep "Other" at the very end
      const named = [...groupMap.entries()]
        .filter(([n]) => n !== "Other")
        .map(([name, members]) => ({ name, members }));

      const shuffled = shuffle(named);
      const other = groupMap.get("Other");
      if (other?.length) shuffled.push({ name: "Other", members: other });

      setAllMembers(memberList);
      setGroups(shuffled);
      setCatIcons(iconMap);
      setGivesAsks(gaMap);
      setLoading(false);
    }
    load();
  }, []);

  // filter within groups when searching; hide empty groups
  const displayGroups = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return groups;
    return groups
      .map((g) => ({
        ...g,
        members: g.members.filter(
          (m) =>
            m.name.toLowerCase().includes(q) ||
            m.business_name.toLowerCase().includes(q) ||
            m.category.toLowerCase().includes(q)
        ),
      }))
      .filter((g) => g.members.length > 0);
  }, [groups, search]);

  const totalShown = displayGroups.reduce((sum, g) => sum + g.members.length, 0);

  return (
    <>
      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <section
        className="relative flex items-center justify-center px-6"
        style={{ background: "var(--color-dark)", paddingTop: 120, paddingBottom: 64 }}
      >
        <div className="text-center">
          <p
            className="text-sm font-semibold tracking-widest uppercase mb-3"
            style={{ color: "var(--color-accent)" }}
          >
            Our Community
          </p>
          <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-4">
            Meet Our Business Entrepreneurs
          </h1>
          <p className="text-lg text-white/70">
            {allMembers.length > 0 ? allMembers.length : "35"}+ professionals
            across {groups.length > 0 ? groups.length : "9"} business groups — all under one roof.
          </p>
        </div>
      </section>

      {/* ── Sticky search bar ─────────────────────────────────────────── */}
      <div
        className="sticky top-[70px] z-30 px-6 py-3"
        style={{ background: "white", borderBottom: "1px solid #E5E7EB" }}
      >
        <div style={{ maxWidth: 1200, margin: "0 auto" }} className="flex items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              width="15" height="15" viewBox="0 0 24 24" fill="none"
              stroke="#9CA3AF" strokeWidth="2.5"
            >
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="text"
              placeholder="Search member or business…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-lg text-sm"
              style={{ border: "1.5px solid #E5E7EB", outline: "none" }}
            />
          </div>

          {search && (
            <button
              onClick={() => setSearch("")}
              className="flex items-center gap-1.5 px-3 py-2.5 rounded-lg text-sm font-semibold"
              style={{ background: "#F3F4F6", color: "var(--color-dark)" }}
            >
              ✕ Clear
            </button>
          )}

          {!loading && (
            <p className="text-xs hidden sm:block" style={{ color: "var(--color-gray)" }}>
              {totalShown} member{totalShown !== 1 ? "s" : ""}
              {search ? ` for "${search}"` : ""}
            </p>
          )}
        </div>
      </div>

      {/* ── Grouped members ───────────────────────────────────────────── */}
      <section className="py-14 px-6" style={{ background: "var(--color-bg)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>

          {loading ? (
            /* Skeleton */
            <div className="flex flex-col gap-14">
              {[6, 3, 5].map((count, i) => (
                <div key={i} className="animate-pulse">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="h-5 bg-gray-200 rounded w-44 shrink-0" />
                    <div className="flex-1 h-px bg-gray-100" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Array.from({ length: count }).map((_, j) => (
                      <div key={j} className="card p-6">
                        <div className="w-20 h-20 rounded-full bg-gray-200 mx-auto mb-4" />
                        <div className="h-4 bg-gray-200 rounded mb-2 w-3/4 mx-auto" />
                        <div className="h-3 bg-gray-100 rounded w-1/2 mx-auto" />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

          ) : displayGroups.length === 0 ? (
            /* Empty state */
            <div className="text-center py-24">
              <p className="text-5xl mb-4">🔍</p>
              <p className="text-lg font-bold mb-2" style={{ color: "var(--color-dark)" }}>
                No members found
              </p>
              <p className="text-sm mb-6" style={{ color: "var(--color-gray)" }}>
                {allMembers.length === 0
                  ? "Members will appear here once added."
                  : `No results for "${search}" — try a different name.`}
              </p>
              {search && (
                <button onClick={() => setSearch("")} className="btn-primary text-sm">
                  Clear search
                </button>
              )}
            </div>

          ) : (
            /* Groups */
            <div className="flex flex-col gap-16">
              {displayGroups.map((group) => (
                <div key={group.name}>
                  {/* Group header — name + rule + count */}
                  <div className="flex items-center gap-4 mb-6">
                    <h2
                      className="text-lg font-extrabold shrink-0"
                      style={{ color: "var(--color-dark)" }}
                    >
                      {group.name}
                    </h2>
                    <div className="flex-1 h-px" style={{ background: "#E5E7EB" }} />
                    <span
                      className="text-xs font-semibold shrink-0 px-2.5 py-1 rounded-full"
                      style={{ background: "#F3F4F6", color: "var(--color-gray)" }}
                    >
                      {group.members.length} member{group.members.length !== 1 ? "s" : ""}
                    </span>
                  </div>

                  {/* Member cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {group.members.map((member) => (
                      <MemberCard
                        key={member.id}
                        member={member}
                        categoryIcon={catIcons.get(member.category)}
                        gives={givesAsksMap.get(member.id)?.gives}
                        asks={givesAsksMap.get(member.id)?.asks}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
