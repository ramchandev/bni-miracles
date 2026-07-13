"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { createSupabaseServerClient } from "@/lib/supabase-server";

async function requireAdmin() {
  const client = await createSupabaseServerClient();
  const {
    data: { user },
  } = await client.auth.getUser();
  if (!user) return { error: "You must be logged in." } as const;
  return { user } as const;
}

export async function updateBvdSettingsAction(
  formData: FormData
): Promise<{ success?: boolean; error?: string }> {
  const auth = await requireAdmin();
  if ("error" in auth) return { error: auth.error };

  const event_date = String(formData.get("event_date") ?? "").trim();
  const breakfast_amount = Number(formData.get("breakfast_amount"));
  const notification_emails = String(formData.get("notification_emails") ?? "").trim();
  const chairman_member_id = String(formData.get("chairman_member_id") ?? "").trim() || null;
  const co_chairman_member_id =
    String(formData.get("co_chairman_member_id") ?? "").trim() || null;

  if (!event_date) return { error: "Event date is required." };
  if (!Number.isFinite(breakfast_amount) || breakfast_amount < 0) {
    return { error: "Enter a valid breakfast amount." };
  }

  const admin = createSupabaseAdminClient();
  const { error } = await admin
    .from("bvd_settings")
    .update({
      event_date,
      breakfast_amount,
      notification_emails: notification_emails || null,
      chairman_member_id,
      co_chairman_member_id,
      updated_at: new Date().toISOString(),
    })
    .eq("id", 1);

  if (error) return { error: error.message };

  revalidatePath("/bvd");
  revalidatePath("/admin/bvd");
  revalidatePath("/bvd/registrations");
  return { success: true };
}

export async function uploadBvdQrAction(
  formData: FormData
): Promise<{ url?: string; error?: string }> {
  const auth = await requireAdmin();
  if ("error" in auth) return { error: auth.error };

  const file = formData.get("file") as File | null;
  if (!file || file.size === 0) return { error: "No file provided." };

  const MAX_MB = 5;
  if (file.size > MAX_MB * 1024 * 1024) {
    return { error: `File too large — max ${MAX_MB} MB.` };
  }

  const ext = (file.name.split(".").pop() ?? "png").toLowerCase();
  const allowed = ["jpg", "jpeg", "png", "webp", "gif"];
  if (!allowed.includes(ext)) return { error: "Only JPG, PNG, WEBP, or GIF allowed." };

  const fileName = `qr/payment-qr-${Date.now()}.${ext}`;
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const admin = createSupabaseAdminClient();

  const { error: uploadError } = await admin.storage
    .from("bvd-media")
    .upload(fileName, buffer, {
      contentType: file.type || "image/png",
      upsert: true,
    });

  if (uploadError) return { error: uploadError.message };

  const {
    data: { publicUrl },
  } = admin.storage.from("bvd-media").getPublicUrl(fileName);

  const { error } = await admin
    .from("bvd_settings")
    .update({
      payment_qr_url: publicUrl,
      updated_at: new Date().toISOString(),
    })
    .eq("id", 1);

  if (error) return { error: error.message };

  revalidatePath("/bvd");
  revalidatePath("/admin/bvd");
  return { url: publicUrl };
}
