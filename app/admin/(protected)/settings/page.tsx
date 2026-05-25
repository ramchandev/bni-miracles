import type { Metadata } from "next";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import EmailSettingsForm from "@/components/admin/EmailSettingsForm";

export const metadata: Metadata = { title: "Settings — BNI Miracles Admin" };

export default async function AdminSettingsPage() {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("email_settings")
    .select("smtp_host, smtp_port, smtp_user, admin_emails, updated_at")
    .eq("id", 1)
    .single();

  return (
    <div className="p-8" style={{ maxWidth: 720 }}>
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold mb-1" style={{ color: "var(--color-dark)" }}>
          ⚙️ Settings
        </h1>
        <p className="text-sm" style={{ color: "var(--color-gray)" }}>
          Configure email notifications for contact form submissions and meeting registrations.
        </p>
      </div>

      {/* Setup notice if not yet configured */}
      {!data?.smtp_host && (
        <div
          className="flex gap-3 p-4 rounded-xl mb-6 text-sm"
          style={{ background: "#FEF9C3", border: "1px solid #FDE68A", color: "#92400E" }}
        >
          <span className="text-lg shrink-0">⚠️</span>
          <div>
            <p className="font-semibold mb-1">Email not yet configured</p>
            <p>
              Fill in the SMTP details below and ensure{" "}
              <code className="bg-yellow-100 px-1 rounded font-mono text-xs">SUPABASE_SERVICE_ROLE_KEY</code>{" "}
              is set in your <code className="bg-yellow-100 px-1 rounded font-mono text-xs">.env.local</code> file.
              Until then, form submissions are saved to the database but no email notifications are sent.
            </p>
          </div>
        </div>
      )}

      {/* Settings card */}
      <div
        className="rounded-xl p-8"
        style={{ background: "white", border: "1px solid #E5E7EB" }}
      >
        <h2 className="text-base font-bold mb-6 pb-4" style={{ color: "var(--color-dark)", borderBottom: "1px solid #F3F4F6" }}>
          📧 Email &amp; Notification Settings
        </h2>
        <EmailSettingsForm initialValues={data ?? null} />
      </div>

      {/* Help section */}
      <div
        className="mt-6 rounded-xl p-6 text-sm"
        style={{ background: "#F9FAFB", border: "1px solid #E5E7EB" }}
      >
        <p className="font-semibold mb-3" style={{ color: "var(--color-dark)" }}>
          📋 Required one-time setup
        </p>
        <ol className="list-decimal list-inside flex flex-col gap-2" style={{ color: "var(--color-gray)" }}>
          <li>
            Get your{" "}
            <strong>service_role</strong> key from{" "}
            <strong>Supabase → Project Settings → API</strong>.
          </li>
          <li>
            Add <code className="bg-gray-100 px-1.5 py-0.5 rounded font-mono text-xs">SUPABASE_SERVICE_ROLE_KEY=your_key</code>{" "}
            to your <code className="font-mono text-xs">.env.local</code> file and restart the server.
          </li>
          <li>
            Create the <code className="bg-gray-100 px-1.5 py-0.5 rounded font-mono text-xs">email_settings</code> table in Supabase SQL editor (SQL provided in the setup guide).
          </li>
          <li>
            Enter your SMTP credentials below and click <strong>Save Settings</strong>.
          </li>
        </ol>
      </div>
    </div>
  );
}
