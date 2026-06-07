import { NextResponse }           from "next/server";
import fs                          from "fs";
import path                        from "path";
import { createElement }           from "react";
import { getMemberSession }        from "@/lib/member-session";
import { getDanceCardAction,
         markPdfGeneratedAction }  from "@/app/actions/dance-card";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { DanceCardPDF }            from "@/components/dance-card/DanceCardPDF";

// Force Node.js runtime so react-pdf's canvas/buffer APIs are available
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  /* ── Auth ────────────────────────────────────────────────────────── */
  const member = await getMemberSession();
  if (!member) return new NextResponse("Unauthorized", { status: 401 });

  /* ── Fetch data ──────────────────────────────────────────────────── */
  const admin = createSupabaseAdminClient();

  const [card, memberDetail] = await Promise.all([
    getDanceCardAction(member.id),
    admin
      .from("members")
      .select("business_name, category, profile_picture_url")
      .eq("id", member.id)
      .single()
      .then(({ data }) => data),
  ]);

  /* ── Logo as base64 data URL ─────────────────────────────────────── */
  const logoPath   = path.join(process.cwd(), "public", "BNI-Miracles-Logo.png");
  const logoBase64 = `data:image/png;base64,${fs.readFileSync(logoPath).toString("base64")}`;

  /* ── Build PDF element ───────────────────────────────────────────── */
  const generatedAt = new Date().toLocaleDateString("en-IN", {
    day: "numeric", month: "long", year: "numeric",
  });

  const pdfElement = createElement(DanceCardPDF, {
    memberName:    member.name,
    memberInitial: member.name.charAt(0).toUpperCase(),
    category:      memberDetail?.category      ?? "",
    businessName:  memberDetail?.business_name ?? "",
    avatarUrl:     memberDetail?.profile_picture_url
                ?? member.profile_picture_url
                ?? null,
    logoBase64,
    card,
    generatedAt,
    totalPages: 3,
  });

  /* ── Render ──────────────────────────────────────────────────────── */
  // Dynamic import keeps react-pdf out of the module graph during build,
  // which avoids RSC / edge-runtime compatibility warnings.
  const { renderToBuffer } = await import("@react-pdf/renderer");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const nodeBuffer: Buffer = await renderToBuffer(pdfElement as any);

  /* ── Mark generated ──────────────────────────────────────────────── */
  markPdfGeneratedAction(member.id).catch(() => {});

  /* ── Stream PDF to client ────────────────────────────────────────── */
  // Filename: [Name]-Dance-Card-[YYYY-MM-DD-HH-MM].pdf
  const now      = new Date();
  const pad      = (n: number) => String(n).padStart(2, "0");
  const dateTime = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}-${pad(now.getHours())}-${pad(now.getMinutes())}`;
  const safeName = member.name.replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-|-$/g, "");
  const safeSlug = `${safeName}-Dance-Card-${dateTime}`;

  // Node Buffer → ReadableStream (required by NextResponse in App Router)
  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(nodeBuffer);
      controller.close();
    },
  });

  return new NextResponse(stream, {
    status: 200,
    headers: {
      "Content-Type":        "application/pdf",
      "Content-Disposition": `attachment; filename="dance-card-${safeSlug}.pdf"`,
      "Cache-Control":       "no-store",
    },
  });
}
