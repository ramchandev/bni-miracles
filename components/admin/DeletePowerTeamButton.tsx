"use client";

import { useTransition } from "react";
import { deletePowerTeamAction } from "@/app/admin/actions/power-teams";

export default function DeletePowerTeamButton({ id, name }: { id: string; name: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (!confirm(`Delete Power Team "${name}"? Members will be unassigned from this team.`)) return;
        startTransition(() => deletePowerTeamAction(id));
      }}
      className="text-sm font-semibold px-3 py-1.5 rounded-lg"
      style={{ color: "#991B1B", background: "#FEE2E2", opacity: pending ? 0.6 : 1 }}
    >
      {pending ? "Deleting…" : "Delete"}
    </button>
  );
}
