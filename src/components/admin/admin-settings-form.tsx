"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { ExternalLink, Loader2, LogOut, Save, Settings } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type React from "react";
import { useState } from "react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { clearAdminToken, fetchAdminSettings, type AdminSettings, updateAdminSettings } from "@/lib/api/admin";

type SectionKey = "brand" | "metadata" | "links" | "features" | "operations";

const featureLabels: Array<[keyof AdminSettings["features"], string]> = [
  ["maintenanceMode", "Maintenance mode"],
  ["waitlistEnabled", "Waitlist enabled"],
  ["buyerSignupEnabled", "Buyer signup enabled"],
  ["sellerSignupEnabled", "Seller signup enabled"],
  ["referralsEnabled", "Referrals enabled"],
  ["recommendationsEnabled", "Recommendations enabled"],
  ["paymentsEnabled", "Payments enabled"],
  ["chatEnabled", "Chat enabled"],
  ["contactAgentEnabled", "Contact Agent enabled"],
  ["identityVerificationRequired", "Identity verification required"],
  ["listingModerationEnabled", "Listing moderation enabled"],
  ["requirementModerationEnabled", "Requirement moderation enabled"],
  ["featuredPlacementEnabled", "Featured placement enabled"],
  ["pushNotificationsEnabled", "Push notifications enabled"],
  ["emailNotificationsEnabled", "Email notifications enabled"],
];

