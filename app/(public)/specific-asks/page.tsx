import SpecificAsksBoard from "@/components/specific-asks/SpecificAsksBoard";
import { getMemberSession } from "@/lib/member-session";
import { canTrackSpecificAsks } from "@/lib/specific-asks-permissions";
import { fetchSpecificAsksBoard } from "@/lib/specific-asks-server";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Specific Asks",
  description:
    "Specific asks raised at Miracle Members meetings — who is asking, who can connect, and whether the introduction has been made.",
  path: "/specific-asks",
  keywords: ["specific ask", "referral tracking", "Miracle Members"],
});

export const dynamic = "force-dynamic";

export default async function SpecificAsksPage({
  searchParams,
}: {
  searchParams: Promise<{ ask?: string }>;
}) {
  const { ask } = await searchParams;
  const session = await getMemberSession();
  const [board, canTrack] = await Promise.all([
    fetchSpecificAsksBoard(),
    canTrackSpecificAsks(session?.id ?? null),
  ]);

  return (
    <>
      <section
        className="px-6 text-center"
        style={{ background: "var(--color-dark)", paddingTop: 96, paddingBottom: 40 }}
      >
        <p
          className="text-sm font-semibold tracking-widest uppercase mb-3"
          style={{ color: "var(--color-accent)" }}
        >
          Referral Coordinator
        </p>
        <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-3">Specific Asks</h1>
        <p className="text-white/60 text-sm max-w-lg mx-auto leading-relaxed">
          Asks raised in the meeting room. Anyone can follow them. Logged-in members can offer a connection, and the member who asked can update the status.
        </p>
      </section>
      <section className="px-4 sm:px-6 py-8" style={{ background: "#F3F4F6" }}>
        <SpecificAsksBoard
          meetings={board.meetings}
          asksByDate={board.asksByDate}
          members={board.members}
          canTrack={canTrack}
          highlightAskId={ask ?? null}
          setupError={board.setupError}
        />
      </section>
    </>
  );
}
