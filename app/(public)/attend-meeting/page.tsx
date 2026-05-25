import MeetingForm from "@/components/MeetingForm";
import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import { breadcrumbJsonLd, createPageMetadata, eventJsonLd } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Attend a Meeting — Book Your Seat",
  description:
    "Book your seat at a BNI Miracles Thursday meeting in Chennai. Free for first-time visitors online. Hybrid format — attend in person or on Zoom.",
  path: "/attend-meeting",
  keywords: ["attend BNI meeting Chennai", "BNI visitor", "Thursday networking Chennai"],
});

export default function AttendMeetingPage() {
  return (
    <>
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Attend a Meeting", path: "/attend-meeting" },
          ]),
          eventJsonLd(),
        ]}
      />
      {/* Hero */}
      <section
        className="py-24 px-6 text-center"
        style={{ background: "var(--color-dark)", paddingTop: 120 }}
      >
        <p className="text-sm font-semibold tracking-widest uppercase mb-3" style={{ color: "var(--color-accent)" }}>
          Every Thursday
        </p>
        <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-4">
          Attend a BNI Miracles Meeting
        </h1>
        <p className="text-lg text-white/70 max-w-xl mx-auto">
          Experience the power of structured business networking — free for first-time visitors.
        </p>
      </section>

      {/* Content */}
      <section className="py-16 px-6" style={{ background: "var(--color-bg)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }} className="grid md:grid-cols-2 gap-12">
          {/* Meeting Info */}
          <div>
            <h2 className="text-2xl font-bold mb-6" style={{ color: "var(--color-dark)" }}>
              Meeting Details
            </h2>
            <div className="flex flex-col gap-5 mb-8">
              {[
                { icon: "📅", label: "When", value: "Every Thursday" },
                { icon: "🕖", label: "Time", value: "7:30 AM – 9:40 AM" },
                { icon: "📍", label: "Venue (Physical)", value: "Chennai — WhatsApp us for exact location" },
                { icon: "💻", label: "Online", value: "Zoom link sent after registration" },
                { icon: "💰", label: "Cost for Visitors", value: "Online is Free and just breakfast fee for In person meeting." },
              ].map((item) => (
                <div key={item.label} className="flex items-start gap-4 p-4 rounded-xl bg-white">
                  <span className="text-2xl">{item.icon}</span>
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wide mb-0.5" style={{ color: "var(--color-primary)" }}>
                      {item.label}
                    </div>
                    <div className="font-semibold" style={{ color: "var(--color-dark)" }}>{item.value}</div>
                  </div>
                </div>
              ))}
            </div>

            <h3 className="text-lg font-bold mb-4" style={{ color: "var(--color-dark)" }}>
              What to Expect
            </h3>
            <ul className="flex flex-col gap-3">
              {[
                "A warm welcome from our chapter members",
                "60-second business presentations from 35+ professionals",
                "Structured referral passing — real business connections",
                "A featured 10-minute business presentation",
                "BNI education slot with practical takeaways",
                "Post-meeting networking over refreshments",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm" style={{ color: "var(--color-gray)" }}>
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    className="flex-shrink-0 mt-0.5"
                    stroke="var(--color-primary)"
                    strokeWidth="2.5"
                  >
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                  {item}
                </li>
              ))}
            </ul>

            <div className="mt-8 p-5 rounded-xl" style={{ background: "#FEF3C7" }}>
              <p className="text-sm font-semibold mb-1" style={{ color: "#92400E" }}>Have questions?</p>
              <a
                href="https://wa.me/919841767641"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm font-bold"
                style={{ color: "#15803D" }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="#25D366">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                WhatsApp +91 98417 67641
              </a>
            </div>
          </div>

          {/* Form */}
          <div>
            <div className="card p-8">
              <h2 className="text-2xl font-bold mb-2" style={{ color: "var(--color-dark)" }}>
                Book Your Seat
              </h2>
              <p className="text-sm mb-6" style={{ color: "var(--color-gray)" }}>
                Fill in your details and we&apos;ll send you the meeting info via WhatsApp.
              </p>
              <MeetingForm />
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-12 px-6 text-center" style={{ background: "var(--color-primary)" }}>
        <p className="text-white/90 font-semibold mb-2">Already a member? Or want to know more?</p>
        <Link href="/about" className="btn-secondary text-sm">
          Learn About BNI Miracles
        </Link>
      </section>
    </>
  );
}
