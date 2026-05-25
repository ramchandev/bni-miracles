import nodemailer from "nodemailer";
import { createSupabaseAdminClient } from "./supabase-admin";

/**
 * Reads SMTP settings from the email_settings table (via service-role client)
 * and sends an HTML email to all configured admin addresses.
 *
 * Silently returns if settings are incomplete — form submissions still succeed.
 */
export async function sendAdminEmail(subject: string, html: string): Promise<void> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("email_settings")
    .select("smtp_host, smtp_port, smtp_user, smtp_pass, admin_emails")
    .eq("id", 1)
    .single();

  if (error || !data) return;
  if (!data.smtp_host || !data.smtp_user || !data.smtp_pass || !data.admin_emails) return;

  const to = (data.admin_emails as string)
    .split(",")
    .map((e: string) => e.trim())
    .filter(Boolean)
    .join(", ");

  if (!to) return;

  const port = (data.smtp_port as number) ?? 465;
  const transporter = nodemailer.createTransport({
    host: data.smtp_host as string,
    port,
    secure: port === 465,
    auth: {
      user: data.smtp_user as string,
      pass: data.smtp_pass as string,
    },
  });

  await transporter.sendMail({
    from: `"BNI Miracles" <${data.smtp_user}>`,
    to,
    subject,
    html,
  });
}

/** Shared HTML wrapper matching BNI Miracles brand colours */
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
          <!-- Header -->
          <tr>
            <td style="background:#C8102E;padding:20px 24px;">
              <p style="margin:0;font-size:18px;font-weight:700;color:#fff;">${title}</p>
              <p style="margin:4px 0 0;font-size:12px;color:rgba(255,255,255,0.7);">BNI Miracles · Chennai</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:8px 8px 24px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
                ${rowsHtml}
              </table>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background:#F9FAFB;padding:14px 24px;border-top:1px solid #E5E7EB;">
              <p style="margin:0;font-size:11px;color:#9CA3AF;">
                This is an automated notification from the BNI Miracles website.
                Log in to the <a href="https://bnimiracles.in/admin" style="color:#C8102E;">admin panel</a> to manage submissions.
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
