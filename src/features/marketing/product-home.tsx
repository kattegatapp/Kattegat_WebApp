import {
  ArrowRight,
  MessageSquare,
  Search,
  ShieldCheck,
  Sparkles,
  Wallet,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { Reveal } from "@/components/motion/reveal";
import { SiteFooter } from "@/features/marketing/site-footer";
import type { PublicAppSettings } from "@/lib/api/settings";
import { cn } from "@/lib/utils";

type ProductHomeProps = {
  settings: PublicAppSettings;
};

const howItWorks = [
  {
    icon: Search,
    title: "Discover talent",
    body: "Browse hospitality categories across Dubai — DJs, hosts, F&B teams, event crews, and more.",
  },
  {
    icon: MessageSquare,
    title: "Talk directly",
    body: "Buyers and providers message in-app. No agency gatekeeper between the brief and the book.",
  },
  {
    icon: Wallet,
    title: "Keep the deal",
    body: "Kattegat earns from memberships and managed White Glove service — never a cut of your booking.",
  },
];

const audiences = [
  {
    title: "For venues & buyers",
    body: "Post a requirement once, shortlist verified providers, and book with a clear conversation trail.",
    points: ["Post requirements and receive direct applications", "Chat in one place", "Trust signals for established talent"],
  },
  {
    title: "For talent & sellers",
    body: "Build a profile, list services, respond to live demand, and get paid for the work — not the middleman.",
    points: ["Show up in search and category browse", "Apply to live requirements", "Manage services from one dashboard"],
  },
];

const memberships = [
  {
    name: "Starter",
    summary: "Get listed and start receiving demand at zero platform commission.",
  },
  {
    name: "Premium",
    summary: "Higher visibility, direct client tools, and stronger placement in discovery.",
  },
  {
    name: "White Glove",
    summary: "Managed concierge support for premium leads when you want a human in the loop.",
  },
];

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-extrabold uppercase tracking-[0.28em] text-brand-blue">{children}</p>
  );
}

