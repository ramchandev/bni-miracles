"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { saveGivesAsksCategoryAction } from "@/app/admin/actions/gives-asks-categories";
import type { GivesAsksCategory } from "@/lib/supabase";

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
      {pending ? "Saving…" : isEdit ? "Save Category" : "Create Category"}
    </button>
  );
}

type Props = { category?: GivesAsksCategory | null };

export default function GivesAsksCategoryForm({ category }: Props) {
  const [state, formAction] = useActionState(saveGivesAsksCategoryAction, null);

  return (
    <form action={formAction} className="card p-6 flex flex-col gap-5" style={{ maxWidth: 560 }}>
      {category?.id && <input type="hidden" name="id" value={category.id} />}

      {state?.error && (
        <div className="px-4 py-3 rounded-lg text-sm font-medium" style={{ background: "#FEE2E2", color: "#991B1B" }}>
          {state.error}
        </div>
      )}

      <div>
        <label style={labelStyle}>
          Category Name <span style={{ color: "var(--color-primary)" }}>*</span>
        </label>
        <input
          name="name"
          type="text"
          required
          defaultValue={category?.name ?? ""}
          placeholder="e.g. Home / Property Buyers"
          style={inputStyle}
        />
      </div>

      <div>
        <label style={labelStyle}>Applies To</label>
        <select name="type" defaultValue={category?.type ?? "both"} style={inputStyle}>
          <option value="both">Give &amp; Ask</option>
          <option value="give">Give only</option>
          <option value="ask">Ask only</option>
        </select>
        <p className="text-xs mt-1" style={{ color: "var(--color-gray)" }}>
          Controls which dropdown lists show this category.
        </p>
      </div>

      {category?.id ? (
        <div>
          <label style={labelStyle}>Sort Order</label>
          <input
            name="sort_order"
            type="number"
            defaultValue={category.sort_order}
            style={{ ...inputStyle, maxWidth: 120 }}
          />
        </div>
      ) : (
        <p className="text-xs" style={{ color: "var(--color-gray)" }}>
          Sort order is assigned automatically when you create this category.
        </p>
      )}

      <label className="flex items-center gap-3 cursor-pointer">
        <input type="checkbox" name="is_active" defaultChecked={category?.is_active ?? true} />
        <span className="text-sm font-semibold" style={{ color: "var(--color-dark)" }}>
          Active (visible in member dropdowns)
        </span>
      </label>

      <SubmitButton isEdit={!!category?.id} />
    </form>
  );
}
