"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CheckCircle2,
  CreditCard,
  ExternalLink,
  ShieldCheck,
  Tags,
  TriangleAlert,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ADMIN_GLASS_ALERT_SUCCESS,
  ADMIN_GLASS_ALERT_WARN,
  ADMIN_GLASS_CARD,
  ADMIN_GLASS_CHIP,
} from "@/features/admin/shared/glass";
import { SettingsLoadError, SettingsLoading, SettingsSaveBar } from "@/features/admin/settings/form-shared";
import { adminPath } from "@/lib/admin/paths";
import { formatFilsAsAed } from "@/lib/admin/money";
import {
  fetchBillingConfiguration,
  updateBillingConfiguration,
  type StripeBillingMode,
} from "@/lib/api/admin/billing";
import { cn } from "@/lib/utils";

type ProfileDraft = {
  secretKey: string;
  webhookSecret: string;
};

const EMPTY_DRAFT: ProfileDraft = {
  secretKey: "",
  webhookSecret: "",
};

export function BillingConfiguration() {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ["admin", "billing-configuration"],
    queryFn: fetchBillingConfiguration,
    retry: false,
  });

  const [modeOverride, setModeOverride] = useState<StripeBillingMode | null>(null);
  const [testDraft, setTestDraft] = useState<ProfileDraft>(EMPTY_DRAFT);
  const [liveDraft, setLiveDraft] = useState<ProfileDraft>(EMPTY_DRAFT);

  const hasDraftChanges =
    modeOverride !== null ||
    Boolean(testDraft.secretKey.trim()) ||
    Boolean(testDraft.webhookSecret.trim()) ||
    Boolean(liveDraft.secretKey.trim()) ||
    Boolean(liveDraft.webhookSecret.trim());

  const saveMutation = useMutation({
    mutationFn: () =>
      updateBillingConfiguration({
        mode,
        test: pruneDraft(testDraft),
        live: pruneDraft(liveDraft),
      }),
    onSuccess: async () => {
      setTestDraft(EMPTY_DRAFT);
      setLiveDraft(EMPTY_DRAFT);
      setModeOverride(null);
      await queryClient.invalidateQueries({ queryKey: ["admin", "billing-configuration"] });
      await queryClient.invalidateQueries({ queryKey: ["admin", "overview"] });
    },
  });

  if (query.isPending) return <SettingsLoading />;
  if (query.isError || !query.data) return <SettingsLoadError error={query.error} />;

  const config = query.data;
  const mode = modeOverride ?? config.mode;
  const activeProfile = mode === "live" ? config.live : config.test;
  const monthlyDisplay =
    config.proMonthlyPriceFils != null ? formatFilsAsAed(config.proMonthlyPriceFils) : "Not set";
  const annualDisplay =
    config.proAnnualPriceFils != null ? formatFilsAsAed(config.proAnnualPriceFils) : "Not set";

  return (
    <div className="space-y-5">
      <section className="ios-glass-pane relative overflow-hidden rounded-[1.75rem] px-5 py-5 text-zinc-900 sm:px-7 sm:py-7">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="max-w-2xl space-y-1">
            <Badge className={cn(ADMIN_GLASS_CHIP, "mb-3 border-0")}>
              <CreditCard className="size-3.5" />
              Stripe billing
            </Badge>
            <h2 className="text-xl font-extrabold tracking-tight text-zinc-900 sm:text-2xl">
              Payment configuration
            </h2>
            <p className="text-sm leading-6 text-zinc-600">
              Stripe keys only. Checkout amounts come from Admin → Pricing — no Stripe products
              required.
            </p>
          </div>
          <Badge
            className={
              config.configured
                ? "border-0 bg-brand-mantis/90 font-bold text-brand-forest"
                : "border-0 bg-amber-200/90 font-bold text-amber-950"
            }
          >
            {config.configured ? `${mode === "live" ? "Live" : "Test"} ready` : "Setup required"}
          </Badge>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatusItem label="Active mode" value={mode === "live" ? "Live" : "Test"} />
          <StatusItem
            label="Secret key"
            value={activeProfile.secretKeyConfigured ? activeProfile.secretKeyPreview ?? "Configured" : "Missing"}
          />
          <StatusItem
            label="Webhook secret"
            value={activeProfile.webhookSecretConfigured ? "Configured" : "Missing"}
          />
          <StatusItem
            label="Pro pricing (DB)"
            value={config.proPricingConfigured ? `${monthlyDisplay} / mo` : "Set in Pricing"}
          />
        </div>
      </section>

      {!config.configured ? (
        <Alert className={ADMIN_GLASS_ALERT_WARN}>
          <TriangleAlert />
          <AlertTitle>Checkout will fail until billing is configured</AlertTitle>
          <AlertDescription>
            Missing: {config.missingFields.join(", ") || "required fields"}. Add Stripe keys below
            and set Pro monthly price in{" "}
            <Link href={adminPath("/pricing")} className="font-semibold underline">
              Admin → Pricing
            </Link>
            , then enable payments in Features.
          </AlertDescription>
        </Alert>
      ) : null}

      <Card className={cn(ADMIN_GLASS_CARD, "bg-transparent")}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tags className="size-5 text-brand-forest" />
            Checkout amounts (from Pricing)
          </CardTitle>
          <CardDescription>
            Stripe charges these amounts dynamically at checkout. Change them in Admin → Pricing —
            no Stripe product setup needed.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center justify-between gap-4">
          <div className="grid gap-1 text-sm">
            <p>
              <span className="font-semibold text-zinc-900">Monthly:</span>{" "}
              <span className="text-zinc-600">{monthlyDisplay}</span>
            </p>
            <p>
              <span className="font-semibold text-zinc-900">Annual:</span>{" "}
              <span className="text-zinc-600">{annualDisplay}</span>
              {config.proPricingConfigured ? (
                <span className="text-zinc-500"> (10 months paid, 2 free)</span>
              ) : null}
            </p>
          </div>
          <Link
            href={adminPath("/pricing")}
            className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-brand-forest/12 px-4 text-sm font-extrabold text-brand-blue hover:border-brand-mantis/50 hover:text-brand-forest"
          >
            Edit in Pricing
            <ExternalLink className="size-4" />
          </Link>
        </CardContent>
      </Card>

      <Card className={cn(ADMIN_GLASS_CARD, "bg-transparent")}>
        <CardHeader>
          <CardTitle>What you need from Stripe</CardTitle>
          <CardDescription className="space-y-2 text-sm leading-6">
            <span className="block">
              Only two values per environment: <strong>secret key</strong> and{" "}
              <strong>webhook signing secret</strong>. No publishable key, no Price IDs, no products
              in the Stripe catalog.
            </span>
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-2 text-xs leading-6 text-muted-foreground sm:grid-cols-2">
          <div className="rounded-xl bg-white/50 p-3">
            <p className="font-bold text-zinc-800">Secret key</p>
            <p>Stripe Dashboard → Developers → API keys → Secret key</p>
          </div>
          <div className="rounded-xl bg-white/50 p-3">
            <p className="font-bold text-zinc-800">Webhook secret</p>
            <p>Developers → Webhooks → your endpoint → Signing secret</p>
          </div>
        </CardContent>
      </Card>

      {config.envFallbackActive ? (
        <Alert className={ADMIN_GLASS_ALERT_WARN}>
          <ShieldCheck />
          <AlertTitle>Environment fallback is active</AlertTitle>
          <AlertDescription>
            Some Stripe keys are still coming from backend <code>STRIPE_*</code> environment
            variables. Save values here to manage billing without redeploying.
          </AlertDescription>
        </Alert>
      ) : null}

      <Card className={cn(ADMIN_GLASS_CARD, "bg-transparent")}>
        <CardHeader>
          <CardTitle>Active environment</CardTitle>
          <CardDescription>
            Start in test mode. Switch to live only after a successful test payment and webhook.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2 rounded-2xl bg-white/50 p-1 sm:max-w-sm">
            {(["test", "live"] as const).map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setModeOverride(value)}
                className={cn(
                  "min-h-10 rounded-xl text-sm font-extrabold capitalize transition",
                  mode === value
                    ? value === "live"
                      ? "bg-brand-forest text-white shadow-sm"
                      : "bg-brand-mantis text-brand-forest shadow-sm"
                    : "text-zinc-500 hover:text-zinc-900",
                )}
              >
                {value}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-5 lg:grid-cols-2">
        <ProfileForm
          title="Test keys"
          description="Stripe test mode — use test card 4242 4242 4242 4242."
          status={config.test}
          draft={testDraft}
          onChange={setTestDraft}
        />
        <ProfileForm
          title="Live keys"
          description="Production keys — only used when live mode is active."
          status={config.live}
          draft={liveDraft}
          onChange={setLiveDraft}
        />
      </div>

      <Card className={cn(ADMIN_GLASS_CARD, "bg-transparent")}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="size-5 text-brand-forest" />
            Webhook endpoint
          </CardTitle>
          <CardDescription>
            Add this URL in Stripe for the active mode. Webhooks upgrade sellers to Pro and log
            payments.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="rounded-xl bg-slate-950 p-4 font-mono text-xs leading-6 text-emerald-200">
            {config.webhookUrl}
          </div>
          <p className="text-xs text-muted-foreground">
            Listen for: <code>checkout.session.completed</code>,{" "}
            <code>invoice.payment_succeeded</code>, <code>customer.subscription.updated</code>,{" "}
            <code>customer.subscription.deleted</code>.
          </p>
        </CardContent>
      </Card>

      <SettingsSaveBar
        isPending={saveMutation.isPending}
        isSuccess={saveMutation.isSuccess}
        isError={saveMutation.isError}
        errorMessage={
          saveMutation.error instanceof Error ? saveMutation.error.message : undefined
        }
        onSave={() => saveMutation.mutate()}
      />

      {saveMutation.isSuccess ? (
        <Alert className={ADMIN_GLASS_ALERT_SUCCESS}>
          <CheckCircle2 />
          <AlertTitle>Billing configuration saved</AlertTitle>
          <AlertDescription>
            Active mode is now {saveMutation.data.mode}. Run a test checkout before enabling live
            payments.
          </AlertDescription>
        </Alert>
      ) : null}

      {!hasDraftChanges && !saveMutation.isSuccess ? (
        <p className="text-center text-xs text-muted-foreground">
          Saving applies the selected test/live mode and any new Stripe keys immediately.
        </p>
      ) : null}
    </div>
  );
}

