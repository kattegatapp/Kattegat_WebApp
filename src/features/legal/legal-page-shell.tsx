import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface LegalPageShellProps {
  eyebrow: string;
  title: string;
  description: string;
  updatedLabel: string;
  children: React.ReactNode;
}

export function LegalPageShell({ eyebrow, title, description, updatedLabel, children }: LegalPageShellProps) {
  return (
    <main className="min-h-screen text-brand-forest">
      <section className="px-3 py-3 sm:px-6 sm:py-6">
        <div className="launch-stage relative mx-auto flex min-h-[calc(100vh-1.5rem)] w-full max-w-5xl flex-col overflow-hidden rounded-[2rem] border border-white/80 px-5 py-6 shadow-2xl shadow-brand-forest/8 backdrop-blur-2xl sm:min-h-[calc(100vh-3rem)] sm:rounded-[3rem] sm:px-8 lg:px-14">
          <header className="relative z-10 flex items-center justify-between gap-4">
            <Link href="/" className="flex min-w-0 items-center">
              <Image
                src="/brand/logo/logo-horizontal-alternative.png"
                alt="Kattegat"
                width={220}
                height={68}
                className="h-auto w-36 sm:w-44"
              />
            </Link>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-brand-forest sm:text-sm"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to Kattegat
            </Link>
          </header>

          <div className="relative z-10 mx-auto w-full max-w-3xl flex-1 py-10 sm:py-14">
            <Badge className="border-brand-forest/10 bg-white/66 px-3 py-1.5 text-brand-forest shadow-sm backdrop-blur">
              {eyebrow}
            </Badge>
            <h1 className="mt-6 text-4xl font-extrabold leading-[1.05] tracking-[-0.03em] text-[#080b0a] sm:text-5xl">
              {title}
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">{description}</p>
            <p className="mt-2 text-xs font-semibold uppercase tracking-[0.18em] text-brand-blue">{updatedLabel}</p>

            <Card className="glass-panel mt-10 rounded-[2rem]">
              <CardContent className="space-y-8 p-6 sm:p-10">{children}</CardContent>
            </Card>
          </div>
        </div>
      </section>
    </main>
  );
}

export function LegalSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-lg font-extrabold tracking-[-0.01em] text-brand-forest sm:text-xl">{title}</h2>
      <div className="mt-3 space-y-3 text-sm leading-7 text-muted-foreground sm:text-base sm:leading-8">
        {children}
      </div>
    </section>
  );
}
