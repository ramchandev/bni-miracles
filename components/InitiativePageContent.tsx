import Link from "next/link";

type Props = {
  tamilName: string;
  englishName: string;
  icon: string;
  fullDescription: string[];
};

export default function InitiativePageContent({ tamilName, englishName, icon, fullDescription }: Props) {
  return (
    <>
      {/* Breadcrumb */}
      <div className="pt-24 pb-4 px-6" style={{ background: "var(--color-dark)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <nav className="flex items-center gap-2 text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <span>/</span>
            <Link href="/initiatives" className="hover:text-white transition-colors">Initiatives</Link>
            <span>/</span>
            <span style={{ color: "white" }}>{englishName}</span>
          </nav>
        </div>
      </div>

      {/* Hero */}
      <section className="py-16 px-6 text-center" style={{ background: "var(--color-dark)" }}>
        <div className="text-6xl mb-4">{icon}</div>
        <h1
          className="text-3xl md:text-5xl font-extrabold text-white mb-3"
          style={{ fontFamily: "Noto Sans Tamil, sans-serif" }}
        >
          {tamilName}
        </h1>
        <p className="text-lg font-semibold" style={{ color: "var(--color-accent)" }}>
          {englishName}
        </p>
      </section>

      {/* Description */}
      <section className="py-16 px-6" style={{ background: "var(--color-bg)" }}>
        <div style={{ maxWidth: 820, margin: "0 auto" }}>
          <div className="flex flex-col gap-6">
            {fullDescription.map((para, i) => (
              <p key={i} className="text-base" style={{ color: "var(--color-gray)", lineHeight: 1.9 }}>
                {para}
              </p>
            ))}
          </div>
        </div>
      </section>

      {/* Activity Logs */}
      <section className="py-16 px-6" style={{ background: "white" }}>
        <div style={{ maxWidth: 820, margin: "0 auto" }}>
          <h2 className="text-2xl font-bold mb-6" style={{ color: "var(--color-dark)" }}>
            Activity Logs
          </h2>
          <div
            className="rounded-xl p-8 text-center"
            style={{ background: "var(--color-bg)", border: "2px dashed #E5E7EB" }}
          >
            <p className="text-4xl mb-3">📋</p>
            <p className="font-semibold mb-1" style={{ color: "var(--color-dark)" }}>Coming Soon</p>
            <p className="text-sm" style={{ color: "var(--color-gray)" }}>
              Activity logs and updates for this initiative will be posted here.
            </p>
          </div>
        </div>
      </section>

      {/* Navigation */}
      <section className="py-10 px-6" style={{ background: "var(--color-bg)" }}>
        <div style={{ maxWidth: 820, margin: "0 auto" }} className="flex flex-col sm:flex-row gap-4 justify-between items-center">
          <Link
            href="/initiatives"
            className="flex items-center gap-2 text-sm font-semibold"
            style={{ color: "var(--color-primary)" }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
            Back to Initiatives
          </Link>
          <Link href="/attend-meeting" className="btn-primary text-sm">
            Attend a Meeting
          </Link>
        </div>
      </section>
    </>
  );
}
