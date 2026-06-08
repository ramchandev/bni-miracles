"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { updateMemberGiveAskCategoryAction } from "@/app/admin/actions/gives-asks-intelligence";
import GivesAsksCategoryPicker from "@/components/GivesAsksCategoryPicker";
import { categoryAppliesTo } from "@/lib/gives-asks-categories";
import type { GivesAsksCategory } from "@/lib/supabase";

export type GiveAskTableRow = {
  id: string;
  member_name: string;
  member_slug: string;
  member_category: string;
  member_photo: string | null;
  item: string;
  category_id: string | null;
  category_name: string | null;
};

type Props = {
  kind: "give" | "ask";
  rows: GiveAskTableRow[];
  categories: GivesAsksCategory[];
};

function Avatar({ name, photo, size = 28 }: { name: string; photo: string | null; size?: number }) {
  if (photo) {
    return (
      <Image
        src={photo}
        alt={name}
        width={size}
        height={size}
        className="rounded-full object-cover shrink-0"
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <div
      className="flex items-center justify-center rounded-full shrink-0 text-white font-bold"
      style={{ width: size, height: size, background: "var(--color-primary)", fontSize: size * 0.35 }}
    >
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

export default function AllGivesAsksTable({ kind, rows, categories: initialCategories }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [savingId, setSavingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [extraCategories, setExtraCategories] = useState<GivesAsksCategory[]>([]);

  const categories = useMemo(() => {
    const byId = new Map<string, GivesAsksCategory>();
    for (const c of [...initialCategories, ...extraCategories]) {
      byId.set(c.id, c);
    }
    return [...byId.values()];
  }, [initialCategories, extraCategories]);

  const options = categories
    .filter((c) => categoryAppliesTo(c, kind))
    .sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" }));

  const itemLabel = kind === "give" ? "Give" : "Ask";
  const emoji = kind === "give" ? "✅" : "🙏";

  const handleCategoryCreated = (category: GivesAsksCategory) => {
    setExtraCategories((prev) =>
      prev.some((c) => c.id === category.id) ? prev : [...prev, category]
    );
    router.refresh();
  };

  const handleCategoryChange = (rowId: string, categoryId: string) => {
    setError(null);
    setSavingId(rowId);
    startTransition(async () => {
      const result = await updateMemberGiveAskCategoryAction(rowId, categoryId || null);
      setSavingId(null);
      if (result.error) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  };

  if (rows.length === 0) {
    return (
      <p className="text-sm text-center py-8" style={{ color: "var(--color-gray)" }}>
        No {kind === "give" ? "gives" : "asks"} recorded yet.
      </p>
    );
  }

  return (
    <div>
      {error && (
        <div className="px-4 py-3 text-sm font-medium" style={{ background: "#FEE2E2", color: "#991B1B" }}>
          {error}
        </div>
      )}
      <table className="w-full text-sm">
        <thead>
          <tr style={{ background: "#F9FAFB", borderBottom: "1px solid #E5E7EB" }}>
            <th className="text-left px-4 py-3 text-xs font-semibold" style={{ color: "var(--color-gray)" }}>
              Member
            </th>
            <th className="text-left px-4 py-3 text-xs font-semibold" style={{ color: "var(--color-gray)" }}>
              Business Category
            </th>
            <th className="text-left px-4 py-3 text-xs font-semibold" style={{ color: "var(--color-gray)" }}>
              {itemLabel}
            </th>
            <th className="text-left px-4 py-3 text-xs font-semibold min-w-[220px]" style={{ color: "var(--color-gray)" }}>
              Category
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} style={{ borderBottom: "1px solid #F3F4F6", opacity: savingId === row.id ? 0.6 : 1 }}>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <Avatar name={row.member_name} photo={row.member_photo} size={28} />
                  <Link
                    href={`/members/${row.member_slug}`}
                    className="font-semibold hover:underline text-xs"
                    style={{ color: "var(--color-dark)" }}
                  >
                    {row.member_name}
                  </Link>
                </div>
              </td>
              <td className="px-4 py-3 text-xs" style={{ color: "var(--color-gray)" }}>
                {row.member_category}
              </td>
              <td className="px-4 py-3 text-xs" style={{ color: "var(--color-dark)" }}>
                {emoji} {row.item}
              </td>
              <td className="px-4 py-3">
                <GivesAsksCategoryPicker
                  options={options}
                  value={row.category_id ?? ""}
                  onChange={(categoryId) => handleCategoryChange(row.id, categoryId)}
                  disabled={pending && savingId === row.id}
                  placeholder="Search category…"
                  allowCreate
                  defaultCreateType={kind}
                  onCategoryCreated={handleCategoryCreated}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
