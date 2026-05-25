// Server Component — owns metadata, delegates rendering to a client-only loader.
import type { Metadata } from "next";
import MembersLoader from "@/components/MembersLoader";

export const metadata: Metadata = {
  title: "Members — BNI Miracles Chennai",
  description:
    "Meet the 35+ business professionals of BNI Miracles, Chennai's hybrid BNI chapter. Browse by business group and connect with members across 9 categories.",
};

export default function MembersPage() {
  return <MembersLoader />;
}
