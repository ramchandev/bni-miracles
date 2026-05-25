"use client";

import { useActionState } from "react";
import { saveEmailSettingsAction, type SettingsState } from "@/app/admin/actions/settings";

type Props = {
  initialValues: {
    smtp_host: string | null;
    smtp_port: number | null;
    smtp_user: string | null;
    admin_emails: string | null;
    updated_at: string | null;
  } | null;
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

export default function EmailSettingsForm({ initialValues }: Props) {
  const [state, formAction, isPending] = useActionState<SettingsState, FormData>(
    saveEmailSettingsAction,
    null
  );

  return (
    <form action={formAction} className="flex flex-col gap-6">

      {/* Success / Error banners */}
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

      {/* SMTP Host */}
      <div>
        <label style={labelStyle}>
          SMTP Host
          <span style={{ color: "var(--color-primary)", marginLeft: 2 }}>*</span>
        </label>
        <input
          name="smtp_host"
          type="text"
          placeholder="mail.bnimiracles.in"
          defaultValue={initialValues?.smtp_host ?? ""}
          required
          style={inputStyle}
        />
      </div>

      {/* SMTP Port */}
      <div>
        <label style={labelStyle}>SMTP Port</label>
        <input
          name="smtp_port"
          type="number"
          placeholder="465"
          defaultValue={initialValues?.smtp_port ?? 465}
          style={{ ...inputStyle, width: 120 }}
        />
        <p className="text-xs mt-1" style={{ color: "var(--color-gray)" }}>
          Use 465 for SSL (recommended) or 587 for STARTTLS.
        </p>
      </div>

      {/* Username */}
      <div>
        <label style={labelStyle}>
          SMTP Username
          <span style={{ color: "var(--color-primary)", marginLeft: 2 }}>*</span>
        </label>
        <input
          name="smtp_user"
          type="text"
          placeholder="care@bnimiracles.in"
          defaultValue={initialValues?.smtp_user ?? ""}
          required
          style={inputStyle}
        />
        <p className="text-xs mt-1" style={{ color: "var(--color-gray)" }}>
          This address also appears as the sender (From:) on all notifications.
        </p>
      </div>

      {/* Password */}
      <div>
        <label style={labelStyle}>SMTP Password</label>
        <input
          name="smtp_pass"
          type="password"
          placeholder="Leave blank to keep the existing password"
          autoComplete="new-password"
          style={inputStyle}
        />
        <p className="text-xs mt-1" style={{ color: "var(--color-gray)" }}>
          Only fill this in if you want to change the stored password.
        </p>
      </div>

      {/* Admin Emails */}
      <div>
        <label style={labelStyle}>
          Admin Email(s)
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
          Separate multiple addresses with commas. All listed addresses receive every notification.
        </p>
      </div>

      {/* Footer row: Save + last-updated */}
      <div className="flex items-center gap-4 flex-wrap pt-2">
        <button
          type="submit"
          disabled={isPending}
          className="btn-primary"
          style={{ opacity: isPending ? 0.7 : 1, minWidth: 140 }}
        >
          {isPending ? "Saving…" : "Save Settings"}
        </button>
        <p className="text-xs" style={{ color: "var(--color-gray)" }}>
          Last saved: {formatTimestamp(initialValues?.updated_at ?? null)}
        </p>
      </div>
    </form>
  );
}
