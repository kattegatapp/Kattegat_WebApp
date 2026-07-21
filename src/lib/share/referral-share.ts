import type { ReferralSummary } from "@/lib/api/account";

export function resolveReferralShareUrl(referral: Pick<ReferralSummary, "shareUrl" | "code">) {
  const fromApi = referral.shareUrl?.trim();
  if (fromApi?.startsWith("http")) return fromApi;
  if (typeof window !== "undefined") {
    return `${window.location.origin}/r/${encodeURIComponent(referral.code)}`;
  }
  return `/r/${encodeURIComponent(referral.code)}`;
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
