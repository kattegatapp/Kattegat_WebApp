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
  TriangleAlert,
  UsersRound,
  Wrench,
  type LucideIcon,
} from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  SettingsLoadError,
  SettingsLoading,
  SettingsSaveBar,
  useAdminSettingsSection,
} from "@/features/admin/settings/form-shared";
import type { AdminSettings } from "@/lib/api/admin";
import { cn } from "@/lib/utils";

type FeatureKey = keyof AdminSettings["features"];
type FeatureItem = { key: FeatureKey; label: string; description: string; icon: LucideIcon; critical?: boolean };
type FeatureGroup = { title: string; description: string; icon: LucideIcon; tone: string; items: FeatureItem[] };

const FEATURE_GROUPS: FeatureGroup[] = [
  {
    title: "Access & growth",
    description: "Control who can join and how the launch experience behaves.",
    icon: Rocket,
    tone: "bg-violet-50 text-violet-700 ring-violet-100",
    items: [
      { key: "freeAccessMode", label: "Launch access", description: "Give every seller Pro capabilities during the launch period.", icon: Sparkles },
      { key: "waitlistEnabled", label: "Waitlist registration", description: "Accept new waitlist applications from the website.", icon: DoorOpen },
      { key: "buyerSignupEnabled", label: "Buyer registration", description: "Allow new buyers to create an account.", icon: UsersRound },
      { key: "sellerSignupEnabled", label: "Seller registration", description: "Allow new hospitality partners to create an account.", icon: Store },
    ],
  },
  {
    title: "Marketplace services",
    description: "Switch customer-facing commercial and communication tools.",
    icon: Store,
    tone: "bg-blue-50 text-blue-700 ring-blue-100",
    items: [
      { key: "paymentsEnabled", label: "Payments & subscriptions", description: "Allow billing, checkout and plan purchases.", icon: CreditCard },
      { key: "chatEnabled", label: "Member messaging", description: "Allow buyers, sellers and operators to use chat.", icon: MessageCircleMore },
      { key: "contactAgentEnabled", label: "Contact an agent", description: "Show assisted service and contact-agent journeys.", icon: UsersRound },
      { key: "referralsEnabled", label: "Referral programme", description: "Allow members to recommend leads and earn rewards.", icon: Sparkles },
      { key: "recommendationsEnabled", label: "Recommendations", description: "Show personalised marketplace recommendations.", icon: Sparkles },
      { key: "featuredPlacementEnabled", label: "Featured placement", description: "Allow promoted placement for eligible listings.", icon: Rocket },
    ],
  },
  {
    title: "Trust & approvals",
    description: "Set the checks required before content and sellers go live.",
    icon: ShieldCheck,
    tone: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    items: [
      { key: "identityVerificationRequired", label: "Identity verification", description: "Require seller identity checks before protected actions.", icon: LockKeyhole },
      { key: "listingModerationEnabled", label: "Listing approval", description: "Send new listings to the admin approval queue.", icon: ShieldCheck },
      { key: "requirementModerationEnabled", label: "Requirement approval", description: "Send new buyer requirements to the admin approval queue.", icon: ShieldCheck },
    ],
  },
  {
    title: "Member communications",
    description: "Choose the channels used for platform updates.",
    icon: BellRing,
    tone: "bg-amber-50 text-amber-700 ring-amber-100",
    items: [
      { key: "pushNotificationsEnabled", label: "Push notifications", description: "Send supported notifications to mobile devices.", icon: BellRing },
      { key: "emailNotificationsEnabled", label: "Email notifications", description: "Send supported transactional messages by email.", icon: MessageCircleMore },
    ],
  },
];

