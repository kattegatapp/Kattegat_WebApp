"use client";

import {
  BellRing,
  CheckCircle2,
  CreditCard,
  DoorOpen,
  LockKeyhole,
  MessageCircleMore,
  Rocket,
  ShieldCheck,
  Sparkles,
  Store,
  ToggleLeft,
  TriangleAlert,
  UsersRound,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { useMemo } from "react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  SettingsLoadError,
  SettingsLoading,
  SettingsSaveBar,
  labelize,
  useAdminSettingsSection,
} from "@/features/admin/settings/form-shared";
import type { AdminSettings } from "@/lib/api/admin";
import { cn } from "@/lib/utils";

type FeatureKey = keyof AdminSettings["features"];
type BooleanFeatureKey = {
  [K in FeatureKey]: AdminSettings["features"][K] extends boolean ? K : never;
}[FeatureKey];

type FeatureItem = {
  key: BooleanFeatureKey;
  label: string;
  description: string;
  icon: LucideIcon;
};

type FeatureGroup = {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  tone: string;
  /** Prefer full-width when many toggles — layout still reflows if space is tight. */
  preferWide?: boolean;
  items: FeatureItem[];
};

const META_KEYS = new Set<FeatureKey>(["maintenanceMode", "maintenanceMessage"]);

const FEATURE_META: Partial<
  Record<BooleanFeatureKey, { label: string; description: string; icon: LucideIcon }>
> = {
  freeAccessMode: {
    label: "Launch access",
    description: "Give every seller Pro capabilities during the launch period.",
    icon: Sparkles,
  },
  vipSupportEnabled: {
    label: "VIP Support",
    description:
      "Show the VIP Support button. Users choose WhatsApp or email (Brand support email + Links WhatsApp URL).",
    icon: MessageCircleMore,
  },
  vipSupportProOnly: {
    label: "VIP Support · Pro only",
    description:
      "When on, only Pro / White Glove sellers (or Launch access) see VIP Support. Keep off while the line is open to everyone.",
    icon: Sparkles,
  },
  waitlistEnabled: {
    label: "Waitlist registration",
    description:
      "On: /waitlist accepts registrations and other public product screens are redirected there; legal, support, contact, download, and admin access remain available. Off: the full website works and /waitlist remains available in its closed state.",
    icon: DoorOpen,
  },
  buyerSignupEnabled: {
    label: "Buyer registration",
    description: "Allow new buyers to create an account.",
    icon: UsersRound,
  },
  sellerSignupEnabled: {
    label: "Seller registration",
    description: "Allow new hospitality partners to create an account.",
    icon: Store,
  },
  paymentsEnabled: {
    label: "Payments & subscriptions",
    description:
      "Keep off until Stripe webhooks and price IDs are proven. Enables billing, checkout and plan purchases.",
    icon: CreditCard,
  },
  reviewsEnabled: {
    label: "Reviews & ratings",
    description:
      "MVP: keep off. When on, buyers can submit reviews (still pending until moderation exists).",
    icon: Sparkles,
  },
  chatEnabled: {
    label: "Member messaging",
    description: "Allow buyers, sellers and operators to use chat.",
    icon: MessageCircleMore,
  },
  contactAgentEnabled: {
    label: "Contact Agent (Vetted chats)",
    description:
      "Buyers request help via Contact Agent — the Vetted team relays in Vetted chats. White Glove managed sellers are handled from their user profile.",
    icon: UsersRound,
  },
  referralsEnabled: {
    label: "Referral programme",
    description: "Allow members to recommend leads and earn rewards.",
    icon: Sparkles,
  },
  recommendationsEnabled: {
    label: "Recommendations",
    description: "Show personalised marketplace recommendations.",
    icon: Sparkles,
  },
  featuredPlacementEnabled: {
    label: "Curated home ranking",
    description:
      "When on, Home Services for you ranks White Glove first, then Premium/Pro, then Starter — with reviews, freshness, and newcomer boost. When off, Home uses the same recommended order without the extra White Glove home boost.",
    icon: Rocket,
  },
  identityVerificationRequired: {
    label: "Identity verification",
    description: "Require seller identity checks before protected actions.",
    icon: LockKeyhole,
  },
  listingModerationEnabled: {
    label: "Listing approval",
    description: "Send new listings to the admin approval queue.",
    icon: ShieldCheck,
  },
  requirementModerationEnabled: {
    label: "Requirement approval",
    description: "Send new buyer requirements to the admin approval queue.",
    icon: ShieldCheck,
  },
  pushNotificationsEnabled: {
    label: "Push notifications",
    description: "Send supported notifications to mobile devices.",
    icon: BellRing,
  },
  emailNotificationsEnabled: {
    label: "Email notifications",
    description: "Send supported transactional messages by email.",
    icon: MessageCircleMore,
  },
};

