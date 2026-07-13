"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Eye, EyeOff, LockKeyhole, Mail, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Spinner } from "@/components/ui/spinner";
import { adminPath } from "@/lib/admin/paths";
import { loginAdmin } from "@/lib/api/admin";
import { adminLoginSchema, type AdminLoginValues } from "@/lib/validations/admin";

export function AdminLoginForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const form = useForm<AdminLoginValues>({
    resolver: zodResolver(adminLoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const mutation = useMutation({
    mutationFn: loginAdmin,
    onSuccess: () => router.replace(adminPath()),
  });

  const emailInvalid = Boolean(form.formState.errors.email);
  const passwordInvalid = Boolean(form.formState.errors.password);

  return (
    <Card className="admin-login-panel relative gap-0 rounded-[1.35rem] border-0 bg-transparent py-0 text-white ring-0 shadow-none [--card-spacing:--spacing(6)]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-10 top-0 z-10 h-px bg-gradient-to-r from-transparent via-brand-mantis/70 to-transparent"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-brand-mantis/15 blur-3xl"
      />

      <CardHeader className="relative border-b border-white/10 pb-5">
        <CardTitle className="text-xl font-extrabold tracking-tight text-white">
          Sign in
        </CardTitle>
        <CardDescription className="text-white/55">
          Step behind the velvet rope with your staff credentials.
        </CardDescription>
        <CardAction>
          <Badge className="border-brand-mantis/30 bg-brand-mantis/15 text-brand-mantis">
            Encrypted
          </Badge>
        </CardAction>
      </CardHeader>

      <CardContent className="relative pt-6">
        <form
          id="admin-login-form"
          onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
        >
          <FieldGroup>
            <Field data-invalid={emailInvalid || undefined}>
              <FieldLabel htmlFor="adminEmail" className="text-white/75">
                Email
              </FieldLabel>
              <InputGroup
                className="h-11 rounded-xl border-white/12 bg-black/30 shadow-none has-[[data-slot=input-group-control]:focus-visible]:border-brand-mantis/55 has-[[data-slot=input-group-control]:focus-visible]:ring-brand-mantis/25"
              >
                <InputGroupAddon>
                  <Mail className="text-white/40" />
                </InputGroupAddon>
                <InputGroupInput
                  id="adminEmail"
                  type="email"
                  autoComplete="email"
                  placeholder="you@kattegat.app"
                  aria-invalid={emailInvalid || undefined}
                  className="text-white placeholder:text-white/30"
                  {...form.register("email")}
                />
              </InputGroup>
              <FieldError
                className="text-red-300"
                errors={[form.formState.errors.email]}
              />
            </Field>

            <Field data-invalid={passwordInvalid || undefined}>
              <FieldLabel htmlFor="adminPassword" className="text-white/75">
                Password
              </FieldLabel>
              <InputGroup
                className="h-11 rounded-xl border-white/12 bg-black/30 shadow-none has-[[data-slot=input-group-control]:focus-visible]:border-brand-mantis/55 has-[[data-slot=input-group-control]:focus-visible]:ring-brand-mantis/25"
              >
                <InputGroupAddon>
                  <LockKeyhole className="text-white/40" />
                </InputGroupAddon>
                <InputGroupInput
                  id="adminPassword"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  aria-invalid={passwordInvalid || undefined}
                  className="text-white placeholder:text-white/30"
                  {...form.register("password")}
                />
                <InputGroupAddon align="inline-end">
                  <InputGroupButton
                    type="button"
                    size="icon-sm"
                    className="cursor-pointer rounded-lg border border-white/10 bg-white/8 text-white shadow-sm hover:border-brand-mantis/40 hover:bg-brand-mantis/15 hover:text-brand-mantis focus-visible:border-brand-mantis/60 focus-visible:ring-brand-mantis/30"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    aria-pressed={showPassword}
                    title={showPassword ? "Hide password" : "Show password"}
                    onClick={() => setShowPassword((value) => !value)}
                  >
                    {showPassword ? (
                      <EyeOff aria-hidden className="size-[18px]" strokeWidth={2.2} />
                    ) : (
                      <Eye aria-hidden className="size-[18px]" strokeWidth={2.2} />
                    )}
                  </InputGroupButton>
                </InputGroupAddon>
              </InputGroup>
              <FieldError
                className="text-red-300"
                errors={[form.formState.errors.password]}
              />
            </Field>

            {mutation.isError ? (
              <Alert className="animate-in fade-in slide-in-from-top-1 border-red-400/30 bg-red-500/15 text-red-100 duration-300">
                <ShieldCheck />
                <AlertTitle>Sign in failed</AlertTitle>
                <AlertDescription className="text-red-100/80">
                  {mutation.error instanceof Error
                    ? mutation.error.message
                    : "Could not sign in."}
                </AlertDescription>
              </Alert>
            ) : null}

            {mutation.isSuccess ? (
              <Alert className="animate-in fade-in slide-in-from-top-1 border-brand-mantis/35 bg-brand-mantis/15 text-brand-mantis duration-300">
                <ShieldCheck />
                <AlertTitle>Access confirmed</AlertTitle>
                <AlertDescription className="text-brand-mantis/80">
                  Opening the admin panel…
                </AlertDescription>
              </Alert>
            ) : null}

            <FieldSeparator className="*:data-[slot=field-separator-content]:bg-transparent *:data-[slot=field-separator-content]:px-0 *:data-[slot=field-separator-content]:text-white/35 [&>div]:bg-white/10">
              Private access
            </FieldSeparator>

            <Button
              type="submit"
              size="lg"
              form="admin-login-form"
              className="h-11 w-full rounded-xl bg-brand-mantis text-sm font-extrabold text-brand-forest shadow-[0_0_28px_rgb(111_219_66/0.3)] transition-[transform,box-shadow,filter] hover:bg-[#7ee34f] hover:shadow-[0_0_40px_rgb(111_219_66/0.4)] active:scale-[0.99]"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? <Spinner /> : null}
              Enter backstage
            </Button>
          </FieldGroup>
        </form>
      </CardContent>

      <CardFooter className="relative justify-center border-white/10 bg-transparent text-[11px] text-white/40">
        <ShieldCheck className="size-3 text-brand-mantis/70" />
        Restricted to Kattegat operations staff
      </CardFooter>
    </Card>
  );
}
