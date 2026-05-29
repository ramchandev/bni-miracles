import DOMPurify from "isomorphic-dompurify";

const ALLOWED_TAGS = [
  "p",
  "br",
  "strong",
  "b",
  "em",
  "i",
  "u",
  "ul",
  "ol",
  "li",
  "h2",
  "h3",
  "blockquote",
];

/** Sanitize stored HTML before rendering on public pages */
export function sanitizeRichHtml(dirty: string | null | undefined): string {
  if (!dirty?.trim()) return "";
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS,
    ALLOWED_ATTR: [],
  });
}