const FEATURE_GROUP_DEFS: Array<{
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  tone: string;
  preferWide?: boolean;
  keys: BooleanFeatureKey[];
}> = [
  {
    id: "access",
    title: "Access & growth",
    description: "Control who can join and how the launch experience behaves.",
    icon: Rocket,
    tone: "bg-[rgb(72_220_129/0.08)] text-brand-blue ring-[rgb(72_220_129/0.12)]",
    keys: ["freeAccessMode", "waitlistEnabled", "buyerSignupEnabled", "sellerSignupEnabled"],
  },
  {
    id: "marketplace",
    title: "Marketplace services",
    description: "Switch customer-facing commercial and communication tools.",
    icon: Store,
    tone: "bg-blue-50 text-blue-700 ring-blue-100",
    preferWide: true,
    keys: [
      "paymentsEnabled",
      "reviewsEnabled",
      "chatEnabled",
      "contactAgentEnabled",
      "referralsEnabled",
      "recommendationsEnabled",
      "featuredPlacementEnabled",
    ],
  },
  {
    id: "trust",
    title: "Trust & approvals",
    description: "Set the checks required before content and sellers go live.",
    icon: ShieldCheck,
    tone: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    keys: [
      "identityVerificationRequired",
      "listingModerationEnabled",
      "requirementModerationEnabled",
    ],
  },
  {
    id: "comms",
    title: "Member communications",
    description: "Choose the channels used for platform updates.",
    icon: BellRing,
    tone: "bg-amber-50 text-amber-700 ring-amber-100",
    keys: [
      "pushNotificationsEnabled",
      "emailNotificationsEnabled",
      "vipSupportEnabled",
      "vipSupportProOnly",
    ],
  },
];

function isBooleanFeatureKey(key: string, value: unknown): key is BooleanFeatureKey {
  return !META_KEYS.has(key as FeatureKey) && typeof value === "boolean";
}

function buildFeatureItem(key: BooleanFeatureKey): FeatureItem {
  const meta = FEATURE_META[key];
  return {
    key,
    label: meta?.label ?? labelize(key),
    description: meta?.description ?? "Toggle this platform capability.",
    icon: meta?.icon ?? ToggleLeft,
  };
}

/** Build visible groups from live settings so new API flags still appear. */
function resolveFeatureGroups(values: AdminSettings["features"]): FeatureGroup[] {
  const available = new Set(
    Object.entries(values)
      .filter(([key, value]) => isBooleanFeatureKey(key, value))
      .map(([key]) => key as BooleanFeatureKey),
  );

  const used = new Set<BooleanFeatureKey>();
  const groups: FeatureGroup[] = [];

  for (const def of FEATURE_GROUP_DEFS) {
    const items = def.keys.filter((key) => available.has(key)).map(buildFeatureItem);
    if (items.length === 0) continue;
    items.forEach((item) => used.add(item.key));
    groups.push({
      id: def.id,
      title: def.title,
      description: def.description,
      icon: def.icon,
      tone: def.tone,
      preferWide: def.preferWide || items.length >= 5,
      items,
    });
  }

  const extras = [...available].filter((key) => !used.has(key)).map(buildFeatureItem);
  if (extras.length > 0) {
    groups.push({
      id: "other",
      title: "Other controls",
      description: "Additional feature flags from the live settings payload.",
      icon: ToggleLeft,
      tone: "bg-slate-100 text-slate-600 ring-slate-200",
      preferWide: extras.length >= 5,
      items: extras,
    });
  }

  return groups;
}

