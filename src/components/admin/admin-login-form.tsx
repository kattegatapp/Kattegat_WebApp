"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Eye, EyeOff, LockKeyhole, Loader2, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
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
    onSuccess: () => router.replace("/kattegat-admin/settings"),
  });

  return (
    <Card className="animate-in fade-in slide-in-from-bottom-4 relative overflow-hidden rounded-[1.75rem] border-white/80 bg-white/85 shadow-2xl shadow-brand-forest/20 backdrop-blur-2xl duration-700">
      <CardHeader className="pb-2">
        <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-forest text-white shadow-lg shadow-brand-forest/30 transition-transform duration-300 hover:scale-105">
          <LockKeyhole className="h-5 w-5" />
        </div>
        <CardTitle className="text-xl font-extrabold text-brand-forest">Admin access</CardTitle>
        <CardDescription>Sign in to manage launch operations.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit((values) => mutation.mutate(values))} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="adminEmail" className="text-brand-forest">
              Email
            </Label>
            <Input
              id="adminEmail"
              type="email"
              autoComplete="email"
              placeholder="you@kattegat.app"
              className="h-11 rounded-xl border-transparent bg-muted/70 px-3.5 text-brand-forest placeholder:text-muted-foreground transition-colors focus-visible:border-brand-blue focus-visible:ring-brand-blue/20"
              {...form.register("email")}
            />
            {form.formState.errors.email ? (
              <p className="text-sm text-red-600">{form.formState.errors.email.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="adminPassword" className="text-brand-forest">
              Password
            </Label>
            <div className="relative">
              <Input
                id="adminPassword"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="••••••••"
                className="h-11 rounded-xl border-transparent bg-muted/70 px-3.5 pr-10 text-brand-forest transition-colors focus-visible:border-brand-blue focus-visible:ring-brand-blue/20"
                {...form.register("password")}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-brand-forest"
                onClick={() => setShowPassword((value) => !value)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            {form.formState.errors.password ? (
              <p className="text-sm text-red-600">{form.formState.errors.password.message}</p>
            ) : null}
          </div>

          <Button
            type="submit"
            className="h-11 w-full rounded-xl text-sm font-bold transition-transform hover:scale-[1.01] active:scale-[0.99]"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Continue
          </Button>

          <div className="flex items-center gap-3 py-1">
            <Separator className="flex-1" />
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Restricted
            </span>
            <Separator className="flex-1" />
          </div>
          <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5" />
            Agent and admin roles only. Access is logged.
          </p>

          {mutation.isSuccess ? (
            <Alert className="animate-in fade-in slide-in-from-top-1 border-emerald-200 bg-emerald-50 text-emerald-800 duration-300">
              <ShieldCheck />
              <AlertTitle>Access confirmed</AlertTitle>
              <AlertDescription className="text-emerald-800/80">
                Opening admin settings.
              </AlertDescription>
            </Alert>
          ) : null}
          {mutation.isError ? (
            <Alert className="animate-in fade-in slide-in-from-top-1 border-red-200 bg-red-50 text-red-800 duration-300">
              <ShieldCheck />
              <AlertTitle>Login failed</AlertTitle>
              <AlertDescription className="text-red-800/80">
                {mutation.error instanceof Error ? mutation.error.message : "Could not sign in."}
              </AlertDescription>
            </Alert>
          ) : null}
        </form>
      </CardContent>
    </Card>
  );
}
