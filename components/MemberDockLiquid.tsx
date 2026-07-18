"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useMemberSession } from "@/components/MemberSessionContext";
import { fetchDockBadgeCountsAction } from "@/app/actions/notifications";
import { GlassEffect, GlassFilter } from "@/components/ui/liquid-glass";

const BIZROX_LAST_SEEN_KEY = "bizrox-last-seen";

function DockBadge({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <span
      className="absolute -top-1 -right-1.5 min-w-[17px] h-[17px] px-1 rounded-full text-[9px] font-bold flex items-center justify-center text-white z-10"
      style={{ background: "#EF4444", boxShadow: "0 1px 4px rgba(0,0,0,0.4)" }}
    >
      {count > 9 ? "9+" : count}
    </span>
  );
}

function DockItem({
  href,
  label,
  active,
  badge = 0,
  children,
}: {
  href: string;
  label: string;
  active: boolean;
  badge?: number;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center gap-1 w-16 py-1 transition-all duration-300 hover:scale-110"
      style={{ transformOrigin: "center" }}
    >
      <span className="relative flex items-center justify-center w-9 h-9">
        {children}
        <DockBadge count={badge} />
      </span>
      <span
        className="text-[10px] font-semibold leading-none whitespace-nowrap"
        style={{ color: active ? "#FBBF24" : "rgba(255,255,255,0.9)" }}
      >
        {label}
      </span>
    </Link>
  );
}

function EmojiIcon({ emoji }: { emoji: string }) {
  return (
    <span
      className="text-[26px] leading-none"
      style={{ filter: "drop-shadow(0 2px 3px rgba(0,0,0,0.35))" }}
      aria-hidden
    >
      {emoji}
    </span>
  );
}

function readBizroxLastSeen(): string | null {
  try {
    return localStorage.getItem(BIZROX_LAST_SEEN_KEY);
  } catch {
    return null;
  }
}

function markBizroxSeen() {
  try {
    localStorage.setItem(BIZROX_LAST_SEEN_KEY, new Date().toISOString());
  } catch {
    /* ignore */
  }
}

/**
 * Liquid-glass member dock — dark smoked glass with emoji icons.
 * Horizontal bar at the bottom on phones/tablets, vertical rail on
 * the right edge for desktop.
 */
export default function MemberDockLiquid() {
  const { member } = useMemberSession();
  const pathname = usePathname();
  const [count121, setCount121] = useState(0);
  const [countBizrox, setCountBizrox] = useState(0);

  const refreshBadges = useCallback(async () => {
    if (!member) return;

    const onBizrox = pathname === "/bizrox" || pathname?.startsWith("/bizrox/");
    if (onBizrox) {
      markBizroxSeen();
      setCountBizrox(0);
    }

    try {
      if (!onBizrox && !readBizroxLastSeen()) {
        markBizroxSeen();
      }
      const counts = await fetchDockBadgeCountsAction(
        onBizrox ? new Date().toISOString() : readBizroxLastSeen()
      );
      setCount121(counts.count121);
      if (!onBizrox) setCountBizrox(counts.countBizrox);
    } catch (err) {
      console.error("[MemberDock] badge refresh failed:", err);
    }
  }, [member, pathname]);

  useEffect(() => {
    if (!member) return;

    refreshBadges();
    const interval = setInterval(refreshBadges, 15_000);

    const onVisible = () => {
      if (document.visibilityState === "visible") refreshBadges();
    };
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", refreshBadges);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", refreshBadges);
    };
  }, [member, refreshBadges]);

  if (!member) return null;

  const profileHref = `/members/${member.slug}`;

  const items = (
    <>
      <DockItem href={profileHref} label="My Profile" active={pathname === profileHref}>
        {member.profile_picture_url ? (
          <Image
            src={member.profile_picture_url}
            alt={member.name}
            width={32}
            height={32}
            className="rounded-full object-cover"
            style={{
              width: 32,
              height: 32,
              border: "2px solid rgba(255,255,255,0.6)",
              boxShadow: "0 2px 4px rgba(0,0,0,0.35)",
            }}
          />
        ) : (
          <span
            className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white"
            style={{
              background: "var(--color-primary)",
              border: "2px solid rgba(255,255,255,0.6)",
            }}
          >
            {member.name.charAt(0).toUpperCase()}
          </span>
        )}
      </DockItem>

      <DockItem href="/my-121" label="My 121s" active={pathname === "/my-121"} badge={count121}>
        <EmojiIcon emoji="📅" />
      </DockItem>

      <DockItem
        href="/bizrox"
        label="BizRox"
        active={pathname === "/bizrox" || pathname?.startsWith("/bizrox/") === true}
        badge={countBizrox}
      >
        <EmojiIcon emoji="📣" />
      </DockItem>

      <DockItem href="/gives-asks" label="Gives & Asks" active={pathname === "/gives-asks"}>
        <EmojiIcon emoji="🤝" />
      </DockItem>

      {/* My Score — module coming soon, dotted placeholder until then */}
      <div
        className="flex flex-col items-center gap-1 w-16 py-1"
        aria-label="My Score — coming soon"
        title="My Score — coming soon"
      >
        <span className="relative flex items-center justify-center w-9 h-9">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2" strokeLinecap="round">
            <circle cx="12" cy="12" r="9" strokeDasharray="3 4" />
          </svg>
        </span>
        <span
          className="text-[10px] font-semibold leading-none whitespace-nowrap"
          style={{ color: "rgba(255,255,255,0.5)" }}
        >
          My Score
        </span>
      </div>
    </>
  );

  return (
    <>
      <GlassFilter />

      {/* Horizontal dock — phones & tablets. z-40 keeps it under modals/sheets (z-50). */}
      <div
        className="lg:hidden fixed left-1/2 -translate-x-1/2 z-40"
        style={{
          bottom:
            "calc(0.75rem + env(safe-area-inset-bottom, 0px) + var(--install-banner-offset, 0px))",
        }}
      >
        <GlassEffect tint="dark" className="rounded-3xl p-1.5">
          <nav aria-label="Member quick navigation" className="flex items-end">
            {items}
          </nav>
        </GlassEffect>
      </div>

      {/* Vertical dock — desktop, pinned to the right edge. z-40 keeps it under modals. */}
      <div className="hidden lg:block fixed right-4 top-1/2 -translate-y-1/2 z-40">
        <GlassEffect tint="dark" className="rounded-3xl p-1.5">
          <nav aria-label="Member quick navigation" className="flex flex-col items-center gap-1">
            {items}
          </nav>
        </GlassEffect>
      </div>
    </>
  );
}
