import MemberCard from "@/components/MemberCard";
import type { GivesAsksByMemberId } from "@/lib/power-teams-server";
import type { Member, PowerTeamMemberWithMember } from "@/lib/supabase";

type Props = {
  members: PowerTeamMemberWithMember[];
  captainMemberId: string | null;
  teamColor: string;
  categoryIcons: Map<string, string>;
  givesAsksByMemberId: GivesAsksByMemberId;
};

/** Full member shape for MemberCard (defaults for fields not loaded on power team queries). */
function toMemberCardMember(
  partial: NonNullable<PowerTeamMemberWithMember["members"]>
): Member {
  return {
    id: partial.id,
    name: partial.name,
    slug: partial.slug,
    business_name: partial.business_name,
    category: partial.category,
    business_location: partial.business_location,
    profile_picture_url: partial.profile_picture_url,
    phone: null,
    email: null,
    website: null,
    services: null,
    why_choose_us: null,
    success_stories: null,
    is_active: partial.is_active ?? true,
    created_at: "",
    updated_at: "",
  };
}

export default function PowerTeamMemberCards({
  members,
  captainMemberId,
  teamColor,
  categoryIcons,
  givesAsksByMemberId,
}: Props) {
  if (members.length === 0) {
    return (
      <p className="text-sm text-center py-8" style={{ color: "var(--color-gray)" }}>
        Team members coming soon.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {members.map((row) => {
        if (!row.members) return null;
        const member = toMemberCardMember(row.members);
        const ga = givesAsksByMemberId.get(member.id);

        return (
          <MemberCard
            key={row.id}
            member={member}
            categoryIcon={categoryIcons.get(member.category)}
            gives={ga?.gives ?? []}
            asks={ga?.asks ?? []}
            isCaptain={member.id === captainMemberId}
            accentColor={teamColor}
          />
        );
      })}
    </div>
  );
}
