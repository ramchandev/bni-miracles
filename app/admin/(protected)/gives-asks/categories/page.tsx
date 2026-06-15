import type { Metadata } from "next";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import DeleteGivesAsksCategoryButton from "@/components/admin/DeleteGivesAsksCategoryButton";
import { typeLabel } from "@/lib/gives-asks-categories";
import type { GivesAsksCategory } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Gives & Asks Categories — Miracle Members Admin" };

export default async function GivesAsksCategoriesPage() {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("gives_asks_categories")
    .select("*")
    .order("sort_order");

  const rows = (data ?? []) as GivesAsksCategory[];

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Link href="/admin/gives-asks" className="text-sm font-semibold" style={{ color: "var(--color-primary)" }}>
              ← Gives &amp; Asks
            </Link>
          </div>
          <h1 className="text-2xl font-extrabold" style={{ color: "var(--color-dark)" }}>
            Gives &amp; Asks Categories
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--color-gray)" }}>
            Options members pick when adding referral gives and asks.
          </p>
        </div>
        <Link href="/admin/gives-asks/categories/new" className="btn-primary text-sm">
          + Add Category
        </Link>
      </div>

      {rows.length === 0 ? (
        <div className="card p-8 text-center">
          <p className="text-4xl mb-3">🏷️</p>
          <p className="font-semibold mb-2" style={{ color: "var(--color-dark)" }}>
            No categories yet
          </p>
          <Link href="/admin/gives-asks/categories/new" className="btn-primary text-sm">
            Create Category
          </Link>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr style={{ background: "#F9FAFB", borderBottom: "1px solid #E5E7EB" }}>
                {["Order", "Category", "Applies To", "Status", "Actions"].map((h, j) => (
                  <th
                    key={h}
                    className={`px-4 py-3 text-xs font-semibold uppercase tracking-wide ${
                      j === 4 ? "text-right" : "text-left"
                    }`}
                    style={{ color: "var(--color-gray)" }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr
                  key={row.id}
                  style={{ borderBottom: i < rows.length - 1 ? "1px solid #F3F4F6" : "none" }}
                >
                  <td className="px-4 py-3 text-sm" style={{ color: "var(--color-gray)" }}>
                    {row.sort_order}
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold" style={{ color: "var(--color-dark)" }}>
                    {row.name}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="text-xs font-semibold px-2 py-0.5 rounded-full"
                      style={{
                        background:
                          row.type === "give" ? "#DCFCE7" : row.type === "ask" ? "#FEE2E2" : "#EDE9FE",
                        color: row.type === "give" ? "#166534" : row.type === "ask" ? "#991B1B" : "#5B21B6",
                      }}
                    >
                      {typeLabel(row.type)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="text-xs font-semibold px-2 py-0.5 rounded-full"
                      style={{
                        background: row.is_active ? "#DCFCE7" : "#F3F4F6",
                        color: row.is_active ? "#166534" : "#6B7280",
                      }}
                    >
                      {row.is_active ? "Active" : "Hidden"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Link
                        href={`/admin/gives-asks/categories/${row.id}/edit`}
                        className="text-sm font-semibold px-3 py-1.5 rounded-lg"
                        style={{ color: "var(--color-primary)", background: "#FEE2E2" }}
                      >
                        Edit
                      </Link>
                      <DeleteGivesAsksCategoryButton id={row.id} name={row.name} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
