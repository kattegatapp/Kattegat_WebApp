/**
 * VIP Support — direct line to the VIP Support team.
 * Contacts come from public app settings (`supportWhatsappUrl`, `supportEmail`).
 * UI should let the user choose WhatsApp or email when both are configured.
 */

export type VipSupportContacts = {
  whatsappUrl?: string | null;
  email?: string | null;
};

export type VipSupportChannels = {
  whatsappHref: string | null;
  emailHref: string | null;
};

export type VipSupportAccessInput = {
  vipSupportEnabled?: boolean | null;
  vipSupportProOnly?: boolean | null;
  freeAccessMode?: boolean | null;
  /** Seller plan tier when signed in as a seller. */
  sellerTier?: string | null;
};

/** Default-on when the flag is missing (older API payloads). */
export function canAccessVipSupport(input: VipSupportAccessInput): boolean {
  if (input.vipSupportEnabled === false) return false;
  if (!input.vipSupportProOnly) return true;
  if (input.freeAccessMode) return true;
  return input.sellerTier === "pro" || input.sellerTier === "white_glove";
}

export function buildVipSupportMailto(email: string): string {
  const subject = encodeURIComponent("Kattegat VIP Support");
  const body = encodeURIComponent(
    "Hello,\n\nI need assistance with Kattegat.\n\n— Sent via VIP Support",
  );
  return `mailto:${email}?subject=${subject}&body=${body}`;
}

export function buildVipSupportWhatsappUrl(whatsappUrl: string): string {
  try {
    const url = new URL(whatsappUrl);
    if (!url.searchParams.has("text")) {
      url.searchParams.set(
        "text",
        "Hello — I need VIP Support on Kattegat.",
      );
    }
    return url.toString();
  } catch {
    return whatsappUrl;
  }
}

export function resolveVipSupportChannels(
  contacts: VipSupportContacts,
): VipSupportChannels {
  const whatsapp = contacts.whatsappUrl?.trim();
  const email = contacts.email?.trim();
  return {
    whatsappHref: whatsapp ? buildVipSupportWhatsappUrl(whatsapp) : null,
    emailHref: email ? buildVipSupportMailto(email) : null,
  };
}

export function hasVipSupportChannels(
  channels: VipSupportChannels | null | undefined,
): boolean {
  return Boolean(channels?.whatsappHref || channels?.emailHref);
}

export function openVipSupportChannel(href: string) {
  if (href.startsWith("mailto:")) {
    window.location.href = href;
    return;
  }
  window.open(href, "_blank", "noopener,noreferrer");
}
