import Image from "next/image";
import Link from "next/link";
import {
  groupCollaborationMatches,
  type MemberCollaborations,
} from "@/lib/gives-asks-collaboration";

function PartnerAvatar({
  name,
  photo,
  size = 36,
}: {
  name: string;
  photo: string | null;
  size?: number;
}) {
  if (photo) {
    return (
      <Image
        src={photo}
        alt=""
        width={size}
        height={size}
        className="rounded-full object-cover shrink-0"
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <div
      className="rounded-full flex items-center justify-center text-white font-bold shrink-0"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.35,
        background: "var(--color-primary)",
      }}
    >
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

function CategoryGroupCard({
  group,
  accentColor,
  accentBg,
  myEntryLabel,
  partnerLabel,
}: {
  group: ReturnType<typeof groupCollaborationMatches>[number];
  accentColor: string;
  accentBg: string;
  myEntryLabel: string;
  partnerLabel: string;
}) {
  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ border: `1px solid ${accentColor}33`, background: accentBg }}
    >
      <div
        className="px-4 py-3"
        style={{ borderBottom: `1px solid ${accentColor}22` }}
      >
        <p className="text-sm font-extrabold" style={{ color: accentColor }}>
          {group.categoryName}
        </p>
        <p className="text-xs mt-0.5" style={{ color: "var(--color-gray)" }}>
          {myEntryLabel}: {group.myItems.join(" · ")}
        </p>
      </div>
      <ul className="divide-y" style={{ borderColor: `${accentColor}15` }}>
        {group.partners.map((partner) => (
          <li key={partner.id} className="px-4 py-3">
            <div className="flex items-start gap-3">
              <PartnerAvatar name={partner.name} photo={partner.profile_picture_url} />
              <div className="min-w-0 flex-1">
                <Link
                  href={`/members/${partner.slug}`}
                  className="text-sm font-bold hover:underline"
                  style={{ color: "var(--color-dark)" }}
                >
                  {partner.name}
                </Link>
                <p className="text-xs truncate" style={{ color: "var(--color-gray)" }}>
                  {partner.category}
                </p>
                <p className="text-xs mt-1" style={{ color: "var(--color-dark)" }}>
                  {partnerLabel}: {partner.items.join(" · ")}
                </p>
              </div>
              <Link
                href={`/members/${partner.slug}`}
                className="text-xs font-semibold shrink-0 px-2 py-1 rounded-lg"
                style={{ background: `${accentColor}18`, color: accentColor }}
              >
                Profile →
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

type Props = {
  collaborations: MemberCollaborations;
  compact?: boolean;
};

export default function MemberCollaborationSection({ collaborations, compact = false }: Props) {
  const giveGroups = groupCollaborationMatches(collaborations.giveMatches);
  const askGroups = groupCollaborationMatches(collaborations.askMatches);
  const hasMatches = giveGroups.length > 0 || askGroups.length > 0;

  if (!hasMatches) {
    return (
      <div
        className="rounded-2xl p-6"
        style={{ border: "1.5px solid #E5E7EB", background: "white" }}
      >
        <h2 className="text-lg font-extrabold mb-2" style={{ color: "var(--color-dark)" }}>
          🤝 Collaboration Opportunities
        </h2>
        <p className="text-sm" style={{ color: "var(--color-gray)" }}>
          Add referral categories to your gives and asks to see chapter members you can collaborate
          with. Matches appear when another member&apos;s give or ask uses the same category.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {!compact && (
        <div>
          <h2 className="text-xl font-extrabold mb-1" style={{ color: "var(--color-dark)" }}>
            🤝 Collaboration Opportunities
          </h2>
          <p className="text-sm" style={{ color: "var(--color-gray)" }}>
            Based on your gives &amp; asks categories — members you can refer to, and members who
            can refer you.
          </p>
        </div>
      )}

      {giveGroups.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
              style={{ background: "#16A34A" }}
            >
              G
            </div>
            <div>
              <h3 className="font-extrabold text-base" style={{ color: "var(--color-dark)" }}>
                Who you can refer
              </h3>
              <p className="text-xs" style={{ color: "var(--color-gray)" }}>
                Members looking for referrals that match your gives
              </p>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {giveGroups.map((group) => (
              <CategoryGroupCard
                key={group.categoryId}
                group={group}
                accentColor="#16A34A"
                accentBg="#16A34A08"
                myEntryLabel="Your gives"
                partnerLabel="Looking for"
              />
            ))}
          </div>
        </div>
      )}

      {askGroups.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
              style={{ background: "var(--color-primary)" }}
            >
              A
            </div>
            <div>
              <h3 className="font-extrabold text-base" style={{ color: "var(--color-dark)" }}>
                Who can refer you
              </h3>
              <p className="text-xs" style={{ color: "var(--color-gray)" }}>
                Members whose gives match what you&apos;re asking for
              </p>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {askGroups.map((group) => (
              <CategoryGroupCard
                key={group.categoryId}
                group={group}
                accentColor="var(--color-primary)"
                accentBg="#C8102E08"
                myEntryLabel="Your asks"
                partnerLabel="Can give"
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
