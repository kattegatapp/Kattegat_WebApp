"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Crown, Layers3, Loader2, Rocket, Save, Settings, ShieldCheck, Sparkles, type LucideIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ADMIN_LOGIN_PATH } from "@/lib/admin/paths";
import {
  fetchPlanFeatures,
  updatePlanFeatures,
  type PlanFeatures,
  type SellerTier,
  type UpdatePlanFeaturesInput,
} from "@/lib/api/admin/pricing";
import { ApiRequestError } from "@/lib/api/client";
import { cn } from "@/lib/utils";

const TIER_LABEL: Record<SellerTier, string> = {
  starter: "Starter",
  pro: "Pro",
  white_glove: "White Glove",
};

const TIER_ORDER: SellerTier[] = ["starter", "pro", "white_glove"];

const TIER_STYLE: Record<SellerTier, { icon: LucideIcon; eyebrow: string; description: string; card: string; header: string; iconBox: string; badge: string; button: string }> = {
  starter: { icon: Rocket, eyebrow: "Entry plan", description: "The essential toolkit for new hospitality partners building their presence.", card: "bg-white ring-slate-200", header: "bg-gradient-to-br from-slate-50 to-white", iconBox: "bg-slate-900 text-white", badge: "bg-slate-200 text-slate-700", button: "bg-slate-900 text-white hover:bg-slate-800" },
  pro: { icon: Sparkles, eyebrow: "Growth plan", description: "Stronger discovery and communication tools for active professionals.", card: "bg-white ring-brand-mantis/40 lg:-translate-y-3 shadow-[0_28px_80px_rgb(0_57_18/0.16)]", header: "bg-[radial-gradient(circle_at_top_right,rgb(111_219_66/0.28),transparent_42%),linear-gradient(145deg,#073b27,#062418)] text-white", iconBox: "bg-brand-mantis text-brand-forest", badge: "bg-brand-mantis text-brand-forest", button: "bg-brand-mantis text-brand-forest hover:bg-brand-mantis/90" },
  white_glove: { icon: Crown, eyebrow: "Managed service", description: "A curated, hands-on experience managed with the Kattegat operations team.", card: "bg-[#fffdf8] ring-amber-200 shadow-[0_18px_60px_rgb(146_95_20/0.1)]", header: "bg-gradient-to-br from-amber-50 via-[#fffaf0] to-white", iconBox: "bg-amber-500 text-white", badge: "bg-amber-100 text-amber-900", button: "bg-amber-600 text-white hover:bg-amber-700" },
};

const featureLabels: Array<[keyof Pick<PlanFeatures, "canReceiveReviews" | "canChatDirectly" | "socialLinkOut" | "prioritySearch">, string]> = [
  ["canChatDirectly", "Can chat directly"],
  ["canReceiveReviews", "Can receive reviews"],
  ["socialLinkOut", "Social link-out"],
  ["prioritySearch", "Priority search"],
];

