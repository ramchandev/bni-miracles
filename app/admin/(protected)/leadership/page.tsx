import type { Metadata } from "next";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import DeleteLeadershipGroupButton from "@/components/admin/DeleteLeadershipGroupButton";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Chapter Leadership — BNI Miracles Admin" };

export default async function AdminLeadershipPage() {
  const supabase = await createSupabaseServerClient();

  const { data: groups } = await supabase
    .from("leadership_groups")
    .select("*, leadership_roles ( id )")
    .order("sort_order");

  const rows = groups ?? [];

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-extrabold" style={{ color: "var(--color-dark)" }}>
            Chapter Leadership
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--color-gray)" }}>
            Manage leadership groups, roles, and member assignments shown on the About page.
          </p>
        </div>
        <Link href="/admin/leadership/groups/new" className="btn-primary text-sm">
          + New Group
        </Link>
      </div>

      {rows.length === 0 ? (
        <div className="card p-8 text-center">
          <p className="text-4xl mb-3">👔</p>
          <p className="font-semibold mb-2" style={{ color: "var(--color-dark)" }}>
            No leadership groups yet
          </p>
          <Link href="/admin/leadership/groups/new" className="btn-primary text-sm">
            Create Group
          </Link>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr style={{ background: "#F9FAFB", borderBottom: "1px solid #E5E7EB" }}>
                {["Order", "Group", "Roles", "Actions"].map((h, j) => (
                  <th
                    key={h}
                    className={`px-4 py-3 text-xs font-semibold uppercase tracking-wide ${
                      j === 3 ? "text-right" : "text-left"
                    }`}
                    style={{ color: "var(--color-gray)" }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((group, i) => {
                const roleCount = (group.leadership_roles as { id: string }[] | null)?.length ?? 0;
                return (
                  <tr
                    key={group.id}
                    style={{ borderBottom: i < rows.length - 1 ? "1px solid #F3F4F6" : "none" }}
                  >
                    <td className="px-4 py-3 text-sm" style={{ color: "var(--color-gray)" }}>
                      {group.sort_order}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-full shrink-0"
                          style={{ background: group.color || "#C8102E" }}
                          title="Group colour"
                        />
                        <p className="font-semibold text-sm" style={{ color: "var(--color-dark)" }}>
                          {group.name}
                        </p>
                        {group.non_members && (
                          <span
                            className="text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded"
                            style={{ background: "#E0E7FF", color: "#3730A3" }}
                          >
                            Non Members
                          </span>
                        )}
                      </div>
                      {group.subtitle && (
                        <p className="text-xs mt-0.5" style={{ color: "var(--color-gray)" }}>
                          {group.subtitle}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold">{roleCount}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <Link
                          href={`/admin/leadership/groups/${group.id}/edit`}
                          className="text-sm font-semibold px-3 py-1.5 rounded-lg"
                          style={{ color: "var(--color-primary)", background: "#FEE2E2" }}
                        >
                          Edit
                        </Link>
                        <DeleteLeadershipGroupButton id={group.id} name={group.name} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <p className="text-xs mt-4" style={{ color: "var(--color-gray)" }}>
        Public page:{" "}
        <a href="/about" className="underline" target="_blank" rel="noopener noreferrer">
          /about
        </a>
      </p>
    </div>
  );
}
