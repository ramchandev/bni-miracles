import type { Metadata } from "next";
import GivesAsksClient from "@/components/GivesAsksClient";
import MemberPageGate from "@/components/MemberPageGate";
import {
  fetchActiveGivesAsksCategories,
  fetchAllGivesAsksCategories,
  mapMemberGiveAskRowsToEntries,
} from "@/lib/gives-asks-categories";
import { fetchMemberCollaborations } from "@/lib/gives-asks-collaboration";
import { getMemberSession } from "@/lib/member-session";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";

export const metadata: Metadata = {
  title: "My Gives & Asks — Miracle Members",
  description: "Miracle Members members: manage your referral gives and asks.",
  robots: { index: false },
};

async function loadGivesAsksData(memberId: string) {
  const admin = createSupabaseAdminClient();
  const [{ data: member }, allCategories, { data: gaData }, collaborations] = await Promise.all([
    admin
      .from("members")
      .select("id, name, slug, category, profile_picture_url")
      .eq("id", memberId)
      .eq("is_active", true)
      .single(),
    fetchAllGivesAsksCategories(),
    admin
      .from("member_gives_asks")
      .select("type, item, category_id")
      .eq("member_id", memberId)
      .order("sort_order"),
    fetchMemberCollaborations(memberId),
  ]);

  if (!member) return null;

  return {
    member: {
      id: member.id,
      name: member.name,
      slug: member.slug,
      category: member.category,
      profile_picture_url: member.profile_picture_url,
    },
    gives: mapMemberGiveAskRowsToEntries(gaData ?? [], allCategories, "give"),
    asks: mapMemberGiveAskRowsToEntries(gaData ?? [], allCategories, "ask"),
    collaborations,
  };
}

export default async function GivesAsksPage() {
  const [categories, session] = await Promise.all([
    fetchActiveGivesAsksCategories(),
    getMemberSession(),
  ]);

  if (!session) {
    return (
      <>
        <section
          className="px-6 text-center"
          style={{ background: "var(--color-dark)", paddingTop: 100, paddingBottom: 48 }}
        >
          <p
            className="text-sm font-semibold tracking-widest uppercase mb-3"
            style={{ color: "var(--color-accent)" }}
          >
            Member Self-Service
          </p>
          <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-3">My Gives &amp; Asks</h1>
          <p className="text-white/60 text-sm max-w-md mx-auto">
            Log in to manage your referral preferences and see collaboration matches.
          </p>
        </section>
        <MemberPageGate
          title="My Gives & Asks"
          description="Log in with your phone number and meeting place to update your gives and asks."
        />
      </>
    );
  }

  const data = await loadGivesAsksData(session.id);
  if (!data) {
    return (
      <MemberPageGate
        title="My Gives & Asks"
        description="Your member account could not be loaded. Please try logging in again."
      />
    );
  }

  return <GivesAsksClient categories={categories} {...data} />;
}
