import InitiativePageContent from "@/components/InitiativePageContent";
import { initiatives } from "@/lib/initiatives";
import { createInitiativeMetadata } from "@/lib/seo";

const init = initiatives.find((i) => i.slug === "one-referral")!;

export const metadata = createInitiativeMetadata(init);

export default function Page() {
  return (
    <InitiativePageContent
      tamilName={init.tamilName}
      englishName={init.englishName}
      icon={init.icon}
      slug={init.slug}
      fullDescription={init.fullDescription}
    />
  );
}
