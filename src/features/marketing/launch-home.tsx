import {
  AtSign,
  Check,
  Circle,
  Headphones,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";

import { Avatar, AvatarFallback, AvatarGroup, AvatarGroupCount } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Reveal } from "@/components/motion/reveal";
import { KATTEGAT_SOCIALS } from "@/features/marketing/socials";
import { WaitlistForm } from "@/features/waitlist";
import { cn } from "@/lib/utils";

const scarcity = [
  { value: "1,000", label: "early access spots" },
  { value: "100", label: "Founding Member seats" },
  { value: "Dubai", label: "built in" },
];

const milestones = [
  {
    status: "Done",
    title: "Platform design locked",
    body: "The full product blueprint — identity system, memberships, tools — is finished and in build.",
    state: "done",
  },
  {
    status: "In progress",
    title: "App in active development",
    body: "Profiles, listings, search, and direct chat are being built right now.",
    state: "now",
  },
  {
    status: "Next",
    title: "First version in hand",
    body: "The working app reaches our internal team and early testers.",
    state: "next",
  },
  {
    status: "Then",
    title: "Founding Members onboarded",
    body: "The first 100 sellers claim their seats and set up their profiles before the public.",
    state: "next",
  },
  {
    status: "Launch",
    title: "Doors open — 1,000 first",
    body: "Early access for everyone on this list. iOS, Android, and web.",
    state: "next",
  },
];

const milestoneStateStyles = {
  done: {
    marker: "border-primary bg-primary text-brand-forest",
    card: "border-primary/35",
  },
  now: {
    marker: "border-brand-blue bg-white text-brand-blue",
    card: "border-brand-blue/30",
  },
  next: {
    marker: "border-brand-forest/12 bg-white text-muted-foreground",
    card: "border-brand-forest/10",
  },
} as const;

const episodes = [
  {
    title: "Why 99% of agencies are about to disappear",
    body: "The builder's case against the middleman economy in Dubai hospitality.",
  },
  {
    title: "What talent actually earns — and what they should",
    body: "Real numbers from real performers on what the commission model costs them.",
  },
  {
    title: "Inside the build",
    body: "Milestone updates straight from the team, as the app comes together.",
  },
];

const productPoints = [
  { icon: ShieldCheck, label: "Verified marketplace identities" },
  { icon: Users, label: "Buyer, seller, and concierge workflows" },
  { icon: Sparkles, label: "White Glove support for premium leads" },
];

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-extrabold uppercase tracking-[0.28em] text-brand-blue">{children}</p>
  );
}

