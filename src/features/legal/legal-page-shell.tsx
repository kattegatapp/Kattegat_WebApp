import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { cn } from "@/lib/utils";

interface LegalPageShellProps {
  eyebrow: string;
  title: string;
  description: string;
  updatedLabel: string;
  children: React.ReactNode;
}

export function LegalPageShell({
  eyebrow,
  title,
  description,
  updatedLabel,
  children,
}: LegalPageShellProps) {
  return (
    <main className="relative min-h-screen bg-[#F7F9F8] text-brand-forest">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[28rem] bg-[radial-gradient(ellipse_at_top,rgb(111_219_66/0.12),transparent_55%),linear-gradient(180deg,#ffffff_0%,#F7F9F8_70%)]"
      />

      <div className="relative mx-auto w-full max-w-3xl px-5 pb-20 pt-6 sm:px-8 sm:pb-28 sm:pt-8">
        <header className="flex items-center justify-between gap-4">
          <Link href="/" className="flex min-w-0 items-center">
            <Image
              src="/brand/logo/logo-horizontal-alternative.png"
              alt="Kattegat"
              width={220}
              height={68}
              className="h-auto w-32 sm:w-40"
              priority
            />
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-brand-forest"
          >
            <ArrowLeft className="size-3.5" />
            Home
          </Link>
        </header>

        <div className="mt-14 sm:mt-20">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-brand-blue">
            {eyebrow}
          </p>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-brand-forest sm:text-4xl">
            {title}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">
            {description}
          </p>
          <p className="mt-3 text-xs text-muted-foreground/80">{updatedLabel}</p>
        </div>

        <div className="mt-12 divide-y divide-brand-forest/8 border-t border-brand-forest/10">
          {children}
        </div>

        <footer className="mt-16 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-brand-forest/10 pt-6 text-sm text-muted-foreground">
          <Link href="/terms-of-service" className="transition-colors hover:text-brand-forest">
            Terms of Service
          </Link>
          <Link href="/privacy-policy" className="transition-colors hover:text-brand-forest">
            Privacy Policy
          </Link>
          <Link href="/delete-account" className="transition-colors hover:text-brand-forest">
            Delete account
          </Link>
          <Link href="/" className="transition-colors hover:text-brand-forest">
            kattegat.app
          </Link>
        </footer>
      </div>
    </main>
  );
}

export function LegalSection({
  title,
  children,
  className,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("py-8 sm:py-10", className)}>
      <h2 className="text-base font-bold tracking-tight text-brand-forest sm:text-lg">
        {title}
      </h2>
      <div className="mt-3 space-y-3 text-sm leading-7 text-muted-foreground sm:text-[15px] sm:leading-8">
        {children}
      </div>
    </section>
  );
}

export function LegalCallout({
  icon: Icon,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-3 rounded-xl bg-brand-forest/[0.035] px-4 py-3.5">
      <Icon className="mt-0.5 size-4 shrink-0 text-brand-blue" />
      <div className="min-w-0 space-y-2 text-sm leading-7 text-muted-foreground">{children}</div>
    </div>
  );
}
