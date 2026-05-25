import EditMyDetailsClient from "@/components/EditMyDetailsClient";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Edit My Details",
  description: "BNI Miracles members: update your business profile, gives and asks directly.",
  path: "/edit-my-details",
  noIndex: true,
});

export default function EditMyDetailsPage() {
  return <EditMyDetailsClient />;
}
