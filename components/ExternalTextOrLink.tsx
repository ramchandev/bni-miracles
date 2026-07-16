import type { CSSProperties, ReactNode } from "react";
import { normalizeExternalUrl } from "@/lib/external-url";

type Props = {
  text: string;
  /** Shown when text is a URL (default: "Location Link") */
  linkLabel?: string;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
};

/** Renders plain text, or a new-tab link labeled linkLabel when text is a URL. */
export default function ExternalTextOrLink({
  text,
  linkLabel = "Location Link",
  className,
  style,
}: Props) {
  const href = normalizeExternalUrl(text);
  if (!href) {
    return (
      <span className={className} style={style}>
        {text}
      </span>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      style={{
        ...style,
        color: "var(--color-primary)",
        fontWeight: 600,
        textDecoration: "underline",
        textUnderlineOffset: 2,
      }}
    >
      {linkLabel}
    </a>
  );
}
