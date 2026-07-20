"use client";

import {
  ArrowRight,
  BadgeCheck,
  BriefcaseBusiness,
  CircleDollarSign,
  HelpCircle,
  MessageCircle,
  Plus,
  ShieldCheck,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useState } from "react";

import { Reveal } from "@/components/motion/reveal";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

type FaqCategory = {
  id: string;
  label: string;
  icon: typeof HelpCircle;
  description: string;
  items: { question: string; answer: string }[];
};

const FAQ_CATEGORIES: FaqCategory[] = [
  {
    id: "general",
    label: "General",
    icon: HelpCircle,
    description: "What Kattegat is and who it's for.",
    items: [
      {
        question: "What is Kattegat?",
        answer:
          "Kattegat is a direct marketplace for hospitality, events, and specialist business services — built in Dubai for the UAE market. Businesses discover capable sellers, compare profiles, and speak directly without an agency in the middle.",
      },
      {
        question: "Who can use Kattegat?",
        answer:
          "Venues, planners, hotels, restaurants, and brands can find specialist sellers. Service professionals and companies can present their capabilities, build structured profiles, and respond to relevant demand.",
      },
      {
        question: "Is Kattegat only for events?",
        answer:
          "No. The marketplace covers events, hospitality operations, restaurant consultancy, marketing, fit-out, lead generation, tailoring, entertainment, shisha outsourcing, and related professional services.",
      },
      {
        question: "Where is Kattegat available?",
        answer:
          "Kattegat is built for Dubai and the wider UAE hospitality market. Listings and discovery are focused on local demand — browse by category or search to see what's live today.",
      },
    ],
  },
  {
    id: "buyers",
    label: "For buyers",
    icon: BriefcaseBusiness,
    description: "Finding talent and posting what you need.",
    items: [
      {
        question: "How do businesses find sellers?",
        answer:
          "Browse service categories, use search, or explore Dubai landing pages for common hiring needs. Review profiles, portfolios, trust signals, and services — then message sellers directly when you're ready.",
      },
      {
        question: "Can I post a brief or requirement?",
        answer:
          "Yes. Buyers can describe what they need so relevant sellers can respond. Requirements help when your brief is specific — date, venue type, budget range, or specialist skills.",
      },
      {
        question: "How do I know if a seller is trustworthy?",
        answer:
          "Kattegat surfaces verification signals, reviews, portfolio work, and marketplace moderation. Always review a seller's profile and ask clarifying questions before you commit.",
      },
      {
        question: "Is there a commission on bookings?",
        answer:
          "No. Kattegat is designed around zero booking commission. When you agree terms with a seller, the platform does not take a percentage of that deal.",
      },
    ],
  },
  {
    id: "sellers",
    label: "For sellers",
    icon: Users,
    description: "Joining, profiles, and keeping what you earn.",
    items: [
      {
        question: "How do sellers join?",
        answer:
          "Create an account, complete your service profile, add relevant capabilities and portfolio work, then respond to marketplace opportunities as categories open. Join the waitlist or download the app for launch updates.",
      },
      {
        question: "What does a seller profile include?",
        answer:
          "Structured services, portfolio media, categories, location, and trust signals buyers can compare. Profiles are designed to show fit quickly — not just a name and phone number.",
      },
      {
        question: "What are seller tiers?",
        answer:
          "Sellers can be on free, Pro, or White Glove plans. White Glove is a managed service for complex or high-stakes briefs. Starter sellers route inquiries through Kattegat Vetted flows rather than open direct chat.",
      },
      {
        question: "Do sellers pay commission on bookings?",
        answer:
          "Kattegat does not take a cut of your booking. Sellers keep the agreed value of their work. The platform earns through subscriptions and managed services — not middleman fees on each deal.",
      },
    ],
  },
  {
    id: "platform",
    label: "Trust & platform",
    icon: ShieldCheck,
    description: "Messaging, accounts, and support.",
    items: [
      {
        question: "How does messaging work?",
        answer:
          "Buyers and sellers align directly in Kattegat's inbox. Share context, ask questions, and agree scope with a clear conversation trail — without an agency controlling the relationship.",
      },
      {
        question: "Can one account be both buyer and seller?",
        answer:
          "Yes. One account can hold buyer and seller identities. Switching identity in the app is a UX convenience — permissions and data still follow backend rules for each role.",
      },
      {
        question: "Is my data safe?",
        answer:
          "Kattegat is built with privacy by design: clear account controls, protected actions, and accessible account deletion. Financial and personal data is handled according to our privacy policy.",
      },
      {
        question: "How do I contact support?",
        answer:
          "Use the contact form or email our support team. We're best equipped to help with onboarding, finding the right seller, partnerships, and platform issues — usually within one business day.",
      },
    ],
  },
];

