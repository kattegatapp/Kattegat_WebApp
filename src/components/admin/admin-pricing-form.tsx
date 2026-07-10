"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ExternalLink, Loader2, LogOut, Save, Settings } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { clearAdminToken } from "@/lib/api/admin";
import {
  fetchPlanFeatures,
  updatePlanFeatures,
  type PlanFeatures,
  type SellerTier,
  type UpdatePlanFeaturesInput,
} from "@/lib/api/pricing";

const TIER_LABEL: Record<SellerTier, string> = {
  starter: "Starter",
  pro: "Pro",
  white_glove: "White Glove",
};

const TIER_ORDER: SellerTier[] = ["starter", "pro", "white_glove"];

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

  function logout() {
    clearAdminToken();
    router.replace("/kattegat-admin/login");
  }

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
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-brand-forest" />
      </div>
    );
  }

  if (query.isError || TIER_ORDER.some((tier) => !getRow(tier))) {
    return (
      <main className="min-h-screen bg-background px-4 py-10">
        <div className="mx-auto max-w-2xl">
          <Alert className="border-red-200 bg-red-50 text-red-800">
            <Settings />
            <AlertTitle>Admin session required</AlertTitle>
            <AlertDescription className="text-red-800/80">
              Sign in again to manage plan features.
            </AlertDescription>
          </Alert>
          <Button className="mt-4" onClick={() => router.replace("/kattegat-admin/login")}>
            Back to login
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-brand-blue">Kattegat admin</p>
            <h1 className="text-2xl font-extrabold text-brand-forest sm:text-3xl">Plan features</h1>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              Per-tier baselines (listing/media quotas, chat, reviews) that &ldquo;Free access
              mode&rdquo; in App Settings temporarily overrides — this is what it reverts to once
              switched off.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/kattegat-admin/settings" className={buttonVariants({ variant: "outline" })}>
              <ExternalLink />
              App settings
            </Link>
            <Button variant="ghost" onClick={logout}>
              <LogOut />
              Sign out
            </Button>
          </div>
        </header>

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

            return (
              <Card key={tier} className="border-border/80 bg-white">
                <CardHeader>
                  <CardTitle className="text-brand-forest">{TIER_LABEL[tier]}</CardTitle>
                  <CardDescription>
                    {tier === "white_glove"
                      ? "Managed off-app — quotas are typically left unlimited (blank)."
                      : "Quotas and capabilities enforced by mobile/web and backend routes."}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                  <NumberField
                    label="Max listings"
                    value={row.maxListings}
                    onChange={(value) => updateField(tier, "maxListings", value)}
                  />
                  <NumberField
                    label="Max photos per listing"
                    value={row.maxPhotosPerListing}
                    onChange={(value) => updateField(tier, "maxPhotosPerListing", value)}
                  />
                  <NumberField
                    label="Max video links per listing"
                    value={row.maxVideoLinksPerListing}
                    onChange={(value) => updateField(tier, "maxVideoLinksPerListing", value)}
                  />
                  <NumberField
                    label="Max profile media"
                    value={row.maxProfileMedia}
                    onChange={(value) => updateField(tier, "maxProfileMedia", value)}
                  />

                  <div className="flex flex-col gap-2 pt-2">
                    {featureLabels.map(([key, label]) => (
                      <label
                        key={key}
                        className="flex min-h-11 items-center gap-3 rounded-lg border border-border bg-muted/40 px-3 text-sm text-brand-forest"
                      >
                        <input
                          type="checkbox"
                          checked={Boolean(row[key])}
                          onChange={(event) => updateField(tier, key, event.target.checked)}
                          className="h-4 w-4 accent-brand-forest"
                        />
                        {label}
                      </label>
                    ))}
                  </div>

                  <Button onClick={() => save(tier)} disabled={saving} className="mt-2">
                    {saving ? <Loader2 className="animate-spin" /> : <Save />}
                    Save {TIER_LABEL[tier]}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </main>
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
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Input
        type="number"
        value={value ?? ""}
        placeholder="Unlimited"
        onChange={(event) => onChange(event.target.value === "" ? null : Number(event.target.value))}
        className="h-10"
      />
    </div>
  );
}
