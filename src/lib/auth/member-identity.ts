export const MEMBER_IDENTITY_STORAGE_KEY = "kattegat-member-identity";

export function readStoredMemberIdentity(
  sid: string | null,
  bid: string | null,
): "buyer" | "seller" | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = window.localStorage.getItem(MEMBER_IDENTITY_STORAGE_KEY);
    if (stored === "buyer" && bid) return "buyer";
    if (stored === "seller" && sid) return "seller";
  } catch {
    return null;
  }
  return null;
}

export function writeStoredMemberIdentity(identity: "buyer" | "seller") {
  try {
    window.localStorage.setItem(MEMBER_IDENTITY_STORAGE_KEY, identity);
  } catch {
    // ignore quota / private mode
  }
}
