"use server";

import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { getMemberSession } from "@/lib/member-session";

/**
 * Uploads a file to the `bizrox-media` Supabase Storage bucket using the
 * service-role key (bypasses RLS). Called from PostComposer via FormData.
 */
export async function uploadBizRoxImageAction(
  formData: FormData
): Promise<{ url?: string; error?: string }> {
  const member = await getMemberSession();
  if (!member) return { error: "Please log in to upload images." };

  const file = formData.get("file") as File | null;
  if (!file || file.size === 0) return { error: "No file provided." };

  const MAX_MB = 8;
  if (file.size > MAX_MB * 1024 * 1024) {
    return { error: `File too large — max ${MAX_MB} MB.` };
  }

  const ext      = (file.name.split(".").pop() ?? "jpg").toLowerCase();
  const allowed  = ["jpg", "jpeg", "png", "webp", "gif"];
  if (!allowed.includes(ext)) return { error: "Only JPG, PNG, WEBP, or GIF allowed." };

  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  // Convert File → ArrayBuffer → Buffer (needed in Node.js runtime)
  const bytes  = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const admin = createSupabaseAdminClient();

  const { error: uploadError } = await admin.storage
    .from("bizrox-media")
    .upload(fileName, buffer, {
      contentType: file.type || "image/jpeg",
      upsert: true,
    });

  if (uploadError) return { error: uploadError.message };

  const { data: { publicUrl } } = admin.storage
    .from("bizrox-media")
    .getPublicUrl(fileName);

  return { url: publicUrl };
}
