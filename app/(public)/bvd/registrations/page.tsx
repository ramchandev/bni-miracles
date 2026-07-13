import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getMemberSession } from "@/lib/member-session";
import { canManageBvdRegistrations } from "@/lib/bvd-permissions";
import { isSiteAdmin } from "@/lib/power-team-permissions";
import { fetchBvdRegistrations } from "@/lib/bvd-server";
import BvdRegistrationsTable from "@/components/bvd/BvdRegistrationsTable";
import MemberPageGate from "@/components/MemberPageGate";

export const metadata: Metadata = {
  title: "BVD Registrations — Miracle Members",
  description: "Manage Big Visitor Day registrations.",
};

export const dynamic = "force-dynamic";

export default async function BvdRegistrationsPage() {
  const member = await getMemberSession();
  const siteAdmin = await isSiteAdmin();

  if (!member && !siteAdmin) {
    return (
      <>
        <section
          className="px-6 text-center"
          style={{ background: "var(--color-dark)", paddingTop: 96, paddingBottom: 48 }}
        >
          <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-3">BVD Registrations</h1>
          <p className="text-white/60 text-sm max-w-md mx-auto">
            Log in to manage Big Visitor Day registrations.
          </p>
        </section>
        <MemberPageGate
          title="BVD Registrations"
          description="Only the BVD Chairman, Co-Chairman, Lead Visitor Host, or site admin can access this page."
        />
      </>
    );
  }

  const allowed = await canManageBvdRegistrations(member?.id ?? null);
  if (!allowed) {
    redirect("/bvd");
  }

  const registrations = await fetchBvdRegistrations();

  return (
    <>
      <section
        className="px-6 text-center"
        style={{ background: "var(--color-dark)", paddingTop: 96, paddingBottom: 40 }}
      >
        <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-2">BVD Registrations</h1>
        <p className="text-white/60 text-sm">
          Update payment status and upload screenshots.{" "}
          <Link href="/bvd" className="underline text-white/80">
            View public page
          </Link>
        </p>
      </section>

      <section className="py-10 px-6" style={{ background: "var(--color-bg)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <BvdRegistrationsTable registrations={registrations} />
        </div>
      </section>
    </>
  );
}
