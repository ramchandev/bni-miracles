"use server";

import { createSupabaseServerClient } from "@/lib/supabase-server";
import { revalidatePath } from "next/cache";

export type SettingsState = { success?: boolean; error?: string } | null;

export async function saveEmailSettingsAction(
  _prev: SettingsState,
  formData: FormData
): Promise<SettingsState> {
  const supabase = await createSupabaseServerClient();

  const smtp_pass_raw = (formData.get("smtp_pass") as string | null) ?? "";

  // If the password field was left blank (masked placeholder), keep the existing value
  const payload: Record<string, unknown> = {
    smtp_host:    (formData.get("smtp_host") as string).trim(),
    smtp_port:    Number(formData.get("smtp_port") ?? 465),
    smtp_user:    (formData.get("smtp_user") as string).trim(),
    admin_emails: (formData.get("admin_emails") as string).trim(),
    updated_at:   new Date().toISOString(),
  };

  // Only update password if a new value was entered
  if (smtp_pass_raw.trim()) {
    payload.smtp_pass = smtp_pass_raw.trim();
  }

  const { error } = await supabase
    .from("email_settings")
    .update(payload)
    .eq("id", 1);

  if (error) return { error: error.message };

  revalidatePath("/admin/settings");
  return { success: true };
}
