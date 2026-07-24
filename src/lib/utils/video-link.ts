export type VideoLinkKind = "youtube" | "vimeo" | "instagram" | "facebook" | "unknown";

export function isValidUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * Only treat text as a URL when it already looks like one.
 * Do NOT prepend https:// to arbitrary words — that turned rate notes like
 * "AED1500/gig" into fake links (`https://AED1500/gig`).
 */
export function looksLikeHttpUrl(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return false;
  if (/^https:\/\//i.test(trimmed)) return isValidUrl(trimmed);
  if (/^www\./i.test(trimmed)) return isValidUrl(`https://${trimmed}`);
  // Host with a real TLD, optional path — e.g. youtube.com/watch?v=…
  if (/^(?:[a-z0-9-]+\.)+[a-z]{2,}(?:[/:?#].*)?$/i.test(trimmed)) {
    return isValidUrl(`https://${trimmed}`);
  }
  return false;
}

/** Sellers often paste `youtube.com/...` without a scheme — normalize to https when safe. */
export function normalizeHttpsUrl(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed || !looksLikeHttpUrl(trimmed)) return null;
  if (isValidUrl(trimmed)) return trimmed;
  try {
    const candidate = `https://${trimmed.replace(/^\/\//, "")}`;
    return isValidUrl(candidate) ? candidate : null;
  } catch {
    return null;
  }
}

/** Schema free-text should only become a tappable link for link-ish fields or real URLs. */
export function schemaFieldLinkUrl(input: {
  key: string;
  label: string;
  type?: string;
  value: string;
}): string | null {
  if (input.type && input.type !== "text") return null;
  const key = input.key.toLowerCase();
  const label = input.label.toLowerCase();
  const looksLikeLinkField =
    /(?:^|_)(link|url|website|reel|portfolio|social)(?:_|$)/i.test(key) ||
    /\b(link|url|website|reel|portfolio|instagram|youtube|facebook)\b/i.test(label);
  const href = normalizeHttpsUrl(input.value);
  if (!href) return null;
  if (looksLikeLinkField) return href;
  // Non-link fields (e.g. "Gig vs residency rates") only linkify obvious https URLs.
  return /^https:\/\//i.test(input.value.trim()) ? href : null;
}

const YOUTUBE_ID_RE = /^[A-Za-z0-9_-]{11}$/;

function isSafeYouTubeId(id: string | null | undefined): id is string {
  return typeof id === "string" && YOUTUBE_ID_RE.test(id);
}

function hostnameOf(url: string): string | null {
  try {
    return new URL(url).hostname.replace(/^www\.|^m\./, "");
  } catch {
    return null;
  }
}

export function parseYouTubeId(url: string): string | null {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, "");
    let candidate: string | null = null;

    if (host === "youtu.be") {
      candidate = parsed.pathname.slice(1).split("/")[0] || null;
    } else if (host === "youtube.com" || host === "m.youtube.com") {
      if (parsed.pathname === "/watch") candidate = parsed.searchParams.get("v");
      else {
        const shortsMatch = parsed.pathname.match(/^\/shorts\/([^/]+)/);
        if (shortsMatch) candidate = shortsMatch[1] ?? null;
        const embedMatch = parsed.pathname.match(/^\/embed\/([^/]+)/);
        if (embedMatch) candidate = embedMatch[1] ?? null;
      }
    }

    return isSafeYouTubeId(candidate) ? candidate : null;
  } catch {
    return null;
  }
}

function isInstagramUrl(url: string): boolean {
  return hostnameOf(url) === "instagram.com";
}

function isFacebookUrl(url: string): boolean {
  const host = hostnameOf(url);
  return host === "facebook.com" || host === "fb.watch";
}

export function detectVideoLinkKind(url: string): VideoLinkKind {
  if (parseYouTubeId(url)) return "youtube";
  if (hostnameOf(url) === "vimeo.com") return "vimeo";
  if (isInstagramUrl(url)) return "instagram";
  if (isFacebookUrl(url)) return "facebook";
  return "unknown";
}

export function parseVimeoId(url: string): string | null {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, "");
    if (host !== "vimeo.com") return null;
    const match = parsed.pathname.match(/^\/(\d+)/);
    const candidate = match?.[1] ?? null;
    return typeof candidate === "string" && /^\d{6,12}$/.test(candidate) ? candidate : null;
  } catch {
    return null;
  }
}

export function youTubeEmbedUrl(videoId: string): string {
  return `https://www.youtube.com/embed/${videoId}`;
}

export function vimeoEmbedUrl(videoId: string): string {
  return `https://player.vimeo.com/video/${videoId}`;
}

/** Matches backend listing media validation — YouTube, Instagram, Facebook only. */
export function isSupportedDemoVideoUrl(url: string): boolean {
  if (!isValidUrl(url)) return false;
  const kind = detectVideoLinkKind(url);
  return kind === "youtube" || kind === "instagram" || kind === "facebook";
}
