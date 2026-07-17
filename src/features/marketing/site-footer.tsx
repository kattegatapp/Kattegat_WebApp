import Image from "next/image";
import Link from "next/link";

import { KATTEGAT_SOCIALS } from "@/features/marketing/socials";

const exploreLinks = [
  ["Home", "/"],
  ["Services", "/services"],
  ["How it works", "/how-it-works"],
  ["About", "/about"],
  ["FAQ", "/faq"],
  ["Contact", "/contact"],
] as const;

type SiteFooterProps = {
  brandName?: string;
  supportEmail?: string;
  appStoreUrl?: string | null;
  playStoreUrl?: string | null;
  instagramUrl?: string | null;
  linkedinUrl?: string | null;
};

export function SiteFooter({
  brandName = "Kattegat",
  supportEmail = "hello@kattegat.app",
  appStoreUrl = null,
  playStoreUrl = null,
  instagramUrl = null,
  linkedinUrl = null,
}: SiteFooterProps) {
  const legalAndSupportLinks = [
    ["Terms of Use", "/terms-of-service"],
    ["Privacy Policy", "/privacy-policy"],
    ["Account Deletion", "/delete-account"],
    ["Help & FAQ", "/faq"],
    ["Contact Support", "/contact"],
  ] as const;

  const socialLinks = [
    ...(instagramUrl ? [{ label: "Instagram", href: instagramUrl }] : []),
    ...(linkedinUrl ? [{ label: "LinkedIn", href: linkedinUrl }] : []),
    ...KATTEGAT_SOCIALS,
  ].filter(
    (social, index, links) =>
      links.findIndex((link) => link.href === social.href) === index,
  );

  return (
    <footer className="mt-4 border-t border-brand-forest/10 bg-brand-forest text-white">
      <div className="mx-auto max-w-[1344px] px-5 py-14 sm:px-8 sm:py-16">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-[1.4fr_0.8fr_1fr_1fr]">
          <div>
            <Link href="/" className="inline-block">
              <Image
                src="/brand/logo/logo-horizontal-alternative.png"
                alt={brandName}
                width={220}
                height={68}
                className="h-12 w-auto"
              />
            </Link>
            <p className="mt-5 max-w-sm text-sm leading-7 text-white/65">
              Dubai&apos;s entertainment and hospitality marketplace. Hire
              trusted talent directly — or get discovered for the next brief —
              without agency commission on the booking.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              {appStoreUrl ? (
                <a
                  href={appStoreUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block"
                >
                  <Image
                    src="/brand/stores/app-store-badge.svg"
                    alt="Download on the App Store"
                    width={140}
                    height={46}
                    className="h-11 w-auto"
                  />
                </a>
              ) : null}
              {playStoreUrl ? (
                <a
                  href={playStoreUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block -ml-1"
                >
                  <Image
                    src="/brand/stores/google-play-badge.png"
                    alt="Get it on Google Play"
                    width={160}
                    height={62}
                    className="h-[3.25rem] w-auto"
                  />
                </a>
              ) : null}
            </div>
          </div>

          <div>
            <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-brand-mantis">
              Explore
            </p>
            <ul className="mt-4 space-y-3">
              {exploreLinks.map(([label, href]) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-sm font-semibold text-white/70 transition hover:text-brand-mantis"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-brand-mantis">
              Legal &amp; support
            </p>
            <ul className="mt-4 space-y-3">
              {legalAndSupportLinks.map(([label, href]) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-sm font-semibold text-white/70 transition hover:text-brand-mantis"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-brand-mantis">
              Follow us
            </p>
            <ul className="mt-4 space-y-3">
              {socialLinks.map((social) => (
                <li key={social.href}>
                  <a
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-semibold text-white/70 transition hover:text-brand-mantis"
                  >
                    {social.label}
                  </a>
                </li>
              ))}
            </ul>
            <p className="mt-6 text-[11px] font-extrabold uppercase tracking-[0.2em] text-brand-mantis">
              Customer care
            </p>
            <a
              href={`mailto:${supportEmail}`}
              className="mt-3 inline-block text-sm font-semibold text-white/70 transition hover:text-brand-mantis"
            >
              {supportEmail}
            </a>
            <p className="mt-2 text-xs leading-5 text-white/45">
              Dubai, UAE · Replies within one business day
            </p>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-5 border-t border-white/10 pt-8 sm:flex-row sm:items-center sm:justify-between">
          <Image
            src="/brand/logo/brandmark-alternative.png"
            alt=""
            width={40}
            height={40}
            className="size-10 rounded-xl opacity-90"
          />
          <div className="text-xs leading-6 text-white/45 sm:text-right">
            <p>
              © {new Date().getFullYear()} {brandName} · Hidden Diversion
              Recreational Services · Built in Dubai
            </p>
            <p>
              By using Kattegat, you agree to our{" "}
              <Link href="/terms-of-service" className="underline underline-offset-4 hover:text-white">
                Terms of Use
              </Link>{" "}
              and acknowledge our{" "}
              <Link href="/privacy-policy" className="underline underline-offset-4 hover:text-white">
                Privacy Policy
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
