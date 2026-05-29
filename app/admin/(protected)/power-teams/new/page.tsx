import type { Metadata } from "next";
import Link from "next/link";
import PowerTeamForm from "@/components/admin/PowerTeamForm";

export const metadata: Metadata = { title: "New Power Team — BNI Miracles Admin" };

export default function NewPowerTeamPage() {
  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/power-teams" className="text-sm font-semibold" style={{ color: "var(--color-primary)" }}>
          ← Power Teams
        </Link>
      </div>
      <h1 className="text-2xl font-extrabold mb-2" style={{ color: "var(--color-dark)" }}>
        New Power Team
      </h1>
      <p className="text-sm mb-6" style={{ color: "var(--color-gray)" }}>
        After creating the team, you can add members on the next screen.
      </p>
      <PowerTeamForm />
    </div>
  );
}