export function AdminSettingsForm() {
  const router = useRouter();
  const [draft, setDraft] = useState<AdminSettings | null>(null);

  const query = useQuery({
    queryKey: ["admin", "settings"],
    queryFn: fetchAdminSettings,
    retry: false,
  });

  const settings = draft ?? query.data ?? null;

  const mutation = useMutation({
    mutationFn: updateAdminSettings,
    onSuccess: (value) => setDraft(value),
  });

  function updateSection<K extends SectionKey>(section: K, key: keyof AdminSettings[K], value: unknown) {
    if (!settings) return;
    setDraft({
      ...settings,
      [section]: {
        ...settings[section],
        [key]: value,
      },
    });
  }

  function logout() {
    clearAdminToken();
    router.replace("/kattegat-admin/login");
  }

  if (query.isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-brand-forest" />
      </div>
    );
  }

  if (query.isError || !settings) {
    return (
      <main className="min-h-screen bg-background px-4 py-10">
        <div className="mx-auto max-w-2xl">
          <Alert className="border-red-200 bg-red-50 text-red-800">
            <Settings />
            <AlertTitle>Admin session required</AlertTitle>
            <AlertDescription className="text-red-800/80">
              Sign in again to manage Kattegat settings.
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
            <h1 className="text-2xl font-extrabold text-brand-forest sm:text-3xl">App settings</h1>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              Settings here drive safe public configuration for mobile and web. Provider credentials stay in env.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/" target="_blank" className={buttonVariants({ variant: "outline" })}>
              <ExternalLink />
              Public site
            </Link>
            <Button variant="ghost" onClick={logout}>
              <LogOut />
              Sign out
            </Button>
            <Button onClick={() => mutation.mutate(toPatch(settings))} disabled={mutation.isPending}>
              {mutation.isPending ? <Loader2 className="animate-spin" /> : <Save />}
              Save settings
            </Button>
          </div>
        </header>

        {mutation.isSuccess ? (
          <Alert className="border-emerald-200 bg-emerald-50 text-emerald-800">
            <Save />
            <AlertTitle>Settings saved</AlertTitle>
            <AlertDescription className="text-emerald-800/80">Mobile and web will pick these up from the API.</AlertDescription>
          </Alert>
        ) : null}
        {mutation.isError ? (
          <Alert className="border-red-200 bg-red-50 text-red-800">
            <Settings />
            <AlertTitle>Save failed</AlertTitle>
            <AlertDescription className="text-red-800/80">
              {mutation.error instanceof Error ? mutation.error.message : "Could not save settings."}
            </AlertDescription>
          </Alert>
        ) : null}

        <div className="grid gap-5 lg:grid-cols-2">
          <SettingsCard title="Brand" description="Shown across mobile, web, and support surfaces.">
            <TextField label="Site name" value={settings.brand.siteName} onChange={(value) => updateSection("brand", "siteName", value)} />
            <TextField label="Legal name" value={settings.brand.legalName} onChange={(value) => updateSection("brand", "legalName", value)} />
            <TextField label="Tagline" value={settings.brand.tagline} onChange={(value) => updateSection("brand", "tagline", value)} />
            <TextField label="Market" value={settings.brand.market} onChange={(value) => updateSection("brand", "market", value)} />
            <TextField label="Support email" value={settings.brand.supportEmail} onChange={(value) => updateSection("brand", "supportEmail", value)} />
            <TextField label="Support phone" value={settings.brand.supportPhone ?? ""} onChange={(value) => updateSection("brand", "supportPhone", value || null)} />
          </SettingsCard>

          <SettingsCard title="Metadata" description="Used by the web app for SEO and previews.">
            <TextField label="Title" value={settings.metadata.title} onChange={(value) => updateSection("metadata", "title", value)} />
            <TextField label="Description" value={settings.metadata.description} onChange={(value) => updateSection("metadata", "description", value)} />
            <TextField label="Keywords" value={settings.metadata.keywords.join(", ")} onChange={(value) => updateSection("metadata", "keywords", csv(value))} />
            <TextField label="OG image URL" value={settings.metadata.ogImageUrl ?? ""} onChange={(value) => updateSection("metadata", "ogImageUrl", value || null)} />
          </SettingsCard>

          <SettingsCard title="Links" description="Public navigation, legal, support, and app-store URLs.">
            {(["webAppUrl", "mobileAppUrl", "appStoreUrl", "playStoreUrl", "termsUrl", "privacyUrl", "supportWhatsappUrl", "instagramUrl", "linkedinUrl"] as const).map((key) => (
              <TextField key={key} label={labelize(key)} value={settings.links[key] ?? ""} onChange={(value) => updateSection("links", key, value || null)} />
            ))}
          </SettingsCard>

          <SettingsCard title="Operations" description="Production gates, defaults, limits, and commercial values.">
            <TextField label="Default currency" value={settings.operations.defaultCurrency} onChange={(value) => updateSection("operations", "defaultCurrency", value.toUpperCase())} />
            <TextField label="Default country" value={settings.operations.defaultCountry} onChange={(value) => updateSection("operations", "defaultCountry", value)} />
            <TextField label="Default city" value={settings.operations.defaultCity} onChange={(value) => updateSection("operations", "defaultCity", value)} />
            <TextField label="Timezone" value={settings.operations.timezone} onChange={(value) => updateSection("operations", "timezone", value)} />
            <TextField label="Minimum app version" value={settings.operations.minimumAppVersion ?? ""} onChange={(value) => updateSection("operations", "minimumAppVersion", value || null)} />
            <TextField label="Latest app version" value={settings.operations.latestAppVersion ?? ""} onChange={(value) => updateSection("operations", "latestAppVersion", value || null)} />
            <NumberField label="Minimum build number" value={settings.operations.minimumSupportedBuildNumber} onChange={(value) => updateSection("operations", "minimumSupportedBuildNumber", value)} />
            <NumberField label="Max listing photos" value={settings.operations.maxListingPhotosDefault} onChange={(value) => updateSection("operations", "maxListingPhotosDefault", value ?? 1)} />
            <NumberField label="Max video links" value={settings.operations.maxVideoLinksDefault} onChange={(value) => updateSection("operations", "maxVideoLinksDefault", value ?? 0)} />
            <NumberField label="Max requirement attachments" value={settings.operations.maxRequirementAttachments} onChange={(value) => updateSection("operations", "maxRequirementAttachments", value ?? 0)} />
            <NumberField label="Commission rate" value={settings.operations.commissionRate} step="0.01" onChange={(value) => updateSection("operations", "commissionRate", value ?? 0)} />
            <NumberField label="Platform fee" value={settings.operations.platformFee} step="0.01" onChange={(value) => updateSection("operations", "platformFee", value ?? 0)} />
            <TextField label="Allowed countries" value={settings.operations.allowedCountries.join(", ")} onChange={(value) => updateSection("operations", "allowedCountries", csv(value))} />
            <TextField label="Blocked email domains" value={settings.operations.blockedEmailDomains.join(", ")} onChange={(value) => updateSection("operations", "blockedEmailDomains", csv(value.toLowerCase()))} />
          </SettingsCard>
        </div>

        <SettingsCard title="Feature controls" description="Operational toggles enforced by mobile/web and backend routes.">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {featureLabels.map(([key, label]) => (
              <label key={key} className="flex min-h-11 items-center gap-3 rounded-lg border border-border bg-muted/40 px-3 text-sm text-brand-forest">
                <input
                  type="checkbox"
                  checked={Boolean(settings.features[key])}
                  onChange={(event) => updateSection("features", key, event.target.checked)}
                  className="h-4 w-4 accent-brand-forest"
                />
                {label}
              </label>
            ))}
          </div>
          <div className="mt-4">
            <TextField label="Maintenance message" value={settings.features.maintenanceMessage} onChange={(value) => updateSection("features", "maintenanceMessage", value)} />
          </div>
        </SettingsCard>
      </div>
    </main>
  );
}

function SettingsCard({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <Card className="border-border/80 bg-white">
      <CardHeader>
        <CardTitle className="text-brand-forest">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-2">{children}</CardContent>
    </Card>
  );
}

function TextField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Input value={value} onChange={(event) => onChange(event.target.value)} className="h-10" />
    </div>
  );
}

function NumberField({
  label,
  value,
  step = "1",
  onChange,
}: {
  label: string;
  value: number | null;
  step?: string;
  onChange: (value: number | null) => void;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Input
        type="number"
        step={step}
        value={value ?? ""}
        onChange={(event) => onChange(event.target.value === "" ? null : Number(event.target.value))}
        className="h-10"
      />
    </div>
  );
}

function csv(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function labelize(value: string) {
  return value.replace(/([A-Z])/g, " $1").replace(/^./, (char) => char.toUpperCase());
}

function toPatch(settings: AdminSettings): Partial<AdminSettings> {
  return {
    brand: settings.brand,
    metadata: settings.metadata,
    links: settings.links,
    features: settings.features,
    operations: settings.operations,
  };
}
