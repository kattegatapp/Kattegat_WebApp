"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { AlertCircle, CheckCircle2, Crown, Heart, PartyPopper, Sparkles } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState, type CSSProperties } from "react";
import { useForm, type Resolver } from "react-hook-form";

import { joinWaitlist } from "@/lib/api/waitlist";
import { ApiRequestError } from "@/lib/api/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  waitlistSchema,
  type WaitlistFormDraft,
  type WaitlistFormValues,
} from "@/lib/validations/waitlist";

const ROLE_OPTIONS = [
  {
    value: "seller" as const,
    title: "I'm a Seller",
    subtitle: "I offer services — DJ, performer, supplier, consultant, and more.",
  },
  {
    value: "buyer" as const,
    title: "I'm a Buyer",
    subtitle: "I book talent — venue, hotel, organizer, or event planner.",
  },
];

const SUCCESS_SPARKS = [
  { left: "12%", delay: "0ms", color: "bg-brand-mantis", x: "-18px" },
  { left: "28%", delay: "120ms", color: "bg-brand-emerald", x: "10px" },
  { left: "46%", delay: "40ms", color: "bg-brand-blue", x: "-8px" },
  { left: "62%", delay: "180ms", color: "bg-brand-mantis", x: "16px" },
  { left: "78%", delay: "90ms", color: "bg-brand-emerald", x: "-12px" },
  { left: "88%", delay: "220ms", color: "bg-brand-blue", x: "6px" },
] as const;