/** Pre-launch home: waitlist story, roadmap, and join form. */
export function LaunchHome() {
  return (
    <main className="min-h-screen overflow-hidden pb-32 text-brand-forest sm:pb-24">
      <section className="px-3 py-3 sm:px-6 sm:py-6">
        <div className="launch-stage relative mx-auto flex min-h-[calc(100vh-1.5rem)] w-full max-w-7xl flex-col overflow-hidden rounded-[2rem] border border-white/80 px-5 py-6 shadow-2xl shadow-brand-forest/8 backdrop-blur-2xl sm:min-h-[calc(100vh-3rem)] sm:rounded-[3rem] sm:px-8 lg:px-14">
          <div className="pointer-events-none absolute left-1/2 top-[14%] h-[38rem] w-[38rem] -translate-x-1/2 rounded-full border border-dashed border-brand-forest/8" />
          <div className="pointer-events-none absolute left-1/2 top-[26%] h-[23rem] w-[23rem] -translate-x-1/2 rounded-full border border-dashed border-brand-forest/8" />
          <Sparkles className="pointer-events-none absolute bottom-[12%] left-1/2 h-4 w-4 -translate-x-1/2 text-brand-forest/18" />
          <Sparkles className="pointer-events-none absolute left-[12%] top-[63%] h-4 w-4 text-brand-forest/18" />
          <Sparkles className="pointer-events-none absolute right-[12%] top-[63%] h-4 w-4 text-brand-forest/18" />

          <header className="animate-in fade-in slide-in-from-top-4 relative z-10 flex items-center justify-between gap-4 duration-700">
            <div className="flex min-w-0 items-center">
              <Image
                src="/brand/logo/logo-horizontal-alternative.png"
                alt="Kattegat"
                width={220}
                height={68}
                className="h-auto w-40 sm:w-52"
                priority
              />
            </div>
            <div className="flex items-center gap-3">
              <Badge className="hidden border-brand-forest/10 bg-white/60 text-brand-forest/70 backdrop-blur sm:inline-flex">
                Launching Soon · Dubai
              </Badge>
            </div>
          </header>

          <div className="relative z-10 mx-auto flex w-full max-w-4xl flex-1 flex-col items-center justify-center py-12 text-center sm:py-16">
            <Badge className="animate-in fade-in slide-in-from-bottom-2 border-brand-forest/10 bg-white/66 px-3 py-1.5 text-brand-forest shadow-sm backdrop-blur duration-700">
              <Sparkles className="h-3.5 w-3.5" />
              Kattegat is launching soon
            </Badge>

            <h1 className="animate-in fade-in slide-in-from-bottom-4 mt-8 max-w-4xl text-5xl font-extrabold leading-[0.96] tracking-[-0.04em] text-[#080b0a] duration-700 sm:text-7xl lg:text-8xl">
              Find talent.
              <br />
              Get booked.
              <br />
              <span className="text-brand-forest">No middlemen.</span>
            </h1>

            <p className="animate-in fade-in slide-in-from-bottom-4 mx-auto mt-7 max-w-2xl text-base font-medium leading-8 text-muted-foreground delay-150 duration-700 sm:text-xl">
              The app for Dubai&apos;s events & hospitality industry. Talent talks to clients
              directly —{" "}
              <strong className="text-brand-forest">
                no commission, no management fee. Keep all your money.
              </strong>
            </p>

            <div className="animate-in fade-in slide-in-from-bottom-4 mt-8 flex flex-wrap justify-center gap-3 delay-300 duration-700">
              {scarcity.map((item) => (
                <Badge
                  key={item.label}
                  variant="outline"
                  className="h-auto rounded-full border-white/80 bg-white/70 px-4 py-2 text-sm font-bold text-brand-forest shadow-sm backdrop-blur transition-transform hover:-translate-y-0.5"
                >
                  {item.label === "built in" ? (
                    <>
                      Built in <span className="text-brand-blue">{item.value}</span>
                    </>
                  ) : (
                    <>
                      <span className="text-brand-blue">{item.value}</span> {item.label}
                    </>
                  )}
                </Badge>
              ))}
            </div>

            <div
              id="join"
              className="animate-in fade-in slide-in-from-bottom-6 mt-10 w-full scroll-mt-8 delay-500 duration-700"
            >
              <div className="mb-4 flex items-center justify-center gap-3">
                <AvatarGroup>
                  {["DJ", "VH", "EP"].map((initials) => (
                    <Avatar key={initials} className="bg-white">
                      <AvatarFallback className="bg-white text-xs font-extrabold text-brand-forest">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                  <AvatarGroupCount className="bg-white text-xs font-extrabold text-brand-forest">
                    +1K
                  </AvatarGroupCount>
                </AvatarGroup>
                <span className="text-sm font-semibold text-muted-foreground">
                  First 1,000 get access before public launch.
                </span>
              </div>
              <Suspense fallback={<div className="mx-auto h-[20rem] max-w-4xl rounded-[2rem] bg-white/50" aria-hidden />}>
                <WaitlistForm />
              </Suspense>
            </div>
          </div>

        </div>
      </section>

      <section className="mx-auto grid w-full max-w-6xl gap-4 px-5 py-12 sm:px-8 md:grid-cols-3">
        {productPoints.map((item, index) => (
          <Reveal key={item.label} delayMs={index * 100}>
            <Card className="glass-panel h-full rounded-[1.75rem] transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-brand-forest/10">
              <CardContent className="p-6">
                <item.icon className="h-6 w-6 text-brand-blue" />
                <p className="mt-5 text-base font-bold leading-7 text-brand-forest">{item.label}</p>
              </CardContent>
            </Card>
          </Reveal>
        ))}
      </section>

      <section id="milestones" className="mx-auto w-full max-w-6xl px-5 py-12 sm:px-8">
        <Reveal className="mx-auto max-w-3xl text-center">
          <SectionLabel>The Road to Launch</SectionLabel>
          <h2 className="mt-3 text-3xl font-extrabold tracking-[-0.03em] text-brand-forest sm:text-4xl">
            What&apos;s coming, and when
          </h2>
          <p className="mt-4 text-base leading-7 text-muted-foreground">
            A clean build path from early access to public launch, with the first seller seats
            handled before the doors open.
          </p>
        </Reveal>

        <div className="relative mt-12">
          <div className="absolute bottom-0 left-6 top-0 w-[3px] overflow-hidden rounded-full bg-brand-forest/8 lg:bottom-auto lg:left-[9%] lg:right-[9%] lg:top-8 lg:h-[3px] lg:w-auto">
            <div className="animate-line-grow h-full w-full origin-left bg-gradient-to-b from-brand-mantis via-brand-emerald to-brand-blue lg:bg-gradient-to-r" />
          </div>
          <ol className="relative grid gap-6 lg:grid-cols-5 lg:gap-5">
            {milestones.map((item, index) => {
              const styles = milestoneStateStyles[item.state as keyof typeof milestoneStateStyles];

              return (
                <Reveal
                  key={item.title}
                  as="li"
                  delayMs={index * 120}
                  className="relative grid grid-cols-[3.25rem_1fr] gap-4 lg:grid-cols-1"
                >
                  <div className="relative z-10 flex lg:justify-center">
                    <div
                      className={cn(
                        "relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border-2 text-sm font-extrabold shadow-sm ring-4 ring-background",
                        styles.marker,
                        item.state === "now" && "animate-pulse-ring",
                      )}
                    >
                      {item.state === "done" ? (
                        <Check className="h-5 w-5" />
                      ) : item.state === "now" ? (
                        <Circle className="h-4 w-4 fill-current" />
                      ) : (
                        index + 1
                      )}
                    </div>
                  </div>
                  <Card
                    className={cn(
                      "glass-panel rounded-3xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-brand-forest/10",
                      styles.card,
                    )}
                  >
                    <CardContent className="p-5 lg:min-h-48">
                      <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.18em] text-brand-blue">
                        {item.status}
                      </p>
                      <h3 className="mt-2 text-base font-extrabold leading-6 text-brand-forest">
                        {item.title}
                      </h3>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.body}</p>
                    </CardContent>
                  </Card>
                </Reveal>
              );
            })}
          </ol>
        </div>
      </section>

      <section id="watch" className="mx-auto w-full max-w-6xl px-5 py-12 sm:px-8">
        <Reveal>
          <SectionLabel>Watch & Listen</SectionLabel>
          <h2 className="mt-3 max-w-2xl text-3xl font-extrabold tracking-[-0.03em] text-brand-forest sm:text-4xl">
            The conversations behind the build
          </h2>
        </Reveal>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {episodes.map((episode, index) => (
            <Reveal key={episode.title} delayMs={index * 100}>
              <Card className="glass-panel h-full rounded-[1.75rem] transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-brand-forest/10">
                <CardContent className="p-6">
                  <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-2xl border border-brand-forest/10 bg-white/70">
                    <Headphones className="h-5 w-5 text-brand-blue" />
                  </div>
                  <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.2em] text-brand-blue">
                    Podcast · Coming soon
                  </p>
                  <h3 className="mt-3 text-lg font-bold leading-7 text-brand-forest">
                    {episode.title}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">{episode.body}</p>
                </CardContent>
              </Card>
            </Reveal>
          ))}
        </div>
      </section>

      <section id="story" className="mx-auto w-full max-w-6xl px-5 py-12 sm:px-8">
        <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
          <Reveal>
            <SectionLabel>The Story</SectionLabel>
            <h2 className="mt-3 text-3xl font-extrabold tracking-[-0.03em] text-brand-forest sm:text-4xl">
              Built in Dubai. By the industry. For the industry.
            </h2>
          </Reveal>
          <Reveal delayMs={150}>
            <Card className="glass-panel rounded-[2rem] transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-brand-forest/10">
              <CardContent className="p-6 text-base leading-8 text-muted-foreground sm:p-8 sm:text-lg">
                <p>
                  Kattegat was built by people who&apos;ve stood on both sides of the booking — the
                  stage and the venue floor. We watched talented people lose a cut of every gig to
                  someone who added a phone call and took a percentage.
                </p>
                <p className="mt-4">
                  <strong className="text-brand-forest">
                    So we built the room where the two sides meet directly.
                  </strong>{" "}
                  Sellers keep what they earn. Buyers know exactly who they&apos;re booking. And the
                  platform makes its money from a simple subscription — never from your deal.
                </p>
              </CardContent>
            </Card>
          </Reveal>
        </div>
      </section>

      <footer className="fixed bottom-3 left-1/2 z-50 flex w-[calc(100%-1.5rem)] max-w-7xl -translate-x-1/2 items-center justify-start gap-3 overflow-x-auto rounded-2xl border border-brand-forest/10 bg-white/90 px-3 py-2 text-xs font-semibold text-muted-foreground shadow-xl shadow-brand-forest/10 backdrop-blur-xl sm:w-[calc(100%-3rem)] sm:justify-center sm:px-5">
        <div className="flex shrink-0 items-center justify-center gap-1" aria-label="Kattegat social links">
          <span className="shrink-0 px-2">Follow us</span>
          {KATTEGAT_SOCIALS.slice(0, 3).map((social) => (
            <a
              key={social.href}
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-lg px-2 transition-colors hover:bg-brand-forest/5 hover:text-brand-forest focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2"
            >
              <AtSign className="h-3.5 w-3.5" aria-hidden="true" />
              {social.label}
            </a>
          ))}
        </div>
        <nav aria-label="Legal and support links" className="flex shrink-0 items-center justify-center gap-1">
          <Link
            href="/terms-of-service"
            className="inline-flex min-h-11 shrink-0 items-center rounded-lg px-2 transition-colors hover:bg-brand-forest/5 hover:text-brand-forest focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2"
          >
            Terms of Use
          </Link>
          <Link
            href="/privacy-policy"
            className="inline-flex min-h-11 shrink-0 items-center rounded-lg px-2 transition-colors hover:bg-brand-forest/5 hover:text-brand-forest focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2"
          >
            Privacy Policy
          </Link>
          <Link
            href="/delete-account"
            className="inline-flex min-h-11 shrink-0 items-center rounded-lg px-2 transition-colors hover:bg-brand-forest/5 hover:text-brand-forest focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2"
          >
            Delete Account
          </Link>
          <Link
            href="/support"
            className="inline-flex min-h-11 shrink-0 items-center rounded-lg px-2 transition-colors hover:bg-brand-forest/5 hover:text-brand-forest focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2"
          >
            Support
          </Link>
        </nav>
      </footer>
    </main>
  );
}
