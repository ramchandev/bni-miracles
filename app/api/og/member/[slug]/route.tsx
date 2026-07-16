import { ImageResponse } from "next/og";
import { createClient } from "@supabase/supabase-js";

export const runtime = "edge";

type Props = { params: Promise<{ slug: string }> };

export async function GET(_req: Request, { params }: Props) {
  const { slug } = await params;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data: member } = await supabase
    .from("members")
    .select("name, business_name, category, profile_picture_url")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  const name = member?.name ?? "Member";
  const business = member?.business_name ?? "Miracle Members";
  const category = member?.category ?? "Business Networking";
  const photoUrl = member?.profile_picture_url?.trim() || null;

  const initials = (() => {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  })();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "linear-gradient(135deg, #1A1A2E 0%, #2A1520 55%, #C8102E 130%)",
          fontFamily: "system-ui, -apple-system, Segoe UI, sans-serif",
          color: "white",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            right: -60,
            top: -40,
            width: 360,
            height: 360,
            borderRadius: 999,
            background: "rgba(245,166,35,0.16)",
            display: "flex",
          }}
        />

        <div
          style={{
            display: "flex",
            width: "100%",
            height: "100%",
            padding: "56px 64px",
            alignItems: "center",
            gap: 56,
            zIndex: 1,
          }}
        >
          <div
            style={{
              display: "flex",
              width: 280,
              height: 280,
              borderRadius: 999,
              overflow: "hidden",
              border: "8px solid rgba(255,255,255,0.2)",
              background: "#C8102E",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            {photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={photoUrl}
                alt=""
                width={280}
                height={280}
                style={{ objectFit: "cover", width: 280, height: 280 }}
              />
            ) : (
              <div style={{ display: "flex", fontSize: 96, fontWeight: 800, color: "white" }}>
                {initials}
              </div>
            )}
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 16,
              flex: 1,
              minWidth: 0,
            }}
          >
            <div
              style={{
                display: "flex",
                fontSize: 20,
                fontWeight: 700,
                letterSpacing: 1.2,
                color: "rgba(255,255,255,0.65)",
              }}
            >
              MIRACLE MEMBERS · CHENNAI
            </div>
            <div
              style={{
                display: "flex",
                alignSelf: "flex-start",
                background: "rgba(200,16,46,0.35)",
                border: "1px solid rgba(255,107,138,0.45)",
                color: "#FFB4C2",
                fontSize: 20,
                fontWeight: 700,
                padding: "8px 18px",
                borderRadius: 999,
              }}
            >
              {category}
            </div>
            <div
              style={{
                display: "flex",
                fontSize: 58,
                fontWeight: 800,
                lineHeight: 1.1,
                letterSpacing: -1,
              }}
            >
              {name}
            </div>
            <div
              style={{
                display: "flex",
                fontSize: 30,
                fontWeight: 600,
                color: "#F5A623",
              }}
            >
              {business}
            </div>
            <div
              style={{
                display: "flex",
                marginTop: 8,
                fontSize: 22,
                fontWeight: 600,
                color: "rgba(255,255,255,0.75)",
              }}
            >
              View profile · Schedule a 1-2-1
            </div>
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
