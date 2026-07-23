"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  CreditCard,
  Loader2,
  Lock,
  ShieldCheck,
  Smartphone,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm, type Resolver } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatFilsAsAed } from "@/lib/admin/money";
import {
  ANNUAL_FREE_MONTHS,
  billingCycleLabel,
  computeProBillingQuote,
  formatCheckoutTotal,
} from "@/lib/billing/pricing";
import {
  createBillingCheckoutSession,
  createBillingPortalSession,
  fetchBillingMe,
  loginForBilling,
  logoutBilling,
  type BillingPlan,
  type BillingUser,
} from "@/lib/api/billing";
import { ApiRequestError } from "@/lib/api/client";
import type { PublicPlanFeatures } from "@/lib/api/plans";
import { INPUT_LIMITS } from "@/lib/security/input";
import { memberLoginSchema, type MemberLoginValues } from "@/lib/validations/auth";
import { cn } from "@/lib/utils";

type PlansCheckoutContentProps = {
  plan: PublicPlanFeatures;
  paymentsEnabled: boolean;
};

export function PlansCheckoutContent({ plan, paymentsEnabled }: PlansCheckoutContentProps) {
  const router = useRouter();
  const [user, setUser] = useState<BillingUser | null>(null);
  const [loadingSession, setLoadingSession] = useState(true);
  const [billingCycle, setBillingCycle] = useState<BillingPlan>("pro_monthly");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [alreadyPro, setAlreadyPro] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);

  const loginForm = useForm<MemberLoginValues>({
    resolver: zodResolver(memberLoginSchema) as Resolver<MemberLoginValues>,
    defaultValues: { email: "", password: "" },
  });

  useEffect(() => {
    let active = true;
    void fetchBillingMe().then((me) => {
      if (active) {
        setUser(me);
        setLoadingSession(false);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  async function handleLogin(values: MemberLoginValues) {
    setAuthLoading(true);
    setSubmitError(null);
    try {
      const me = await loginForBilling(values.email, values.password);
      setUser(me);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Could not sign in.");
    } finally {
      setAuthLoading(false);
    }
  }

  async function handleCheckout() {
    if (!user?.sid) {
      setSubmitError("Sign in with a seller account before continuing to payment.");
      return;
    }

    setCheckoutLoading(true);
    setSubmitError(null);
    try {
      const { url } = await createBillingCheckoutSession(billingCycle);
      window.location.href = url;
    } catch (error) {
      if (error instanceof ApiRequestError && error.code === "PRO_ALREADY_ACTIVE") {
        setAlreadyPro(true);
        setSubmitError(null);
      } else {
        setSubmitError(
          error instanceof Error
            ? error.message
            : "Checkout could not be started. Try again or contact support.",
        );
      }
      setCheckoutLoading(false);
    }
  }

  async function openBillingPortal() {
    setPortalLoading(true);
    setSubmitError(null);
    try {
      const { url } = await createBillingPortalSession();
      window.location.href = url;
    } catch (error) {
      setSubmitError(
        error instanceof ApiRequestError
          ? error.message
          : "Could not open billing portal. Try /billing or contact support.",
      );
      setPortalLoading(false);
    }
  }

  const quote = computeProBillingQuote(plan.monthlyPriceFils);
  const monthlyPrice =
    quote != null ? formatFilsAsAed(quote.monthlyPriceFils) : "—";
  const annualPrice = quote != null ? formatFilsAsAed(quote.annualPriceFils) : "—";
  const annualListPrice = quote != null ? formatFilsAsAed(quote.annualListFils) : "—";
  const effectiveMonthly =
    quote != null ? formatFilsAsAed(quote.effectiveMonthlyFils) : "—";
  const checkoutTotal = formatCheckoutTotal(billingCycle, quote);
  const isAnnual = billingCycle === "pro_annual";

  return (
    <section className="relative isolate overflow-x-clip bg-[#F7F9F8] py-10 sm:py-14">
      <div aria-hidden className="marketing-section-bg">
        <div className="absolute -left-32 top-8 size-[22rem] rounded-full bg-brand-mantis/12 blur-3xl" />
        <div className="absolute -right-24 bottom-0 size-[20rem] rounded-full bg-brand-blue/10 blur-3xl" />
      </div>

      <div className="marketing-section-content marketing-container">
        <Link
          href="/plans"
          className="mb-8 inline-flex min-h-11 items-center gap-2 text-sm font-extrabold text-brand-blue hover:text-brand-forest"
        >
          <ArrowLeft className="size-4" />
          Back to plans
        </Link>

        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-start lg:gap-10">
          <div className="space-y-6">
            <div>
              <p className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-brand-blue">
                Secure checkout
              </p>
              <h1 className="mt-2 text-3xl font-extrabold tracking-[-0.04em] sm:text-4xl">
                Upgrade to Pro
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-7 text-brand-forest/60 sm:text-base">
                Upgrade on the web via Stripe — not through the App Store or Google Play. Sign in
                with your existing Kattegat seller account, then continue to payment.
              </p>
            </div>

            <article className="rounded-[1.75rem] border border-brand-mantis/30 bg-white p-6 shadow-[0_18px_50px_rgb(0_57_18/0.08)] sm:p-7">
              <div className="flex items-start gap-4">
                <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-brand-mantis text-brand-forest">
                  <Sparkles className="size-5" />
                </span>
                <div className="min-w-0">
                  <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-brand-blue">
                    Pro plan
                  </p>
                  <p className="mt-1 text-2xl font-extrabold tracking-[-0.03em]">Kattegat Pro</p>
                  <p className="mt-2 text-sm leading-7 text-brand-forest/65">
                    Direct chat, reviews, priority search, and stronger discovery for active sellers.
                  </p>
                </div>
              </div>

              <div className="mt-6 rounded-2xl border border-brand-forest/8 bg-[#F7F9F8] p-4 sm:p-5">
                <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-brand-blue">
                  {isAnnual ? "Annual total" : "Monthly total"}
                </p>
                <div className="mt-2 flex flex-wrap items-end gap-x-3 gap-y-1">
                  <p className="text-3xl font-extrabold tracking-[-0.04em] text-brand-forest">
                    {checkoutTotal}
                    <span className="ml-1 text-sm font-bold text-brand-forest/45">
                      {isAnnual ? "/ year" : "/ month"}
                    </span>
                  </p>
                  {isAnnual && quote ? (
                    <span className="rounded-full bg-brand-mantis/20 px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.12em] text-brand-forest">
                      Save {quote.savingsPercent}%
                    </span>
                  ) : null}
                </div>
                {isAnnual && quote ? (
                  <p className="mt-2 text-sm text-brand-forest/55">
                    <span className="line-through">{annualListPrice}/year</span>
                    <span className="mx-2 text-brand-forest/25">·</span>
                    Works out to {effectiveMonthly}/month
                  </p>
                ) : quote ? (
                  <p className="mt-2 text-sm text-brand-forest/55">
                    Or {annualPrice}/year and save {quote.savingsPercent}% ({ANNUAL_FREE_MONTHS}{" "}
                    months free)
                  </p>
                ) : null}
              </div>

              <div className="mt-6 grid gap-2 sm:grid-cols-2">
                {(
                  [
                    ["pro_monthly", "Monthly", `${monthlyPrice} / month`, "Billed every month"],
                    [
                      "pro_annual",
                      "Annual",
                      `${annualPrice} / year`,
                      quote
                        ? `Save ${quote.savingsPercent}% · ${effectiveMonthly}/mo`
                        : "Best value · billed yearly",
                    ],
                  ] as const
                ).map(([value, label, priceLine, detail]) => {
                  const selected = billingCycle === value;
                  const showSavings = value === "pro_annual" && quote;
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setBillingCycle(value)}
                      className={cn(
                        "relative rounded-2xl border px-4 py-4 text-left transition",
                        selected
                          ? "border-brand-mantis bg-brand-mantis/12"
                          : "border-brand-forest/10 bg-[#F7F9F8] hover:border-brand-forest/20",
                      )}
                    >
                      {showSavings ? (
                        <span className="absolute -right-2 -top-2 rounded-full bg-brand-forest px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-[0.1em] text-brand-mantis">
                          Save {quote.savingsPercent}%
                        </span>
                      ) : null}
                      <p className="text-sm font-extrabold text-brand-forest">{label}</p>
                      <p className="mt-1 text-sm font-bold text-brand-forest">{priceLine}</p>
                      <p className="mt-1 text-xs font-semibold text-brand-forest/55">{detail}</p>
                    </button>
                  );
                })}
              </div>

              <ul className="mt-6 space-y-3 text-sm leading-6 text-brand-forest/75">
                {[
                  "Direct buyer messaging",
                  "Collect reviews on your profile",
                  "Priority placement in search",
                  "Social link-out on profile",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <BadgeCheck className="mt-0.5 size-4 shrink-0 text-brand-mantis" />
                    {item}
                  </li>
                ))}
              </ul>
            </article>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-brand-forest/8 bg-white p-4">
                <Lock className="size-4 text-brand-blue" />
                <p className="mt-2 text-sm font-extrabold">Stripe secure payment</p>
                <p className="mt-1 text-xs leading-6 text-brand-forest/55">
                  Card details are handled by Stripe. Kattegat never stores your full card number.
                </p>
              </div>
              <div className="rounded-2xl border border-brand-forest/8 bg-white p-4">
                <ShieldCheck className="size-4 text-brand-mantis" />
                <p className="mt-2 text-sm font-extrabold">Cancel anytime</p>
                <p className="mt-1 text-xs leading-6 text-brand-forest/55">
                  Manage or cancel from Billing → Manage Pro subscription (Stripe Customer Portal).
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-brand-forest/10 bg-white p-5 shadow-[0_18px_50px_rgb(0_57_18/0.08)] sm:p-7">
            {paymentsEnabled && quote ? (
              <div className="mb-6 rounded-2xl border border-brand-forest/8 bg-[#F7F9F8] p-4">
                <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-brand-blue">
                  Order summary
                </p>
                <div className="mt-3 space-y-2 text-sm">
                  <div className="flex items-start justify-between gap-3">
                    <span className="font-semibold text-brand-forest">
                      Kattegat Pro · {billingCycleLabel(billingCycle)}
                    </span>
                    <span className="shrink-0 font-bold text-brand-forest">{checkoutTotal}</span>
                  </div>
                  {isAnnual ? (
                    <p className="text-xs text-brand-forest/55">
                      Billed once per year. You save {formatFilsAsAed(quote.savingsFils)} compared to
                      paying monthly.
                    </p>
                  ) : (
                    <p className="text-xs text-brand-forest/55">Renews every month. Cancel anytime.</p>
                  )}
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-brand-forest/8 pt-4">
                  <span className="text-sm font-extrabold text-brand-forest">Total due today</span>
                  <span className="text-lg font-extrabold text-brand-forest">
                    {checkoutTotal}
                    <span className="ml-1 text-xs font-bold text-brand-forest/45">
                      {isAnnual ? "/ year" : "/ month"}
                    </span>
                  </span>
                </div>
              </div>
            ) : null}

            {!paymentsEnabled ? (
              <div className="space-y-4 text-center">
                <CreditCard className="mx-auto size-8 text-brand-blue" />
                <h2 className="text-xl font-extrabold">Checkout opening soon</h2>
                <p className="text-sm leading-7 text-brand-forest/60">
                  Online plan purchases are not enabled yet. Join the waitlist and we&apos;ll notify
                  you when Pro checkout goes live.
                </p>
                <Button
                  className="h-11 w-full rounded-xl bg-brand-forest font-extrabold text-white hover:bg-brand-blue"
                  onClick={() => router.push("/waitlist")}
                >
                  Join the waitlist
                </Button>
              </div>
            ) : loadingSession ? (
              <div className="flex min-h-48 items-center justify-center text-sm text-brand-forest/55">
                <Loader2 className="mr-2 size-4 animate-spin" />
                Loading your session…
              </div>
            ) : user?.sid ? (
              <div className="space-y-5">
                {alreadyPro ? (
                  <div className="space-y-4 rounded-2xl border border-brand-mantis/30 bg-brand-mantis/10 p-4">
                    <div>
                      <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-brand-blue">
                        Already on Pro
                      </p>
                      <h2 className="mt-2 text-xl font-extrabold">No new checkout needed</h2>
                      <p className="mt-2 text-sm leading-7 text-brand-forest/65">
                        This account already has Pro. Open Billing to update your card, download
                        invoices, or cancel.
                      </p>
                    </div>
                    <Button
                      type="button"
                      disabled={portalLoading}
                      onClick={() => void openBillingPortal()}
                      className="h-12 w-full rounded-xl bg-brand-mantis font-extrabold text-brand-forest hover:bg-brand-forest hover:text-white"
                    >
                      {portalLoading ? (
                        <>
                          <Loader2 className="size-4 animate-spin" />
                          Opening portal…
                        </>
                      ) : (
                        "Manage Pro subscription"
                      )}
                    </Button>
                    <Link
                      href="/billing"
                      className="block text-center text-sm font-extrabold text-brand-blue hover:text-brand-forest"
                    >
                      Go to billing account
                    </Link>
                  </div>
                ) : (
                  <>
                <div>
                  <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-brand-blue">
                    Signed in
                  </p>
                  <h2 className="mt-2 text-xl font-extrabold">Ready to pay</h2>
                  <p className="mt-2 text-sm leading-7 text-brand-forest/60">
                    {user.businessName || user.username || user.email}
                  </p>
                  <p className="text-sm text-brand-forest/45">{user.email}</p>
                </div>

                <Button
                  type="button"
                  disabled={checkoutLoading}
                  onClick={() => void handleCheckout()}
                  className="h-12 w-full rounded-xl bg-brand-mantis font-extrabold text-brand-forest hover:bg-brand-forest hover:text-white"
                >
                  {checkoutLoading ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Redirecting to Stripe…
                    </>
                  ) : (
                    <>
                      Pay {checkoutTotal}
                      {isAnnual ? " / year" : " / month"}
                      <CreditCard className="size-4" />
                    </>
                  )}
                </Button>
                  </>
                )}

                <button
                  type="button"
                  className="w-full text-center text-xs font-semibold text-brand-blue hover:underline"
                  onClick={() => {
                    setUser(null);
                    setAlreadyPro(false);
                    void logoutBilling();
                  }}
                >
                  Use a different account
                </button>
              </div>
            ) : (
              <div className="space-y-5">
                <div>
                  <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-brand-blue">
                    Link your account
                  </p>
                  <h2 className="mt-2 text-xl font-extrabold">Sign in to continue</h2>
                  <p className="mt-2 text-sm leading-7 text-brand-forest/60">
                    Use the same email and password as your Kattegat seller profile. We&apos;ll attach
                    Pro to that account after payment.
                  </p>
                </div>

                <form className="space-y-4" onSubmit={loginForm.handleSubmit(handleLogin)}>
                  <Field label="Email" error={loginForm.formState.errors.email?.message}>
                    <Input
                      type="email"
                      autoComplete="email"
                      maxLength={INPUT_LIMITS.email}
                      className="h-11 rounded-xl"
                      {...loginForm.register("email")}
                    />
                  </Field>
                  <Field label="Password" error={loginForm.formState.errors.password?.message}>
                    <Input
                      type="password"
                      autoComplete="current-password"
                      maxLength={INPUT_LIMITS.password}
                      className="h-11 rounded-xl"
                      {...loginForm.register("password")}
                    />
                  </Field>
                  <Button
                    type="submit"
                    disabled={authLoading}
                    className="h-11 w-full rounded-xl bg-brand-mantis font-extrabold text-brand-forest hover:bg-brand-forest hover:text-white"
                  >
                    {authLoading ? "Signing in…" : "Sign in and pay"}
                  </Button>
                </form>

                <div className="rounded-2xl border border-brand-forest/8 bg-[#F7F9F8] p-4">
                  <div className="flex items-start gap-3">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-blue/10 text-brand-blue">
                      <Smartphone className="size-4" />
                    </span>
                    <div>
                      <p className="text-sm font-extrabold text-brand-forest">New to Kattegat?</p>
                      <p className="mt-1 text-sm leading-6 text-brand-forest/60">
                        Create your free seller profile in the app first, then come back here to
                        upgrade. That keeps onboarding in the app and payments on the web.
                      </p>
                      <Link
                        href="/download"
                        className="mt-3 inline-flex min-h-10 items-center gap-2 text-sm font-extrabold text-brand-blue hover:text-brand-forest"
                      >
                        Download the app
                        <ArrowRight className="size-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {submitError ? (
              <p role="alert" className="mt-4 text-sm font-semibold leading-6 text-red-700">
                {submitError}
              </p>
            ) : null}

            <p className="mt-6 text-center text-xs leading-6 text-brand-forest/45">
              By continuing you agree to our{" "}
              <Link href="/terms-of-service" className="font-semibold text-brand-blue hover:underline">
                Terms
              </Link>{" "}
              and{" "}
              <Link href="/privacy-policy" className="font-semibold text-brand-blue hover:underline">
                Privacy Policy
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <Label className="text-xs font-extrabold uppercase tracking-[0.14em] text-brand-forest/55">
        {label}
      </Label>
      <div className="mt-2">{children}</div>
      {error ? <p className="mt-2 text-xs font-semibold text-red-600">{error}</p> : null}
    </div>
  );
}
