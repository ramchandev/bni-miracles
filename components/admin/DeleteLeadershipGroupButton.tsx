"use client";

import { useTransition } from "react";
import { deleteLeadershipGroupAction } from "@/app/admin/actions/leadership";

export default function DeleteLeadershipGroupButton({ id, name }: { id: string; name: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (confirm(`Delete group "${name}" and all its roles?`)) {
          startTransition(() => deleteLeadershipGroupAction(id));
        }
      }}
      className="text-sm font-semibold px-3 py-1.5 rounded-lg"
      style={{ color: "#991B1B", background: "#FEE2E2", opacity: pending ? 0.7 : 1 }}
    >
      Delete
    </button>
  );
}
