import EditMyDetailsClient from "@/components/EditMyDetailsClient";
import MemberPageGate from "@/components/MemberPageGate";
import {
  fetchAllGivesAsksCategories,
  mapMemberGiveAskRowsToEntries,
} from "@/lib/gives-asks-categories";
import { getMemberSession } from "@/lib/member-session";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { createPageMetadata } from "@/lib/seo";
import type { VerifiedMember } from "@/app/actions/member-self-edit";

export const metadata = createPageMetadata({
  title: "Edit My Details",
  description: "Miracle Members members: update your business profile, gives and asks directly.",
  path: "/edit-my-details",
  noIndex: true,
});

async function loadMemberEditData(memberId: string) {
  const admin = createSupabaseAdminClient();
  const [memberResult, categories, gaResult] = await Promise.all([
    admin
      .from("members")
      .select(
        "id, name, slug, business_name, business_location, website, email, services, why_choose_us, success_stories, category, profile_picture_url"
      )
      .eq("id", memberId)
      .eq("is_active", true)
      .single(),
    fetchAllGivesAsksCategories(),
    admin
      .from("member_gives_asks")
      .select("type, item, category_id")
      .eq("member_id", memberId)
      .order("sort_order"),
  ]);

  if (memberResult.error || !memberResult.data) return null;

  const member = memberResult.data as VerifiedMember;
  const gives = mapMemberGiveAskRowsToEntries(gaResult.data ?? [], categories, "give");
  const asks = mapMemberGiveAskRowsToEntries(gaResult.data ?? [], categories, "ask");

  return { member, gives, asks, categories };
}

export default async function EditMyDetailsPage() {
  const session = await getMemberSession();

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
            Member Portal
          </p>
          <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-3">Edit My Details</h1>
          <p className="text-white/60 text-sm max-w-md mx-auto">
            Log in to update your business profile, gives, and asks.
          </p>
        </section>
        <MemberPageGate
          title="Edit My Details"
          description="Log in with your phone number and meeting place to edit your profile."
        />
      </>
    );
  }

  const data = await loadMemberEditData(session.id);
  if (!data) {
    return (
      <MemberPageGate
        title="Edit My Details"
        description="Your member account could not be loaded. Please try logging in again."
      />
    );
  }

  return <EditMyDetailsClient {...data} />;
}