const HIGHLIGHTS = [
  {
    icon: CircleDollarSign,
    title: "0% booking commission",
    body: "No percentage taken when you agree a deal.",
  },
  {
    icon: MessageCircle,
    title: "Direct messaging",
    body: "Buyers and sellers align without a gatekeeper.",
  },
  {
    icon: BadgeCheck,
    title: "Verified marketplace",
    body: "Trust signals to help you hire with confidence.",
  },
] as const;

function FaqItem({ question, answer }: { question: string; answer: string }) {
  return (
    <Collapsible className="group/faq rounded-2xl border border-brand-forest/10 bg-white transition duration-300 hover:border-brand-mantis/35 data-[panel-open]:border-brand-mantis/40 data-[panel-open]:shadow-[0_14px_40px_rgb(0_57_18/0.08)]">
      <CollapsibleTrigger className="flex w-full cursor-pointer items-center justify-between gap-4 p-5 text-left sm:p-6">
        <span className="font-extrabold tracking-[-0.02em] text-brand-forest">{question}</span>
        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-brand-blue/10 text-brand-blue transition duration-300 group-data-[panel-open]/faq:rotate-45 group-data-[panel-open]/faq:bg-brand-forest group-data-[panel-open]/faq:text-brand-mantis">
          <Plus className="size-4" aria-hidden />
        </span>
      </CollapsibleTrigger>
      <CollapsibleContent className="px-5 pb-5 sm:px-6 sm:pb-6">
        <p className="max-w-2xl text-sm leading-7 text-brand-forest/65">{answer}</p>
      </CollapsibleContent>
    </Collapsible>
  );
}

