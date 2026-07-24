import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";
import { Suspense } from "react";

import { Badge } from "@/components/ui/badge";
import { WaitlistForm } from "@/features/waitlist";
import { MaintenanceState } from "@/components/status/error-state";
import { getPublicAppSettings } from "@/lib/api/settings";

export const metadata: Metadata = {
  title: "Join the Waitlist | Kattegat",
  description:
    "Claim early access to Kattegat — Dubai's direct marketplace for events and hospitality talent.",
  robots: {
    index: true,
    follow: true,
  },
};

export default async function WaitlistPage() {
  const settings = await getPublicAppSettings();

  if (settings.features.maintenanceMode) {
    return <MaintenanceState message={settings.features.maintenanceMessage} />;
  }

  return (
    <main className="min-h-screen overflow-hidden text-brand-forest">
      <section className="px-3 py-3 sm:px-6 sm:py-6">
        <div className="launch-stage relative mx-auto flex min-h-[calc(100vh-1.5rem)] w-full max-w-7xl flex-col overflow-hidden rounded-[2rem] border border-white/80 px-5 py-6 shadow-2xl shadow-brand-forest/8 backdrop-blur-2xl sm:min-h-[calc(100vh-3rem)] sm:rounded-[3rem] sm:px-8 lg:px-14">
          <header className="relative z-10 flex items-center justify-between gap-4">
            <Link href="/" className="flex min-w-0 items-center">
              <Image
                src="/brand/logo/logo-horizontal-alternative.png"
                alt="Kattegat"
                width={220}
                height={68}
                className="h-auto w-36 sm:w-44"
                priority
              />
            </Link>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground transition-colors hover:text-brand-forest"
            >
              <ArrowLeft className="size-3.5" />
              Home
            </Link>
          </header>

          <div className="relative z-10 mx-auto flex w-full max-w-4xl flex-1 flex-col items-center justify-center py-10 text-center sm:py-14">
            <Badge className="border-brand-forest/10 bg-white/66 px-3 py-1.5 text-brand-forest shadow-sm backdrop-blur">
              <Sparkles className="h-3.5 w-3.5" />
              Early access
            </Badge>
            <h1 className="mt-6 max-w-3xl text-4xl font-extrabold leading-[1.05] tracking-tight text-[#080b0a] sm:text-5xl">
              Claim your spot before doors open.
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
              First 1,000 get access before public launch. Sellers in the early cohort may unlock
              Founding Member seats.
            </p>

            <div className="mt-10 w-full text-left">
              <Suspense
                fallback={
                  <div className="mx-auto h-[20rem] max-w-4xl rounded-[2rem] bg-white/50" aria-hidden />
                }
              >
                <WaitlistForm />
              </Suspense>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
