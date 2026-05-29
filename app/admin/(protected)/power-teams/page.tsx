import type { Metadata } from "next";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import DeletePowerTeamButton from "@/components/admin/DeletePowerTeamButton";

export const metadata: Metadata = { title: "Power Teams — BNI Miracles Admin" };

export default async function AdminPowerTeamsPage() {
  const supabase = await createSupabaseServerClient();

  const { data: teams } = await supabase
    .from("power_teams")
    .select("*, power_team_members ( id )")
    .order("sort_order");

  const rows = teams ?? [];

  const captainIds = rows
    .map((t) => t.captain_member_id)
    .filter((id): id is string => !!id);

  const { data: captains } =
    captainIds.length > 0
      ? await supabase.from("members").select("id, name").in("id", captainIds)
      : { data: [] };

  const captainNameById = new Map((captains ?? []).map((c) => [c.id, c.name]));

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-extrabold" style={{ color: "var(--color-dark)" }}>
            Power Teams
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--color-gray)" }}>
            Manage teams for the சக்தி கொடு initiative. Each member can join one team only.
          </p>
        </div>
        <Link href="/admin/power-teams/new" className="btn-primary text-sm">
          + New Power Team
        </Link>
      </div>

      {rows.length === 0 ? (
        <div className="card p-8 text-center">
          <p className="text-4xl mb-3">⚡</p>
          <p className="font-semibold mb-2" style={{ color: "var(--color-dark)" }}>
            No Power Teams yet
          </p>
          <p className="text-sm mb-4" style={{ color: "var(--color-gray)" }}>
            Create your first team, then add members on the edit screen.
          </p>
          <Link href="/admin/power-teams/new" className="btn-primary text-sm">
            Create Power Team
          </Link>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr style={{ background: "#F9FAFB", borderBottom: "1px solid #E5E7EB" }}>
                {["Order", "Team", "Captain", "Members", "Actions"].map((h, j) => (
                  <th
                    key={h}
                    className={`px-4 py-3 text-xs font-semibold uppercase tracking-wide ${
                      j === 4 ? "text-right" : j === 3 ? "text-center" : "text-left"
                    }`}
                    style={{ color: "var(--color-gray)" }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((team, i) => {
                const count = (team.power_team_members as { id: string }[] | null)?.length ?? 0;
                return (
                  <tr
                    key={team.id}
                    style={{ borderBottom: i < rows.length - 1 ? "1px solid #F3F4F6" : "none" }}
                  >
                    <td className="px-4 py-3 text-sm" style={{ color: "var(--color-gray)" }}>
                      {team.sort_order}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{team.emoji}</span>
                        <div>
                          <p className="font-semibold text-sm" style={{ color: "var(--color-dark)" }}>
                            {team.name}
                          </p>
                          {team.focus_area && (
                            <p className="text-xs line-clamp-1" style={{ color: "var(--color-gray)" }}>
                              {team.focus_area}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm" style={{ color: "var(--color-gray)" }}>
                      {team.captain_member_id
                        ? captainNameById.get(team.captain_member_id) ?? "—"
                        : "—"}
                    </td>
                    <td className="px-4 py-3 text-center text-sm font-semibold">{count}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <Link
                          href={`/admin/power-teams/${team.id}/edit`}
                          className="text-sm font-semibold px-3 py-1.5 rounded-lg"
                          style={{ color: "var(--color-primary)", background: "#FEE2E2" }}
                        >
                          Edit
                        </Link>
                        <DeletePowerTeamButton id={team.id} name={team.name} />
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
        <a href="/power-team" className="underline" target="_blank" rel="noopener noreferrer">
          /power-team
        </a>
      </p>
    </div>
  );
}
