"use client";

import { useBizRoxNewCount } from "@/components/bizrox/useBizRoxNewCount";

/**
 * Red counter shown next to the BizRox nav link with the number of posts
 * published since the visitor last opened the feed. Visiting any /bizrox
 * page marks the feed as seen and clears the counter.
 */
export default function BizRoxNewBadge() {
  const count = useBizRoxNewCount();

  if (count <= 0) return null;

  return (
    <span
      className="inline-flex items-center justify-center rounded-full text-[10px] font-bold leading-none shrink-0"
      style={{
        background: "#EF4444",
        color: "white",
        minWidth: 18,
        height: 18,
        padding: "0 5px",
      }}
      aria-label={`${count} new BizRox posts`}
    >
      {count > 9 ? "9+" : count}
    </span>
  );
}
