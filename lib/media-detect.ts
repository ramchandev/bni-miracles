export type DetectedMedia =
  | { type: "youtube";   embedUrl: string; videoId: string }
  | { type: "instagram"; originalUrl: string }
  | { type: null };

/**
 * Detect YouTube or Instagram URLs and return an embed-friendly representation.
 * Works for: watch?v=, youtu.be/, /shorts/, /reel/, /p/, /tv/
 */
export function detectMedia(url: string): DetectedMedia {
  const trimmed = url.trim();
  if (!trimmed) return { type: null };

  // YouTube: standard watch, short link, Shorts
  const ytMatch = trimmed.match(
    /(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  if (ytMatch) {
    const videoId = ytMatch[1];
    return {
      type: "youtube",
      embedUrl: `https://www.youtube.com/embed/${videoId}?rel=0`,
      videoId,
    };
  }

  // Instagram: post, reel, tv, stories
  if (/instagram\.com\/(p|reel|tv|stories)\//.test(trimmed)) {
    return { type: "instagram", originalUrl: trimmed };
  }

  return { type: null };
}