/** Live product home — no waitlist, early-access, or launch-roadmap copy. */
export function ProductHome({ settings }: ProductHomeProps) {
  const appStoreUrl = settings.links.appStoreUrl?.trim() || null;
  const playStoreUrl = settings.links.playStoreUrl?.trim() || null;
  const supportEmail = settings.brand.supportEmail;
  const instagramUrl = settings.links.instagramUrl?.trim() || "https://instagram.com/kattegat.app";
  const hasStoreLinks = Boolean(appStoreUrl || playStoreUrl);

  return (
    <main className="min-h-screen overflow-hidden text-brand-forest">
      <section className="relative min-h-[100svh] overflow-hidden">
        <Image
          src="/brand/launch-visual.jpg"
          alt=""
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-brand-forest/75 via-brand-forest/55 to-[#06140d]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgb(111_219_66/0.22),transparent_55%)]" />

        <div className="relative z-10 mx-auto flex min-h-[100svh] w-full max-w-6xl flex-col px-5 py-6 sm:px-8 sm:py-8">
          <header className="animate-in fade-in slide-in-from-top-4 flex items-center justify-between gap-4 duration-700">
            <Link href="/" className="flex min-w-0 items-center">
              <Image
                src="/brand/logo/logo-horizontal-main.png"
                alt="Kattegat"
                width={220}
                height={68}
                className="h-auto w-36 brightness-0 invert sm:w-44"
                priority
              />
            </Link>
            <a
              href={`mailto:${supportEmail}`}
              className="text-sm font-semibold text-white/75 transition-colors hover:text-white"
            >
              Contact
            </a>
          </header>

          <div className="flex flex-1 flex-col justify-end pb-16 pt-24 sm:pb-20 sm:pt-28">
            <p className="animate-in fade-in slide-in-from-bottom-2 text-xs font-extrabold uppercase tracking-[0.28em] text-brand-mantis duration-700">
              Dubai · Events & hospitality
            </p>
            <h1 className="animate-in fade-in slide-in-from-bottom-4 mt-5 max-w-4xl text-5xl font-extrabold leading-[0.96] tracking-[-0.04em] text-white duration-700 sm:text-7xl lg:text-8xl">
              Find talent.
              <br />
              Get booked.
              <br />
              No middlemen.
            </h1>
            <p className="animate-in fade-in slide-in-from-bottom-4 mt-6 max-w-xl text-base font-medium leading-8 text-white/80 delay-150 duration-700 sm:text-lg">
              Kattegat is the direct marketplace for Dubai&apos;s events and hospitality industry —
              sellers keep what they earn, buyers book the person doing the work.
            </p>

            <div className="animate-in fade-in slide-in-from-bottom-6 mt-10 flex flex-col gap-3 delay-300 duration-700 sm:flex-row sm:items-center">
              {hasStoreLinks ? (
                <>
                  {appStoreUrl ? (
                    <Link
                      href={appStoreUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn(
                        buttonVariants({ size: "lg" }),
                        "h-12 rounded-2xl px-7 text-base font-extrabold",
                      )}
                    >
                      Download on the App Store
                    </Link>
                  ) : null}
                  {playStoreUrl ? (
                    <Link
                      href={playStoreUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn(
                        buttonVariants({ variant: "outline", size: "lg" }),
                        "h-12 rounded-2xl border-white/35 bg-white/10 px-7 text-base font-bold text-white backdrop-blur hover:bg-white/18 hover:text-white",
                      )}
                    >
                      Get it on Google Play
                    </Link>
                  ) : null}
                </>
              ) : (
                <>
                  <Link
                    href={instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      buttonVariants({ size: "lg" }),
                      "h-12 rounded-2xl px-7 text-base font-extrabold",
                    )}
                  >
                    Follow @kattegat.app
                  </Link>
                  <a
                    href={`mailto:${supportEmail}`}
                    className={cn(
                      buttonVariants({ variant: "outline", size: "lg" }),
                      "h-12 rounded-2xl border-white/35 bg-white/10 px-7 text-base font-bold text-white backdrop-blur hover:bg-white/18 hover:text-white",
                    )}
                  >
                    Talk to us
                    <ArrowRight className="size-4" />
                  </a>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-8 sm:py-20">
        <Reveal className="max-w-2xl">
          <SectionLabel>How it works</SectionLabel>
          <h2 className="mt-3 text-3xl font-extrabold tracking-[-0.03em] text-brand-forest sm:text-4xl">
            Direct connections. Zero deal commission.
          </h2>
        </Reveal>
        <div className="mt-12 grid gap-10 md:grid-cols-3 md:gap-8">
          {howItWorks.map((item, index) => (
            <Reveal key={item.title} delayMs={index * 100}>
              <item.icon className="h-6 w-6 text-brand-blue" />
              <h3 className="mt-5 text-lg font-extrabold text-brand-forest">{item.title}</h3>
              <p className="mt-3 text-sm leading-7 text-muted-foreground sm:text-base">{item.body}</p>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="border-y border-brand-forest/8 bg-white/50">
        <div className="mx-auto grid w-full max-w-6xl gap-12 px-5 py-16 sm:px-8 sm:py-20 lg:grid-cols-2 lg:gap-16">
          {audiences.map((audience, index) => (
            <Reveal key={audience.title} delayMs={index * 120}>
              <SectionLabel>{audience.title}</SectionLabel>
              <h2 className="mt-3 text-2xl font-extrabold tracking-[-0.03em] text-brand-forest sm:text-3xl">
                {audience.body}
              </h2>
              <ul className="mt-6 space-y-3">
                {audience.points.map((point) => (
                  <li
                    key={point}
                    className="flex gap-3 text-sm font-medium leading-6 text-muted-foreground sm:text-base"
                  >
                    <ShieldCheck className="mt-0.5 size-4 shrink-0 text-brand-mantis" />
                    {point}
                  </li>
                ))}
              </ul>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-8 sm:py-20">
        <Reveal className="max-w-2xl">
          <SectionLabel>Membership</SectionLabel>
          <h2 className="mt-3 text-3xl font-extrabold tracking-[-0.03em] text-brand-forest sm:text-4xl">
            Built for every stage of a hospitality business
          </h2>
          <p className="mt-4 text-base leading-7 text-muted-foreground">
            From getting discovered to premium managed support — always without taking a commission
            on the booking itself.
          </p>
        </Reveal>
        <div className="mt-12 grid gap-8 sm:grid-cols-3">
          {memberships.map((tier, index) => (
            <Reveal key={tier.name} delayMs={index * 100}>
              <div className="border-t-2 border-brand-mantis/70 pt-5">
                <div className="flex items-center gap-2">
                  <Sparkles className="size-4 text-brand-blue" />
                  <h3 className="text-lg font-extrabold text-brand-forest">{tier.name}</h3>
                </div>
                <p className="mt-3 text-sm leading-7 text-muted-foreground sm:text-base">
                  {tier.summary}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-5 pb-8 sm:px-8">
        <Reveal>
          <div className="relative overflow-hidden rounded-[2rem] border border-brand-forest/10 bg-brand-forest px-6 py-12 text-white sm:rounded-[2.5rem] sm:px-12 sm:py-14">
            <div className="pointer-events-none absolute -right-16 top-0 h-56 w-56 rounded-full bg-brand-mantis/20 blur-3xl" />
            <div className="pointer-events-none absolute -left-10 bottom-0 h-40 w-40 rounded-full bg-brand-blue/30 blur-3xl" />
            <div className="relative max-w-3xl">
              <SectionLabel>
                <span className="text-brand-mantis">The company</span>
              </SectionLabel>
              <h2 className="mt-3 text-3xl font-extrabold tracking-[-0.03em] sm:text-4xl">
                Built in Dubai. By the industry. For the industry.
              </h2>
              <p className="mt-5 text-base leading-8 text-white/75 sm:text-lg">
                We&apos;ve stood on both sides of the booking — the stage and the venue floor. Kattegat
                exists so talent and clients meet directly, keep their money, and run hospitality work
                without an agency skim on every deal.
              </p>
              <p className="mt-4 text-sm font-semibold text-white/55">
                {settings.brand.legalName} · {settings.brand.market}, UAE
              </p>
            </div>
          </div>
        </Reveal>
      </section>

      <SiteFooter />
    </main>
  );
}
