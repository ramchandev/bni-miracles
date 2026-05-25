// Server Component — owns metadata, delegates rendering to a client-only loader.
import MembersLoader from "@/components/MembersLoader";
import JsonLd from "@/components/JsonLd";
import { breadcrumbJsonLd, createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Our Members",
  description:
    "Meet the 35+ business professionals of BNI Miracles, Chennai's hybrid BNI chapter. Browse by business group and connect with members across diverse categories.",
  path: "/members",
  keywords: ["BNI members Chennai", "BNI Miracles members", "business professionals Chennai"],
});

export default function MembersPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Members", path: "/members" },
        ])}
      />
      <MembersLoader />
    </>
  );
}
