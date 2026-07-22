export const MEMBER_IDENTITY_STORAGE_KEY = "kattegat-member-identity";

export type MemberIdentity = "buyer" | "seller";

function hasIdentity(value: string | null | boolean | undefined) {
  return Boolean(value);
}

/** Default when nothing is stored — prefer seller if the account has one (matches mobile). */
export function defaultMemberIdentity(
  sid: string | null | boolean | undefined,
  bid: string | null | boolean | undefined,
): MemberIdentity {
  if (hasIdentity(sid)) return "seller";
  return "buyer";
}

export function readStoredMemberIdentity(
  sid: string | null | boolean | undefined,
  bid: string | null | boolean | undefined,
): MemberIdentity | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = window.localStorage.getItem(MEMBER_IDENTITY_STORAGE_KEY);
    if (stored === "buyer" && hasIdentity(bid)) return "buyer";
    if (stored === "seller" && hasIdentity(sid)) return "seller";
  } catch {
    return null;
  }
  return null;
}

/** Active UX identity — storage first, else default. Not a security boundary. */
export function resolveActiveMemberIdentity(
  sid: string | null | boolean | undefined,
  bid: string | null | boolean | undefined,
): MemberIdentity {
  return readStoredMemberIdentity(sid, bid) ?? defaultMemberIdentity(sid, bid);
}

export function writeStoredMemberIdentity(identity: MemberIdentity) {
  try {
    window.localStorage.setItem(MEMBER_IDENTITY_STORAGE_KEY, identity);
  } catch {
    // ignore quota / private mode
  }
}

export function canActAsBuyer(
  identity: MemberIdentity,
  bid: string | null | boolean | undefined,
) {
  return identity === "buyer" && hasIdentity(bid);
}

export function canActAsSeller(
  identity: MemberIdentity,
  sid: string | null | boolean | undefined,
) {
  return identity === "seller" && hasIdentity(sid);
}
