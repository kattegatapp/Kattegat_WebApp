"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { AlertCircle, CheckCircle2, Crown, Loader2, Sparkles } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";

import { joinWaitlist } from "@/lib/api/waitlist";
import { ApiRequestError } from "@/lib/api/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { waitlistSchema, type WaitlistFormValues } from "@/lib/validations/waitlist";

export function WaitlistForm() {
  const searchParams = useSearchParams();
  const source = searchParams.get("src") ?? "direct";
  const form = useForm<WaitlistFormValues>({
    resolver: zodResolver(waitlistSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      instagramHandle: "",
      linkedinUrl: "",
      role: "seller",
    },
  });
  // React Hook Form's watch is intentionally stateful; React Compiler safely skips this hook.
  // eslint-disable-next-line react-hooks/incompatible-library
  const role = form.watch("role");
  const phoneField = form.register("phone");
  const instagramField = form.register("instagramHandle");

  const mutation = useMutation({
    mutationFn: (values: WaitlistFormValues) => joinWaitlist({ ...values, source }),
    onSuccess: () =>
      form.reset({ fullName: "", email: "", phone: "", instagramHandle: "", linkedinUrl: "", role }),
  });

  function onSubmit(values: WaitlistFormValues) {
    const phoneDigits = values.phone?.replace(/\D/g, "");

    mutation.mutate({
      ...values,
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
    return (
      <Card className="animate-in fade-in zoom-in-95 mx-auto w-full max-w-4xl rounded-[2rem] border-white/80 bg-white/82 shadow-2xl shadow-brand-forest/10 backdrop-blur-2xl duration-500">
        <CardContent className="p-8 text-center sm:p-12">
          <div className="animate-pulse-ring relative mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/15">
            <CheckCircle2 className="h-9 w-9 text-primary" />
          </div>
          <h2 className="mt-5 text-2xl font-extrabold text-brand-forest">You&apos;re on the list.</h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
            Watch your inbox — and follow{" "}
            <Link
              href="https://instagram.com/kattegat.app"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-brand-forest underline decoration-brand-forest/25 underline-offset-4 transition-colors hover:text-brand-blue hover:decoration-brand-blue/50"
            >
              @kattegat.app
            </Link>{" "}
            for milestones, podcasts, and the launch.
          </p>
          <Button
            type="button"
            className="mt-6 h-11 rounded-full px-5 transition-transform hover:scale-[1.03] active:scale-[0.98]"
            onClick={() => mutation.reset()}
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

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {[
              { value: "seller" as const, title: "I'm a Seller", subtitle: "DJ · Performer · Supplier" },
              { value: "buyer" as const, title: "I'm a Buyer", subtitle: "Venue · Hotel · Organizer" },
            ].map((option) => (
              <Button
                key={option.value}
                type="button"
                variant={role === option.value ? "default" : "outline"}
                onClick={() => form.setValue("role", option.value, { shouldValidate: true })}
                className={cn(
                  "h-auto justify-start rounded-3xl px-5 py-5 text-left transition-all duration-300",
                  role === option.value
                    ? "border-primary bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                    : "border-border bg-white/70 text-brand-forest hover:bg-muted",
                )}
              >
                <span>
                  <span className="block text-base font-extrabold">{option.title}</span>
                  <span className="mt-1 block text-sm font-medium opacity-75">{option.subtitle}</span>
                </span>
              </Button>
            ))}
          </div>

          {role === "seller" ? (
            <Card className="animate-in fade-in slide-in-from-top-2 mt-6 rounded-[1.75rem] border-brand-emerald/30 bg-brand-emerald/10 shadow-sm backdrop-blur duration-300">
              <CardContent className="grid gap-5 p-5 sm:grid-cols-[auto_1fr] sm:p-6">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-brand-emerald/40 bg-white/70 text-brand-forest shadow-sm">
                  <Crown className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className="rounded-full border-brand-emerald/40 bg-white/70 text-brand-forest">
                      <Sparkles className="h-3 w-3" />
                      Seller priority
                    </Badge>
                    <span className="text-xs font-extrabold uppercase tracking-[0.18em] text-muted-foreground">
                      100 seats
                    </span>
                  </div>
                  <p className="mt-3 text-base leading-7 text-muted-foreground">
                    <strong className="text-brand-forest">100 of the first 1,000 sellers</strong> become{" "}
                    <strong className="text-brand-forest">Founding Members</strong> with permanent founder
                    status, rewards, and public visibility.
                  </p>
                  <div className="mt-5 grid gap-2 text-sm font-bold text-brand-forest sm:grid-cols-3">
                    {["Founder status", "Public visibility", "Earned, not bought"].map((item) => (
                      <div key={item} className="rounded-2xl border border-brand-emerald/30 bg-white/70 px-3 py-2.5">
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
              <Label htmlFor="phone" className="text-brand-forest">
                Phone (WhatsApp)
              </Label>
              <div className="flex">
                <span className="flex h-14 shrink-0 items-center rounded-l-2xl border border-transparent bg-muted/90 px-4 text-base font-bold text-brand-forest">
                  +971
                </span>
                <Input
                  id="phone"
                  type="tel"
                  autoComplete="tel"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="501234567"
                  className="h-14 rounded-l-none rounded-r-2xl border-transparent bg-muted/70 px-4 text-base text-brand-forest placeholder:text-muted-foreground transition-colors focus-visible:border-brand-blue"
                  {...phoneField}
                  onChange={(event) => {
                    event.currentTarget.value = event.currentTarget.value.replace(/\D/g, "");
                    phoneField.onChange(event);
                  }}
                />
              </div>
            </div>
          </div>

          {errorMessage ? (
            <div className="animate-in fade-in slide-in-from-top-1 mt-5 flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 duration-300">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {errorMessage}
            </div>
          ) : null}

          <Button
            type="submit"
            size="lg"
            disabled={mutation.isPending}
            className="mt-7 h-14 w-full rounded-2xl text-base font-extrabold transition-transform hover:scale-[1.01] active:scale-[0.99]"
          >
            {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Claim my spot
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
