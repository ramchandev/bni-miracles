"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { Member } from "@/lib/supabase";

function Initials({ name }: { name: string }) {
  const parts = name.trim().split(" ");
  const initials =
    parts.length >= 2
      ? `${parts[0][0]}${parts[parts.length - 1][0]}`
      : parts[0].slice(0, 2);
  return (
    <div
      className="flex items-center justify-center w-20 h-20 rounded-full text-white text-2xl font-bold mx-auto"
      style={{ background: "var(--color-primary)" }}
    >
      {initials.toUpperCase()}
    </div>
  );
}

interface MemberCardProps {
  member: Member;
  categoryIcon?: string;
  gives?: string[];
  asks?: string[];
}

export default function MemberCard({ member, categoryIcon, gives = [], asks = [] }: MemberCardProps) {
  const [flipped, setFlipped] = useState(false);

  const hasGivesAsks = gives.length > 0 || asks.length > 0;

  // Slice to a max of 3 items per side so the card doesn't overflow
  const showGives = gives.slice(0, 3);
  const showAsks  = asks.slice(0, 3);

  return (
    /* Outer wrapper — fixed height, perspective for 3D */
    <div
      className="group"
      style={{ perspective: "1000px", height: 320 }}
      onMouseEnter={() => hasGivesAsks && setFlipped(true)}
      onMouseLeave={() => setFlipped(false)}
      onClick={() => hasGivesAsks && setFlipped((f) => !f)}
    >
      {/* Inner — rotates */}
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          transformStyle: "preserve-3d",
          transition: "transform 0.55s cubic-bezier(0.4, 0, 0.2, 1)",
          transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
      >
        {/* ── FRONT FACE ──────────────────────────────────────────────── */}
        <article
          className="card flex flex-col overflow-hidden"
          style={{
            position: "absolute",
            inset: 0,
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
          }}
        >
          <div className="p-6 flex flex-col items-center text-center flex-1">
            {/* Avatar */}
            <div className="mb-4">
              {member.profile_picture_url ? (
                <Image
                  src={member.profile_picture_url}
                  alt={`${member.name} profile picture`}
                  width={80}
                  height={80}
                  className="rounded-full object-cover mx-auto"
                  style={{ width: 80, height: 80 }}
                />
              ) : (
                <Initials name={member.name} />
              )}
            </div>

            {/* Category badge */}
            <span
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold mb-3"
              style={{ background: "#FEE2E2", color: "var(--color-primary)" }}
            >
              {categoryIcon && <span>{categoryIcon}</span>}
              {member.category}
            </span>

            {/* Name & Business */}
            <h3 className="text-lg font-bold mb-1" style={{ color: "var(--color-dark)" }}>
              {member.name}
            </h3>
            <p className="text-sm font-medium mb-1" style={{ color: "var(--color-gray)" }}>
              {member.business_name}
            </p>
            {member.business_location && (
              <p
                className="text-xs flex items-center gap-1 justify-center"
                style={{ color: "var(--color-gray)" }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                {member.business_location}
              </p>
            )}
          </div>

          <div className="px-6 pb-6 flex flex-col gap-2">
            <Link
              href={`/members/${member.slug}`}
              className="btn-outline w-full text-center text-sm"
              style={{ padding: "0.6rem 1rem" }}
              onClick={(e) => e.stopPropagation()}
            >
              View Profile
            </Link>
            {hasGivesAsks && (
              <p className="text-center text-xs" style={{ color: "var(--color-gray)" }}>
                Hover to see Gives &amp; Asks
              </p>
            )}
          </div>
        </article>

        {/* ── BACK FACE ───────────────────────────────────────────────── */}
        <article
          className="card flex flex-col overflow-hidden"
          style={{
            position: "absolute",
            inset: 0,
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
            background: "var(--color-dark)",
          }}
        >
          {/* Header */}
          <div className="px-5 pt-5 pb-3 flex items-center gap-2 border-b border-white/10">
            <div className="w-8 h-8 rounded-full overflow-hidden shrink-0">
              {member.profile_picture_url ? (
                <Image
                  src={member.profile_picture_url}
                  alt={member.name}
                  width={32}
                  height={32}
                  className="object-cover w-full h-full"
                />
              ) : (
                <div
                  className="flex items-center justify-center w-full h-full text-white text-xs font-bold"
                  style={{ background: "var(--color-primary)" }}
                >
                  {member.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <span className="text-white font-bold text-sm truncate">{member.name}</span>
          </div>

          {/* Gives & Asks */}
          <div className="flex-1 overflow-hidden px-5 py-4 grid grid-rows-2 gap-3">
            {/* Gives */}
            <div>
              <p
                className="text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-1"
                style={{ color: "#4ADE80" }}
              >
                <span>✅</span> Gives
              </p>
              {showGives.length > 0 ? (
                <ul className="space-y-1">
                  {showGives.map((item, i) => (
                    <li key={i} className="text-white/85 text-xs flex items-start gap-1.5">
                      <span style={{ color: "#4ADE80", marginTop: 1 }}>•</span>
                      <span className="line-clamp-1">{item}</span>
                    </li>
                  ))}
                  {gives.length > 3 && (
                    <li className="text-white/40 text-xs">+{gives.length - 3} more…</li>
                  )}
                </ul>
              ) : (
                <p className="text-white/30 text-xs italic">Nothing listed yet</p>
              )}
            </div>

            {/* Asks */}
            <div>
              <p
                className="text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-1"
                style={{ color: "#F87171" }}
              >
                <span>🙏</span> Asks
              </p>
              {showAsks.length > 0 ? (
                <ul className="space-y-1">
                  {showAsks.map((item, i) => (
                    <li key={i} className="text-white/85 text-xs flex items-start gap-1.5">
                      <span style={{ color: "#F87171", marginTop: 1 }}>•</span>
                      <span className="line-clamp-1">{item}</span>
                    </li>
                  ))}
                  {asks.length > 3 && (
                    <li className="text-white/40 text-xs">+{asks.length - 3} more…</li>
                  )}
                </ul>
              ) : (
                <p className="text-white/30 text-xs italic">Nothing listed yet</p>
              )}
            </div>
          </div>

          {/* CTA */}
          <div className="px-5 pb-5">
            <Link
              href={`/members/${member.slug}`}
              className="block w-full text-center text-sm font-semibold rounded-lg py-2.5 transition-opacity hover:opacity-90"
              style={{ background: "var(--color-primary)", color: "#fff" }}
              onClick={(e) => e.stopPropagation()}
            >
              View Full Profile →
            </Link>
          </div>
        </article>
      </div>
    </div>
  );
}
