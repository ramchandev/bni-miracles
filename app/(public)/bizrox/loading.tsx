import BizRoxFeedSkeleton from "@/components/bizrox/BizRoxFeedSkeleton";

export default function BizRoxLoading() {
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
          Loading the member feed…
        </p>
      </section>

      <section className="py-10 px-6" style={{ background: "var(--color-bg)" }}>
        <div style={{ maxWidth: 1080, margin: "0 auto" }}>
          <div className="grid gap-6" style={{ gridTemplateColumns: "minmax(0,1fr) 280px" }}>
            <div>
              <div className="mb-6 animate-pulse">
                <div
                  className="rounded-2xl h-28 bg-white"
                  style={{ border: "1px solid #E5E7EB" }}
                />
              </div>
              <div className="flex flex-wrap gap-2 mb-6 animate-pulse">
                {[72, 64, 64, 72, 110].map((w, i) => (
                  <div
                    key={i}
                    className="h-8 rounded-full bg-gray-200"
                    style={{ width: w }}
                  />
                ))}
              </div>
              <BizRoxFeedSkeleton count={4} />
            </div>
            <div className="hidden lg:block animate-pulse">
              <div
                className="rounded-2xl bg-white p-5 space-y-4"
                style={{ border: "1px solid #E5E7EB" }}
              >
                <div className="h-4 bg-gray-200 rounded w-32" />
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gray-200 shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3 bg-gray-200 rounded w-24" />
                      <div className="h-2.5 bg-gray-100 rounded w-16" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
