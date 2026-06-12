import type { Metadata } from "next";
import My121Client from "@/components/members/My121Client";
import MemberPageGate from "@/components/MemberPageGate";
import { fetchMy121Calendar } from "@/lib/one-on-one-queries";
import { getMemberSession } from "@/lib/member-session";

export const metadata: Metadata = {
  title: "My 1-2-1 Calendar — BNI Miracles",
  description: "BNI Miracles members: view and manage your one-to-one meetings.",
  robots: { index: false },
};

export default async function My121Page() {
  const session = await getMemberSession();

  if (!session) {
    return (
      <>
        <section
          className="px-6 text-center"
          style={{ background: "var(--color-dark)", paddingTop: 100, paddingBottom: 48 }}
        >
          <p
            className="text-sm font-semibold tracking-widest uppercase mb-3"
            style={{ color: "var(--color-accent)" }}
          >
            Member Self-Service
          </p>
          <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-3">My 1-2-1 Calendar</h1>
          <p className="text-white/60 text-sm max-w-md mx-auto">
            Log in to see all your scheduled 1-2-1 meetings.
          </p>
        </section>
        <MemberPageGate
          title="My 1-2-1 Calendar"
          description="Log in with your phone number and meeting place to view your calendar."
        />
      </>
    );
  }

  const calendar = await fetchMy121Calendar(session.id);

  return (
    <My121Client memberId={session.id} initial={calendar} />
  );
}
