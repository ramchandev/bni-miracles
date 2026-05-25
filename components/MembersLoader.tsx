"use client";

// Dynamic import with ssr:false must live inside a Client Component.
// This wrapper lets the parent Server page export metadata while
// ensuring MembersPageClient (which uses Math.random) is never SSR'd.
import dynamic from "next/dynamic";

const MembersPageClient = dynamic(
  () => import("@/components/MembersPageClient"),
  { ssr: false }
);

export default function MembersLoader() {
  return <MembersPageClient />;
}