function ProfileForm({
  title,
  description,
  status,
  draft,
  onChange,
}: {
  title: string;
  description: string;
  status: {
    secretKeyConfigured: boolean;
    webhookSecretConfigured: boolean;
    secretKeyPreview: string | null;
  };
  draft: ProfileDraft;
  onChange: (next: ProfileDraft) => void;
}) {
  return (
    <Card className={cn(ADMIN_GLASS_CARD, "bg-transparent")}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Field
          label="Secret key (server)"
          hint={
            status.secretKeyConfigured
              ? `Current: ${status.secretKeyPreview}`
              : "Required. Stripe → Developers → API keys (sk_test_… or sk_live_…)."
          }
          value={draft.secretKey}
          onChange={(value) => onChange({ ...draft, secretKey: value })}
          placeholder="sk_test_… or sk_live_…"
        />
        <Field
          label="Webhook signing secret"
          hint={
            status.webhookSecretConfigured
              ? "Configured"
              : "Required. Stripe → Developers → Webhooks → Signing secret (whsec_…)."
          }
          value={draft.webhookSecret}
          onChange={(value) => onChange({ ...draft, webhookSecret: value })}
          placeholder="whsec_…"
        />
      </CardContent>
    </Card>
  );
}

function Field({
  label,
  hint,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  hint: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <div className="grid gap-2">
      <Label className="text-xs font-bold uppercase tracking-wider text-zinc-500">{label}</Label>
      <Input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="font-mono text-xs"
      />
      <p className="text-[11px] text-muted-foreground">{hint}</p>
    </div>
  );
}

function StatusItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="ios-glass-chip rounded-2xl px-4 py-3">
      <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">{label}</p>
      <p className="mt-1 break-all text-sm font-semibold text-zinc-900">{value}</p>
    </div>
  );
}

function pruneDraft(draft: ProfileDraft) {
  const next: Partial<ProfileDraft> = {};
  if (draft.secretKey.trim()) next.secretKey = draft.secretKey.trim();
  if (draft.webhookSecret.trim()) next.webhookSecret = draft.webhookSecret.trim();
  return next;
}
