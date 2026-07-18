import Image from "next/image";
import Link from "next/link";

import { KATTEGAT_SOCIALS } from "@/features/marketing/socials";

const exploreLinks = [
  ["Home", "/"],
  ["Search", "/search"],
  ["Services", "/services"],
  ["How it works", "/how-it-works"],
  ["About", "/about"],
  ["FAQ", "/faq"],
  ["Contact", "/contact"],
] as const;

const legalAndSupportLinks = [
  ["Terms of Use", "/terms-of-service"],
  ["Privacy Policy", "/privacy-policy"],
  ["Account Deletion", "/delete-account"],
  ["Help & FAQ", "/faq"],
  ["Contact Support", "/support"],
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
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-9">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-[minmax(0,1.3fr)_repeat(3,minmax(0,0.7fr))] lg:gap-8">
          <div className="min-w-0 sm:col-span-2 lg:col-span-1">
            <Link
              href="/"
              aria-label={`${brandName} home`}
              className="inline-flex focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-mantis"
            >
              <Image
                src="/brand/logo/logo-horizontal-alternative.svg"
                alt={brandName}
                width={220}
                height={56}
                className="h-9 w-auto object-contain sm:h-10"
              />
            </Link>
            <p className="mt-3 max-w-sm text-sm leading-6 text-white/60">
              Dubai&apos;s direct marketplace for entertainment and hospitality talent.
            </p>
            <a
              href={`mailto:${supportEmail}`}
              className="mt-3 inline-block text-sm font-semibold text-brand-mantis transition hover:text-white"
            >
              {supportEmail}
            </a>
            {(appStoreUrl || playStoreUrl) && (
              <div className="mt-4 flex flex-wrap items-center gap-2">
                {appStoreUrl ? (
                  <a href={appStoreUrl} target="_blank" rel="noopener noreferrer">
                    <Image
                      src="/brand/stores/app-store-badge.svg"
                      alt="Download on the App Store"
                      width={120}
                      height={40}
                      className="h-9 w-auto"
                    />
                  </a>
                ) : null}
                {playStoreUrl ? (
                  <a href={playStoreUrl} target="_blank" rel="noopener noreferrer">
                    <Image
                      src="/brand/stores/google-play-badge.png"
                      alt="Get it on Google Play"
                      width={136}
                      height={52}
                      className="h-[2.65rem] w-auto"
                    />
                  </a>
                ) : null}
              </div>
            )}
          </div>

          <div className="min-w-0">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-brand-mantis">
              Explore
            </p>
            <ul className="mt-3 space-y-2">
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
            <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-brand-mantis">
              Legal &amp; support
            </p>
            <ul className="mt-3 space-y-2">
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

          <div className="min-w-0">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-brand-mantis">
              Follow us
            </p>
            <ul className="mt-3 space-y-2">
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

        <div className="mt-7 flex flex-col gap-2 border-t border-white/10 pt-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-white/40">
            © {new Date().getFullYear()} {brandName}. Built in Dubai, UAE.
          </p>
          <p className="text-xs text-white/40">
            <Link href="/terms-of-service" className="underline underline-offset-4 hover:text-white">
              Terms
            </Link>
            <span className="mx-2 text-white/20">·</span>
            <Link href="/privacy-policy" className="underline underline-offset-4 hover:text-white">
              Privacy
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
