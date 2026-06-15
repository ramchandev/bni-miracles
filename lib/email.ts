import { Resend } from "resend";
import { SITE_URL } from "@/lib/seo";
import { createSupabaseAdminClient } from "./supabase-admin";

type EmailSettings = {
  from_email: string;
  admin_emails: string | null;
};

export type SendEmailResult = { sent: true } | { sent: false; error: string };

export function isResendConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY?.trim());
}

function getResendClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) return null;
  return new Resend(apiKey);
}

async function loadEmailSettings(): Promise<EmailSettings | null> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("email_settings")
    .select("smtp_user, admin_emails")
    .eq("id", 1)
    .single();

  if (error || !data) {
    console.warn("[email] Could not load email_settings:", error?.message ?? "no row");
    return null;
  }

  return {
    from_email: data.smtp_user ? String(data.smtp_user).trim() : "",
    admin_emails: data.admin_emails ? String(data.admin_emails) : null,
  };
}

function resolveFromAddress(settings: EmailSettings | null): string {
  const fromEnv = process.env.EMAIL_FROM?.trim();
  if (fromEnv) return fromEnv;

  const fromDb = settings?.from_email?.trim();
  if (fromDb) return `"Miracle Members" <${fromDb}>`;

  return '"Miracle Members" <onboarding@resend.dev>';
}

function htmlToPlainText(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<\/tr>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function normalizeRecipients(to: string | string[]): string[] {
  return (Array.isArray(to) ? to : [to])
    .map((e) => e.trim())
    .filter((e) => e.includes("@"));
}

/**
 * Sends a single email via Resend.
 */
export async function sendEmail(
  to: string | string[],
  subject: string,
  html: string
): Promise<SendEmailResult> {
  const recipients = normalizeRecipients(to);
  if (recipients.length === 0) {
    return { sent: false, error: "No valid recipient address." };
  }

  const resend = getResendClient();
  if (!resend) {
    return {
      sent: false,
      error: "RESEND_API_KEY is not set. Add it to .env.local and Vercel environment variables.",
    };
  }

  const settings = await loadEmailSettings();
  const from = resolveFromAddress(settings);

  try {
    const { data, error } = await resend.emails.send({
      from,
      to: recipients,
      subject,
      html,
      text: htmlToPlainText(html),
    });

    if (error) {
      console.error("[sendEmail] Resend error:", error.message);
      return { sent: false, error: error.message };
    }

    console.info("[sendEmail] Sent to", recipients.join(", "), "id:", data?.id);
    return { sent: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[sendEmail] Failed:", message);
    return { sent: false, error: message };
  }
}

/** Pre-flight check before sending a test email. */
export async function verifyEmailDelivery(): Promise<SendEmailResult> {
  if (!isResendConfigured()) {
    return { sent: false, error: "RESEND_API_KEY is not set." };
  }

  const settings = await loadEmailSettings();
  const from = resolveFromAddress(settings);
  if (!from.includes("@")) {
    return {
      sent: false,
      error: "Set a sender address in admin settings (must be on your verified Resend domain).",
    };
  }

  if (!settings?.admin_emails?.trim()) {
    return { sent: false, error: "No admin notification emails configured." };
  }

  return { sent: true };
}

/** Sends an HTML email to all configured admin addresses. */
export async function sendAdminEmail(subject: string, html: string): Promise<SendEmailResult> {
  const settings = await loadEmailSettings();
  if (!settings?.admin_emails) {
    console.warn("[sendAdminEmail] No admin_emails configured");
    return { sent: false, error: "No admin_emails configured." };
  }

  const to = settings.admin_emails
    .split(",")
    .map((e) => e.trim())
    .filter(Boolean);

  if (to.length === 0) {
    return { sent: false, error: "No admin_emails configured." };
  }

  return sendEmail(to, subject, html);
}

/** Sends an HTML email to a specific member's address. */
export async function sendMemberEmail(
  to: string,
  subject: string,
  html: string
): Promise<SendEmailResult> {
  return sendEmail(to.trim(), subject, html);
}

/** Shared HTML wrapper matching Miracle Members brand colours */
export function emailTemplate(title: string, rows: { label: string; value: string }[]): string {
  const rowsHtml = rows
    .map(
      (r) => `
      <tr>
        <td style="padding:10px 16px;font-size:13px;font-weight:600;color:#6B7280;white-space:nowrap;width:140px;vertical-align:top;">
          ${r.label}
        </td>
        <td style="padding:10px 16px;font-size:14px;color:#111827;vertical-align:top;">
          ${r.value}
        </td>
      </tr>`
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F3F4F6;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">
          <tr>
            <td style="background:#C8102E;padding:20px 24px;">
              <p style="margin:0;font-size:18px;font-weight:700;color:#fff;">${title}</p>
              <p style="margin:4px 0 0;font-size:12px;color:rgba(255,255,255,0.7);">Miracle Members · Chennai</p>
            </td>
          </tr>
          <tr>
            <td style="padding:8px 8px 24px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
                ${rowsHtml}
              </table>
            </td>
          </tr>
          <tr>
            <td style="background:#F9FAFB;padding:14px 24px;border-top:1px solid #E5E7EB;">
              <p style="margin:0;font-size:11px;color:#9CA3AF;">
                This is an automated notification from the Miracle Members website.
                Log in to the <a href="${SITE_URL}/admin" style="color:#C8102E;">admin panel</a> to manage submissions.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
