import PowerTeamInitials from "@/components/power-team/PowerTeamInitials";
import type { PowerTeamLogAttendanceEntry } from "@/lib/supabase";

type Props = {
  attendance: PowerTeamLogAttendanceEntry[];
  size?: number;
};

export default function PowerTeamLogAttendanceAvatars({ attendance, size = 44 }: Props) {
  if (!attendance.length) return null;

  const presentCount = attendance.filter((a) => a.present).length;
  const absentCount = attendance.length - presentCount;

  return (
    <div>
      <p
        className="text-xs font-bold uppercase tracking-wide mb-2"
        style={{ color: "var(--color-gray)" }}
      >
        Attendance
        <span className="ml-2 font-semibold normal-case tracking-normal" style={{ color: "#6B7280" }}>
          {presentCount} present · {absentCount} absent
        </span>
      </p>
      <div className="flex flex-wrap gap-2.5">
        {attendance.map((person) => (
          <div
            key={person.member_id}
            className="relative shrink-0"
            title={`${person.name} — ${person.present ? "Present" : "Absent"}`}
          >
            {person.profile_picture_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={person.profile_picture_url}
                alt={person.name}
                width={size}
                height={size}
                className="rounded-full object-cover"
                style={{
                  width: size,
                  height: size,
                  filter: person.present ? "none" : "grayscale(1)",
                  opacity: person.present ? 1 : 0.55,
                }}
              />
            ) : (
              <div
                style={{
                  filter: person.present ? "none" : "grayscale(1)",
                  opacity: person.present ? 1 : 0.55,
                }}
              >
                <PowerTeamInitials name={person.name} size={size} />
              </div>
            )}
            {person.present && (
              <span
                className="absolute -bottom-0.5 -right-0.5 flex items-center justify-center rounded-full text-white"
                style={{
                  width: Math.max(16, Math.round(size * 0.38)),
                  height: Math.max(16, Math.round(size * 0.38)),
                  background: "#16A34A",
                  border: "2px solid white",
                  fontSize: Math.max(9, Math.round(size * 0.22)),
                  lineHeight: 1,
                }}
                aria-hidden
              >
                ✓
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
