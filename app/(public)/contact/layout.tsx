import JsonLd from "@/components/JsonLd";
import { breadcrumbJsonLd, createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Contact Us",
  description:
    "Contact BNI Miracles in Chennai. Ask about membership, visitors, or chapter meetings. Reach us by form, phone, or WhatsApp.",
  path: "/contact",
  keywords: ["contact BNI Chennai", "BNI Miracles contact", "visit BNI chapter"],
});

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Contact", path: "/contact" },
        ])}
      />
      {children}
    </>
  );
}
