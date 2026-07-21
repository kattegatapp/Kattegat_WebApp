"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import {
  ArrowRight,
  BriefcaseBusiness,
  Building2,
  Phone,
  Sparkles,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { z } from "zod";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import type { AccountDashboard } from "@/lib/api/account";
import { updateAccountProfile, updateSellerProfile } from "@/lib/api/account-actions";
import {
  needsBusinessNameField,
  profileSetupPath,
  resolveProfileSetupStep,
  safeNextPath,
} from "@/lib/auth/profile-completion";
import { ApiRequestError } from "@/lib/api/client";
import { INPUT_LIMITS } from "@/lib/security/input";
import { cn } from "@/lib/utils";
import {
  profileDetailsSchema,
  profileDetailsWithBusinessSchema,
  sellerSetupSchema,
  type SellerSetupValues,
} from "@/lib/validations/profile";

const inputClass =
  "h-12 rounded-xl border-brand-forest/12 bg-white text-brand-forest shadow-sm placeholder:text-brand-forest/35 focus-visible:border-brand-mantis/55 focus-visible:ring-brand-mantis/20";

export function MemberProfileSetupContent({
  dashboard,
  initialStep,
  nextPath,
}: {
  dashboard: AccountDashboard;
  initialStep: "profile-details" | "seller-setup";
  nextPath: string | null;
}) {
  const { user } = dashboard;
  const showBusinessName = needsBusinessNameField(user);
  const isSellerOriginal = user.originalRole === "seller";
  const totalSteps = isSellerOriginal || user.sid ? 2 : 1;
  const currentStep = initialStep === "seller-setup" ? 2 : 1;

  if (initialStep === "seller-setup") {
    return (
      <SellerSetupStep
        dashboard={dashboard}
        nextPath={nextPath}
        stepLabel={`Step ${currentStep} of ${totalSteps}`}
      />
    );
  }

  return (
    <ProfileDetailsStep
      dashboard={dashboard}
      nextPath={nextPath}
      showBusinessName={showBusinessName}
      stepLabel={totalSteps > 1 ? `Step ${currentStep} of ${totalSteps}` : undefined}
    />
  );
}

function ProfileDetailsStep({
  dashboard,
  nextPath,
  showBusinessName,
  stepLabel,
}: {
  dashboard: AccountDashboard;
  nextPath: string | null;
  showBusinessName: boolean;
  stepLabel?: string;
}) {
  const router = useRouter();
  const { user, sellerProfile } = dashboard;

  const schema = useMemo(() => {
    return showBusinessName ? profileDetailsWithBusinessSchema : profileDetailsSchema;
  }, [showBusinessName]);

  type FormValues = z.infer<typeof schema>;

  const form = useForm<FormValues>({
    resolver: zodResolver(schema) as Resolver<FormValues>,
    defaultValues: {
      username: user.username ?? "",
      phone: user.phone ?? "",
      businessName: user.businessName ?? "",
    },
  });

  const mutation = useMutation({
    mutationFn: (values: FormValues) =>
      updateAccountProfile({
        username: values.username.trim(),
        phone: values.phone?.trim() || undefined,
        businessName: showBusinessName ? values.businessName?.trim() : undefined,
      }),
    onSuccess: () => {
      const nextDashboard = {
        user: {
          ...user,
          username: form.getValues("username").trim(),
          phone: form.getValues("phone")?.trim() || null,
          businessName: showBusinessName
            ? form.getValues("businessName")?.trim() || null
            : user.businessName,
        },
        sellerProfile,
      };
      const step = resolveProfileSetupStep(nextDashboard);
      router.replace(profileSetupPath(step, nextPath));
      router.refresh();
    },
  });

  return (
    <SetupStepIntro stepLabel={stepLabel}>
      <form className="space-y-5" onSubmit={form.handleSubmit((values) => mutation.mutate(values))}>
        <FieldGroup>
          <Field data-invalid={form.formState.errors.username ? true : undefined}>
            <FieldLabel htmlFor="setupUsername" className="text-brand-forest/75">
              Username
            </FieldLabel>
            <div className="relative">
              <UserRound className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-brand-forest/35" />
              <Input
                id="setupUsername"
                autoComplete="username"
                maxLength={INPUT_LIMITS.username}
                placeholder="yourname"
                className={cn(inputClass, "pl-10")}
                {...form.register("username", {
                  onChange: (event) => {
                    const sanitized = event.target.value.replace(/[^A-Za-z0-9_.]/g, "");
                    form.setValue("username", sanitized, { shouldValidate: true });
                  },
                })}
              />
            </div>
            <p className="text-xs text-brand-forest/50">
              3–30 characters · letters, numbers, underscores, periods
            </p>
            <FieldError errors={[form.formState.errors.username]} />
          </Field>

          {showBusinessName ? (
            <Field data-invalid={form.formState.errors.businessName ? true : undefined}>
              <FieldLabel htmlFor="setupBusinessName" className="text-brand-forest/75">
                Business name
              </FieldLabel>
              <div className="relative">
                <Building2 className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-brand-forest/35" />
                <Input
                  id="setupBusinessName"
                  autoComplete="organization"
                  maxLength={INPUT_LIMITS.businessName}
                  placeholder="Your venue, brand, or company"
                  className={cn(inputClass, "pl-10")}
                  {...form.register("businessName")}
                />
              </div>
              <FieldError errors={[form.formState.errors.businessName]} />
            </Field>
          ) : null}

          <Field data-invalid={form.formState.errors.phone ? true : undefined}>
            <FieldLabel htmlFor="setupPhone" className="text-brand-forest/75">
              Phone (optional)
            </FieldLabel>
            <div className="relative">
              <Phone className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-brand-forest/35" />
              <Input
                id="setupPhone"
                type="tel"
                autoComplete="tel"
                maxLength={INPUT_LIMITS.phone}
                placeholder="+971 …"
                className={cn(inputClass, "pl-10")}
                {...form.register("phone")}
              />
            </div>
            <FieldError errors={[form.formState.errors.phone]} />
          </Field>
        </FieldGroup>

        {mutation.isError ? (
          <Alert variant="destructive">
            <AlertTitle>Could not save profile</AlertTitle>
            <AlertDescription>
              {mutation.error instanceof ApiRequestError
                ? mutation.error.message
                : "Please check your details and try again."}
            </AlertDescription>
          </Alert>
        ) : null}

        <Button
          type="submit"
          size="lg"
          className="h-12 w-full rounded-xl bg-brand-mantis font-extrabold text-brand-forest shadow-[0_12px_32px_rgb(111_219_66/0.22)] hover:bg-[#7ee34f]"
          disabled={mutation.isPending}
        >
          {mutation.isPending ? <Spinner /> : null}
          Continue
          <ArrowRight />
        </Button>
      </form>
    </SetupStepIntro>
  );
}

