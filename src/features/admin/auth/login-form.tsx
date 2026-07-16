"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group";
import { Spinner } from "@/components/ui/spinner";
import { adminPath } from "@/lib/admin/paths";
import { resetAdminQueryCache } from "@/lib/admin/query-cache";
import { fetchAdminMe, loginAdmin } from "@/lib/api/admin";
import { adminLoginSchema, type AdminLoginValues } from "@/lib/validations/admin";

export function AdminLoginForm() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [showPassword, setShowPassword] = useState(false);
  const form = useForm<AdminLoginValues>({
    resolver: zodResolver(adminLoginSchema),
    defaultValues: { email: "", password: "" },
  });

  const mutation = useMutation({
    mutationFn: loginAdmin,
    onSuccess: async () => {
      resetAdminQueryCache(queryClient);
      await queryClient.fetchQuery({ queryKey: ["admin", "me"], queryFn: fetchAdminMe });
      router.replace(adminPath());
    },
  });

  const emailInvalid = Boolean(form.formState.errors.email);
  const passwordInvalid = Boolean(form.formState.errors.password);

  return (
    <Card className="admin-login-panel relative gap-0 overflow-hidden rounded-[1.75rem] border-0 bg-transparent py-0 text-white ring-0 shadow-none [--card-spacing:--spacing(6)] sm:[--card-spacing:--spacing(8)]">
      <div aria-hidden className="pointer-events-none absolute inset-x-12 top-0 z-10 h-px bg-gradient-to-r from-transparent via-brand-mantis/80 to-transparent" />
      <div aria-hidden className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-brand-mantis/10 blur-3xl" />

      <CardHeader className="relative border-b border-white/8 pb-6 pt-7 sm:pb-7 sm:pt-8">
        <div className="mb-5 flex size-11 items-center justify-center rounded-2xl border border-brand-mantis/20 bg-brand-mantis/10 text-brand-mantis shadow-[inset_0_1px_0_rgb(255_255_255/0.08)]">
          <LockKeyhole className="size-5" strokeWidth={2.2} />
        </div>
        <CardTitle className="text-2xl font-extrabold tracking-[-0.035em] text-white sm:text-[1.7rem]">
          Sign in to your account
        </CardTitle>
        <CardDescription className="mt-1.5 text-sm leading-6 text-white/50">
          Enter your staff credentials to access the admin workspace.
        </CardDescription>
      </CardHeader>

      <CardContent className="relative pb-7 pt-6 sm:pb-8 sm:pt-7">
        <form id="admin-login-form" onSubmit={form.handleSubmit((values) => mutation.mutate(values))}>
          <FieldGroup>
            <Field data-invalid={emailInvalid || undefined}>
              <FieldLabel htmlFor="adminEmail" className="text-xs font-bold text-white/70">Work email</FieldLabel>
              <InputGroup className="h-12 rounded-xl border-white/10 bg-white/[0.055] shadow-none transition-colors has-[[data-slot=input-group-control]:focus-visible]:border-brand-mantis/55 has-[[data-slot=input-group-control]:focus-visible]:ring-brand-mantis/20">
                <InputGroupAddon><Mail className="text-white/35" /></InputGroupAddon>
                <InputGroupInput id="adminEmail" type="email" autoComplete="email" placeholder="name@kattegat.com" aria-invalid={emailInvalid || undefined} className="text-white placeholder:text-white/25" {...form.register("email")} />
              </InputGroup>
              <FieldError className="text-red-300" errors={[form.formState.errors.email]} />
            </Field>

            <Field data-invalid={passwordInvalid || undefined}>
              <FieldLabel htmlFor="adminPassword" className="text-xs font-bold text-white/70">Password</FieldLabel>
              <InputGroup className="h-12 rounded-xl border-white/10 bg-white/[0.055] shadow-none transition-colors has-[[data-slot=input-group-control]:focus-visible]:border-brand-mantis/55 has-[[data-slot=input-group-control]:focus-visible]:ring-brand-mantis/20">
                <InputGroupAddon><LockKeyhole className="text-white/35" /></InputGroupAddon>
                <InputGroupInput id="adminPassword" type={showPassword ? "text" : "password"} autoComplete="current-password" placeholder="Enter your password" aria-invalid={passwordInvalid || undefined} className="text-white placeholder:text-white/25" {...form.register("password")} />
                <InputGroupAddon align="inline-end">
                  <InputGroupButton type="button" size="icon-sm" className="size-9 cursor-pointer rounded-lg text-white/45 hover:bg-white/8 hover:text-white focus-visible:ring-brand-mantis/30" aria-label={showPassword ? "Hide password" : "Show password"} aria-pressed={showPassword} onClick={() => setShowPassword((value) => !value)}>
                    {showPassword ? <EyeOff aria-hidden className="size-[18px]" /> : <Eye aria-hidden className="size-[18px]" />}
                  </InputGroupButton>
                </InputGroupAddon>
              </InputGroup>
              <FieldError className="text-red-300" errors={[form.formState.errors.password]} />
            </Field>

            {mutation.isError ? (
              <Alert className="animate-in fade-in slide-in-from-top-1 border-red-400/30 bg-red-500/15 text-red-100 duration-300">
                <ShieldCheck /><AlertTitle>Sign in failed</AlertTitle>
                <AlertDescription className="text-red-100/80">{mutation.error instanceof Error ? mutation.error.message : "Could not sign in."}</AlertDescription>
              </Alert>
            ) : null}
            {mutation.isSuccess ? (
              <Alert className="animate-in fade-in slide-in-from-top-1 border-brand-mantis/35 bg-brand-mantis/15 text-brand-mantis duration-300">
                <ShieldCheck /><AlertTitle>Access confirmed</AlertTitle>
                <AlertDescription className="text-brand-mantis/80">Opening the admin panel…</AlertDescription>
              </Alert>
            ) : null}

            <Button type="submit" size="lg" form="admin-login-form" className="group h-12 w-full rounded-xl bg-brand-mantis text-sm font-extrabold text-brand-forest shadow-[0_12px_32px_rgb(111_219_66/0.18)] transition-[transform,box-shadow,background-color] hover:bg-[#7ee34f] hover:shadow-[0_14px_38px_rgb(111_219_66/0.28)] active:scale-[0.99]" disabled={mutation.isPending}>
              {mutation.isPending ? <Spinner /> : null}
              Continue to admin
              {!mutation.isPending ? <ArrowRight className="ml-auto size-4 transition-transform group-hover:translate-x-0.5" /> : null}
            </Button>
            <div className="flex items-center justify-center gap-2 pt-1 text-[11px] text-white/35">
              <ShieldCheck className="size-3.5 text-brand-mantis/60" /> Protected and monitored access
            </div>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
