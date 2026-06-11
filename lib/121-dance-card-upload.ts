import { randomBytes } from "crypto";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";

export const GUEST_DANCE_CARD_BUCKET = "121-dance-cards";
export const GUEST_DANCE_CARD_MAX_MB = 10;

export async function uploadGuestDanceCardPdf(
  file: File
): Promise<{ path?: string; error?: string }> {
  if (!file || file.size === 0) return { error: "No file provided." };

  if (file.size > GUEST_DANCE_CARD_MAX_MB * 1024 * 1024) {
    return { error: `File too large — max ${GUEST_DANCE_CARD_MAX_MB} MB.` };
  }

  const ext = (file.name.split(".").pop() ?? "").toLowerCase();
  if (ext !== "pdf") return { error: "Only PDF files are allowed." };

  const fileName = `${Date.now()}-${randomBytes(8).toString("hex")}.pdf`;
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const admin = createSupabaseAdminClient();
  const { error: uploadError } = await admin.storage
    .from(GUEST_DANCE_CARD_BUCKET)
    .upload(fileName, buffer, {
      contentType: "application/pdf",
      upsert: false,
    });

  if (uploadError) return { error: uploadError.message };
  return { path: fileName };
}
