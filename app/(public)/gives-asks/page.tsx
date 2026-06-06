import type { Metadata } from "next";
import GivesAsksClient from "@/components/GivesAsksClient";

export const metadata: Metadata = {
  title: "My Gives & Asks — BNI Miracles",
  description: "BNI Miracles members: manage your referral gives and asks.",
  robots: { index: false },
};

export default function GivesAsksPage() {
  return <GivesAsksClient />;
}
