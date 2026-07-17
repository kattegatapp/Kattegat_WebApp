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
    ["Contact Support", "/support"],
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
    <footer className="border-t border-white/10 bg-brand-forest text-white">
      <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16">
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-2 sm:gap-x-10 sm:gap-y-12 lg:grid-cols-[1.35fr_0.75fr_1fr_0.75fr]">
          <div className="col-span-2 lg:col-span-1">
            <Link
              href="/"
              aria-label={`${brandName} home`}
              className="inline-flex focus-visible:outline-2 focus-visible:outline-brand-mantis"
            >
              <Image
                src="/brand/logo/logo-horizontal-alternative.png"
                alt={brandName}
                width={220}
                height={68}
                className="h-10 w-auto object-contain sm:h-11"
              />
            </Link>
            <p className="mt-4 max-w-md text-sm leading-7 text-white/65 lg:max-w-sm">
              Dubai&apos;s entertainment and hospitality marketplace. Hire
              trusted talent directly — or get discovered for the next brief —
              without agency commission on the booking.
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-2 sm:gap-3">
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

            <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.04] p-4 lg:rounded-none lg:border-y-0 lg:border-r-0 lg:border-l-2 lg:border-brand-mantis/70 lg:bg-transparent lg:py-0 lg:pr-0">
              <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-brand-mantis">
                Customer care
              </p>
              <a
                href={`mailto:${supportEmail}`}
                className="mt-2 inline-block break-all text-sm font-semibold text-white transition hover:text-brand-mantis"
              >
                {supportEmail}
              </a>
              <p className="mt-1 text-xs leading-5 text-white/50">
                Dubai, UAE · Replies within one business day
              </p>
            </div>
          </div>

          <div className="min-w-0">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-brand-mantis">
              Explore
            </p>
            <ul className="mt-4 space-y-3.5">
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

          <div className="min-w-0">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-brand-mantis">
              Legal &amp; support
            </p>
            <ul className="mt-4 space-y-3.5">
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

          <div className="col-span-2 border-t border-white/10 pt-7 lg:col-span-1 lg:border-0 lg:pt-0">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-brand-mantis">
              Follow us
            </p>
            <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-3 lg:block lg:space-y-3">
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
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center gap-5 border-t border-white/10 pt-7 text-center sm:mt-14 sm:flex-row sm:items-start sm:justify-between sm:text-left">
          <Image
            src="/brand/logo/brandmark-alternative.png"
            alt={`${brandName} logo`}
            width={32}
            height={39}
            className="h-9 w-auto object-contain opacity-90"
          />
          <div className="max-w-3xl text-xs leading-6 text-white/50 sm:text-right">
            <p>
              © {new Date().getFullYear()} {brandName}. Hidden Diversion Recreational
              Services. Built in Dubai, UAE.
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
