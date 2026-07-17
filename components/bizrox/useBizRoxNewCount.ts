"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { fetchBizRoxNewCountAction } from "@/app/actions/bizrox";

const LAST_SEEN_KEY = "bizrox-last-seen";

/**
 * Number of BizRox posts published since this visitor last opened the feed.
 * Visiting any /bizrox page marks the feed as seen and resets the count.
 */
export function useBizRoxNewCount(): number {
  const [count, setCount] = useState(0);
  const pathname = usePathname();

  useEffect(() => {
    const onFeed = pathname === "/bizrox" || pathname?.startsWith("/bizrox/");

    if (onFeed) {
      try {
        localStorage.setItem(LAST_SEEN_KEY, new Date().toISOString());
      } catch {}
      setCount(0);
      return;
    }

    let lastSeen: string | null = null;
    try {
      lastSeen = localStorage.getItem(LAST_SEEN_KEY);
    } catch {}

    if (!lastSeen) {
      // First visit — start counting from now instead of all-time post count
      try {
        localStorage.setItem(LAST_SEEN_KEY, new Date().toISOString());
      } catch {}
      return;
    }

    let cancelled = false;
    fetchBizRoxNewCountAction(lastSeen)
      .then((n) => {
        if (!cancelled) setCount(n);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [pathname]);

  return count;
}