export function AdminPricingForm() {
  const router = useRouter();
  const queryClient = useQueryClient();
  // Edits-only overlay — never synced from `query.data` via an effect. A tier's displayed
  // row is `drafts[tier] ?? query.data.find(...)`, computed at read time in `getRow`, so
  // there's nothing to keep in sync in the first place.
  const [drafts, setDrafts] = useState<Partial<Record<SellerTier, PlanFeatures>>>({});

  const query = useQuery({
    queryKey: ["admin", "pricing"],
    queryFn: fetchPlanFeatures,
    retry: false,
  });

  function getRow(tier: SellerTier): PlanFeatures | undefined {
    return drafts[tier] ?? query.data?.find((row) => row.tier === tier);
  }

  const mutation = useMutation({
    mutationFn: ({ tier, input }: { tier: SellerTier; input: UpdatePlanFeaturesInput }) =>
      updatePlanFeatures(tier, input),
    onSuccess: (value) => {
      setDrafts((current) => ({ ...current, [value.tier]: value }));
      queryClient.invalidateQueries({ queryKey: ["admin", "pricing"] });
    },
  });

  function updateField<K extends keyof PlanFeatures>(tier: SellerTier, key: K, value: PlanFeatures[K]) {
    const row = getRow(tier);
    if (!row) return;
    setDrafts((current) => ({ ...current, [tier]: { ...row, [key]: value } }));
  }

  function save(tier: SellerTier) {
    const row = getRow(tier);
    if (!row) return;
    mutation.mutate({
      tier,
      input: {
        maxListings: row.maxListings,
        maxPhotosPerListing: row.maxPhotosPerListing,
        maxVideoLinksPerListing: row.maxVideoLinksPerListing,
        maxProfileMedia: row.maxProfileMedia,
        canReceiveReviews: row.canReceiveReviews,
        canChatDirectly: row.canChatDirectly,
        socialLinkOut: row.socialLinkOut,
        prioritySearch: row.prioritySearch,
      },
    });
  }

  if (query.isPending) {
    return (
      <div className="flex min-h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-brand-forest" />
      </div>
    );
  }

  if (query.isError || TIER_ORDER.some((tier) => !getRow(tier))) {
    const unauthorized =
      query.error instanceof ApiRequestError && query.error.status === 401;
    return (
      <div className="mx-auto max-w-2xl space-y-4">
        <Alert className="border-red-200 bg-red-50 text-red-800">
          <Settings />
          <AlertTitle>
            {unauthorized ? "Please sign in again" : "Could not load plan features"}
          </AlertTitle>
          <AlertDescription className="text-red-800/80">
            {query.error instanceof Error
              ? query.error.message
              : "Check your connection and try again."}
          </AlertDescription>
        </Alert>
        {unauthorized ? (
          <Button onClick={() => router.replace(ADMIN_LOGIN_PATH)}>Back to login</Button>
        ) : (
          <Button variant="outline" onClick={() => void query.refetch()}>
            Try again
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <section className="relative overflow-hidden rounded-[2rem] bg-[#062418] p-6 text-white shadow-[0_26px_80px_rgb(0_57_18/0.22)] sm:p-8"><div aria-hidden className="absolute inset-0 bg-[radial-gradient(circle_at_88%_0%,rgb(111_219_66/0.25),transparent_36%),linear-gradient(125deg,transparent_45%,rgb(255_255_255/0.04))]" /><div className="relative grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end"><div className="max-w-2xl"><Badge className="mb-4 border-white/10 bg-white/10 text-brand-mantis"><Layers3 />Commercial controls</Badge><h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Design the value of every plan.</h1><p className="mt-3 text-sm leading-6 text-white/65">Set practical limits and premium capabilities for Starter, Pro and White Glove sellers. Free access mode temporarily overrides these baselines.</p></div><div className="flex gap-2"><HeroStat icon={ShieldCheck} value="3" label="Plan tiers" /><HeroStat icon={Sparkles} value="Live" label="Configuration" /></div></div></section>

      {mutation.isSuccess ? (
        <Alert className="border-emerald-200 bg-emerald-50 text-emerald-800">
          <Save />
          <AlertTitle>Saved</AlertTitle>
          <AlertDescription className="text-emerald-800/80">
            {TIER_LABEL[mutation.data.tier]} plan updated.
          </AlertDescription>
        </Alert>
      ) : null}
      {mutation.isError ? (
        <Alert className="border-red-200 bg-red-50 text-red-800">
          <Settings />
          <AlertTitle>Save failed</AlertTitle>
          <AlertDescription className="text-red-800/80">
            {mutation.error instanceof Error ? mutation.error.message : "Could not save plan features."}
          </AlertDescription>
        </Alert>
      ) : null}

      <div className="grid gap-5 lg:grid-cols-3">
        {TIER_ORDER.map((tier) => {
          const row = getRow(tier)!;
          const saving = mutation.isPending && mutation.variables?.tier === tier;
          const style = TIER_STYLE[tier];
          const TierIcon = style.icon;
          const enabledTools = featureLabels.filter(([key]) => Boolean(row[key])).length;

          return (
            <Card key={tier} className={cn("overflow-hidden border-0 py-0 ring-1 transition-transform", style.card)}>
              <CardHeader className={cn("min-h-56 border-b border-current/10 px-5 py-6", style.header)}>
                <div className="flex items-start justify-between gap-3"><span className={cn("flex size-12 items-center justify-center rounded-2xl shadow-sm", style.iconBox)}><TierIcon className="size-6" /></span><Badge className={cn("border-0", style.badge)}>{tier === "pro" ? "Most capable" : style.eyebrow}</Badge></div>
                <div className="mt-5"><p className={cn("text-[10px] font-extrabold uppercase tracking-[0.2em]", tier === "pro" ? "text-brand-mantis/80" : "text-muted-foreground")}>{style.eyebrow}</p><CardTitle className={cn("mt-1 text-2xl font-extrabold", tier === "pro" ? "text-white" : "text-brand-forest")}>{TIER_LABEL[tier]}</CardTitle><CardDescription className={cn("mt-2 leading-6", tier === "pro" && "text-white/65")}>{style.description}</CardDescription></div>
                <div className={cn("mt-4 flex items-center justify-between rounded-xl px-3 py-2 text-xs", tier === "pro" ? "bg-white/10 text-white/75" : "bg-white/70 text-muted-foreground")}><span>Premium tools enabled</span><strong className={tier === "pro" ? "text-brand-mantis" : "text-brand-forest"}>{enabledTools} of {featureLabels.length}</strong></div>
              </CardHeader>
              <CardContent className="flex flex-col gap-5 px-5 py-5">
                <div><p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-muted-foreground">Usage allowances</p><p className="mt-1 text-xs text-muted-foreground">Leave a value blank to make that allowance unlimited.</p></div>
                <div className="grid grid-cols-2 gap-3">
                <NumberField
                  label="Listings"
                  value={row.maxListings}
                  onChange={(value) => updateField(tier, "maxListings", value)}
                />
                <NumberField
                  label="Photos / listing"
                  value={row.maxPhotosPerListing}
                  onChange={(value) => updateField(tier, "maxPhotosPerListing", value)}
                />
                <NumberField
                  label="Videos / listing"
                  value={row.maxVideoLinksPerListing}
                  onChange={(value) => updateField(tier, "maxVideoLinksPerListing", value)}
                />
                <NumberField
                  label="Profile media"
                  value={row.maxProfileMedia}
                  onChange={(value) => updateField(tier, "maxProfileMedia", value)}
                /></div>

                <div className="space-y-2"><p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-muted-foreground">Plan capabilities</p><div className="flex flex-col gap-2">
                  {featureLabels.map(([key, label]) => (
                    <div
                      key={key}
                      className={cn("flex min-h-12 items-center justify-between gap-3 rounded-xl border px-3 text-sm font-medium transition-colors", row[key] ? "border-emerald-200 bg-emerald-50/70 text-brand-forest" : "border-border/70 bg-muted/20 text-muted-foreground")}
                    >
                      <span className="flex items-center gap-2">{row[key] ? <Check className="size-4 text-emerald-600" /> : <span className="size-4" />}{label}</span>
                      <Switch
                        checked={Boolean(row[key])}
                        onCheckedChange={(checked) => updateField(tier, key, checked)}
                        aria-label={label}
                      />
                    </div>
                  ))}
                </div></div>

                <Button onClick={() => save(tier)} disabled={saving} className={cn("mt-auto h-11 font-bold", style.button)}>
                  {saving ? <Loader2 className="animate-spin" /> : <Save />}
                  Save {TIER_LABEL[tier]}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function NumberField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number | null;
  onChange: (value: number | null) => void;
}) {
  return (
    <div className="space-y-1.5 rounded-xl border border-border/70 bg-muted/20 p-3">
      <Label className="text-xs font-semibold text-brand-forest">{label}</Label>
      <Input
        type="number"
        value={value ?? ""}
        placeholder="Unlimited"
        onChange={(event) => {
          const raw = event.target.value;
          if (raw === "") {
            onChange(null);
            return;
          }
          const next = Number(raw);
          onChange(Number.isFinite(next) ? next : null);
        }}
        min={0}
        className="h-10 border-0 bg-white text-lg font-extrabold text-brand-forest shadow-none ring-1 ring-border/60"
      />
    </div>
  );
}

function HeroStat({ icon: Icon, value, label }: { icon: LucideIcon; value: string; label: string }) {
  return <div className="min-w-28 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur"><Icon className="mb-2 size-4 text-brand-mantis" /><p className="text-xl font-extrabold">{value}</p><p className="text-[9px] font-bold uppercase tracking-wider text-white/45">{label}</p></div>;
}
