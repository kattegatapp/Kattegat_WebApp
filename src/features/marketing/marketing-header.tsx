"use client";

import { ArrowUpRight, Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { HeaderAccountMenu } from "@/features/marketing/header-account-menu";
import { cn } from "@/lib/utils";

type MarketingHeaderProps = {
  brandName?: string;
};

const navigation = [
  ["Home", "/"],
  ["Search", "/search"],
  ["Services", "/services"],
  ["Plans", "/plans"],
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
      ["Search", "/search"],
      ["Services", "/services"],
      ["How it works", "/how-it-works"],
    ],
  },
  {
    label: "Dubai services",
    links: [
      ["DJs", "/dubai/dj"],
      ["Event hosts", "/dubai/event-host"],
      ["Restaurant consultancy", "/dubai/restaurant-consultancy"],
      ["Event management", "/dubai/event-management"],
    ],
  },
  {
    label: "Company & help",
    links: [
      ["Plans", "/plans"],
      ["About", "/about"],
      ["FAQ", "/faq"],
      ["Contact", "/contact"],
    ],
  },
] as const;

function isActivePath(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function MarketingHeader({ brandName = "Kattegat" }: MarketingHeaderProps) {
  const pathname = usePathname() || "/";
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="relative isolate z-[100] grid h-16 w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-4 rounded-full border border-white/15 bg-[#003912] px-4 text-white shadow-[0_14px_40px_rgb(0_0_0/0.28)] lg:flex lg:h-[4.5rem] lg:gap-0 lg:px-5">
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
          className="h-auto w-32 max-w-full object-contain sm:w-36 lg:w-40"
          priority
        />
      </Link>

      <nav
        className="absolute left-1/2 hidden -translate-x-1/2 shrink-0 items-center gap-0.5 text-xs font-bold lg:flex xl:gap-1 xl:text-[13px]"
        aria-label="Main navigation"
      >
        {navigation.map(([label, href]) => {
          const active = isActivePath(pathname, href);
          const isPlans = href === "/plans";
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "relative whitespace-nowrap rounded-full px-2.5 py-2.5 transition focus-visible:outline-2 focus-visible:outline-brand-mantis xl:px-3 2xl:px-4",
                active
                  ? "font-extrabold text-white"
                  : isPlans
                    ? "bg-brand-mantis/15 font-extrabold text-brand-mantis ring-1 ring-inset ring-brand-mantis/30 hover:bg-brand-mantis/20 hover:text-brand-mantis"
                    : "text-white/70 hover:text-white",
              )}
            >
              <span className="flex items-center gap-1.5">
                {label}
                {isPlans ? (
                  <span className="rounded-full bg-brand-mantis px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-[0.12em] text-brand-forest">
                    Pro
                  </span>
                ) : null}
              </span>
              <span
                aria-hidden
                className={cn(
                  "pointer-events-none absolute inset-x-3 bottom-1.5 h-0.5 rounded-full bg-brand-mantis transition-opacity duration-200",
                  active ? "opacity-100" : "opacity-0",
                )}
              />
            </Link>
          );
        })}
      </nav>

      <div className="ml-auto hidden shrink-0 items-center lg:flex">
        <HeaderAccountMenu />
      </div>

      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="m-0 flex size-11 shrink-0 items-center justify-center justify-self-end bg-white/10 p-0 leading-none text-white hover:bg-white/15 hover:text-brand-mantis lg:hidden"
        onClick={() => setMenuOpen((value) => !value)}
        aria-expanded={menuOpen}
        aria-label="Toggle navigation"
      >
        {menuOpen ? <X className="size-6" /> : <Menu className="size-6" />}
      </Button>

      {menuOpen ? (
        <div className="animate-in fade-in absolute left-1/2 top-[calc(100%+0.65rem)] z-[110] max-h-[calc(100dvh-6.5rem)] w-[calc(100vw-1.5rem)] -translate-x-1/2 overflow-x-hidden overflow-y-auto overscroll-contain rounded-3xl border border-white/15 bg-[#003912] p-3 pb-5 text-white shadow-[0_24px_80px_rgb(0_0_0/0.45)] duration-200 lg:hidden">
          <nav className="grid gap-2" aria-label="Mobile navigation">
            {mobileNavigationSections.map((section) => (
              <section
                key={section.label}
                className="rounded-2xl border border-white/10 bg-white/[0.04] p-2"
              >
                <p className="px-3 pb-1 pt-2 text-[10px] font-extrabold uppercase tracking-[0.2em] text-brand-mantis">
                  {section.label}
                </p>
                {section.links.map(([label, href]) => {
                  const active = isActivePath(pathname, href);
                  const isPlans = href === "/plans";
                  return (
                    <Link
                      key={href}
                      href={href}
                      aria-current={active ? "page" : undefined}
                      onClick={() => setMenuOpen(false)}
                      className={cn(
                        "flex min-h-11 items-center justify-between rounded-xl px-3 py-3 text-sm font-bold transition",
                        active
                          ? "text-brand-mantis"
                          : isPlans
                            ? "bg-brand-mantis/10 text-brand-mantis ring-1 ring-inset ring-brand-mantis/25"
                            : "text-white/80 hover:bg-white/10 hover:text-white",
                      )}
                    >
                      <span className="flex items-center gap-2">
                        {label}
                        {isPlans ? (
                          <span className="rounded-full bg-brand-mantis px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-[0.12em] text-brand-forest">
                            Pro
                          </span>
                        ) : null}
                      </span>
                      <ArrowUpRight
                        className={cn(
                          "size-4 transition",
                          active ? "text-brand-mantis opacity-80" : "opacity-35",
                        )}
                      />
                    </Link>
                  );
                })}
              </section>
            ))}
          </nav>
          <div className="mt-2">
            <div className="rounded-2xl border border-white/15 bg-white/[0.06] p-3">
              <p className="mb-2 px-1 text-[11px] font-extrabold uppercase tracking-[0.18em] text-brand-mantis">
                Account
              </p>
              <HeaderAccountMenu
                className="w-full justify-between"
                onNavigate={() => setMenuOpen(false)}
              />
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