export function SettingsFeaturesForm({ embedded = false }: { embedded?: boolean }) {
  const { query, sectionData, mutation, updateField, save } = useAdminSettingsSection("features");

  const groups = useMemo(
    () => (sectionData ? resolveFeatureGroups(sectionData) : []),
    [sectionData],
  );

  if (query.isPending) return <SettingsLoading />;
  if (query.isError || !sectionData) return <SettingsLoadError error={query.error} />;

  const enabledCount = Object.entries(sectionData).filter(
    ([key, value]) => isBooleanFeatureKey(key, value) && value === true,
  ).length;
  const totalCount = groups.reduce((total, group) => total + group.items.length, 0);

  const body = (
    <>
      <div className="space-y-5">
        <section className="ios-glass-pane relative overflow-hidden rounded-[1.75rem] px-5 py-5 text-zinc-900 sm:px-7 sm:py-7">
          <div className="relative flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl">
              <Badge className="ios-glass-chip mb-4 border-0 text-zinc-800">
                Platform controls
              </Badge>
              <h2 className="text-2xl font-extrabold tracking-tight text-zinc-900 sm:text-3xl">
                Shape the live product experience.
              </h2>
              <p className="mt-2 text-sm leading-6 text-zinc-600">
                Manage access, marketplace services, approvals and communications without releasing
                a new version of the app.
              </p>
            </div>
            <div className="grid min-w-48 grid-cols-2 gap-2">
              <SummaryStat value={enabledCount} label="Enabled" />
              <SummaryStat value={totalCount - enabledCount} label="Disabled" />
            </div>
          </div>
        </section>

        <Card
          className={cn(
            "overflow-hidden border-0 shadow-lg ring-1",
            sectionData.maintenanceMode ? "bg-amber-50 ring-amber-200" : "bg-white ring-border/70",
          )}
        >
          <CardHeader className="border-b border-current/10">
            <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
              <div className="flex min-w-0 gap-3">
                <span
                  className={cn(
                    "flex size-11 shrink-0 items-center justify-center rounded-2xl",
                    sectionData.maintenanceMode
                      ? "bg-amber-500 text-white"
                      : "bg-slate-100 text-slate-600",
                  )}
                >
                  <Wrench className="size-5" />
                </span>
                <div>
                  <CardTitle>Maintenance mode</CardTitle>
                  <CardDescription
                    className={sectionData.maintenanceMode ? "text-amber-900/65" : undefined}
                  >
                    Temporarily pause customer product traffic while your team works.
                  </CardDescription>
                </div>
              </div>
              <Switch
                aria-label="Maintenance mode"
                className="shrink-0"
                checked={sectionData.maintenanceMode}
                onCheckedChange={(value) => updateField("maintenanceMode", value)}
              />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {sectionData.maintenanceMode ? (
              <Alert className="ios-glass-pane rounded-2xl border-amber-200/60 bg-amber-50/35 text-amber-950 backdrop-blur-xl">
                <TriangleAlert />
                <AlertTitle>Customer access will be restricted</AlertTitle>
                <AlertDescription>
                  The admin console remains available. Save your changes to activate the maintenance
                  screen.
                </AlertDescription>
              </Alert>
            ) : (
              <div className="flex items-center gap-2 text-sm text-emerald-700">
                <CheckCircle2 className="size-4" />
                The marketplace is available to customers.
              </div>
            )}
            <div className="space-y-2">
              <label htmlFor="maintenance-message" className="text-sm font-semibold text-brand-forest">
                Customer message
              </label>
              <Textarea
                id="maintenance-message"
                value={sectionData.maintenanceMessage}
                onChange={(event) => updateField("maintenanceMessage", event.target.value)}
                placeholder="We’re upgrading systems. Please check back soon."
                className="min-h-24 resize-y rounded-xl bg-white"
              />
              <p className="text-xs text-muted-foreground">
                Displayed on the branded maintenance screen when this control is enabled.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Flexible card grid: 1 → 2 → 3 cols by width; wide groups can span 2. */}
        <div className="grid grid-cols-1 items-start gap-5 md:grid-cols-2 xl:grid-cols-3">
          {groups.map((group) => (
            <FeatureGroupCard
              key={group.id}
              group={group}
              values={sectionData}
              onChange={updateField}
              className={cn(
                group.preferWide && "md:col-span-2",
                group.preferWide && groups.length > 1 && "xl:col-span-2",
              )}
            />
          ))}
        </div>
      </div>

      <SettingsSaveBar
        isPending={mutation.isPending}
        isSuccess={mutation.isSuccess}
        isError={mutation.isError}
        errorMessage={mutation.error instanceof Error ? mutation.error.message : undefined}
        onSave={save}
      />
    </>
  );

  if (embedded) return body;
  return <div className="mx-auto w-full max-w-7xl">{body}</div>;
}

