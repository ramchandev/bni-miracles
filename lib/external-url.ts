/** Returns an absolute http(s) URL if the text looks like a web link, else null. */
export function normalizeExternalUrl(text: string | null | undefined): string | null {
  if (!text) return null;
  const t = text.trim();
  if (!t) return null;

  if (/^https?:\/\//i.test(t)) return t;
  if (/^www\./i.test(t)) return `https://${t}`;

  // Common short / maps links without scheme
  if (
    /^(maps\.app\.goo\.gl|goo\.gl|maps\.google\.com|google\.com\/maps|bit\.ly|tinyurl\.com)\b/i.test(
      t
    )
  ) {
    return `https://${t}`;
  }

  return null;
}

export function isExternalUrl(text: string | null | undefined): boolean {
  return Boolean(normalizeExternalUrl(text));
}
