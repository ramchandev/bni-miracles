"use client";

// Dynamic import with ssr:false prevents the DanceCardClient from being
// server-rendered. This eliminates hydration mismatches caused by the
// large array-initialised form state (10 contact sphere rows, etc.)
import dynamic from "next/dynamic";
import type { DanceCardRow } from "@/lib/dance-card-types";
import type { SessionMember } from "@/lib/supabase";

const DanceCardClient = dynamic(
  () => import("@/components/dance-card/DanceCardClient"),
  {
    ssr: false,
    loading: () => (
      <div className="flex flex-col gap-4 animate-pulse" style={{ maxWidth: 820, margin: "0 auto" }}>
        <div className="h-16 rounded-2xl bg-gray-200" />
        <div className="h-12 rounded-xl bg-gray-100" />
        <div className="h-80 rounded-2xl bg-gray-200" />
      </div>
    ),
  }
);

type Props = {
  member: SessionMember & { business_name?: string; category?: string };
  initialData: DanceCardRow | null;
};

export default function DanceCardLoader(props: Props) {
  return <DanceCardClient {...props} />;
}