export function FaqPageContent() {
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const scrollToCategory = useCallback((id: string) => {
    setActiveCategory(id);
    if (id === "all") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    document.getElementById(`faq-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const visibleCategories =
    activeCategory === "all"
      ? FAQ_CATEGORIES
      : FAQ_CATEGORIES.filter((category) => category.id === activeCategory);

  return (
    <>
      <section className="relative isolate overflow-x-clip border-b border-brand-forest/8 bg-white">
        <div aria-hidden className="marketing-section-bg">
          <div className="absolute -left-32 top-8 size-[22rem] rounded-full bg-brand-mantis/12 blur-3xl" />
          <div className="absolute -right-24 bottom-0 size-[20rem] rounded-full bg-brand-blue/10 blur-3xl" />
        </div>

        <div className="marketing-section-content marketing-container py-12 sm:py-16">
          <Reveal>
            <div className="grid gap-3 sm:grid-cols-3">
              {HIGHLIGHTS.map((item) => {
                const Icon = item.icon;
                return (
                  <article
                    key={item.title}
                    className="rounded-2xl border border-brand-forest/8 bg-white p-5 shadow-[0_10px_35px_rgb(0_57_18/0.06)]"
                  >
                    <span className="flex size-10 items-center justify-center rounded-xl bg-brand-mantis/20 text-brand-forest">
                      <Icon className="size-5" aria-hidden />
                    </span>
                    <h2 className="mt-4 text-base font-extrabold tracking-[-0.02em]">{item.title}</h2>
                    <p className="mt-1.5 text-sm leading-6 text-brand-forest/60">{item.body}</p>
                  </article>
                );
              })}
            </div>
          </Reveal>

          <Reveal delayMs={80}>
            <div className="marketing-chip-scroll mt-8 flex gap-2 sm:mt-10">
              <button
                type="button"
                onClick={() => scrollToCategory("all")}
                className={cn(
                  "shrink-0 rounded-full px-4 py-2 text-sm font-extrabold transition",
                  activeCategory === "all"
                    ? "bg-brand-forest text-white"
                    : "border border-brand-forest/12 bg-white text-brand-forest/70 hover:border-brand-mantis/50",
                )}
              >
                All topics
              </button>
              {FAQ_CATEGORIES.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => scrollToCategory(category.id)}
                  className={cn(
                    "shrink-0 rounded-full px-4 py-2 text-sm font-extrabold transition",
                    activeCategory === category.id
                      ? "bg-brand-forest text-white"
                      : "border border-brand-forest/12 bg-white text-brand-forest/70 hover:border-brand-mantis/50",
                  )}
                >
                  {category.label}
                </button>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <section className="relative isolate overflow-x-clip bg-[#F7F9F8] py-14 sm:py-20">
        <div aria-hidden className="marketing-section-bg">
          <div className="category-grid absolute inset-0 opacity-30" />
          <div className="absolute -right-20 top-16 size-72 rounded-full bg-brand-mantis/12 blur-3xl" />
        </div>

        <div className="marketing-container space-y-12 sm:space-y-16">
          {visibleCategories.map((category) => {
            const Icon = category.icon;
            return (
              <div key={category.id} id={`faq-${category.id}`} className="scroll-mt-32">
                <div className="mb-6 flex items-start gap-4 sm:mb-8">
                  <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-brand-forest text-brand-mantis">
                    <Icon className="size-5" aria-hidden />
                  </span>
                  <div>
                    <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-brand-blue">
                      {category.label}
                    </p>
                    <h2 className="mt-1 text-2xl font-extrabold tracking-[-0.04em] sm:text-3xl">
                      {category.description}
                    </h2>
                  </div>
                </div>
                <div className="space-y-3">
                  {category.items.map((item) => (
                    <FaqItem key={item.question} question={item.question} answer={item.answer} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="border-t border-brand-forest/8 bg-brand-forest px-4 py-14 sm:px-6 sm:py-18">
        <div className="marketing-section-content marketing-container">
          <Reveal>
            <div className="glass-panel relative overflow-hidden rounded-[1.75rem] border-white/20 bg-white/10 p-6 backdrop-blur-md sm:p-10">
              <div aria-hidden className="pointer-events-none absolute -right-12 -top-12 size-48 rounded-full bg-brand-mantis/20 blur-3xl" />
              <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div className="max-w-xl">
                  <p className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-brand-mantis">
                    Still stuck?
                  </p>
                  <h2 className="mt-3 text-2xl font-extrabold tracking-[-0.04em] text-white sm:text-3xl">
                    We&apos;re happy to point you in the right direction.
                  </h2>
                  <p className="mt-3 text-sm leading-7 text-white/65 sm:text-base">
                    Whether you&apos;re hiring for a venue, joining as a seller, or exploring a
                    partnership — send a note and we&apos;ll respond quickly.
                  </p>
                </div>
                <div className="flex w-full flex-col gap-3 sm:w-auto sm:min-w-[14rem]">
                  <Link
                    href="/contact"
                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-brand-mantis px-6 text-sm font-extrabold text-brand-forest transition hover:bg-brand-emerald"
                  >
                    Contact us
                    <ArrowRight className="size-4" />
                  </Link>
                  <Link
                    href="/how-it-works"
                    className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-white/20 px-6 text-center text-sm font-extrabold text-white transition hover:bg-white/10"
                  >
                    How Kattegat works
                  </Link>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}

