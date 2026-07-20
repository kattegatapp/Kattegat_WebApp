"use client";

import {
  ArrowRight,
  ArrowUpRight,
  BriefcaseBusiness,
  Clock3,
  Handshake,
  Headphones,
  Mail,
  MapPin,
  MessageSquare,
  Users,
} from "lucide-react";
import Link from "next/link";

import { Reveal } from "@/components/motion/reveal";
import { ContactForm } from "@/features/marketing/contact-form";
import { KATTEGAT_SOCIALS } from "@/features/marketing/socials";

const HIGHLIGHTS = [
  {
    icon: Clock3,
    title: "Fast replies",
    body: "We usually respond within one business day.",
  },
  {
    icon: MapPin,
    title: "Dubai-based",
    body: "Built for the UAE hospitality and events market.",
  },
  {
    icon: MessageSquare,
    title: "Direct line",
    body: "No call centre — your message reaches our team.",
  },
] as const;

const ENQUIRY_TYPES = [
  {
    icon: BriefcaseBusiness,
    title: "Hiring talent",
    body: "Need a DJ, host, consultant, or specialist for a venue or event?",
  },
  {
    icon: Users,
    title: "Joining as a seller",
    body: "Want to list your services and reach relevant buyers on Kattegat?",
  },
  {
    icon: Handshake,
    title: "Partnerships & press",
    body: "Exploring a collaboration, integration, or media enquiry?",
  },
  {
    icon: Headphones,
    title: "Product support",
    body: "Questions about your account, listings, or how the platform works?",
  },
] as const;

type ContactPageContentProps = {
  supportEmail: string;
  instagramUrl?: string | null;
  linkedinUrl?: string | null;
};

