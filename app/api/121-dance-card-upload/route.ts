import { NextResponse } from "next/server";
import { uploadGuestDanceCardPdf } from "@/lib/121-dance-card-upload";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file provided." }, { status: 400 });
    }

    const result = await uploadGuestDanceCardPdf(file);
    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ path: result.path });
  } catch (err) {
    console.error("[121-dance-card-upload]", err);
    return NextResponse.json({ error: "Upload failed." }, { status: 500 });
  }
}
