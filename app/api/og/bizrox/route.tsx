import { ImageResponse } from "next/og";

export const runtime = "edge";

const FEATURES = [
  { emoji: "📢", label: "Latest Announcements" },
  { emoji: "🙏", label: "Specific Asks & Gives" },
  { emoji: "📣", label: "Promo Content" },
];

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "56px 64px",
          background: "linear-gradient(145deg, #1A1A2E 0%, #241A3E 52%, #7C3AED 130%)",
          fontFamily: "system-ui, -apple-system, Segoe UI, sans-serif",
          color: "white",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            right: -90,
            top: -70,
            width: 420,
            height: 420,
            borderRadius: 999,
            background: "rgba(124,58,237,0.25)",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: -110,
            bottom: -130,
            width: 480,
            height: 480,
            borderRadius: 999,
            background: "rgba(196,181,253,0.12)",
            display: "flex",
          }}
        />

        {/* Header */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10, zIndex: 1 }}>
          <div
            style={{
              display: "flex",
              fontSize: 22,
              fontWeight: 700,
              letterSpacing: 1,
              color: "rgba(255,255,255,0.72)",
            }}
          >
            MIRACLE MEMBERS · CHENNAI
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div
              style={{
                display: "flex",
                fontSize: 72,
                fontWeight: 800,
                letterSpacing: -1,
              }}
            >
              BizRox
            </div>
            <div
              style={{
                display: "flex",
                background: "rgba(124,58,237,0.45)",
                border: "1px solid rgba(167,139,250,0.5)",
                color: "#DDD6FE",
                fontSize: 20,
                fontWeight: 800,
                padding: "8px 18px",
                borderRadius: 999,
              }}
            >
              Member Feed
            </div>
          </div>
        </div>

        {/* Feature rows */}
        <div style={{ display: "flex", flexDirection: "column", gap: 18, zIndex: 1 }}>
          {FEATURES.map((f) => (
            <div key={f.label} style={{ display: "flex", alignItems: "center", gap: 18 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 58,
                  height: 58,
                  borderRadius: 16,
                  background: "rgba(255,255,255,0.1)",
                  border: "1px solid rgba(255,255,255,0.18)",
                  fontSize: 30,
                }}
              >
                {f.emoji}
              </div>
              <div style={{ display: "flex", fontSize: 32, fontWeight: 700 }}>
                {f.label}
              </div>
            </div>
          ))}
          <div
            style={{
              display: "flex",
              fontSize: 24,
              fontWeight: 500,
              color: "rgba(255,255,255,0.75)",
              marginTop: 4,
            }}
          >
            All in one place.
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            zIndex: 1,
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 26,
              fontWeight: 700,
              color: "#C4B5FD",
              maxWidth: 760,
              lineHeight: 1.3,
            }}
          >
            A power-packed tool to take your business to higher visibility.
          </div>
          <div
            style={{
              display: "flex",
              background: "white",
              color: "#7C3AED",
              fontSize: 22,
              fontWeight: 800,
              padding: "14px 28px",
              borderRadius: 999,
            }}
          >
            Visit the feed →
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
