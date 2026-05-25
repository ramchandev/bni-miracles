import type { Metadata } from "next";
import EditMyDetailsClient from "@/components/EditMyDetailsClient";

export const metadata: Metadata = {
  title: "Edit My Details — BNI Miracles",
  description: "BNI Miracles members: update your business profile, gives & asks directly.",
  robots: { index: false }, // Keep this page out of search results
};

export default function EditMyDetailsPage() {
  return <EditMyDetailsClient />;
}
