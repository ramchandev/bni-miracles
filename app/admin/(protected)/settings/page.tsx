import type { Metadata } from "next";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { isResendConfigured } from "@/lib/email";
import EmailSettingsForm from "@/components/admin/EmailSettingsForm";

export const metadata: Metadata = { title: "Settings — Miracle Members Admin" };

export default async function AdminSettingsPage() {
  const supabase = createSupabaseAdminClient();
  const { data } = await supabase
    .from("email_settings")
    .select("smtp_user, admin_emails, updated_at")
    .eq("id", 1)
    .single();

  const resendConfigured = isResendConfigured();

  return (
    <div className="p-8" style={{ maxWidth: 720 }}>
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold mb-1" style={{ color: "var(--color-dark)" }}>
          ⚙️ Settings
        </h1>
        <p className="text-sm" style={{ color: "var(--color-gray)" }}>
          Email notifications are sent via Resend for contact forms, meeting registrations, and 1-2-1 updates.
        </p>
      </div>

      {!resendConfigured && (
        <div
          className="flex gap-3 p-4 rounded-xl mb-6 text-sm"
          style={{ background: "#FEE2E2", border: "1px solid #FECACA", color: "#991B1B" }}
        >
          <span className="text-lg shrink-0">⚠️</span>
          <div>
            <p className="font-semibold mb-1">Add your Resend API key</p>
            <p>
              Set <code className="bg-red-100 px-1 rounded font-mono text-xs">RESEND_API_KEY=re_...</code>{" "}
              in <code className="font-mono text-xs">.env.local</code> and Vercel → Environment Variables,
              then restart the dev server or redeploy.
            </p>
          </div>
        </div>
      )}

      <div
        className="rounded-xl p-8"
        style={{ background: "white", border: "1px solid #E5E7EB" }}
      >
        <h2 className="text-base font-bold mb-6 pb-4" style={{ color: "var(--color-dark)", borderBottom: "1px solid #F3F4F6" }}>
          📧 Resend Email Settings
        </h2>
        <EmailSettingsForm initialValues={data ?? null} resendConfigured={resendConfigured} />
      </div>

      <div
        className="mt-6 rounded-xl p-6 text-sm"
        style={{ background: "#F9FAFB", border: "1px solid #E5E7EB" }}
      >
        <p className="font-semibold mb-3" style={{ color: "var(--color-dark)" }}>
          Setup checklist
        </p>
        <ol className="list-decimal list-inside flex flex-col gap-2" style={{ color: "var(--color-gray)" }}>
          <li>
            Verify <strong>miraclemembers.in</strong> at{" "}
            <a href="https://resend.com/domains" className="underline" target="_blank" rel="noopener noreferrer">
              resend.com/domains
            </a>{" "}
            (add DNS records).
          </li>
          <li>
            Add <code className="bg-gray-100 px-1.5 py-0.5 rounded font-mono text-xs">RESEND_API_KEY</code>{" "}
            to <code className="font-mono text-xs">.env.local</code> and Vercel.
          </li>
          <li>
            Run the <code className="bg-gray-100 px-1.5 py-0.5 rounded font-mono text-xs">email_settings</code>{" "}
            migration in Supabase if needed.
          </li>
          <li>
            Set sender and admin emails below, save, then click <strong>Send test email</strong>.
          </li>
        </ol>
      </div>
    </div>
  );
}
