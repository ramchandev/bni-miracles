import type { Metadata } from "next";
import InitiativePageContent from "@/components/InitiativePageContent";
import { initiatives } from "@/lib/initiatives";

const init = initiatives.find((i) => i.slug === "referral-drive")!;

export const metadata: Metadata = {
  title: `${init.englishName} — ${init.tamilName} | BNI Miracles`,
  description: init.description,
};

export default function Page() {
  return <InitiativePageContent tamilName={init.tamilName} englishName={init.englishName} icon={init.icon} fullDescription={init.fullDescription} />;
}
