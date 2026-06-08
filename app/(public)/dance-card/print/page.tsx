import { redirect } from "next/navigation";
import { getMemberSession } from "@/lib/member-session";
import { getDanceCardAction, markPdfGeneratedAction } from "@/app/actions/dance-card";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import PrintableCard from "@/components/dance-card/PrintableCard";
import AutoPrintTrigger from "@/components/dance-card/AutoPrintTrigger";
import PrintControls from "@/components/dance-card/PrintControls";

export const metadata = { robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function DanceCardPrintPage() {
  const member = await getMemberSession();
  if (!member) redirect("/dance-card");

  // Fetch dance card data + full member details in parallel
  const admin = createSupabaseAdminClient();
  const [card, memberDetail] = await Promise.all([
    getDanceCardAction(member.id),
    admin
      .from("members")
      .select("business_name, category")
      .eq("id", member.id)
      .single()
      .then(({ data }) => data),
  ]);

  // Mark as generated (best-effort — don't block render)
  markPdfGeneratedAction(member.id).catch(() => {});

  const fullMember = {
    ...member,
    business_name: memberDetail?.business_name ?? undefined,
    category:      memberDetail?.category      ?? undefined,
  };

  return (
    <>
      <AutoPrintTrigger />
      <PrintControls />

      {/* Printable body */}
      <div id="print-body" style={{ background: "white", minHeight: "100vh", padding: "32px 40px" }}>
        <PrintableCard member={fullMember} card={card} />
      </div>

      {/* Print-only styles injected server-side */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          #print-body { padding: 0 !important; }
          body { margin: 0; background: white; }
          @page { margin: 1.4cm; size: A4 portrait; }
        }
        @media screen {
          body { background: #F3F4F6; }
          #print-body {
            max-width: 820px;
            margin: 0 auto;
            box-shadow: 0 4px 24px rgba(0,0,0,0.12);
          }
        }
      `}</style>
    </>
  );
}
