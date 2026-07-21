const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isUuid(value: string): boolean {
  return UUID_PATTERN.test(value);
}

/** Lowercase URL segment for public seller profile routes. */
export function slugifyPublicName(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);
}

export type SellerPublicPathInput = {
  userId: string;
  customSlug?: string | null;
  displayName?: string | null;
};

/** Preferred public seller profile path — custom slug, then slugified name, then UUID. */
export function sellerPublicPath(input: SellerPublicPathInput): string {
  const customSlug = input.customSlug?.trim();
  if (customSlug) return `/seller/${encodeURIComponent(customSlug)}`;

  const fromName = input.displayName ? slugifyPublicName(input.displayName) : '';
  if (fromName.length >= 3) return `/seller/${encodeURIComponent(fromName)}`;

  return `/seller/${input.userId}`;
}

export function sellerPublicSegment(input: SellerPublicPathInput): string {
  return sellerPublicPath(input).replace(/^\/seller\//, '');
}

/** Decode route param — slug, custom handle, or legacy UUID. */
export function decodePublicRouteParam(value: string): string {
  try {
    return decodeURIComponent(value.trim());
  } catch {
    return value.trim();
  }
}

export function shouldRedirectSellerPublicPath(
  requestedSegment: string,
  input: SellerPublicPathInput,
): boolean {
  const normalizedRequest = decodePublicRouteParam(requestedSegment).toLowerCase();
  const canonical = sellerPublicSegment(input).toLowerCase();
  return normalizedRequest !== canonical;
}

const ID_SUFFIX_LEN = 8;
const MAX_PUBLIC_SEGMENT_LEN = 64;

export type TitledPublicPathInput = {
  id: string;
  title: string;
};

/** SEO-friendly segment: slugified title + short id suffix for uniqueness. */
export function titledPublicSegment({ id, title }: TitledPublicPathInput): string {
  const prefix = id.replace(/-/g, "").slice(0, ID_SUFFIX_LEN).toLowerCase();
  const slug = slugifyPublicName(title);
  if (slug.length < 3) return id;
  const maxSlugLen = Math.max(3, MAX_PUBLIC_SEGMENT_LEN - 1 - prefix.length);
  return `${slug.slice(0, maxSlugLen)}-${prefix}`;
}

export function listingPublicPath(input: TitledPublicPathInput): string {
  return `/listing/${encodeURIComponent(titledPublicSegment(input))}`;
}

export function requirementPublicPath(input: TitledPublicPathInput): string {
  return `/requirement/${encodeURIComponent(titledPublicSegment(input))}`;
}

export function shouldRedirectTitledPublicPath(
  requestedSegment: string,
  input: TitledPublicPathInput,
): boolean {
  const normalizedRequest = decodePublicRouteParam(requestedSegment).toLowerCase();
  const canonical = titledPublicSegment(input).toLowerCase();
  return normalizedRequest !== canonical;
}