export function WaitlistForm() {
  const searchParams = useSearchParams();
  const source = searchParams.get("src") ?? "direct";
  const [celebration, setCelebration] = useState<{
    firstName: string;
    role: "seller" | "buyer";
  } | null>(null);
  const form = useForm<WaitlistFormDraft>({
    resolver: zodResolver(waitlistSchema) as Resolver<WaitlistFormDraft>,
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      instagramHandle: "",
      linkedinUrl: "",
      role: "",
    },
  });
  // React Hook Form's watch is intentionally stateful; React Compiler safely skips this hook.
  // eslint-disable-next-line react-hooks/incompatible-library
  const role = form.watch("role");
  const phoneField = form.register("phone");
  const instagramField = form.register("instagramHandle");

  const mutation = useMutation({
    mutationFn: (values: WaitlistFormValues) => joinWaitlist({ ...values, source }),
    onSuccess: (_data, values) => {
      const firstName = values.fullName.trim().split(/\s+/)[0] ?? "";
      setCelebration({ firstName, role: values.role });
      form.reset({
        fullName: "",
        email: "",
        phone: "",
        instagramHandle: "",
        linkedinUrl: "",
        role: "",
      });
    },
  });

  function onSubmit(values: WaitlistFormDraft) {
    if (values.role !== "seller" && values.role !== "buyer") {
      form.setError("role", {
        type: "manual",
        message: "Choose whether you are joining as a seller or a buyer",
      });
      return;
    }

    const phoneDigits = values.phone?.replace(/\D/g, "").replace(/^0+/, "") ?? "";

    mutation.mutate({
      ...values,
      role: values.role,
      phone: phoneDigits ? `+971${phoneDigits}` : undefined,
      instagramHandle: values.instagramHandle.replace(/^@/, ""),
      linkedinUrl: values.linkedinUrl ? values.linkedinUrl : undefined,
    });
  }

  const errorMessage =
    mutation.error instanceof ApiRequestError
      ? mutation.error.message
      : mutation.error instanceof Error
        ? mutation.error.message
        : mutation.error
          ? "Something went wrong. Please try again."
          : null;

  if (mutation.isSuccess) {
    const thankYouName = celebration?.firstName ? `, ${celebration.firstName}` : "";
    const roleLabel = celebration?.role === "buyer" ? "buyer" : "seller";

    return (
      <Card className="animate-in fade-in zoom-in-95 relative mx-auto w-full max-w-4xl overflow-hidden rounded-[2rem] border-white/80 bg-white/82 shadow-2xl shadow-brand-forest/10 backdrop-blur-2xl duration-700">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="animate-waitlist-glow absolute left-1/2 top-8 h-40 w-40 -translate-x-1/2 rounded-full bg-brand-mantis/25 blur-3xl" />
          <div className="animate-waitlist-glow absolute bottom-6 left-10 h-28 w-28 rounded-full bg-brand-blue/20 blur-3xl [animation-delay:400ms]" />
          <div className="animate-waitlist-glow absolute bottom-10 right-12 h-24 w-24 rounded-full bg-brand-emerald/25 blur-3xl [animation-delay:800ms]" />
          {SUCCESS_SPARKS.map((spark, index) => (
            <span
              key={index}
              aria-hidden
              className={cn(
                "animate-waitlist-float absolute bottom-24 size-2.5 rounded-full",
                spark.color,
              )}
              style={
                {
                  left: spark.left,
                  animationDelay: spark.delay,
                  "--waitlist-x": spark.x,
                } as CSSProperties
              }
            />
          ))}
        </div>

        <CardContent className="relative p-8 text-center sm:p-12">
          <div className="animate-waitlist-check mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/15 text-primary shadow-[0_0_0_1px_rgb(111_219_66/0.25)]">
            <div className="animate-pulse-ring relative flex size-full items-center justify-center rounded-full">
              <CheckCircle2 className="h-10 w-10" />
            </div>
          </div>

          <Badge className="animate-in fade-in slide-in-from-bottom-2 mt-6 rounded-full border-brand-emerald/30 bg-brand-emerald/12 px-3 py-1.5 text-brand-forest duration-500 fill-mode-both">
            <PartyPopper className="size-3.5" />
            Spot claimed
          </Badge>

          <h2 className="animate-in fade-in slide-in-from-bottom-3 mt-4 text-3xl font-extrabold tracking-tight text-brand-forest duration-700 fill-mode-both sm:text-4xl [animation-delay:80ms]">
            Thank you{thankYouName}!
          </h2>
          <p className="animate-in fade-in slide-in-from-bottom-3 mx-auto mt-3 max-w-lg text-base leading-7 text-muted-foreground duration-700 fill-mode-both [animation-delay:160ms]">
            You&apos;re officially on the Kattegat early-access list as a{" "}
            <strong className="text-brand-forest">{roleLabel}</strong>. We&apos;ll email you when doors
            open — you&apos;re in before the public launch.
          </p>

          <div className="animate-in fade-in slide-in-from-bottom-4 mx-auto mt-7 grid max-w-xl gap-3 text-left duration-700 fill-mode-both sm:grid-cols-3 [animation-delay:240ms]">
            {[
              { icon: Sparkles, title: "First in line", body: "Launch updates before the crowd." },
              { icon: Heart, title: "No spam", body: "Only the moments that matter." },
              { icon: Crown, title: "Founders lane", body: "Sellers may unlock founder seats." },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-brand-forest/10 bg-white/75 px-4 py-3 shadow-sm backdrop-blur"
              >
                <item.icon className="mb-2 size-4 text-brand-forest" />
                <p className="text-sm font-extrabold text-brand-forest">{item.title}</p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">{item.body}</p>
              </div>
            ))}
          </div>

          <p className="animate-in fade-in slide-in-from-bottom-3 mx-auto mt-6 max-w-md text-sm leading-6 text-muted-foreground duration-700 fill-mode-both [animation-delay:320ms]">
            Follow{" "}
            <Link
              href="https://instagram.com/kattegat.app"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-brand-forest underline decoration-brand-forest/25 underline-offset-4 transition-colors hover:text-brand-blue hover:decoration-brand-blue/50"
            >
              @kattegat.app
            </Link>{" "}
            for milestones, podcasts, and the launch countdown.
          </p>

          <Button
            type="button"
            className="animate-in fade-in slide-in-from-bottom-2 mt-7 h-11 rounded-full px-5 transition-transform duration-500 hover:scale-[1.03] active:scale-[0.98] fill-mode-both [animation-delay:400ms]"
            onClick={() => {
              setCelebration(null);
              mutation.reset();
            }}
            variant="outline"
          >
            Add another person
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="animate-in fade-in slide-in-from-bottom-4 group relative mx-auto w-full max-w-4xl overflow-hidden rounded-[2.25rem] border-white/80 bg-white/82 shadow-2xl shadow-brand-forest/10 backdrop-blur-2xl duration-700">
      <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-brand-mantis/18 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-28 -left-20 h-64 w-64 rounded-full bg-brand-blue/14 blur-3xl" />
      <CardContent className="relative p-6 sm:p-10 lg:p-12">
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-brand-blue">
                First Access
              </p>
              <h2 className="mt-3 text-3xl font-extrabold leading-tight text-brand-forest sm:text-4xl">
                Add your name to the list
              </h2>
            </div>
            <Badge className="w-fit rounded-full border-brand-emerald/30 bg-brand-emerald/12 px-3 py-1.5 text-brand-forest">
              Early access queue
            </Badge>
          </div>
          <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground">
            No spam. One email when doors open — and first access before anyone else.
          </p>

          <fieldset className="mt-8 space-y-3">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <legend className="text-sm font-extrabold text-brand-forest">
                How are you joining?
              </legend>
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Required
              </span>
            </div>
            <p className="text-sm leading-6 text-muted-foreground">
              Choose one. This decides which early-access lane you enter.
            </p>

            <div
              className="grid gap-3 sm:grid-cols-2"
              role="radiogroup"
              aria-label="Waitlist role"
              aria-required="true"
            >
              {ROLE_OPTIONS.map((option) => {
                const selected = role === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() =>
                      form.setValue("role", option.value, {
                        shouldValidate: true,
                        shouldDirty: true,
                        shouldTouch: true,
                      })
                    }
                    className={cn(
                      "relative h-auto rounded-3xl border px-5 py-5 text-left transition-all duration-300",
                      selected
                        ? "border-primary bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                        : "border-dashed border-brand-forest/25 bg-white/70 text-brand-forest hover:border-brand-forest/45 hover:bg-muted",
                    )}
                  >
                    <span
                      className={cn(
                        "absolute right-4 top-4 flex size-6 items-center justify-center rounded-full border",
                        selected
                          ? "border-white/40 bg-white text-brand-forest"
                          : "border-brand-forest/20 bg-transparent",
                      )}
                      aria-hidden
                    >
                      {selected ? <CheckCircle2 className="size-4" /> : null}
                    </span>
                    <span className="block pr-8 text-base font-extrabold">{option.title}</span>
                    <span className="mt-1.5 block text-sm font-medium leading-5 opacity-80">
                      {option.subtitle}
                    </span>
                  </button>
                );
              })}
            </div>

            {form.formState.errors.role ? (
              <p className="flex items-center gap-1.5 text-sm font-semibold text-red-600">
                <AlertCircle className="size-3.5 shrink-0" />
                {form.formState.errors.role.message}
              </p>
            ) : null}
          </fieldset>

          {role === "seller" ? (
            <Card className="animate-in fade-in slide-in-from-top-2 mt-6 rounded-[1.75rem] border-brand-emerald/30 bg-brand-emerald/10 shadow-sm backdrop-blur duration-300">
              <CardContent className="grid gap-5 p-5 sm:grid-cols-[auto_1fr] sm:p-6">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-brand-emerald/40 bg-white/70 text-brand-forest shadow-sm">
                  <Crown className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge
                      variant="outline"
                      className="rounded-full border-brand-emerald/40 bg-white/70 text-brand-forest"
                    >
                      <Sparkles className="h-3 w-3" />
                      Seller priority
                    </Badge>
                    <span className="text-xs font-extrabold uppercase tracking-[0.18em] text-muted-foreground">
                      100 seats
                    </span>
                  </div>
                  <p className="mt-3 text-base leading-7 text-muted-foreground">
                    <strong className="text-brand-forest">100 of the first 1,000 sellers</strong> become{" "}
                    <strong className="text-brand-forest">Founding Members</strong> with permanent
                    founder status, rewards, and public visibility.
                  </p>
                  <div className="mt-5 grid gap-2 text-sm font-bold text-brand-forest sm:grid-cols-3">
                    {["Founder status", "Public visibility", "Earned, not bought"].map((item) => (
                      <div
                        key={item}
                        className="rounded-2xl border border-brand-emerald/30 bg-white/70 px-3 py-2.5"
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : null}

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-brand-forest">
                Full name
              </Label>
              <Input
                id="fullName"
                autoComplete="name"
                placeholder="Your name"
                className="h-14 rounded-2xl border-transparent bg-muted/70 px-4 text-base text-brand-forest placeholder:text-muted-foreground transition-colors focus-visible:border-brand-blue"
                {...form.register("fullName")}
              />
              {form.formState.errors.fullName ? (
                <p className="text-sm text-red-600">{form.formState.errors.fullName.message}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-brand-forest">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                className="h-14 rounded-2xl border-transparent bg-muted/70 px-4 text-base text-brand-forest placeholder:text-muted-foreground transition-colors focus-visible:border-brand-blue"
                {...form.register("email")}
              />
              {form.formState.errors.email ? (
                <p className="text-sm text-red-600">{form.formState.errors.email.message}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="instagramHandle" className="text-brand-forest">
                Instagram handle
              </Label>
              <div className="flex">
                <span className="flex h-14 shrink-0 items-center rounded-l-2xl border border-transparent bg-muted/90 px-4 text-base font-bold text-brand-forest">
                  @
                </span>
                <Input
                  id="instagramHandle"
                  autoComplete="off"
                  placeholder="yourhandle"
                  className="h-14 rounded-l-none rounded-r-2xl border-transparent bg-muted/70 px-4 text-base text-brand-forest placeholder:text-muted-foreground transition-colors focus-visible:border-brand-blue"
                  {...instagramField}
                  onChange={(event) => {
                    event.currentTarget.value = event.currentTarget.value.replace(/^@/, "");
                    instagramField.onChange(event);
                  }}
                />
              </div>
              {form.formState.errors.instagramHandle ? (
                <p className="text-sm text-red-600">{form.formState.errors.instagramHandle.message}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <div className="flex items-baseline justify-between">
                <Label htmlFor="linkedinUrl" className="text-brand-forest">
                  LinkedIn
                </Label>
                <span className="text-xs font-semibold text-muted-foreground">Optional</span>
              </div>
              <Input
                id="linkedinUrl"
                type="url"
                autoComplete="url"
                placeholder="https://linkedin.com/in/yourname"
                className="h-14 rounded-2xl border-transparent bg-muted/70 px-4 text-base text-brand-forest placeholder:text-muted-foreground transition-colors focus-visible:border-brand-blue"
                {...form.register("linkedinUrl")}
              />
              {form.formState.errors.linkedinUrl ? (
                <p className="text-sm text-red-600">{form.formState.errors.linkedinUrl.message}</p>
              ) : null}
            </div>

            <div className="space-y-2 sm:col-span-2">
              <div className="flex items-baseline justify-between gap-2">
                <Label htmlFor="phone" className="text-brand-forest">
                  Phone (WhatsApp)
                </Label>
                <span className="text-xs font-semibold text-muted-foreground">
                  UAE mobile · no country code
                </span>
              </div>
              <div className="flex">
                <span className="flex h-14 shrink-0 items-center rounded-l-2xl border border-transparent bg-muted/90 px-4 text-base font-bold text-brand-forest">
                  +971
                </span>
                <Input
                  id="phone"
                  type="tel"
                  autoComplete="tel-national"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={9}
                  placeholder="501234567"
                  className="h-14 rounded-l-none rounded-r-2xl border-transparent bg-muted/70 px-4 text-base text-brand-forest placeholder:text-muted-foreground transition-colors focus-visible:border-brand-blue"
                  {...phoneField}
                  onChange={(event) => {
                    const digits = event.currentTarget.value.replace(/\D/g, "").replace(/^0+/, "").slice(0, 9);
                    event.currentTarget.value = digits;
                    phoneField.onChange(event);
                  }}
                />
              </div>
              {form.formState.errors.phone ? (
                <p className="text-sm text-red-600">{form.formState.errors.phone.message}</p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  9 digits starting with 5. Example: 50 123 4567
                </p>
              )}
            </div>
          </div>

          {errorMessage ? (
            <div className="animate-in fade-in slide-in-from-top-1 mt-5 flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 duration-300">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {errorMessage}
            </div>
          ) : null}

          {mutation.isPending ? (
            <div
              className="mt-7 h-1 w-full overflow-hidden rounded-full bg-brand-forest/10"
              role="status"
              aria-live="polite"
              aria-busy="true"
            >
              <div className="animate-line-loader h-full w-[38%] rounded-full bg-gradient-to-r from-brand-mantis via-brand-emerald to-brand-blue shadow-[0_0_12px_rgb(111_219_66/0.4)]" />
              <span className="sr-only">Submitting waitlist application</span>
            </div>
          ) : null}

          <Button
            type="submit"
            size="lg"
            disabled={mutation.isPending}
            className={cn(
              "h-14 w-full rounded-2xl text-base font-extrabold transition-transform hover:scale-[1.01] active:scale-[0.99]",
              mutation.isPending ? "mt-4" : "mt-7",
            )}
          >
            {mutation.isPending
              ? "Submitting…"
              : role === "seller"
                ? "Join as a seller"
                : role === "buyer"
                  ? "Join as a buyer"
                  : "Choose a role to continue"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
