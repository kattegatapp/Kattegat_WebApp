import Image from "next/image";
import Link from "next/link";

import { GetTheAppCard } from "@/features/marketing/get-the-app-card";
import { KATTEGAT_SOCIALS } from "@/features/marketing/socials";

const exploreLinks = [
  ["Home", "/"],
  ["Search", "/search"],
  ["Dubai", "/dubai"],
  ["Services", "/services"],
  ["How it works", "/how-it-works"],
  ["Plans", "/plans"],
  ["About", "/about"],
  ["FAQ", "/faq"],
  ["Contact", "/contact"],
] as const;

const dubaiLinks = [
  ["DJs in Dubai", "/dubai/dj"],
  ["Event hosts", "/dubai/event-host"],
  ["Entertainment", "/dubai/entertainment"],
  ["Event management", "/dubai/event-management"],
  ["Restaurant consultancy", "/dubai/restaurant-consultancy"],
  ["Marketing", "/dubai/marketing"],
] as const;

const legalAndSupportLinks = [
  ["Sign in", "/login"],
  ["Create account", "/register"],
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
  mobileAppUrl?: string | null;
  instagramUrl?: string | null;
  linkedinUrl?: string | null;
};

function FooterLinkList({
  title,
  links,
}: {
  title: string;
  links: readonly (readonly [string, string])[];
}) {
  return (
    <div className="min-w-0">
      <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-brand-mantis">
        {title}
      </p>
      <ul className="mt-3 space-y-2">
        {links.map(([label, href]) => (
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
  );
}

export function SiteFooter({
  brandName = "Kattegat",
  supportEmail = "hello@kattegat.app",
  appStoreUrl = null,
  playStoreUrl = null,
  mobileAppUrl = null,
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
    <>
      <section className="border-t border-brand-forest/10 bg-[#F7F9F8] px-4 py-10 sm:px-6 sm:py-12">
        <div className="mx-auto max-w-6xl">
          <GetTheAppCard
            appStoreUrl={appStoreUrl}
            playStoreUrl={playStoreUrl}
            mobileAppUrl={mobileAppUrl}
          />
        </div>
      </section>

      <footer className="border-t border-white/10 bg-brand-forest text-white">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-9">
          {/* Mobile: stacked brand + grouped link cards (not one long straight list) */}
          <div className="lg:hidden">
            <div className="min-w-0">
              <Link
                href="/"
                aria-label={`${brandName} home`}
                className="inline-flex focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-mantis"
              >
                <Image
                  src="/brand/logo/logo-horizontal-alternative.svg"
                  alt={brandName}
                  width={400}
                  height={104}
                  className="h-16 w-auto max-w-[min(100%,22rem)] object-contain"
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
            </div>

            <div className="mt-8 grid gap-3">
              <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-brand-mantis">
                  Explore
                </p>
                <ul className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2.5">
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
              </section>

              <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-brand-mantis">
                  Dubai
                </p>
                <ul className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2.5">
                  {dubaiLinks.map(([label, href]) => (
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
              </section>

              <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-brand-mantis">
                  Legal &amp; support
                </p>
                <ul className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2.5">
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
              </section>

              {socialLinks.length ? (
                <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                  <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-brand-mantis">
                    Follow us
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {socialLinks.map((social) => (
                      <a
                        key={social.href}
                        href={social.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex min-h-10 items-center rounded-full border border-white/15 bg-white/[0.06] px-3.5 text-sm font-bold text-white/85 transition hover:border-brand-mantis/40 hover:text-brand-mantis"
                      >
                        {social.label}
                      </a>
                    ))}
                  </div>
                </section>
              ) : null}
            </div>

            <div className="mt-7 flex flex-col gap-2 border-t border-white/10 pt-5">
              <p className="text-xs text-white/40">
                © {new Date().getFullYear()} {brandName}. Built in Dubai, UAE.
              </p>
              <p className="text-xs text-white/40">
                <Link
                  href="/terms-of-service"
                  className="underline underline-offset-4 hover:text-white"
                >
                  Terms
                </Link>
                <span className="mx-2 text-white/20">·</span>
                <Link href="/privacy-policy" className="underline underline-offset-4 hover:text-white">
                  Privacy
                </Link>
              </p>
            </div>
          </div>

          {/* Desktop: original straight column layout */}
          <div className="hidden lg:block">
            <div className="grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_repeat(4,minmax(0,0.7fr))] lg:gap-6">
              <div className="min-w-0">
                <Link
                  href="/"
                  aria-label={`${brandName} home`}
                  className="inline-flex focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-mantis"
                >
                  <Image
                    src="/brand/logo/logo-horizontal-alternative.svg"
                    alt={brandName}
                    width={400}
                    height={104}
                    className="h-16 w-auto max-w-[min(100%,22rem)] object-contain lg:h-20"
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
              </div>

              <FooterLinkList title="Explore" links={exploreLinks} />
              <FooterLinkList title="Dubai" links={dubaiLinks} />
              <FooterLinkList title="Legal & support" links={legalAndSupportLinks} />

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
                <Link
                  href="/terms-of-service"
                  className="underline underline-offset-4 hover:text-white"
                >
                  Terms
                </Link>
                <span className="mx-2 text-white/20">·</span>
                <Link href="/privacy-policy" className="underline underline-offset-4 hover:text-white">
                  Privacy
                </Link>
              </p>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
