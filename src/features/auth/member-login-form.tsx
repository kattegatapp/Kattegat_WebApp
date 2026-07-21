"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm, type Resolver } from "react-hook-form";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { loginErrorMessage } from "@/lib/auth/error-messages";
import { loginMember } from "@/lib/api/auth";
import { safeNextPath } from "@/lib/auth/profile-completion";
import { INPUT_LIMITS } from "@/lib/security/input";
import { memberLoginSchema, type MemberLoginValues } from "@/lib/validations/auth";

const inputClass =
  "h-12 rounded-xl border-brand-forest/12 bg-white pl-10 text-brand-forest shadow-sm placeholder:text-brand-forest/35 focus-visible:border-brand-mantis/55 focus-visible:ring-brand-mantis/20";

export function MemberLoginForm() {
  const searchParams = useSearchParams();
  const nextPath = safeNextPath(searchParams.get("next")) ?? "/account";
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<MemberLoginValues>({
    resolver: zodResolver(memberLoginSchema) as Resolver<MemberLoginValues>,
    defaultValues: { email: "", password: "" },
  });

  const mutation = useMutation({
    mutationFn: (values: MemberLoginValues) => loginMember(values.email, values.password),
    onSuccess: () => {
      // Hard navigation ensures the new httpOnly session cookie is on the next request.
      window.location.assign(nextPath);
    },
  });

  return (
    <form
      className="space-y-5"
      onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
    >
      <FieldGroup>
        <Field data-invalid={form.formState.errors.email ? true : undefined}>
          <FieldLabel htmlFor="memberEmail" className="text-brand-forest/75">
            Email
          </FieldLabel>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-brand-forest/35" />
            <Input
              id="memberEmail"
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

        <Field data-invalid={form.formState.errors.password ? true : undefined}>
          <FieldLabel htmlFor="memberPassword" className="text-brand-forest/75">
            Password
          </FieldLabel>
          <div className="relative">
            <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-brand-forest/35" />
            <Input
              id="memberPassword"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              maxLength={INPUT_LIMITS.password}
              placeholder="Your password"
              className={`${inputClass} pr-12`}
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
          <FieldError errors={[form.formState.errors.password]} />
        </Field>
      </FieldGroup>

      {mutation.isError ? (
        <Alert variant="destructive">
          <AlertDescription>{loginErrorMessage(mutation.error)}</AlertDescription>
        </Alert>
      ) : null}

      <Button
        type="submit"
        size="lg"
        className="h-12 w-full rounded-xl bg-brand-mantis font-extrabold text-brand-forest shadow-[0_12px_32px_rgb(111_219_66/0.22)] hover:bg-[#7ee34f]"
        disabled={mutation.isPending}
      >
        {mutation.isPending ? <Spinner /> : null}
        Sign in
        <ArrowRight />
      </Button>

      <p className="text-center text-sm text-brand-forest/60">
        New to Kattegat?{" "}
        <Link
          href="/register"
          className="font-bold text-brand-forest underline-offset-2 hover:underline"
        >
          Create an account
        </Link>
      </p>
    </form>
  );
}
