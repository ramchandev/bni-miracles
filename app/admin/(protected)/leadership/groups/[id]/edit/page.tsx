import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import LeadershipGroupForm from "@/components/admin/LeadershipGroupForm";
import LeadershipRolesEditor from "@/components/admin/LeadershipRolesEditor";
import { fetchLeadershipGroupForAdmin } from "@/lib/leadership-admin";
import type { LeadershipGroup, Member } from "@/lib/supabase";

type Props = { params: Promise<{ id: string }> };

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Edit Leadership Group — BNI Miracles Admin" };

export default async function EditLeadershipGroupPage({ params }: Props) {
  const { id } = await params;

  let group: LeadershipGroup | null = null;
  let groupWithRoles = await fetchLeadershipGroupForAdmin(id);

  try {
    const admin = createSupabaseAdminClient();
    const { data } = await admin.from("leadership_groups").select("*").eq("id", id).single<LeadershipGroup>();
    group = data;
  } catch {
    const supabase = await createSupabaseServerClient();
    const { data } = await supabase.from("leadership_groups").select("*").eq("id", id).single<LeadershipGroup>();
    group = data;
    if (!groupWithRoles) {
      groupWithRoles = null;
    }
  }

  let allMembers: Pick<Member, "id" | "name" | "category" | "slug" | "profile_picture_url">[] = [];
  try {
    const admin = createSupabaseAdminClient();
    const { data } = await admin
      .from("members")
      .select("id, name, category, slug, profile_picture_url")
      .eq("is_active", true)
      .order("name");
    allMembers = data ?? [];
  } catch {
    const supabase = await createSupabaseServerClient();
    const { data } = await supabase
      .from("members")
      .select("id, name, category, slug, profile_picture_url")
      .eq("is_active", true)
      .order("name");
    allMembers = data ?? [];
  }

  if (!group) notFound();

  const roles = groupWithRoles?.leadership_roles ?? [];

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/leadership" className="text-sm font-semibold" style={{ color: "var(--color-primary)" }}>
          ← Leadership
        </Link>
        <span style={{ color: "#E5E7EB" }}>/</span>
        <span className="text-sm font-semibold" style={{ color: "var(--color-dark)" }}>
          {group.name}
        </span>
      </div>

      <LeadershipGroupForm group={group} />

      <div className="mt-8">
        <LeadershipRolesEditor
          groupId={group.id}
          groupColor={group.color || "#C8102E"}
          nonMembers={group.non_members ?? false}
          roles={roles}
          allMembers={allMembers}
        />
      </div>
    </div>
  );
}