function FeatureGroupCard({
  group,
  values,
  onChange,
  className,
}: {
  group: FeatureGroup;
  values: AdminSettings["features"];
  onChange: <K extends keyof AdminSettings["features"]>(
    key: K,
    value: AdminSettings["features"][K],
  ) => void;
  className?: string;
}) {
  const enabled = group.items.filter((item) => Boolean(values[item.key])).length;
  const useTwoColItems = group.items.length >= 5;

  return (
    <Card
      className={cn(
        "h-full overflow-hidden border-0 bg-white shadow-[0_12px_35px_rgb(0_57_18/0.06)] ring-1 ring-border/70",
        className,
      )}
    >
      <CardHeader className="border-b border-border/60">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
          <div className="flex gap-3">
            <span
              className={cn(
                "flex size-10 shrink-0 items-center justify-center rounded-2xl ring-1",
                group.tone,
              )}
            >
              <group.icon className="size-5" />
            </span>
            <div className="min-w-0">
              <CardTitle>{group.title}</CardTitle>
              <CardDescription>{group.description}</CardDescription>
            </div>
          </div>
          <Badge variant="outline" className="w-fit shrink-0 bg-muted/30">
            {enabled}/{group.items.length} on
          </Badge>
        </div>
      </CardHeader>
      <CardContent
        className={cn(
          "grid gap-px bg-border/60 p-0",
          useTwoColItems ? "sm:grid-cols-2" : "grid-cols-1",
        )}
      >
        {group.items.map((item) => (
          <FeatureControl
            key={item.key}
            item={item}
            checked={Boolean(values[item.key])}
            onChange={(value) => onChange(item.key, value)}
          />
        ))}
      </CardContent>
    </Card>
  );
}

function FeatureControl({
  item,
  checked,
  onChange,
}: {
  item: FeatureItem;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div
      className={cn(
        "flex h-full items-start gap-3 bg-white px-4 py-4 transition-colors sm:items-center sm:px-5",
        checked ? "bg-emerald-50/50" : "hover:bg-muted/25",
      )}
    >
      <span
        className={cn(
          "mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl transition-colors sm:mt-0",
          checked ? "bg-brand-forest text-white" : "bg-muted text-muted-foreground",
        )}
      >
        <item.icon className="size-4" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-semibold text-brand-forest">{item.label}</p>
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider",
              checked ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-500",
            )}
          >
            {checked ? "Active" : "Off"}
          </span>
        </div>
        <p className="mt-0.5 text-xs leading-5 text-muted-foreground">{item.description}</p>
      </div>
      <Switch
        aria-label={item.label}
        className="mt-1 shrink-0 sm:mt-0"
        checked={checked}
        onCheckedChange={onChange}
      />
    </div>
  );
}

function SummaryStat({ value, label }: { value: number; label: string }) {
  return (
    <div className="ios-glass-chip rounded-2xl px-4 py-3">
      <p className="text-2xl font-extrabold text-zinc-900">{value}</p>
      <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">{label}</p>
    </div>
  );
}
