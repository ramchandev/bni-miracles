import nodemailer from "nodemailer";
import type SMTPTransport from "nodemailer/lib/smtp-transport";
import { createSupabaseAdminClient } from "./supabase-admin";

type EmailSettings = {
  smtp_host: string;
  smtp_port: number;
  smtp_user: string;
  smtp_pass: string;
  admin_emails: string | null;
};

export type SendEmailResult = { sent: true } | { sent: false; error: string };

async function loadEmailSettings(): Promise<EmailSettings | null> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("email_settings")
    .select("smtp_host, smtp_port, smtp_user, smtp_pass, admin_emails")
    .eq("id", 1)
    .single();

  if (error || !data) {
    console.warn("[email] Could not load email_settings:", error?.message ?? "no row");
    return null;
  }

  if (!data.smtp_host || !data.smtp_user || !data.smtp_pass) {
    console.warn("[email] SMTP settings incomplete — configure in admin → Settings");
    return null;
  }

  return {
    smtp_host: String(data.smtp_host).trim(),
    smtp_port: Number(data.smtp_port) || 465,
    smtp_user: String(data.smtp_user).trim(),
    smtp_pass: String(data.smtp_pass),
    admin_emails: data.admin_emails ? String(data.admin_emails) : null,
  };
}

function createSmtpTransporter(settings: EmailSettings) {
  const port = settings.smtp_port;
  const transport: SMTPTransport.Options = {
    host: settings.smtp_host,
    port,
    secure: port === 465,
    auth: {
      user: settings.smtp_user,
      pass: settings.smtp_pass,
    },
    tls: {
      // cPanel / shared hosting often uses certs that fail strict Node verification
      rejectUnauthorized: false,
      minVersion: "TLSv1.2",
    },
    connectionTimeout: 25_000,
    greetingTimeout: 25_000,
    socketTimeout: 25_000,
  };

  if (port === 587) {
    transport.secure = false;
    transport.requireTLS = true;
  }

  return nodemailer.createTransport(transport);
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

function normalizeRecipients(to: string | string[]): string {
  const list = (Array.isArray(to) ? to : [to])
    .map((e) => e.trim())
    .filter((e) => e.includes("@"));
  return list.join(", ");
}

/**
 * Sends a single email using SMTP settings from email_settings.
 */
export async function sendEmail(
  to: string | string[],
  subject: string,
  html: string
): Promise<SendEmailResult> {
  const recipients = normalizeRecipients(to);
  if (!recipients) {
    return { sent: false, error: "No valid recipient address." };
  }

  const settings = await loadEmailSettings();
  if (!settings) {
    return { sent: false, error: "SMTP settings are not configured." };
  }

  try {
    const transporter = createSmtpTransporter(settings);
    const fromAddress = settings.smtp_user;

    await transporter.verify();

    const info = await transporter.sendMail({
      from: `"BNI Miracles" <${fromAddress}>`,
      replyTo: fromAddress,
      to: recipients,
      subject,
      html,
      text: htmlToPlainText(html),
    });

    console.info(
      "[sendEmail] Sent to",
      recipients,
      "from",
      fromAddress,
      ":",
      info.messageId ?? info.response
    );
    return { sent: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[sendEmail] Failed to send to", recipients, ":", message);
    return { sent: false, error: message };
  }
}

/**
 * Sends an HTML email to all configured admin addresses.
 */
export async function sendAdminEmail(subject: string, html: string): Promise<SendEmailResult> {
  const settings = await loadEmailSettings();
  if (!settings?.admin_emails) {
    console.warn("[sendAdminEmail] No admin_emails configured");
    return { sent: false, error: "No admin_emails configured." };
  }

  const to = settings.admin_emails
    .split(",")
    .map((e) => e.trim())
    .filter(Boolean)
    .join(", ");

  if (!to) {
    return { sent: false, error: "No admin_emails configured." };
  }

  return sendEmail(to, subject, html);
}

/**
 * Sends an HTML email to a specific member's address.
 */
export async function sendMemberEmail(
  to: string,
  subject: string,
  html: string
): Promise<SendEmailResult> {
  return sendEmail(to.trim(), subject, html);
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
