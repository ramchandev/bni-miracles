import Image from "next/image";
import Link from "next/link";
import { groupLightBg } from "@/lib/leadership-colors";
import { fetchLeadershipGroupsWithRoles, getRoleAssignee } from "@/lib/leadership-server";

const DEFAULT_GROUP_COLOR = "#C8102E";
const AVATAR_SIZE = 72;

function RoleAvatar({ name, url, accentColor }: { name: string; url: string | null; accentColor: string }) {
  if (url) {
    return (
      <Image
        src={url}
        alt={name}
        width={AVATAR_SIZE}
        height={AVATAR_SIZE}
        className="rounded-full object-cover shrink-0"
        style={{ width: AVATAR_SIZE, height: AVATAR_SIZE }}
      />
    );
  }
  const parts = name.trim().split(" ");
  const initials =
    parts.length >= 2 ? `${parts[0][0]}${parts[parts.length - 1][0]}` : parts[0].slice(0, 2);
  return (
    <div
      className="rounded-full flex items-center justify-center text-white text-base font-bold shrink-0"
      style={{ width: AVATAR_SIZE, height: AVATAR_SIZE, background: accentColor }}
    >
      {initials.toUpperCase()}
    </div>
  );
}

export default async function ChapterLeadershipSection() {
  const groups = await fetchLeadershipGroupsWithRoles();

  if (groups.length === 0) return null;

  const hasAnyAssignee = groups.some((g) =>
    g.leadership_roles.some((r) => getRoleAssignee(r) !== null)
  );

  return (
    <section className="py-20 px-6" style={{ background: "var(--color-bg)" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div className="text-center mb-14">
          <p className="text-sm font-semibold tracking-widest uppercase mb-3" style={{ color: "var(--color-primary)" }}>
            Chapter Leadership
          </p>
          <h2 className="section-title mb-3">Our Leadership Team</h2>
          <p className="text-base max-w-2xl mx-auto" style={{ color: "var(--color-gray)", lineHeight: 1.75 }}>
            {hasAnyAssignee
              ? "The members who lead, coordinate, and grow BNI Miracles every week."
              : "Leadership roles are being assigned — check back soon."}
          </p>
        </div>

        <div className="flex flex-col gap-12">
          {groups.map((group) => {
            const groupColor = group.color || DEFAULT_GROUP_COLOR;
            return (
              <div key={group.id}>
                <div
                  className="mb-6 pb-3 pl-4"
                  style={{ borderLeft: `4px solid ${groupColor}`, borderBottom: "1px solid #E5E7EB" }}
                >
                  <h3 className="text-xl font-extrabold" style={{ color: "var(--color-dark)" }}>
                    {group.name}
                  </h3>
                  {group.subtitle && (
                    <p className="text-sm mt-1 font-medium" style={{ color: groupColor }}>
                      {group.subtitle}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {group.leadership_roles.map((role) => {
                    const assignee = getRoleAssignee(role);
                    const cardStyle = {
                      background: groupLightBg(groupColor),
                      border: `1px solid ${groupColor}33`,
                      borderLeft: `4px solid ${groupColor}`,
                    };
                    const cardClass =
                      "rounded-xl p-4 flex gap-4 items-start shadow-sm transition-shadow hover:shadow-md";

                    const roleTitle = (
                      <p className="text-base font-extrabold leading-snug mb-0.5" style={{ color: groupColor }}>
                        {role.name}
                      </p>
                    );

                    const roleDescription = role.description ? (
                      <p className="text-xs mb-2 leading-snug" style={{ color: "var(--color-gray)" }}>
                        {role.description}
                      </p>
                    ) : null;

                    if (assignee) {
                      const cardContent = (
                        <>
                          <RoleAvatar
                            name={assignee.name}
                            url={assignee.profile_picture_url}
                            accentColor={groupColor}
                          />
                          <div className="min-w-0 flex-1">
                            {roleTitle}
                            {roleDescription}
                            <p className="text-sm font-medium leading-snug" style={{ color: "var(--color-dark)" }}>
                              {assignee.name}
                            </p>
                            {assignee.kind === "member" && assignee.category && (
                              <p className="text-xs mt-1" style={{ color: "var(--color-gray)" }}>
                                {assignee.category}
                              </p>
                            )}
                            {assignee.kind === "member" && assignee.business_name && (
                              <p className="text-xs mt-0.5 line-clamp-1" style={{ color: "var(--color-gray)" }}>
                                {assignee.business_name}
                              </p>
                            )}
                          </div>
                        </>
                      );

                      if (assignee.kind === "member" && assignee.slug) {
                        return (
                          <Link
                            key={role.id}
                            href={`/members/${assignee.slug}`}
                            className={`${cardClass} no-underline`}
                            style={cardStyle}
                          >
                            {cardContent}
                          </Link>
                        );
                      }

                      return (
                        <div key={role.id} className={cardClass} style={cardStyle}>
                          {cardContent}
                        </div>
                      );
                    }

                    return (
                      <div key={role.id} className={cardClass} style={cardStyle}>
                        <div className="min-w-0 flex-1">
                          {roleTitle}
                          {roleDescription}
                          <p className="text-sm italic" style={{ color: "var(--color-gray)" }}>
                            To be announced
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
