"use client";

import { ArrowUpRight, Menu } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { HeaderAccountMenu } from "@/features/marketing/header-account-menu";
import { cn } from "@/lib/utils";

type MarketingHeaderProps = {
  brandName?: string;
};

const navigation = [
  ["Home", "/"],
  ["Search", "/search"],
  ["Services", "/services"],
  ["Competition", "/competition"],
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
      ["Competition", "/competition"],
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
  const [competitionStatus, setCompetitionStatus] = useState("live");
  useEffect(() => {
    let active = true;
    fetch("/api/competition", { cache: "no-store" }).then((response) => response.json()).then((body) => {
      if (active && body?.data?.status) setCompetitionStatus(body.data.status);
    }).catch(() => undefined);
    return () => { active = false; };
  }, []);

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
          const isCompetition = href === "/competition";
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "relative whitespace-nowrap rounded-full px-2.5 py-2.5 transition focus-visible:outline-2 focus-visible:outline-brand-mantis xl:px-3 2xl:px-4",
                isCompetition
                  ? "bg-gradient-to-r from-brand-mantis to-brand-emerald font-extrabold text-brand-forest shadow-[0_0_22px_rgb(111_219_66/0.3)] ring-1 ring-inset ring-white/25 hover:brightness-105"
                  : active
                  ? "font-extrabold text-white"
                  : isPlans
                    ? "bg-brand-mantis/15 font-extrabold text-brand-mantis ring-1 ring-inset ring-brand-mantis/30 hover:bg-brand-mantis/20 hover:text-brand-mantis"
                    : "text-white/70 hover:text-white",
              )}
            >
              <span className="flex items-center gap-1.5">
                {label}
                {isCompetition ? (
                  <span className="flex items-center gap-1 rounded-full bg-brand-forest/15 px-1.5 py-0.5 text-[8px] font-extrabold uppercase tracking-[0.1em]">
                    <span className={cn("size-1.5 rounded-full bg-brand-forest", competitionStatus === "live" && "animate-pulse")} /> {competitionStatus === "live" ? "Live" : competitionStatus}
                  </span>
                ) : null}
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
                  active && !isCompetition ? "opacity-100" : "opacity-0",
                )}
              />
            </Link>
          );
        })}
      </nav>

      <div className="ml-auto hidden shrink-0 items-center lg:flex">
        <HeaderAccountMenu />
      </div>

      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="m-0 flex size-11 shrink-0 items-center justify-center justify-self-end bg-white/10 p-0 leading-none text-white hover:bg-white/15 hover:text-brand-mantis lg:hidden"
          onClick={() => setMenuOpen(true)}
          aria-expanded={menuOpen}
          aria-label="Open navigation sidebar"
        >
          <Menu className="size-6" />
        </Button>

        <SheetContent side="right" className="w-[88vw] max-w-sm overflow-y-auto border-l border-white/15 bg-[#003912] p-0 text-white lg:hidden">
          <SheetHeader className="border-b border-white/10 px-5 pb-5 pt-6">
            <Image src="/brand/logo/logo-horizontal-alternative.png" alt={brandName} width={150} height={46} className="h-auto w-36" />
            <SheetTitle className="sr-only">Main navigation</SheetTitle>
            <SheetDescription className="text-xs text-[#C6F3CA]/70">Explore Kattegat and manage your account.</SheetDescription>
          </SheetHeader>
          <div className="p-3 pb-6">
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
                  const isCompetition = href === "/competition";
                  return (
                    <Link
                      key={href}
                      href={href}
                      aria-current={active ? "page" : undefined}
                      onClick={() => setMenuOpen(false)}
                      className={cn(
                        "flex min-h-11 items-center justify-between rounded-xl px-3 py-3 text-sm font-bold transition",
                        isCompetition
                          ? "my-1 border border-brand-mantis/40 bg-gradient-to-r from-brand-mantis to-brand-emerald text-brand-forest shadow-[0_8px_24px_rgb(111_219_66/0.18)]"
                          : active
                          ? "text-brand-mantis"
                          : isPlans
                            ? "bg-brand-mantis/10 text-brand-mantis ring-1 ring-inset ring-brand-mantis/25"
                            : "text-white/80 hover:bg-white/10 hover:text-white",
                      )}
                    >
                      <span className="flex items-center gap-2">
                        {label}
                        {isCompetition ? (
                          <span className="flex items-center gap-1 rounded-full bg-brand-forest/15 px-2 py-1 text-[8px] font-extrabold uppercase tracking-[0.1em] text-brand-forest">
                            <span className={cn("size-1.5 rounded-full bg-brand-forest", competitionStatus === "live" && "animate-pulse")} />
                            {competitionStatus === "live" ? "Live" : competitionStatus}
                          </span>
                        ) : null}
                        {isPlans ? (
                          <span className="rounded-full bg-brand-mantis px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-[0.12em] text-brand-forest">
                            Pro
                          </span>
                        ) : null}
                      </span>
                      <ArrowUpRight
                        className={cn(
                          "size-4 transition",
                          isCompetition
                            ? "text-brand-forest opacity-80"
                            : active
                              ? "text-brand-mantis opacity-80"
                              : "opacity-35",
                        )}
                      />
                    </Link>
                  );
                })}
              </section>
            ))}
            </nav>
            <div className="mt-3 rounded-2xl border border-white/15 bg-white/[0.06] p-3">
                <p className="mb-2 px-1 text-[11px] font-extrabold uppercase tracking-[0.18em] text-brand-mantis">Account</p>
                <HeaderAccountMenu className="w-full justify-between" onNavigate={() => setMenuOpen(false)} />
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </header>
  );
}
