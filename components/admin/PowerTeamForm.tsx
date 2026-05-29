"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { savePowerTeamAction } from "@/app/admin/actions/power-teams";
import RichTextEditor from "@/components/admin/RichTextEditor";
import { POWER_TEAM_COLOR_PRESETS } from "@/lib/power-teams";
import type { PowerTeam } from "@/lib/supabase";

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
      {pending ? "Saving…" : isEdit ? "Save Team" : "Create Team"}
    </button>
  );
}

type Props = {
  team?: PowerTeam | null;
};

export default function PowerTeamForm({ team }: Props) {
  const [state, formAction] = useActionState(savePowerTeamAction, null);

  return (
    <form action={formAction} className="card p-6 flex flex-col gap-5">
      {team?.id && <input type="hidden" name="id" value={team.id} />}

      {state?.error && (
        <div className="px-4 py-3 rounded-lg text-sm font-medium" style={{ background: "#FEE2E2", color: "#991B1B" }}>
          {state.error}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-5">
        <div>
          <label style={labelStyle}>
            Team Name <span style={{ color: "var(--color-primary)" }}>*</span>
          </label>
          <input name="name" type="text" required defaultValue={team?.name ?? ""} placeholder="e.g. Build & Beautify" style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Focus Area (short tagline)</label>
          <input
            name="focus_area"
            type="text"
            defaultValue={team?.focus_area ?? ""}
            placeholder="e.g. Serving home owners & developers"
            style={inputStyle}
          />
        </div>
        <div className="md:col-span-2">
          <label style={labelStyle}>URL slug</label>
          <input
            name="slug"
            type="text"
            defaultValue={team?.slug ?? ""}
            placeholder="e.g. build-and-beautify"
            pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
            style={inputStyle}
          />
          <p className="text-xs mt-1" style={{ color: "var(--color-gray)" }}>
            Public page:{" "}
            <code className="text-xs">
              /power-team/{team?.slug ? team.slug : "your-slug"}
            </code>
            . Leave blank to generate from the team name.
          </p>
        </div>
      </div>

      <div>
        <label style={labelStyle}>Description (why this team works)</label>
        <p className="text-xs mb-2" style={{ color: "var(--color-gray)" }}>
          Use the toolbar for bullet points, bold text, and headings.
        </p>
        <RichTextEditor
          name="description"
          defaultValue={team?.description ?? ""}
          placeholder="Explain the shared client base and referral synergy…"
        />
      </div>

      <div className="grid md:grid-cols-3 gap-5">
        <div>
          <label style={labelStyle}>Emoji</label>
          <input name="emoji" type="text" defaultValue={team?.emoji ?? "⚡"} style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Accent Colour</label>
          <input name="color" type="color" defaultValue={team?.color ?? "#C8102E"} style={{ ...inputStyle, height: 44, padding: 4 }} />
          <div className="flex flex-wrap gap-2 mt-2">
            {POWER_TEAM_COLOR_PRESETS.map((p) => (
              <span key={p.color} className="text-xs font-mono" style={{ color: p.color }}>
                {p.color}
              </span>
            ))}
          </div>
        </div>
        <div>
          <label style={labelStyle}>Sort Order</label>
          <input name="sort_order" type="number" defaultValue={team?.sort_order ?? 0} style={inputStyle} />
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <SubmitButton isEdit={!!team?.id} />
      </div>
    </form>
  );
}
