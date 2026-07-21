export type VideoLinkKind = "youtube" | "vimeo" | "instagram" | "facebook" | "unknown";

export function isValidUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "https:";
  } catch {
    return false;
  }
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
  if (isInstagramUrl(url)) return "instagram";
  if (isFacebookUrl(url)) return "facebook";
  return "unknown";
}

/** Matches backend listing media validation — YouTube, Instagram, Facebook only. */
export function isSupportedDemoVideoUrl(url: string): boolean {
  if (!isValidUrl(url)) return false;
  const kind = detectVideoLinkKind(url);
  return kind === "youtube" || kind === "instagram" || kind === "facebook";
}
