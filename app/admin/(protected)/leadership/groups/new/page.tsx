import type { Metadata } from "next";
import Link from "next/link";
import LeadershipGroupForm from "@/components/admin/LeadershipGroupForm";

export const metadata: Metadata = { title: "New Leadership Group — BNI Miracles Admin" };

export default function NewLeadershipGroupPage() {
  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/leadership" className="text-sm font-semibold" style={{ color: "var(--color-primary)" }}>
          ← Leadership
        </Link>
        <span style={{ color: "#E5E7EB" }}>/</span>
        <span className="text-sm font-semibold" style={{ color: "var(--color-dark)" }}>
          New Group
        </span>
      </div>
      <LeadershipGroupForm />
    </div>
  );
}
