"use client";

import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import {
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

/** Fits the visual viewport; body scrolls. Overrides shadcn DialogContent grid/center defaults. */
export const EDITOR_DIALOG_CLASS = [
  "top-3 bottom-3 left-1/2",
  "flex h-auto max-h-[calc(100svh-1.5rem)] w-[calc(100%-1.5rem)] min-h-0",
  "translate-x-[-50%] translate-y-0",
  "flex-col gap-0 overflow-hidden p-0",
  "rounded-[1.25rem] border-0 bg-[#F7F9F8] ring-1 ring-brand-forest/10",
  "sm:top-1/2 sm:bottom-auto sm:max-h-[calc(100svh-2.5rem)] sm:max-w-2xl sm:-translate-y-1/2 sm:rounded-[1.5rem]",
].join(" ");

export function EditorDialogHeader({
  icon: Icon,
  title,
  description,
  badge,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  badge?: string;
}) {
  return (
    <DialogHeader className="relative shrink-0 space-y-0 overflow-hidden border-b border-brand-forest/8 px-4 pb-4 pt-4 pr-12 text-left sm:px-6 sm:pb-5 sm:pt-5">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute -left-16 -top-20 size-56 rounded-full bg-brand-mantis/20 blur-3xl" />
        <div className="absolute -right-10 top-0 size-44 rounded-full bg-brand-blue/12 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 size-36 rounded-full bg-brand-emerald/14 blur-3xl" />
      </div>
      <div className="relative flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-mantis/90 to-brand-emerald/80 text-brand-forest shadow-[0_10px_24px_rgb(111_219_66/0.28)] sm:size-11">
          <Icon className="size-4 sm:size-5" strokeWidth={2.25} />
        </span>
        <div className="min-w-0 space-y-1">
          {badge ? (
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-forest/55">
              {badge}
            </p>
          ) : null}
          <DialogTitle className="text-lg font-extrabold tracking-[-0.02em] text-brand-forest sm:text-xl">
            {title}
          </DialogTitle>
          <DialogDescription className="max-w-xl text-[13px] leading-relaxed text-brand-forest/65 sm:text-sm">
            {description}
          </DialogDescription>
        </div>
      </div>
    </DialogHeader>
  );
}

export function EditorFormBody({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-3.5 sm:px-6 sm:py-4",
        className,
      )}
    >
      <div className="space-y-3.5 sm:space-y-4">{children}</div>
    </div>
  );
}

export function EditorFormSection({
  icon: Icon,
  title,
  description,
  children,
  className,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
  action?: ReactNode;
}) {
  return (
    <section
      className={cn(
        "rounded-[1.25rem] border border-white/80 bg-white/85 p-4 shadow-[0_8px_28px_rgb(0_57_18/0.05)] backdrop-blur-sm sm:p-5",
        className,
      )}
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl bg-brand-forest/[0.06] text-brand-forest">
            <Icon className="size-4" />
          </span>
          <div className="min-w-0">
            <h3 className="text-[15px] font-bold tracking-[-0.01em] text-brand-forest">{title}</h3>
            {description ? (
              <p className="mt-0.5 text-[12px] leading-relaxed text-muted-foreground">{description}</p>
            ) : null}
          </div>
        </div>
        {action}
      </div>
      <div className="space-y-3.5">{children}</div>
    </section>
  );
}

export function EditorAlert({
  tone = "amber",
  children,
}: {
  tone?: "amber" | "red" | "blue";
  children: ReactNode;
}) {
  return (
    <p
      className={cn(
        "rounded-2xl border px-3.5 py-2.5 text-sm leading-relaxed",
        tone === "amber" && "border-amber-200/80 bg-amber-50/90 text-amber-900",
        tone === "red" && "border-red-200/80 bg-red-50/90 text-red-800",
        tone === "blue" && "border-brand-blue/20 bg-brand-blue/5 text-brand-blue",
      )}
    >
      {children}
    </p>
  );
}

export function EditorMediaDropzone({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-dashed border-brand-forest/15 bg-gradient-to-b from-brand-forest/[0.03] to-transparent p-3.5",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function EditorFormFooter({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mx-0 mb-0 mt-0 flex shrink-0 flex-col-reverse gap-2 border-t border-brand-forest/8 bg-white/95 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-md sm:flex-row sm:items-center sm:justify-end sm:px-6 sm:py-4",
        className,
      )}
    >
      {children}
    </div>
  );
}
