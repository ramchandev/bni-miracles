"use client";

import NextTopLoader from "nextjs-toploader";

export default function NavigationProgress() {
  return (
    <NextTopLoader
      color="#C8102E"
      height={3}
      showSpinner={false}
      crawl
      crawlSpeed={200}
      speed={200}
      zIndex={9999}
      showForHashAnchor={false}
    />
  );
}
