import Image from "next/image";

type Props = {
  size?: number;
  className?: string;
  dark?: boolean;
};

export default function CrorepathiClubBadge({ size = 56, className = "", dark = false }: Props) {
  return (
    <span
      className={`inline-flex items-center gap-2 ${className}`}
      title="Crorepathi Club Member"
    >
      <Image
        src="/images/crorepathi-giver-pin.png"
        alt=""
        width={size}
        height={size}
        className="shrink-0 object-contain"
        style={{ width: size, height: size }}
      />
      <span
        className="text-sm font-semibold tracking-wide"
        style={{ color: dark ? "rgba(255,255,255,0.92)" : "var(--color-dark)" }}
      >
        Crorepathi Club Member
      </span>
    </span>
  );
}
