import type { ReferralSummary } from "@/lib/api/account";

export function resolveReferralShareUrl(referral: Pick<ReferralSummary, "shareUrl" | "code">) {
  const encodedCode = encodeURIComponent(referral.code.trim());

  // The API may return an internal backend origin (for example :3000). Referral links
  // must always use the public website origin so /r/{code} can perform the app/web handoff.
  if (typeof window !== "undefined") {
    return `${window.location.origin}/r/${encodedCode}`;
  }
  return `/r/${encodedCode}`;
}

export function buildReferralShareMessage(shareUrl: string, code: string) {
  return `I've been earning real money referring friends to Kattegat — join with my link and let's both benefit: ${shareUrl} (code: ${code})`;
}

export function buildReferralShareLinks(shareUrl: string, code: string) {
  const message = buildReferralShareMessage(shareUrl, code);
  const encodedMessage = encodeURIComponent(message);
  const encodedUrl = encodeURIComponent(shareUrl);

  return {
    whatsapp: `https://wa.me/?text=${encodedMessage}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodedMessage}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    email: `mailto:?subject=${encodeURIComponent("Join Kattegat")}&body=${encodedMessage}`,
  };
}
