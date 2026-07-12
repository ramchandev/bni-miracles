import type { Metadata } from "next";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import RegistrationsTable from "@/components/admin/RegistrationsTable";
import type { MeetingRegistration } from "@/lib/supabase";

export const metadata: Metadata = { title: "Registrations — Miracle Members Admin" };

export default async function RegistrationsPage() {
  const supabase = await createSupabaseServerClient();
  const { data: registrations } = await supabase
    .from("meeting_registrations")
    .select("*")
    .order("created_at", { ascending: false });

  const rows = (registrations ?? []) as MeetingRegistration[];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold" style={{ color: "var(--color-dark)" }}>
          Meeting Registrations
        </h1>
        <p className="text-sm mt-0.5" style={{ color: "var(--color-gray)" }}>
          {rows.length} registrations total
        </p>
      </div>

      <RegistrationsTable registrations={rows} />
    </div>
  );
}
