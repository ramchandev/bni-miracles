export default function PowerTeamInitials({ name, size = 72 }: { name: string; size?: number }) {
  const parts = name.trim().split(" ");
  const initials =
    parts.length >= 2
      ? `${parts[0][0]}${parts[parts.length - 1][0]}`
      : parts[0].slice(0, 2);

  return (
    <div
      className="flex items-center justify-center rounded-full text-white font-bold shrink-0"
      style={{
        width: size,
        height: size,
        background: "var(--color-primary)",
        fontSize: size * 0.3,
      }}
    >
      {initials.toUpperCase()}
    </div>
  );
}