export function SettingsFeaturesForm({ embedded = false }: { embedded?: boolean }) {
  const { query, sectionData, mutation, updateField, save } = useAdminSettingsSection("features");

  if (query.isPending) return <SettingsLoading />;
  if (query.isError || !sectionData) return <SettingsLoadError error={query.error} />;

  const enabledCount = Object.entries(sectionData).filter(([key, value]) => key !== "maintenanceMessage" && value === true).length;
  const totalCount = FEATURE_GROUPS.reduce((total, group) => total + group.items.length, 0);

  const body = (
    <>
      <div className="space-y-5">
        <section className="relative overflow-hidden rounded-[1.75rem] bg-[#062418] p-5 text-white shadow-[0_24px_70px_rgb(0_57_18/0.2)] sm:p-7">
          <div aria-hidden className="absolute inset-0 bg-[radial-gradient(circle_at_90%_0%,rgb(111_219_66/0.22),transparent_34%),linear-gradient(130deg,transparent_40%,rgb(255_255_255/0.04))]" />
          <div className="relative flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl"><Badge className="mb-4 border-white/10 bg-white/10 text-brand-mantis">Platform controls</Badge><h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Shape the live product experience.</h2><p className="mt-2 text-sm leading-6 text-white/65">Manage access, marketplace services, approvals and communications without releasing a new version of the app.</p></div>
            <div className="grid min-w-48 grid-cols-2 gap-2"><SummaryStat value={enabledCount} label="Enabled" /><SummaryStat value={totalCount - enabledCount} label="Disabled" /></div>
          </div>
        </section>

        <Card className={cn("overflow-hidden border-0 shadow-lg ring-1", sectionData.maintenanceMode ? "bg-amber-50 ring-amber-200" : "bg-white ring-border/70")}>
          <CardHeader className="border-b border-current/10">
            <div className="flex items-start justify-between gap-4"><div className="flex min-w-0 gap-3"><span className={cn("flex size-11 shrink-0 items-center justify-center rounded-2xl", sectionData.maintenanceMode ? "bg-amber-500 text-white" : "bg-slate-100 text-slate-600")}><Wrench className="size-5" /></span><div><CardTitle>Maintenance mode</CardTitle><CardDescription className={sectionData.maintenanceMode ? "text-amber-900/65" : undefined}>Temporarily pause customer product traffic while your team works.</CardDescription></div></div><Switch aria-label="Maintenance mode" checked={sectionData.maintenanceMode} onCheckedChange={(value) => updateField("maintenanceMode", value)} /></div>
          </CardHeader>
          <CardContent className="space-y-4">
            {sectionData.maintenanceMode ? <Alert className="border-amber-300 bg-white/70 text-amber-950"><TriangleAlert /><AlertTitle>Customer access will be restricted</AlertTitle><AlertDescription>The admin console remains available. Save your changes to activate the maintenance screen.</AlertDescription></Alert> : <div className="flex items-center gap-2 text-sm text-emerald-700"><CheckCircle2 className="size-4" />The marketplace is available to customers.</div>}
            <div className="space-y-2"><label htmlFor="maintenance-message" className="text-sm font-semibold text-brand-forest">Customer message</label><Textarea id="maintenance-message" value={sectionData.maintenanceMessage} onChange={(event) => updateField("maintenanceMessage", event.target.value)} placeholder="We’re upgrading systems. Please check back soon." className="min-h-24 resize-y rounded-xl bg-white" /><p className="text-xs text-muted-foreground">Displayed on the branded maintenance screen when this control is enabled.</p></div>
          </CardContent>
        </Card>

        <div className="grid items-start gap-5 xl:grid-cols-2">
          {FEATURE_GROUPS.map((group) => <FeatureGroupCard key={group.title} group={group} values={sectionData} onChange={updateField} />)}
        </div>
      </div>

      <SettingsSaveBar isPending={mutation.isPending} isSuccess={mutation.isSuccess} isError={mutation.isError} errorMessage={mutation.error instanceof Error ? mutation.error.message : undefined} onSave={save} />
    </>
  );

  if (embedded) return body;
  return <div className="mx-auto w-full max-w-6xl">{body}</div>;
}

function FeatureGroupCard({ group, values, onChange }: { group: FeatureGroup; values: AdminSettings["features"]; onChange: <K extends keyof AdminSettings["features"]>(key: K, value: AdminSettings["features"][K]) => void }) {
  const enabled = group.items.filter((item) => Boolean(values[item.key])).length;
  return <Card className="overflow-hidden border-0 bg-white shadow-[0_12px_35px_rgb(0_57_18/0.06)] ring-1 ring-border/70"><CardHeader className="border-b border-border/60"><div className="flex items-start justify-between gap-3"><div className="flex gap-3"><span className={cn("flex size-10 shrink-0 items-center justify-center rounded-2xl ring-1", group.tone)}><group.icon className="size-5" /></span><div><CardTitle>{group.title}</CardTitle><CardDescription>{group.description}</CardDescription></div></div><Badge variant="outline" className="shrink-0 bg-muted/30">{enabled}/{group.items.length} on</Badge></div></CardHeader><CardContent className="divide-y divide-border/60 p-0">{group.items.map((item) => <FeatureControl key={item.key} item={item} checked={Boolean(values[item.key])} onChange={(value) => onChange(item.key, value)} />)}</CardContent></Card>;
}

function FeatureControl({ item, checked, onChange }: { item: FeatureItem; checked: boolean; onChange: (value: boolean) => void }) {
  return <div className={cn("flex items-center gap-3 px-4 py-4 transition-colors sm:px-5", checked ? "bg-emerald-50/35" : "hover:bg-muted/25")}><span className={cn("flex size-9 shrink-0 items-center justify-center rounded-xl transition-colors", checked ? "bg-brand-forest text-white" : "bg-muted text-muted-foreground")}><item.icon className="size-4" /></span><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><p className="text-sm font-semibold text-brand-forest">{item.label}</p><span className={cn("rounded-full px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider", checked ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-500")}>{checked ? "Active" : "Off"}</span></div><p className="mt-0.5 text-xs leading-5 text-muted-foreground">{item.description}</p></div><Switch aria-label={item.label} checked={checked} onCheckedChange={onChange} /></div>;
}

function SummaryStat({ value, label }: { value: number; label: string }) { return <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur"><p className="text-2xl font-extrabold text-white">{value}</p><p className="text-[10px] font-bold uppercase tracking-wider text-white/50">{label}</p></div>; }
