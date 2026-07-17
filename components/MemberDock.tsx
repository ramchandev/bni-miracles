"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemberSession } from "@/components/MemberSessionContext";
import { useBizRoxNewCount } from "@/components/bizrox/useBizRoxNewCount";
import { fetchMemberNotificationsAction } from "@/app/actions/notifications";

function DockBadge({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <span
      className="absolute -top-1 -right-2 min-w-[16px] h-4 px-1 rounded-full text-[9px] font-bold flex items-center justify-center text-white"
      style={{ background: "#EF4444" }}
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
      className="flex flex-col items-center gap-0.5 px-2 py-1 rounded-xl transition-colors"
      style={{ color: active ? "#FBBF24" : "rgba(255,255,255,0.75)" }}
    >
      <span className="relative flex items-center justify-center w-6 h-6">
        {children}
        <DockBadge count={badge} />
      </span>
      <span className="text-[10px] font-medium leading-none whitespace-nowrap">{label}</span>
    </Link>
  );
}

/**
 * iPhone-style floating dock shown at the bottom of the screen for
 * logged-in members: My Profile, My 121s, BizRox, Gives & Asks.
 */
export default function MemberDock() {
  const { member } = useMemberSession();
  const pathname = usePathname();
  const bizroxCount = useBizRoxNewCount();
  const [count121, setCount121] = useState(0);

  useEffect(() => {
    if (!member) return;

    const load = async () => {
      try {
        const { notifications } = await fetchMemberNotificationsAction();
        setCount121(
          notifications.filter((n) => !n.is_read && n.type.startsWith("121")).length
        );
      } catch {}
    };

    load();
    const interval = setInterval(load, 60_000);
    return () => clearInterval(interval);
  }, [member, pathname]);

  if (!member) return null;

  const profileHref = `/members/${member.slug}`;

  return (
    <nav
      aria-label="Member quick navigation"
      className="fixed left-1/2 -translate-x-1/2 z-50 flex items-end gap-1 px-3 py-2 rounded-3xl shadow-2xl"
      style={{
        bottom: "calc(0.75rem + env(safe-area-inset-bottom, 0px) + var(--install-banner-offset, 0px))",
        background: "rgba(26,26,46,0.92)",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        border: "1px solid rgba(255,255,255,0.14)",
      }}
    >
      <DockItem href={profileHref} label="My Profile" active={pathname === profileHref}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      </DockItem>

      <DockItem href="/my-121" label="My 121s" active={pathname === "/my-121"} badge={count121}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <path d="M16 2v4M8 2v4M3 10h18" />
        </svg>
      </DockItem>

      <DockItem
        href="/bizrox"
        label="BizRox"
        active={pathname === "/bizrox" || pathname?.startsWith("/bizrox/") === true}
        badge={bizroxCount}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 11l18-5v12L3 14v-3z" />
          <path d="M11.6 16.8a3 3 0 11-5.8-1.6" />
        </svg>
      </DockItem>

      <DockItem href="/gives-asks" label="Gives & Asks" active={pathname === "/gives-asks"}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
      </DockItem>
    </nav>
  );
}
