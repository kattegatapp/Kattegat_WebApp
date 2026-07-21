"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import {
  ArrowRight,
  Building2,
  Eye,
  EyeOff,
  Gift,
  LockKeyhole,
  Mail,
  ShoppingBag,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useForm, type Resolver } from "react-hook-form";

import { PasswordStrength } from "@/features/auth/password-strength";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { registerErrorMessage } from "@/lib/auth/error-messages";
import { ApiRequestError } from "@/lib/api/client";
import { registerMember } from "@/lib/api/auth";
import { INPUT_LIMITS } from "@/lib/security/input";
import { cn } from "@/lib/utils";
import {
  memberRegisterFormSchema,
  type MemberRegisterFormValues,
} from "@/lib/validations/auth";

const inputClass =
  "h-12 rounded-xl border-brand-forest/12 bg-white pl-10 text-brand-forest shadow-sm placeholder:text-brand-forest/35 focus-visible:border-brand-mantis/55 focus-visible:ring-brand-mantis/20";

export function MemberRegisterForm({ initialReferralCode = "" }: { initialReferralCode?: string }) {
  const refFromUrl = initialReferralCode.trim().toUpperCase();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [needsConfirm, setNeedsConfirm] = useState(false);
  const [role, setRole] = useState<"buyer" | "seller">("buyer");

  const form = useForm<MemberRegisterFormValues>({
    resolver: zodResolver(memberRegisterFormSchema) as Resolver<MemberRegisterFormValues>,
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      businessName: "",
      role: "buyer",
      referralCode: refFromUrl,
    },
  });

  const passwordValue = form.watch("password") ?? "";

  const mutation = useMutation({
    mutationFn: (values: MemberRegisterFormValues) =>
      registerMember({
        email: values.email,
        password: values.password,
        role: values.role,
        businessName:
          values.role === "buyer" ? values.businessName?.trim() || undefined : undefined,
        referralCode: values.referralCode?.trim() || undefined,
      }),
    onSuccess: (result) => {
      if (result.requiresEmailConfirmation) {
        setNeedsConfirm(true);
        return;
      }
      if (result.user) {
        window.location.assign("/account/setup");
      }
    },
    onError: (error) => {
      if (error instanceof ApiRequestError && error.code === "CONFIRMATION_REQUIRED") {
        setNeedsConfirm(true);
      }
    },
  });

  if (needsConfirm) {
    return (
      <Alert className="border-brand-mantis/30 bg-brand-mantis/10 text-brand-forest">
        <AlertTitle>Check your email</AlertTitle>
        <AlertDescription className="space-y-3 text-brand-forest/75">
          <p>
            We sent a confirmation link to your email. After you verify, sign in to open your
            account.
          </p>
          <Button variant="outline" nativeButton={false} render={<Link href="/login" />}>
            Go to sign in
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <form
      className="space-y-5"
      onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
    >
      <FieldGroup>
        <Field>
          <FieldLabel className="text-brand-forest/75">I want to join as</FieldLabel>
          <div className="grid grid-cols-2 gap-2">
            {(
              [
                { value: "seller" as const, label: "Seller", icon: Building2, hint: "List & get booked" },
                { value: "buyer" as const, label: "Buyer", icon: ShoppingBag, hint: "Find talent" },
              ] as const
            ).map((option) => {
              const Icon = option.icon;
              const selected = role === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    setRole(option.value);
                    form.setValue("role", option.value, { shouldValidate: true });
                    if (option.value === "seller") {
                      form.setValue("businessName", "", { shouldValidate: true });
                    }
                  }}
                  className={cn(
                    "rounded-xl border px-3 py-3 text-left transition shadow-sm",
                    selected
                      ? "border-brand-mantis/50 bg-brand-mantis/12 ring-1 ring-brand-mantis/25"
                      : "border-brand-forest/12 bg-white hover:border-brand-forest/25",
                  )}
                >
                  <span className="flex items-center gap-2 font-extrabold text-brand-forest">
                    <Icon className="size-4 text-brand-mantis" />
                    {option.label}
                  </span>
                  <span className="mt-1 block text-xs text-brand-forest/55">{option.hint}</span>
                </button>
              );
            })}
          </div>
          <p className="text-xs leading-5 text-brand-forest/50">
            You can add the other identity later — one account, dual identity.
          </p>
        </Field>

        <Field data-invalid={form.formState.errors.email ? true : undefined}>
          <FieldLabel htmlFor="registerEmail" className="text-brand-forest/75">
            Email
          </FieldLabel>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-brand-forest/35" />
            <Input
              id="registerEmail"
              type="email"
              autoComplete="email"
              maxLength={INPUT_LIMITS.email}
              placeholder="you@email.com"
              className={inputClass}
              {...form.register("email")}
            />
          </div>
          <FieldError errors={[form.formState.errors.email]} />
        </Field>

        {role === "buyer" ? (
          <Field data-invalid={form.formState.errors.businessName ? true : undefined}>
            <FieldLabel htmlFor="registerBusiness" className="text-brand-forest/75">
              Business name (optional)
            </FieldLabel>
            <div className="relative">
              <Building2 className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-brand-forest/35" />
              <Input
                id="registerBusiness"
                type="text"
                autoComplete="organization"
                maxLength={INPUT_LIMITS.businessName}
                placeholder="Your brand or company"
                className={inputClass}
                {...form.register("businessName")}
              />
            </div>
            <FieldError errors={[form.formState.errors.businessName]} />
          </Field>
        ) : null}

        <Field data-invalid={form.formState.errors.password ? true : undefined}>
          <FieldLabel htmlFor="registerPassword" className="text-brand-forest/75">
            Password
          </FieldLabel>
          <div className="relative">
            <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-brand-forest/35" />
            <Input
              id="registerPassword"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              maxLength={INPUT_LIMITS.password}
              placeholder="Create a strong password"
              className={cn(inputClass, "pr-12")}
              {...form.register("password")}
            />
            <button
              type="button"
              className="absolute right-2 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-lg text-brand-forest/45 hover:bg-brand-forest/5 hover:text-brand-forest"
              aria-label={showPassword ? "Hide password" : "Show password"}
              onClick={() => setShowPassword((value) => !value)}
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
          <PasswordStrength password={passwordValue} />
          <FieldError errors={[form.formState.errors.password]} />
        </Field>

        <Field data-invalid={form.formState.errors.confirmPassword ? true : undefined}>
          <FieldLabel htmlFor="registerConfirmPassword" className="text-brand-forest/75">
            Confirm password
          </FieldLabel>
          <div className="relative">
            <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-brand-forest/35" />
            <Input
              id="registerConfirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              autoComplete="new-password"
              maxLength={INPUT_LIMITS.password}
              placeholder="Re-enter your password"
              className={cn(inputClass, "pr-12")}
              {...form.register("confirmPassword")}
            />
            <button
              type="button"
              className="absolute right-2 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-lg text-brand-forest/45 hover:bg-brand-forest/5 hover:text-brand-forest"
              aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              onClick={() => setShowConfirmPassword((value) => !value)}
            >
              {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
          <FieldError errors={[form.formState.errors.confirmPassword]} />
        </Field>

        <Field data-invalid={form.formState.errors.referralCode ? true : undefined}>
          <FieldLabel htmlFor="registerReferral" className="text-brand-forest/75">
            Referral code (optional)
          </FieldLabel>
          <div className="relative">
            <Gift className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-brand-forest/35" />
            <Input
              id="registerReferral"
              type="text"
              autoComplete="off"
              maxLength={INPUT_LIMITS.referralCode}
              placeholder="Friend's code"
              className={cn(inputClass, "uppercase")}
              {...form.register("referralCode")}
              defaultValue={refFromUrl}
            />
          </div>
          <FieldError errors={[form.formState.errors.referralCode]} />
        </Field>
      </FieldGroup>

      {mutation.isError &&
      !(mutation.error instanceof ApiRequestError &&
        mutation.error.code === "CONFIRMATION_REQUIRED") ? (
        <Alert variant="destructive">
          <AlertDescription>{registerErrorMessage(mutation.error)}</AlertDescription>
        </Alert>
      ) : null}

      <Button
        type="submit"
        size="lg"
        className="h-12 w-full rounded-xl bg-brand-mantis font-extrabold text-brand-forest shadow-[0_12px_32px_rgb(111_219_66/0.22)] hover:bg-[#7ee34f]"
        disabled={mutation.isPending}
      >
        {mutation.isPending ? <Spinner /> : null}
        Create {role === "seller" ? "seller" : "buyer"} account
        <ArrowRight />
      </Button>

      <p className="text-center text-sm text-brand-forest/60">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-bold text-brand-forest underline-offset-2 hover:underline"
        >
          Sign in
        </Link>
      </p>
    </form>
  );
}
