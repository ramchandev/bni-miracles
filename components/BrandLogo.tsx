type Props = {
  className?: string;
  /** Header uses white text; footer can override via className */
  accentClassName?: string;
};

export default function BrandLogo({ className = "", accentClassName }: Props) {
  return (
    <span
      className={`font-extrabold tracking-tight leading-none ${className}`}
      aria-label="Miracle Members"
    >
      Miracle{" "}
      <span className={accentClassName ?? "text-[var(--color-accent)]"}>Members</span>
    </span>
  );
}
