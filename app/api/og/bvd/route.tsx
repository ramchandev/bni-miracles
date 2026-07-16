import { ImageResponse } from "next/og";

export const runtime = "edge";

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
          background: "linear-gradient(145deg, #1A1A2E 0%, #2A1520 48%, #C8102E 120%)",
          fontFamily: "system-ui, -apple-system, Segoe UI, sans-serif",
          color: "white",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            right: -80,
            top: -60,
            width: 420,
            height: 420,
            borderRadius: 999,
            background: "rgba(245,166,35,0.18)",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: -100,
            bottom: -120,
            width: 480,
            height: 480,
            borderRadius: 999,
            background: "rgba(200,16,46,0.28)",
            display: "flex",
          }}
        />

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            zIndex: 1,
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
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
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div
                style={{
                  display: "flex",
                  background: "#F5A623",
                  color: "#1A1A2E",
                  fontSize: 20,
                  fontWeight: 800,
                  padding: "8px 16px",
                  borderRadius: 999,
                }}
              >
                BVD 2.0
              </div>
              <div
                style={{
                  display: "flex",
                  fontSize: 20,
                  fontWeight: 600,
                  color: "rgba(255,255,255,0.85)",
                }}
              >
                Big Visitor Day
              </div>
            </div>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
              background: "rgba(255,255,255,0.1)",
              border: "1px solid rgba(255,255,255,0.18)",
              borderRadius: 20,
              padding: "16px 22px",
            }}
          >
            <div style={{ display: "flex", fontSize: 16, color: "rgba(255,255,255,0.65)", fontWeight: 600 }}>
              DATE
            </div>
            <div style={{ display: "flex", fontSize: 36, fontWeight: 800, color: "#F5A623" }}>
              13 Aug
            </div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 22, zIndex: 1, maxWidth: 980 }}>
          <div
            style={{
              display: "flex",
              fontSize: 48,
              fontWeight: 800,
              lineHeight: 1.15,
              letterSpacing: -0.5,
            }}
          >
            Invites you to change the way you do business.
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 28,
              fontWeight: 500,
              lineHeight: 1.35,
              color: "rgba(255,255,255,0.88)",
            }}
          >
            Meet 37+ entrepreneurs under one roof to take your business to the next level.
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 22,
              fontWeight: 500,
              color: "rgba(255,255,255,0.7)",
            }}
          >
            Venue will be texted to you after registration.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            zIndex: 1,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            {["Register", "Participate", "Grow!"].map((label, i) => (
              <div key={label} style={{ display: "flex", alignItems: "center", gap: 14 }}>
                {i > 0 && (
                  <div
                    style={{
                      display: "flex",
                      width: 10,
                      height: 10,
                      borderRadius: 999,
                      background: "#F5A623",
                    }}
                  />
                )}
                <div
                  style={{
                    display: "flex",
                    fontSize: 26,
                    fontWeight: 800,
                    color: i === 2 ? "#F5A623" : "white",
                  }}
                >
                  {label}
                </div>
              </div>
            ))}
          </div>
          <div
            style={{
              display: "flex",
              background: "white",
              color: "#C8102E",
              fontSize: 22,
              fontWeight: 800,
              padding: "14px 28px",
              borderRadius: 999,
            }}
          >
            Reserve your seat →
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
