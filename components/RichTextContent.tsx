import { sanitizeRichHtml } from "@/lib/sanitize-html";

type Props = {
  html: string | null | undefined;
  className?: string;
  style?: React.CSSProperties;
};

/** Renders sanitized HTML (lists, bold, etc.) on public pages */
export default function RichTextContent({ html, className = "", style }: Props) {
  const safe = sanitizeRichHtml(html);
  if (!safe) return null;

  return (
    <div
      className={`rich-text ${className}`.trim()}
      style={style}
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: safe }}
    />
  );
}
