"use client";

import { useTransition } from "react";
import { deleteGivesAsksCategoryAction } from "@/app/admin/actions/gives-asks-categories";

export default function DeleteGivesAsksCategoryButton({ id, name }: { id: string; name: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (!confirm(`Delete category "${name}"? Existing member selections will keep the label but lose the link.`)) return;
        startTransition(() => deleteGivesAsksCategoryAction(id));
      }}
      className="text-xs px-2.5 py-1 rounded-lg font-semibold"
      style={{ color: "#991B1B", background: "#FEE2E2" }}
    >
      Delete
    </button>
  );
}
