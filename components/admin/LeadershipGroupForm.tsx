"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { saveLeadershipGroupAction } from "@/app/admin/actions/leadership";
import { LEADERSHIP_GROUP_COLOR_PRESETS } from "@/lib/leadership-colors";
import type { LeadershipGroup } from "@/lib/supabase";

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

function SubmitButton({ isEdit }: { isEdit: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn-primary" style={{ opacity: pending ? 0.7 : 1 }}>
      {pending ? "Saving…" : isEdit ? "Save Group" : "Create Group"}
    </button>
  );
}

type Props = { group?: LeadershipGroup | null };

export default function LeadershipGroupForm({ group }: Props) {
  const [state, formAction] = useActionState(saveLeadershipGroupAction, null);

  return (
    <form action={formAction} className="card p-6 flex flex-col gap-5">
      {group?.id && <input type="hidden" name="id" value={group.id} />}

      {state?.error && (
        <div className="px-4 py-3 rounded-lg text-sm font-medium" style={{ background: "#FEE2E2", color: "#991B1B" }}>
          {state.error}
        </div>
      )}

      <div>
        <label style={labelStyle}>
          Group Name <span style={{ color: "var(--color-primary)" }}>*</span>
        </label>
        <input name="name" type="text" required defaultValue={group?.name ?? ""} placeholder="e.g. Head Table" style={inputStyle} />
      </div>

      <div>
        <label style={labelStyle}>Subtitle (optional)</label>
        <input
          name="subtitle"
          type="text"
          defaultValue={group?.subtitle ?? ""}
          placeholder="e.g. President's Team"
          style={inputStyle}
        />
      </div>

      <div
        className="p-4 rounded-xl"
        style={{ background: "#F9FAFB", border: "1px solid #E5E7EB" }}
      >
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            name="non_members"
            defaultChecked={group?.non_members ?? false}
            className="mt-1 shrink-0"
          />
          <span>
            <span className="block text-sm font-semibold" style={{ color: "var(--color-dark)" }}>
              Non Members
            </span>
            <span className="block text-xs mt-1" style={{ color: "var(--color-gray)", lineHeight: 1.5 }}>
              People who are not chapter members but hold a role. Roles use a name and profile photo
              instead of linking to a member profile.
            </span>
          </span>
        </label>
      </div>

      <div>
        <label style={labelStyle}>Group Colour</label>
        <p className="text-xs mb-2" style={{ color: "var(--color-gray)" }}>
          Used for role cards on the About page and member profiles.
        </p>
        <input
          name="color"
          type="color"
          defaultValue={group?.color ?? "#C8102E"}
          style={{ ...inputStyle, height: 44, padding: 4, maxWidth: 120 }}
        />
        <div className="flex flex-wrap gap-2 mt-2">
          {LEADERSHIP_GROUP_COLOR_PRESETS.map((p) => (
            <span key={p.color} className="text-xs" style={{ color: p.color }}>
              {p.label}
            </span>
          ))}
        </div>
      </div>

      <div>
        <label style={labelStyle}>Sort Order</label>
        <input name="sort_order" type="number" defaultValue={group?.sort_order ?? 0} style={{ ...inputStyle, maxWidth: 120 }} />
      </div>

      <SubmitButton isEdit={!!group?.id} />
    </form>
  );
}
