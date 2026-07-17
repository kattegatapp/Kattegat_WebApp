"use client";

import { ArrowUpRight, ChevronDown, Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type MarketingHeaderProps = {
  brandName?: string;
  appStoreUrl: string | null;
  playStoreUrl: string | null;
  mobileAppUrl?: string | null;
  /** `light` = option-2 home style; `dark` = solid forest bar for content pages */
  tone?: "light" | "dark";
};

const navigation = [
  ["Home", "/"],
  ["Services", "/services"],
  ["About", "/about"],
  ["How it works", "/how-it-works"],
  ["FAQ", "/faq"],
  ["Contact", "/contact"],
] as const;

const mobileNavigationSections = [
  {
    label: "Explore",
    links: [
      ["Home", "/"],
      ["Services", "/services"],
      ["How it works", "/how-it-works"],
    ],
  },
  {
    label: "Company & help",
    links: [
      ["About", "/about"],
      ["FAQ", "/faq"],
      ["Contact", "/contact"],
    ],
  },
] as const;

function StoreLinks({
  appStoreUrl,
  playStoreUrl,
  mobileAppUrl,
  tone,
  layout = "stacked",
}: Omit<MarketingHeaderProps, "brandName"> & { layout?: "stacked" | "row" }) {
  const isLight = tone === "light";
  return (
    <div
      className={cn(
        "grid gap-3 text-left",
        layout === "row" && "grid-cols-2 items-center gap-2",
      )}
    >
      {appStoreUrl ? (
        <a
          href={appStoreUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block rounded-xl focus-visible:outline-2 focus-visible:outline-brand-mantis"
        >
          <Image
            src="/brand/stores/app-store-badge.svg"
            alt="Download on the App Store"
            width={156}
            height={52}
            className={cn(
              "h-12 w-auto",
              layout === "row" && "h-auto max-h-10 w-full object-contain",
            )}
          />
        </a>
      ) : (
        <div
          className={cn(
            "rounded-xl border px-3 py-3",
            isLight
              ? "border-brand-forest/10 bg-brand-forest/5 text-brand-forest/60"
              : "border-white/12 bg-white/[0.04] text-white/60",
          )}
        >
          <p className="text-sm font-extrabold">App Store</p>
          <p className="mt-0.5 text-[11px] font-semibold">Coming soon</p>
        </div>
      )}

      {playStoreUrl ? (
        <a
          href={playStoreUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block -ml-2 rounded-xl focus-visible:outline-2 focus-visible:outline-brand-mantis"
        >
          <Image
            src="/brand/stores/google-play-badge.png"
            alt="Get it on Google Play"
            width={180}
            height={70}
            className={cn(
              "h-[3.65rem] w-auto",
              layout === "row" && "h-auto max-h-12 w-full object-contain",
            )}
          />
        </a>
      ) : (
        <div
          className={cn(
            "rounded-xl border px-3 py-3",
            isLight
              ? "border-brand-forest/10 bg-brand-forest/5 text-brand-forest/60"
              : "border-white/12 bg-white/[0.04] text-white/60",
          )}
        >
          <p className="text-sm font-extrabold">Google Play</p>
          <p className="mt-0.5 text-[11px] font-semibold">Coming soon</p>
        </div>
      )}

      {mobileAppUrl ? (
        <a
          href={mobileAppUrl}
          className={cn(
            "mt-1 text-center text-xs font-bold",
            layout === "row" && "col-span-2",
            isLight
              ? "text-brand-blue hover:text-brand-forest"
              : "text-brand-mantis hover:text-white",
          )}
        >
          Open the installed app
        </a>
      ) : null}
    </div>
  );
}

export function MarketingHeader({
  brandName = "Kattegat",
  appStoreUrl,
  playStoreUrl,
  mobileAppUrl = null,
  tone = "dark",
}: MarketingHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const isLight = tone === "light";

  return (
    <header
      className={cn(
        "production-header-surface relative isolate z-[100] grid h-16 w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-4 rounded-[1.25rem] border border-white/20 bg-brand-forest/80 px-4 shadow-[0_14px_40px_rgb(0_0_0/0.22)] backdrop-blur-xl lg:flex lg:h-[4.5rem] lg:gap-0 lg:px-5 lg:py-0",
        isLight
          ? "text-white lg:rounded-full lg:border-brand-forest/10 lg:bg-white lg:text-brand-forest lg:shadow-[0_16px_50px_rgb(0_0_0/0.16)] lg:backdrop-blur-none"
          : "text-white lg:border-white/15 lg:bg-[#003912] lg:shadow-[0_18px_55px_rgb(0_0_0/0.45)] lg:backdrop-blur-none",
      )}
    >
      <Link
        href="/"
        aria-label={`${brandName} home`}
        className="flex shrink-0 items-center focus-visible:outline-2 focus-visible:outline-brand-mantis"
      >
        <Image
          src="/brand/logo/logo-horizontal-alternative.png"
          alt={brandName}
          width={160}
          height={50}
          className="h-auto w-32 max-w-full object-contain drop-shadow-[0_2px_10px_rgb(0_0_0/0.45)] sm:w-36 lg:w-40 lg:drop-shadow-none"
          priority
        />
      </Link>

      <nav
        className="absolute left-1/2 hidden -translate-x-1/2 shrink-0 items-center gap-0 text-xs font-bold lg:flex xl:gap-1 xl:text-[13px]"
        aria-label="Main navigation"
      >
        {navigation.map(([label, href]) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "whitespace-nowrap rounded-full px-2.5 py-2.5 transition focus-visible:outline-2 focus-visible:outline-brand-mantis xl:px-3 2xl:px-4",
              isLight
                ? "text-brand-forest/70 hover:bg-brand-forest/5 hover:text-brand-forest"
                : "text-white/90 hover:bg-white/12 hover:text-white",
            )}
          >
            {label}
          </Link>
        ))}
      </nav>

      <details className="group relative ml-auto hidden shrink-0 lg:block">
        <summary
          className={cn(
            "flex min-h-11 min-w-36 cursor-pointer list-none items-center justify-center gap-2 rounded-full px-5 text-sm font-extrabold transition focus-visible:outline-2",
            isLight
              ? "bg-brand-forest text-white hover:bg-brand-blue focus-visible:outline-brand-mantis"
              : "bg-brand-mantis text-brand-forest shadow-[0_8px_24px_rgb(111_219_66/0.22)] hover:bg-white focus-visible:outline-white",
          )}
        >
          Get the app
          <ChevronDown className="size-4 transition group-open:rotate-180" />
        </summary>
        <div
          className={cn(
            "group-open:animate-in group-open:fade-in group-open:slide-in-from-top-2 absolute right-0 top-[calc(100%+0.75rem)] z-[110] w-72 rounded-2xl border p-4 shadow-[0_24px_80px_rgb(0_0_0/0.18)] group-open:duration-200",
            isLight
              ? "border-brand-forest/10 bg-white text-brand-forest"
              : "border-white/15 bg-[#003912] text-white shadow-[0_24px_80px_rgb(0_0_0/0.55)]",
          )}
        >
          <p
            className={cn(
              "px-1 pb-3 text-[11px] font-extrabold uppercase tracking-[0.18em]",
              isLight ? "text-brand-blue" : "text-brand-mantis",
            )}
          >
            Choose your platform
          </p>
          <StoreLinks
            appStoreUrl={appStoreUrl}
            playStoreUrl={playStoreUrl}
            mobileAppUrl={mobileAppUrl}
            tone={tone}
            layout="row"
          />
        </div>
      </details>

      <Button
        type="button"
        variant="ghost"
        size="icon"
        className={cn(
          "m-0 flex size-11 shrink-0 items-center justify-center justify-self-end p-0 leading-none lg:hidden",
          isLight
            ? "bg-white/10 text-white hover:bg-white/20 hover:text-brand-mantis"
            : "bg-white/10 text-white hover:bg-white/20 hover:text-brand-mantis",
        )}
        onClick={() => setMenuOpen((value) => !value)}
        aria-expanded={menuOpen}
        aria-label="Toggle navigation"
      >
        {menuOpen ? <X className="size-6" /> : <Menu className="size-6" />}
      </Button>

      {menuOpen ? (
        <div
          className={cn(
            "animate-in fade-in absolute left-1/2 top-[calc(100%+0.65rem)] z-[110] max-h-[calc(100dvh-6.5rem)] w-[calc(100vw-1.5rem)] -translate-x-1/2 overflow-x-hidden overflow-y-auto overscroll-contain rounded-3xl border p-3 pb-5 shadow-[0_24px_80px_rgb(0_0_0/0.28)] backdrop-blur-2xl duration-200 lg:hidden",
            isLight
              ? "border-white/60 bg-white/95 text-brand-forest"
              : "border-white/15 bg-[#003912]/95 text-white shadow-[0_24px_80px_rgb(0_0_0/0.55)]",
          )}
        >
          <nav className="grid gap-2" aria-label="Mobile navigation">
            {mobileNavigationSections.map((section) => (
              <section
                key={section.label}
                className={cn(
                  "rounded-2xl border p-2",
                  isLight
                    ? "border-brand-forest/8 bg-brand-forest/[0.025]"
                    : "border-white/10 bg-white/[0.04]",
                )}
              >
                <p
                  className={cn(
                    "px-3 pb-1 pt-2 text-[10px] font-extrabold uppercase tracking-[0.2em]",
                    isLight ? "text-brand-blue" : "text-brand-mantis",
                  )}
                >
                  {section.label}
                </p>
                {section.links.map(([label, href]) => (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setMenuOpen(false)}
                    className={cn(
                      "group/link flex min-h-11 items-center justify-between rounded-xl px-3 py-3 text-sm font-bold transition",
                      isLight ? "hover:bg-white" : "hover:bg-white/10",
                    )}
                  >
                    {label}
                    <ArrowUpRight className="size-4 opacity-35 transition group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 group-hover/link:opacity-100" />
                  </Link>
                ))}
              </section>
            ))}
          </nav>
          <div
            className={cn(
              "animate-in fade-in slide-in-from-bottom-2 mt-2 rounded-2xl border p-4 delay-100 duration-300 fill-mode-both",
              isLight
                ? "border-brand-mantis/25 bg-brand-forest text-white"
                : "border-white/15 bg-white/[0.06]",
            )}
          >
            <p
              className={cn(
                "mb-3 px-1 text-[11px] font-extrabold uppercase tracking-[0.18em]",
                "text-brand-mantis",
              )}
            >
              Get the app
            </p>
            <StoreLinks
              appStoreUrl={appStoreUrl}
              playStoreUrl={playStoreUrl}
              mobileAppUrl={mobileAppUrl}
              tone="dark"
              layout="row"
            />
          </div>
        </div>
      ) : null}
    </header>
  );
}
