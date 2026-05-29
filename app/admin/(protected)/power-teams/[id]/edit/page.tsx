import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import PowerTeamForm from "@/components/admin/PowerTeamForm";
import PowerTeamMembersEditor from "@/components/admin/PowerTeamMembersEditor";
import type { Member, PowerTeam, PowerTeamMemberWithMember } from "@/lib/supabase";

type Props = { params: Promise<{ id: string }> };

export const metadata: Metadata = { title: "Edit Power Team — BNI Miracles Admin" };

export default async function EditPowerTeamPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();

  const [
    { data: team },
    { data: teamMembers },
    { data: allMembers },
    { data: allAssignments },
  ] = await Promise.all([
    supabase.from("power_teams").select("*").eq("id", id).single<PowerTeam>(),
    supabase
      .from("power_team_members")
      .select("*, members(id, name, slug, category, business_name, profile_picture_url)")
      .eq("power_team_id", id)
      .order("sort_order")
      .returns<PowerTeamMemberWithMember[]>(),
    supabase
      .from("members")
      .select("id, name, category, slug")
      .eq("is_active", true)
      .order("name")
      .returns<Pick<Member, "id" | "name" | "category" | "slug">[]>(),
    supabase
      .from("power_team_members")
      .select("member_id, power_teams(name)")
      .neq("power_team_id", id),
  ]);

  if (!team) notFound();

  const assignedElsewhere = (allAssignments ?? [])
    .map((row) => {
      const teamRef = row.power_teams as { name: string } | { name: string }[] | null;
      const teamName = Array.isArray(teamRef) ? teamRef[0]?.name : teamRef?.name;
      return teamName ? { member_id: row.member_id as string, team_name: teamName } : null;
    })
    .filter(Boolean) as { member_id: string; team_name: string }[];

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/power-teams" className="text-sm font-semibold" style={{ color: "var(--color-primary)" }}>
          ← Power Teams
        </Link>
        <span style={{ color: "#E5E7EB" }}>/</span>
        <span className="text-sm font-semibold" style={{ color: "var(--color-dark)" }}>
          {team.emoji} {team.name}
        </span>
      </div>

      <PowerTeamForm team={team} />

      {team.slug && (
        <p className="text-xs mt-3" style={{ color: "var(--color-gray)" }}>
          View public page:{" "}
          <a
            href={`/power-team/${team.slug}`}
            className="underline font-medium"
            target="_blank"
            rel="noopener noreferrer"
          >
            /power-team/{team.slug}
          </a>
        </p>
      )}

      <div className="mt-8">
        <PowerTeamMembersEditor
          teamId={team.id}
          captainMemberId={team.captain_member_id}
          teamMembers={teamMembers ?? []}
          allMembers={allMembers ?? []}
          assignedElsewhere={assignedElsewhere}
        />
      </div>
    </div>
  );
}
