import type { Metadata } from "next";
import { getMemberSession } from "@/lib/member-session";
import { getDanceCardAction } from "@/app/actions/dance-card";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import DanceCardLoader from "@/components/dance-card/DanceCardLoader";
import MemberPageGate from "@/components/MemberPageGate";

export const metadata: Metadata = {
  title: "My Dance Card — BNI Miracles",
  description: "Complete your BNI One-on-One Dance Card Planner.",
  robots: { index: false },
};

export const dynamic = "force-dynamic";

export default async function DanceCardPage() {
  const member = await getMemberSession();

  if (!member) {
    return (
      <>
        <section
          className="px-6 text-center"
          style={{ background: "var(--color-dark)", paddingTop: 96, paddingBottom: 48 }}
        >
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-4"
            style={{ background: "rgba(200,16,46,0.2)", color: "#FCA5A5", border: "1px solid rgba(200,16,46,0.35)" }}
          >
            🎴 Member Tool
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-3">
            One-on-One Dance Card
          </h1>
          <p className="text-white/60 max-w-lg mx-auto text-sm leading-relaxed">
            Log in to fill in your dance card, share with partners, and generate a PDF.
          </p>
        </section>
        <MemberPageGate
          title="Dance Card"
          description="Log in with your phone number and meeting place to access your dance card."
        />
      </>
    );
  }

  // Fetch dance card data + extended member profile in parallel
  const admin = createSupabaseAdminClient();
  const [initialData, memberDetail] = await Promise.all([
    getDanceCardAction(member.id),
    admin
      .from("members")
      .select("business_name, category")
      .eq("id", member.id)
      .single()
      .then(({ data }) => data),
  ]);

  const fullMember = {
    ...member,
    business_name: memberDetail?.business_name ?? undefined,
    category:      memberDetail?.category      ?? undefined,
  };

  return (
    <>
      {/* Hero */}
      <section
        className="px-6 text-center"
        style={{ background: "var(--color-dark)", paddingTop: 96, paddingBottom: 48 }}
      >
        <div
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-4"
          style={{ background: "rgba(200,16,46,0.2)", color: "#FCA5A5", border: "1px solid rgba(200,16,46,0.35)" }}
        >
          🎴 Member Tool
        </div>
        <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-3">
          One-on-One Dance Card
        </h1>
        <p className="text-white/60 max-w-lg mx-auto text-sm leading-relaxed">
          Your personal BNI planner — fill in your details, share with dance partners,
          and generate a ready-to-print PDF for your One-on-One meetings.
        </p>

        {/* Step guide */}
        <div className="flex items-center justify-center gap-1 mt-6 flex-wrap">
          {[
            { n: 1, label: "Fill 4 tabs" },
            { n: 2, label: "Generate PDF" },
            { n: 3, label: "Share & Meet" },
          ].map(({ n, label }, i, arr) => (
            <div key={n} className="flex items-center gap-1">
              <div className="flex items-center gap-1.5">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{ background: "var(--color-primary)", color: "white" }}
                >
                  {n}
                </div>
                <span className="text-xs text-white/70">{label}</span>
              </div>
              {i < arr.length - 1 && (
                <span className="text-white/25 text-xs mx-1">→</span>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Form / View */}
      <section className="py-10 px-6" style={{ background: "var(--color-bg)" }}>
        <DanceCardLoader member={fullMember} initialData={initialData} />
      </section>
    </>
  );
}
