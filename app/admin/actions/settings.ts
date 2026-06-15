"use server";

import { createSupabaseServerClient } from "@/lib/supabase-server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { emailTemplate, sendAdminEmail, verifyEmailDelivery } from "@/lib/email";
import { revalidatePath } from "next/cache";

export type SettingsState = { success?: boolean; error?: string } | null;

async function requireAdmin() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "You must be logged in." } as const;
  return { user } as const;
}

export async function saveEmailSettingsAction(
  _prev: SettingsState,
  formData: FormData
): Promise<SettingsState> {
  const auth = await requireAdmin();
  if ("error" in auth) return { error: auth.error };

  const fromEmail = (formData.get("from_email") as string).trim().toLowerCase();
  const adminEmails = (formData.get("admin_emails") as string).trim();

  if (!fromEmail.includes("@")) {
    return { error: "Please enter a valid sender email address." };
  }

  const admin = createSupabaseAdminClient();
  const { error } = await admin
    .from("email_settings")
    .upsert({
      id: 1,
      smtp_user: fromEmail,
      admin_emails: adminEmails,
      updated_at: new Date().toISOString(),
    });

  if (error) return { error: error.message };

  revalidatePath("/admin/settings");
  return { success: true };
}

export async function sendTestEmailAction(): Promise<SettingsState> {
  const auth = await requireAdmin();
  if ("error" in auth) return { error: auth.error };

  const verify = await verifyEmailDelivery();
  if (!verify.sent) {
    return { error: verify.error };
  }

  const result = await sendAdminEmail(
    "✅ Miracle Members — Test Email",
    emailTemplate("Test Email", [
      { label: "Status", value: "Email delivery is working correctly via Resend." },
      { label: "Sent at", value: new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }) },
    ])
  );

  if (!result.sent) {
    return { error: result.error };
  }

  return { success: true };
}
