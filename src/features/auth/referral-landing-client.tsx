"use client";

import { ArrowRight, ExternalLink, Smartphone } from "lucide-react";
import Link from "next/link";
import { useMemo, useRef } from "react";

import { Button } from "@/components/ui/button";

type ReferralLandingClientProps = {
  code: string;
};

function isMobileBrowser() {
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

export function ReferralLandingClient({ code }: ReferralLandingClientProps) {
  const fallbackTimer = useRef<number | null>(null);
  const encodedCode = useMemo(() => encodeURIComponent(code), [code]);
  const appHref = `kattegat://register?ref=${encodedCode}`;
  const webHref = `/register?ref=${encodedCode}`;

  function clearFallback() {
    if (fallbackTimer.current) {
      window.clearTimeout(fallbackTimer.current);
      fallbackTimer.current = null;
    }
  }

  function openAppOrWebsite() {
    clearFallback();

    if (!isMobileBrowser()) {
      window.location.replace(webHref);
      return;
    }

    const handleVisibility = () => {
      if (document.visibilityState === "hidden") clearFallback();
    };

    document.addEventListener("visibilitychange", handleVisibility, { once: true });
    window.location.href = appHref;

    fallbackTimer.current = window.setTimeout(() => {
      if (document.visibilityState === "visible") {
        window.location.replace(webHref);
      }
    }, 1600);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-5 py-12 text-foreground">
      <section className="w-full max-w-md rounded-3xl bg-card p-6 text-center shadow-[0_24px_70px_rgb(0_57_18/0.10)] ring-1 ring-foreground/8 sm:p-8">
        <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-brand-mantis/15 text-brand-forest">
          <Smartphone className="size-6" />
        </span>
        <p className="mt-5 text-[11px] font-extrabold uppercase tracking-[0.2em] text-brand-blue">
          Kattegat invitation
        </p>
        <h1 className="mt-2 text-2xl font-extrabold tracking-[-0.04em] sm:text-3xl">
          Opening the Kattegat app…
        </h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          If the app is installed, this invitation opens there. Otherwise, you&apos;ll continue to
          web registration with referral code <strong className="text-foreground">{code}</strong>.
        </p>

        <div className="mt-6 grid gap-2.5">
          <Button type="button" size="lg" className="h-11 rounded-xl font-bold" onClick={openAppOrWebsite}>
            Open Kattegat app
            <ExternalLink />
          </Button>
          <Button
            size="lg"
            variant="outline"
            nativeButton={false}
            render={<Link href={webHref} />}
            className="h-11 rounded-xl font-bold"
          >
            Register on website
            <ArrowRight />
          </Button>
        </div>
      </section>
    </main>
  );
}
