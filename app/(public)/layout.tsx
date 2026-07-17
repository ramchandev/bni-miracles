import { GoogleAnalytics } from "@next/third-parties/google";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import InstallAppBanner from "@/components/InstallAppBanner";
import PushNotificationsPrompt from "@/components/PushNotificationsPrompt";
import JsonLd from "@/components/JsonLd";
import { GA_MEASUREMENT_ID } from "@/lib/analytics";
import { fetchPowerTeamsNav } from "@/lib/power-teams-server";
import { organizationJsonLd, websiteJsonLd } from "@/lib/seo";
import { getMemberSession } from "@/lib/member-session";
import { MemberSessionProvider } from "@/components/MemberSessionContext";
import MemberLoginHost from "@/components/MemberLoginHost";
import { canManageBvdRegistrations } from "@/lib/bvd-permissions";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const [powerTeams, initialMember] = await Promise.all([
    fetchPowerTeamsNav(),
    getMemberSession(),
  ]);

  const canManageBvd = await canManageBvdRegistrations(initialMember?.id ?? null);

  return (
    <MemberSessionProvider initialMember={initialMember} canManageBvd={canManageBvd}>
      <JsonLd data={[organizationJsonLd(), websiteJsonLd()]} />
      <Header powerTeams={powerTeams} />
      <main className="flex-1">{children}</main>
      <Footer powerTeams={powerTeams} />
      <WhatsAppButton />
      <InstallAppBanner />
      <PushNotificationsPrompt />
      <MemberLoginHost />
      <GoogleAnalytics gaId={GA_MEASUREMENT_ID} />
    </MemberSessionProvider>
  );
}
