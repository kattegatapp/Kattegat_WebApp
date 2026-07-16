"use client";

import { ChevronDown, Menu, X } from "lucide-react";
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

function StoreLinks({
  appStoreUrl,
  playStoreUrl,
  mobileAppUrl,
  tone,
}: Omit<MarketingHeaderProps, "brandName">) {
  const isLight = tone === "light";
  return (
    <div className="grid gap-3 text-left">
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
            className="h-12 w-auto"
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
            className="h-[3.65rem] w-auto"
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
        "relative z-[100] flex min-h-[4.25rem] w-full items-center justify-between px-3 py-2 sm:px-5",
        isLight
          ? "rounded-full border border-brand-forest/10 bg-white/90 text-brand-forest shadow-[0_12px_40px_rgb(0_57_18/0.08)] backdrop-blur-xl"
          : "rounded-2xl border border-white/15 bg-[#003912] text-white shadow-[0_18px_55px_rgb(0_0_0/0.45)]",
      )}
    >
      <Link
        href="/"
        className="flex shrink-0 items-center gap-3 rounded-xl focus-visible:outline-2 focus-visible:outline-brand-mantis"
      >
        <Image
          src="/brand/app-icon.png"
          alt=""
          width={40}
          height={40}
          className="rounded-xl ring-1 ring-brand-forest/10"
          priority
        />
        <span
          className={cn(
            "whitespace-nowrap text-lg font-extrabold tracking-[-0.03em]",
            isLight ? "text-brand-forest" : "text-white",
          )}
        >
          {brandName}
        </span>
      </Link>

      <nav
        className="hidden shrink-0 items-center gap-0.5 text-sm font-bold xl:flex"
        aria-label="Main navigation"
      >
        {navigation.map(([label, href]) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "whitespace-nowrap rounded-full px-3 py-2.5 transition focus-visible:outline-2 focus-visible:outline-brand-mantis 2xl:px-4",
              isLight
                ? "text-brand-forest/70 hover:bg-brand-forest/5 hover:text-brand-forest"
                : "text-white/90 hover:bg-white/12 hover:text-white",
            )}
          >
            {label}
          </Link>
        ))}
      </nav>

      <details className="group relative hidden shrink-0 xl:block">
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
            "absolute right-0 top-[calc(100%+0.75rem)] z-[110] w-72 rounded-2xl border p-4 shadow-[0_24px_80px_rgb(0_0_0/0.18)]",
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
          />
        </div>
      </details>

      <Button
        variant="ghost"
        size="icon"
        className={cn(
          "size-11 shrink-0 xl:hidden",
          isLight
            ? "border border-brand-forest/12 text-brand-forest hover:bg-brand-forest/5"
            : "border border-white/20 bg-[#003912] text-white hover:bg-white/12 hover:text-white",
        )}
        onClick={() => setMenuOpen((value) => !value)}
        aria-expanded={menuOpen}
        aria-label="Toggle navigation"
      >
        {menuOpen ? <X /> : <Menu />}
      </Button>

      {menuOpen ? (
        <div
          className={cn(
            "absolute inset-x-0 top-[calc(100%+0.75rem)] z-[110] max-h-[calc(100dvh-7rem)] overflow-y-auto rounded-2xl border p-3 shadow-[0_24px_80px_rgb(0_0_0/0.18)] xl:hidden",
            isLight
              ? "border-brand-forest/10 bg-white text-brand-forest"
              : "border-white/15 bg-[#003912] text-white shadow-[0_24px_80px_rgb(0_0_0/0.55)]",
          )}
        >
          <nav className="grid">
            {navigation.map(([label, href]) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMenuOpen(false)}
                className={cn(
                  "flex min-h-12 items-center rounded-xl px-4 py-3.5 text-sm font-bold transition",
                  isLight ? "hover:bg-brand-forest/5" : "hover:bg-white/12",
                )}
              >
                {label}
              </Link>
            ))}
          </nav>
          <div
            className={cn(
              "mt-2 border-t pt-3",
              isLight ? "border-brand-forest/10" : "border-white/15",
            )}
          >
            <p
              className={cn(
                "mb-3 px-1 text-[11px] font-extrabold uppercase tracking-[0.18em]",
                isLight ? "text-brand-blue" : "text-brand-mantis",
              )}
            >
              Get the app
            </p>
            <StoreLinks
              appStoreUrl={appStoreUrl}
              playStoreUrl={playStoreUrl}
              mobileAppUrl={mobileAppUrl}
              tone={tone}
            />
          </div>
        </div>
      ) : null}
    </header>
  );
}