export function ContactPageContent({
  supportEmail,
  instagramUrl,
  linkedinUrl,
}: ContactPageContentProps) {
  const contactDetails = [
    { icon: Mail, label: "Email", value: supportEmail, href: `mailto:${supportEmail}` },
    { icon: MapPin, label: "Based in", value: "Dubai, United Arab Emirates" },
    {
      icon: Clock3,
      label: "Response time",
      value: "Usually within one business day",
    },
    {
      icon: MessageSquare,
      label: "Best for",
      value: "Hiring help, seller onboarding, partnerships, and support",
    },
  ] as const;

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
        </div>
      </section>

      <section className="relative isolate overflow-x-clip bg-[#F7F9F8] py-14 sm:py-20">
        <div aria-hidden className="marketing-section-bg">
          <div className="category-grid absolute inset-0 opacity-25" />
          <div className="absolute -right-20 top-16 size-72 rounded-full bg-brand-mantis/10 blur-3xl" />
        </div>

        <div className="marketing-section-content marketing-container">
          <div className="grid gap-8 md:gap-10 lg:grid-cols-[0.95fr_1.15fr] lg:gap-12 xl:gap-16">
            <div className="space-y-5 sm:space-y-6">
              <Reveal>
                <div>
                  <p className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-brand-blue">
                    Get in touch
                  </p>
                  <h2 className="mt-2 text-2xl font-extrabold tracking-[-0.04em] sm:text-3xl">
                    Tell us what you need — we&apos;ll point you in the right direction.
                  </h2>
                  <p className="mt-3 text-sm leading-7 text-brand-forest/60 sm:text-base">
                    Whether you&apos;re booking talent, joining as a seller, or exploring a
                    partnership, a short note is enough to get started.
                  </p>
                </div>
              </Reveal>

              <div className="space-y-3">
                {contactDetails.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.label}
                      className="flex items-start gap-3 rounded-2xl border border-brand-forest/8 bg-white p-4 shadow-[0_8px_28px_rgb(0_57_18/0.05)] transition hover:border-brand-mantis/35 sm:gap-4 sm:p-5"
                    >
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-blue/10 text-brand-blue sm:size-11">
                        <Icon className="size-5" aria-hidden />
                      </span>
                      <div className="min-w-0">
                        <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-brand-blue">
                          {item.label}
                        </p>
                        {"href" in item && item.href ? (
                          <a
                            href={item.href}
                            className="mt-1 block break-all text-sm font-bold leading-6 text-brand-forest hover:text-brand-blue sm:text-base"
                          >
                            {item.value}
                          </a>
                        ) : (
                          <p className="mt-1 text-sm font-bold leading-6 text-brand-forest sm:text-base">
                            {item.value}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="rounded-[1.75rem] bg-brand-forest p-5 text-white sm:p-7">
                <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-brand-mantis">
                  Prefer email directly?
                </p>
                <p className="mt-3 text-sm leading-7 text-white/70">
                  Write to{" "}
                  <a
                    href={`mailto:${supportEmail}`}
                    className="font-extrabold text-brand-mantis hover:text-white"
                  >
                    {supportEmail}
                  </a>
                  . Include your company or service and the best way to reach you.
                </p>
              </div>

              {(instagramUrl || linkedinUrl) && (
                <div className="glass-panel rounded-2xl p-4 sm:p-5">
                  <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-brand-blue">
                    Follow Kattegat
                  </p>
                  <div className="mt-3 flex flex-wrap gap-3">
                    {instagramUrl ? (
                      <a
                        href={instagramUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex min-h-11 items-center rounded-full border border-brand-forest/10 px-4 text-sm font-extrabold text-brand-forest transition hover:border-brand-blue/25 hover:text-brand-blue"
                      >
                        Instagram
                      </a>
                    ) : null}
                    {linkedinUrl ? (
                      <a
                        href={linkedinUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex min-h-11 items-center rounded-full border border-brand-forest/10 px-4 text-sm font-extrabold text-brand-forest transition hover:border-brand-blue/25 hover:text-brand-blue"
                      >
                        LinkedIn
                      </a>
                    ) : null}
                  </div>
                </div>
              )}
            </div>

            <Reveal delayMs={80}>
              <div className="min-w-0">
                <p className="mb-4 text-[11px] font-extrabold uppercase tracking-[0.2em] text-brand-blue">
                  Contact form
                </p>
                <ContactForm supportEmail={supportEmail} />
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="border-t border-brand-forest/8 bg-white py-14 sm:py-18">
        <div className="marketing-section-content marketing-container">
          <Reveal>
            <div className="mb-8 max-w-2xl">
              <p className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-brand-blue">
                Common enquiries
              </p>
              <h2 className="mt-2 text-2xl font-extrabold tracking-[-0.04em] sm:text-3xl">
                Not sure which topic fits?
              </h2>
              <p className="mt-3 text-sm leading-7 text-brand-forest/60">
                Pick the closest match in the form — or browse these before you write.
              </p>
            </div>
          </Reveal>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {ENQUIRY_TYPES.map((item, index) => {
              const Icon = item.icon;
              return (
                <Reveal key={item.title} delayMs={index * 40} className="h-full">
                  <article className="h-full rounded-2xl border border-brand-forest/8 bg-[#F7F9F8] p-5 transition hover:border-brand-mantis/40 hover:bg-white hover:shadow-[0_12px_35px_rgb(0_57_18/0.06)]">
                    <span className="flex size-10 items-center justify-center rounded-xl bg-brand-forest text-brand-mantis">
                      <Icon className="size-4" aria-hidden />
                    </span>
                    <h3 className="mt-4 text-sm font-extrabold tracking-[-0.02em]">{item.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-brand-forest/60">{item.body}</p>
                  </article>
                </Reveal>
              );
            })}
          </div>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link
              href="/faq"
              className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl border border-brand-forest/12 bg-white px-5 text-sm font-extrabold transition hover:border-brand-mantis/50 sm:w-auto"
            >
              Read the FAQ
              <ArrowUpRight className="size-4" />
            </Link>
            <Link
              href="/how-it-works"
              className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl bg-brand-forest px-5 text-sm font-extrabold text-white transition hover:bg-brand-blue sm:w-auto"
            >
              How Kattegat works
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </section>

      <section className="border-t border-brand-forest/8 bg-brand-forest px-4 py-14 sm:px-6 sm:py-18">
        <div className="marketing-section-content marketing-container">
          <Reveal>
            <div className="glass-panel relative overflow-hidden rounded-[1.75rem] border-white/20 bg-white/10 p-5 backdrop-blur-md sm:p-8 lg:p-10">
              <div aria-hidden className="pointer-events-none absolute -right-12 -top-12 size-48 rounded-full bg-brand-mantis/20 blur-3xl" />
              <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div className="max-w-xl">
                  <p className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-brand-mantis">
                    On Instagram
                  </p>
                  <h2 className="mt-3 text-2xl font-extrabold tracking-[-0.04em] text-white sm:text-3xl">
                    Follow the Kattegat community
                  </h2>
                  <p className="mt-3 text-sm leading-7 text-white/65">
                    Talent spotlights, marketplace updates, and behind-the-scenes from Dubai
                    hospitality.
                  </p>
                </div>
                <div className="grid w-full gap-2 sm:flex sm:w-auto sm:flex-wrap">
                  {KATTEGAT_SOCIALS.map((social) => (
                    <a
                      key={social.href}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/20 px-4 text-sm font-extrabold text-white transition hover:bg-white/10 sm:min-h-10"
                    >
                      {social.label}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}