function SellerSetupStep({
  dashboard,
  nextPath,
  stepLabel,
}: {
  dashboard: AccountDashboard;
  nextPath: string | null;
  stepLabel?: string;
}) {
  const router = useRouter();
  const { sellerProfile } = dashboard;

  const form = useForm<SellerSetupValues>({
    resolver: zodResolver(sellerSetupSchema) as Resolver<SellerSetupValues>,
    defaultValues: {
      displayName: sellerProfile?.displayName ?? "",
      bio: sellerProfile?.bio ?? "",
    },
  });

  const mutation = useMutation({
    mutationFn: (values: { displayName: string; bio?: string }) =>
      updateSellerProfile({
        displayName: values.displayName.trim(),
        bio: values.bio?.trim() || undefined,
      }),
    onSuccess: () => {
      router.replace(safeNextPath(nextPath) ?? "/account");
      router.refresh();
    },
  });

  return (
    <SetupStepIntro stepLabel={stepLabel}>
      <form className="space-y-5" onSubmit={form.handleSubmit((values) => mutation.mutate(values))}>
        <FieldGroup>
          <Field data-invalid={form.formState.errors.displayName ? true : undefined}>
            <FieldLabel htmlFor="setupDisplayName" className="text-brand-forest/75">
              Display name
            </FieldLabel>
            <div className="relative">
              <BriefcaseBusiness className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-brand-forest/35" />
              <Input
                id="setupDisplayName"
                maxLength={INPUT_LIMITS.displayName}
                placeholder="e.g. Amara Events"
                className={cn(inputClass, "pl-10")}
                {...form.register("displayName")}
              />
            </div>
            <FieldError errors={[form.formState.errors.displayName]} />
          </Field>

          <Field data-invalid={form.formState.errors.bio ? true : undefined}>
            <FieldLabel htmlFor="setupBio" className="text-brand-forest/75">
              Bio (optional)
            </FieldLabel>
            <Textarea
              id="setupBio"
              placeholder="What do you offer, and what makes you great at it?"
              rows={4}
              maxLength={INPUT_LIMITS.message}
              className="rounded-xl border-brand-forest/12 bg-white text-brand-forest shadow-sm placeholder:text-brand-forest/35 focus-visible:border-brand-mantis/55 focus-visible:ring-brand-mantis/20"
              {...form.register("bio")}
            />
            <FieldError errors={[form.formState.errors.bio]} />
          </Field>
        </FieldGroup>

        {mutation.isError ? (
          <Alert variant="destructive">
            <AlertTitle>Could not save seller profile</AlertTitle>
            <AlertDescription>
              {mutation.error instanceof ApiRequestError
                ? mutation.error.message
                : "Please check your details and try again."}
            </AlertDescription>
          </Alert>
        ) : null}

        <Button
          type="submit"
          size="lg"
          className="h-12 w-full rounded-xl bg-brand-mantis font-extrabold text-brand-forest shadow-[0_12px_32px_rgb(111_219_66/0.22)] hover:bg-[#7ee34f]"
          disabled={mutation.isPending}
        >
          {mutation.isPending ? <Spinner /> : null}
          Finish setup
          <Sparkles />
        </Button>
      </form>
    </SetupStepIntro>
  );
}

function SetupStepIntro({
  stepLabel,
  children,
}: {
  stepLabel?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      {stepLabel ? (
        <p className="mb-4 text-[11px] font-extrabold uppercase tracking-[0.18em] text-brand-blue">
          {stepLabel}
        </p>
      ) : null}
      {children}
      <p className="mt-5 text-center text-xs text-brand-forest/45">
        Need help?{" "}
        <Link href="/contact" className="font-semibold text-brand-forest hover:underline">
          Contact support
        </Link>
      </p>
    </div>
  );
}
