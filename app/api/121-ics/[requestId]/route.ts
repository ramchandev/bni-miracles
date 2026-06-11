import { NextResponse } from "next/server";
import { generate121IcsAction } from "@/app/actions/one-on-one";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Props = { params: Promise<{ requestId: string }> };

export async function GET(_req: Request, { params }: Props) {
  const { requestId } = await params;
  const result = await generate121IcsAction(requestId);

  if (result.error || !result.content) {
    return new NextResponse(result.error ?? "Not found", { status: 404 });
  }

  return new NextResponse(result.content, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="${result.filename ?? "meeting.ics"}"`,
    },
  });
}
