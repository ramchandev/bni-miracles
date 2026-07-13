import type { Metadata } from "next";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { fetchBvdSettings } from "@/lib/bvd-permissions";
import { fetchBvdRegistrations } from "@/lib/bvd-server";
import BvdSettingsForm from "@/components/admin/BvdSettingsForm";
import BvdRegistrationsTable from "@/components/bvd/BvdRegistrationsTable";
import type { MemberOption } from "@/components/admin/MemberAssignPicker";

export const metadata: Metadata = { title: "BVD — Miracle Members Admin" };

export const dynamic = "force-dynamic";

export default async function AdminBvdPage() {
  const admin = createSupabaseAdminClient();
  const [settings, registrations, membersRes] = await Promise.all([
    fetchBvdSettings(),
    fetchBvdRegistrations(),
    admin
      .from("members")
      .select("id, name, category, profile_picture_url")
      .order("name"),
  ]);

  const members = (membersRes.data ?? []) as MemberOption[];

  if (!settings) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-extrabold mb-2" style={{ color: "var(--color-dark)" }}>
          BVD
        </h1>
        <p className="text-sm" style={{ color: "var(--color-gray)" }}>
          Could not load BVD settings. Run the <code className="font-mono text-xs bg-gray-100 px-1 rounded">bvd</code>{" "}
          migration in Supabase, then refresh.
        </p>
      </div>
    );
  }

  return (
    <div className="p-8" style={{ maxWidth: 1100 }}>
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold mb-1" style={{ color: "var(--color-dark)" }}>
          Big Visitor Day (BVD)
        </h1>
        <p className="text-sm" style={{ color: "var(--color-gray)" }}>
          Configure the public invite page at <code className="font-mono text-xs">/bvd</code> and manage registrations.
        </p>
      </div>

      <div
        className="rounded-xl p-6 mb-10"
        style={{ background: "white", border: "1px solid #E5E7EB" }}
      >
        <h2 className="text-base font-bold mb-6 pb-4" style={{ color: "var(--color-dark)", borderBottom: "1px solid #F3F4F6" }}>
          Event settings
        </h2>
        <BvdSettingsForm settings={settings} members={members} />
      </div>

      <div>
        <h2 className="text-base font-bold mb-4" style={{ color: "var(--color-dark)" }}>
          Registrations
        </h2>
        <BvdRegistrationsTable registrations={registrations} />
      </div>
    </div>
  );
}
