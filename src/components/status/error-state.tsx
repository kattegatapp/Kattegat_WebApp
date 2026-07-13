"use client";

import { AlertTriangle, Home, LockKeyhole, SearchX, ServerCrash, Wrench } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const icons = { 401: LockKeyhole, 403: LockKeyhole, 404: SearchX, 500: ServerCrash, 503: Wrench } as const;

export function ErrorState({ code, title, description, retry, showHome = true }: { code: keyof typeof icons; title: string; description: string; retry?: () => void; showHome?: boolean }) {
  const Icon = icons[code] ?? AlertTriangle;
  return <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,rgb(111_219_66/0.14),transparent_34%),linear-gradient(180deg,#f8fbf8,#eef5f0)] px-5 py-10 text-brand-forest"><section className="w-full max-w-xl overflow-hidden rounded-[2rem] border border-white bg-white/90 shadow-[0_30px_90px_rgb(0_57_18/0.15)] backdrop-blur"><div className="flex justify-center border-b border-brand-forest/10 bg-white px-6 py-6"><Image src="/brand/logo/logo-horizontal-main.png" alt="Kattegat" width={220} height={69} priority className="h-auto w-44 sm:w-52" /></div><div className="p-6 text-center sm:p-10"><span className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-brand-mantis/15 text-brand-forest ring-1 ring-brand-forest/10"><Icon className="size-8" /></span><p className="mt-6 text-xs font-extrabold uppercase tracking-[0.24em] text-brand-blue">Error {code}</p><h1 className="mt-2 text-3xl font-extrabold tracking-tight">{title}</h1><p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted-foreground">{description}</p>{retry || showHome ? <div className="mt-7 flex flex-col justify-center gap-2 sm:flex-row">{retry ? <Button onClick={retry}>Try again</Button> : null}{showHome ? <Link href="/" className={cn(buttonVariants({ variant: retry ? "outline" : "default" }))}><Home />Go to homepage</Link> : null}</div> : null}</div></section></main>;
}

export function MaintenanceState({ message }: { message: string }) {
  return <ErrorState code={503} title="We’ll be back shortly" description={message} showHome={false} />;
}
