import { GoogleAnalytics } from "@next/third-parties/google";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import JsonLd from "@/components/JsonLd";
import { GA_MEASUREMENT_ID } from "@/lib/analytics";
import { fetchPowerTeamsNav } from "@/lib/power-teams-server";
import { organizationJsonLd, websiteJsonLd } from "@/lib/seo";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const powerTeams = await fetchPowerTeamsNav();

  return (
    <>
      <JsonLd data={[organizationJsonLd(), websiteJsonLd()]} />
      <Header powerTeams={powerTeams} />
      <main className="flex-1">{children}</main>
      <Footer powerTeams={powerTeams} />
      <WhatsAppButton />
      <GoogleAnalytics gaId={GA_MEASUREMENT_ID} />
    </>
  );
}
