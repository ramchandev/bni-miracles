import type { Metadata } from "next";
import GivesAsksClient from "@/components/GivesAsksClient";
import {
  fetchActiveGivesAsksCategories,
  fetchAllGivesAsksCategories,
  mapMemberGiveAskRowsToEntries,
} from "@/lib/gives-asks-categories";
import { fetchMemberCollaborations } from "@/lib/gives-asks-collaboration";
import { getMemberSession } from "@/lib/member-session";
import { supabase } from "@/lib/supabase";

export const metadata: Metadata = {
  title: "My Gives & Asks — BNI Miracles",
  description: "BNI Miracles members: manage your referral gives and asks.",
  robots: { index: false },
};

export default async function GivesAsksPage() {
  const [categories, sessionMember] = await Promise.all([
    fetchActiveGivesAsksCategories(),
    getMemberSession(),
  ]);

  let prefilled = null;

  if (sessionMember) {
    const { data: member } = await supabase
      .from("members")
      .select("id, name, slug, category, profile_picture_url")
      .eq("id", sessionMember.id)
      .eq("is_active", true)
      .single();

    if (member) {
      const [{ data: gaData }, allCategories, collaborations] = await Promise.all([
        supabase
          .from("member_gives_asks")
          .select("type, item, category_id")
          .eq("member_id", member.id)
          .order("sort_order"),
        fetchAllGivesAsksCategories(),
        fetchMemberCollaborations(member.id),
      ]);

      prefilled = {
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
  }

  return <GivesAsksClient categories={categories} prefilled={prefilled} />;
}
