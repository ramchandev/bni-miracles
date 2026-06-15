"use client";

import { useActionState, useState, useTransition } from "react";
import { saveEmailSettingsAction, sendTestEmailAction, type SettingsState } from "@/app/admin/actions/settings";

type Props = {
  initialValues: {
    smtp_user: string | null;
    admin_emails: string | null;
    updated_at: string | null;
  } | null;
  resendConfigured: boolean;
};

const inputStyle = {
  width: "100%",
  padding: "0.65rem 0.9rem",
  borderRadius: 8,
  border: "1.5px solid #E5E7EB",
  fontSize: 14,
  outline: "none",
  background: "#fff",
} as const;

const labelStyle = {
  display: "block",
  fontSize: 13,
  fontWeight: 600,
  marginBottom: 4,
  color: "var(--color-dark)",
} as const;

function formatTimestamp(ts: string | null): string {
  if (!ts) return "Never";
  return new Date(ts).toLocaleString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export default function EmailSettingsForm({ initialValues, resendConfigured }: Props) {
  const [state, formAction, isPending] = useActionState<SettingsState, FormData>(
    saveEmailSettingsAction,
    null
  );
  const [testState, setTestState] = useState<SettingsState>(null);
  const [isTesting, startTest] = useTransition();

  const runTestEmail = () => {
    setTestState(null);
    startTest(async () => {
      const result = await sendTestEmailAction();
      setTestState(result);
    });
  };

  return (
    <form action={formAction} className="flex flex-col gap-6">
      {state?.success && (
        <div
          className="flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium"
          style={{ background: "#DCFCE7", color: "#166534" }}
        >
          <span>✅</span> Settings saved successfully.
        </div>
      )}
      {state?.error && (
        <div
          className="flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium"
          style={{ background: "#FEE2E2", color: "#991B1B" }}
        >
          <span>❌</span> {state.error}
        </div>
      )}

      <div
        className="px-4 py-3 rounded-lg text-sm"
        style={{
          background: resendConfigured ? "#DCFCE7" : "#FEE2E2",
          color: resendConfigured ? "#166534" : "#991B1B",
          border: `1px solid ${resendConfigured ? "#BBF7D0" : "#FECACA"}`,
        }}
      >
        {resendConfigured ? (
          <p>
            <strong>Resend is connected.</strong> Emails send via HTTPS and work on Vercel.
          </p>
        ) : (
          <p>
            <strong>Resend API key missing.</strong> Add{" "}
            <code className="font-mono text-xs">RESEND_API_KEY</code> to{" "}
            <code className="font-mono text-xs">.env.local</code> (local) and Vercel environment
            variables (production), then restart or redeploy.
          </p>
        )}
      </div>

      {testState?.success && (
        <div
          className="flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium"
          style={{ background: "#DCFCE7", color: "#166534" }}
        >
          <span>✅</span> Test email sent to your admin address(es). Check inbox and spam.
        </div>
      )}
      {testState?.error && (
        <div
          className="flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium"
          style={{ background: "#FEE2E2", color: "#991B1B" }}
        >
          <span>❌</span> {testState.error}
        </div>
      )}

      <div>
        <label style={labelStyle}>
          Sender email (From)
          <span style={{ color: "var(--color-primary)", marginLeft: 2 }}>*</span>
        </label>
        <input
          name="from_email"
          type="email"
          placeholder="care@miraclemembers.in"
          defaultValue={initialValues?.smtp_user ?? ""}
          required
          style={inputStyle}
        />
        <p className="text-xs mt-1" style={{ color: "var(--color-gray)" }}>
          Must be an address on your verified Resend domain (e.g.{" "}
          <code className="font-mono">care@miraclemembers.in</code>).
        </p>
      </div>

      <div>
        <label style={labelStyle}>
          Admin notification email(s)
          <span style={{ color: "var(--color-primary)", marginLeft: 2 }}>*</span>
        </label>
        <textarea
          name="admin_emails"
          placeholder="ram@menkumizhi.com, another@example.com"
          defaultValue={initialValues?.admin_emails ?? ""}
          required
          rows={3}
          style={{ ...inputStyle, resize: "vertical", lineHeight: 1.6 }}
        />
        <p className="text-xs mt-1" style={{ color: "var(--color-gray)" }}>
          Comma-separated. These addresses receive contact forms, meeting registrations, and 1-2-1 alerts.
        </p>
      </div>

      <div className="flex items-center gap-4 flex-wrap pt-2">
        <button
          type="submit"
          disabled={isPending}
          className="btn-primary"
          style={{ opacity: isPending ? 0.7 : 1, minWidth: 140 }}
        >
          {isPending ? "Saving…" : "Save Settings"}
        </button>
        <button
          type="button"
          onClick={runTestEmail}
          disabled={isTesting || isPending || !resendConfigured}
          className="text-sm font-semibold px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-60"
          style={{ color: "var(--color-dark)" }}
        >
          {isTesting ? "Sending test…" : "Send test email"}
        </button>
        <p className="text-xs" style={{ color: "var(--color-gray)" }}>
          Last saved: {formatTimestamp(initialValues?.updated_at ?? null)}
        </p>
      </div>
    </form>
  );
}
