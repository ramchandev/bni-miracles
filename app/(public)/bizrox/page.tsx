import type { Metadata } from "next";
import { fetchPostsAction } from "@/app/actions/bizrox";
import BizRoxFeed from "@/components/bizrox/BizRoxFeed";
import BizRoxSidebar from "@/components/bizrox/BizRoxSidebar";
import MemberPageGate from "@/components/MemberPageGate";
import { getMemberSession } from "@/lib/member-session";

export const metadata: Metadata = {
  title: "BizRox — Miracle Members Member Feed",
  description:
    "BizRox is the Miracle Members member feed — share business needs, offers, and promos. Connect with members directly on WhatsApp.",
};

export const dynamic = "force-dynamic"; // always fresh

export default async function BizRoxPage() {
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
            style={{ background: "rgba(124,58,237,0.25)", color: "#C4B5FD", border: "1px solid rgba(167,139,250,0.3)" }}
          >
            📣 Member Feed
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-3">BizRox</h1>
          <p className="text-white/60 max-w-lg mx-auto text-sm leading-relaxed">
            Log in to post business needs, share promos, and connect with fellow Miracle Members members.
          </p>
        </section>
        <MemberPageGate
          title="BizRox"
          description="Log in with your phone number and meeting place to access the member feed."
        />
      </>
    );
  }

  const { posts, hasMore } = await fetchPostsAction();

  return (
    <>
      {/* Hero */}
      <section
        className="px-6 text-center"
        style={{ background: "var(--color-dark)", paddingTop: 96, paddingBottom: 48 }}
      >
        <div
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-4"
          style={{ background: "rgba(124,58,237,0.25)", color: "#C4B5FD", border: "1px solid rgba(167,139,250,0.3)" }}
        >
          📣 Member Feed
        </div>
        <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-3">BizRox</h1>
        <p className="text-white/60 max-w-lg mx-auto text-sm leading-relaxed">
          Post your business needs, give referrals, share promos, and connect with fellow
          Miracle Members members — all in one place.
        </p>

        {/* Quick stats */}
        <div className="flex items-center justify-center gap-6 mt-6">
          {[
            { label: "Active Members", value: "37+" },
            { label: "Daily Posts",    value: "📝" },
            { label: "WhatsApp Connect", value: "⚡" },
          ].map(({ label, value }) => (
            <div key={label} className="text-center">
              <p className="text-xl font-extrabold text-white">{value}</p>
              <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Feed + Sidebar */}
      <section className="py-10 px-6" style={{ background: "var(--color-bg)" }}>
        <div style={{ maxWidth: 1080, margin: "0 auto" }}>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
            {/* Main feed */}
            <div className="min-w-0">
              <BizRoxFeed initialPosts={posts} initialHasMore={hasMore} />
            </div>
            {/* Right sidebar — hidden on mobile, sticky on desktop */}
            <div className="hidden lg:block">
              <BizRoxSidebar />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
