const CHAT_PREFIX = "/chat/";
const ALLOWED_PREFIXES = [
  "/chat/",
  "/account",
  "/listing/",
  "/requirement/",
  "/seller/",
  "/category/",
  "/requirements",
  "/referrals",
  "/billing",
  "/support",
];

/**
 * Normalize backend notification deep links for the web app.
 * Accepts `/chat/{id}`, full URLs, and strips query strings for safety.
 */
export function normalizeMemberDeepLink(raw: string | null | undefined): string | null {
  if (!raw?.trim()) return null;

  let path = raw.trim();

  if (path.includes("://") || path.startsWith("//")) {
    try {
      const url = new URL(path.startsWith("//") ? `https:${path}` : path);
      path = `${url.pathname}${url.search}`;
    } catch {
      return null;
    }
  }

  if (!path.startsWith("/")) return null;
  if (path.includes("..") || path.includes("\\")) return null;

  const pathname = path.split("?")[0] ?? path;
  const allowed =
    pathname === "/chat" ||
    pathname === "/account" ||
    pathname === "/notifications" ||
    ALLOWED_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(prefix));

  if (!allowed) return null;

  return pathname;
}

export function parseChatConversationId(path: string | null | undefined): string | null {
  const normalized = normalizeMemberDeepLink(path);
  if (!normalized?.startsWith(CHAT_PREFIX)) return null;
  const id = normalized.slice(CHAT_PREFIX.length).trim();
  if (!id || id.includes("/")) return null;
  return id;
}

export function isChatDeepLink(raw: string | null | undefined): boolean {
  return parseChatConversationId(raw) != null || normalizeMemberDeepLink(raw) === "/chat";
}
