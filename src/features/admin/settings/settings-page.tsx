"use client";

import {
  Building2,
  Link2,
  MailCheck,
  MapPinned,
  Search,
  ToggleLeft,
} from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { SettingsBrandForm } from "@/features/admin/settings/brand-form";
import { SettingsFeaturesForm } from "@/features/admin/settings/features-form";
import { SettingsLinksForm } from "@/features/admin/settings/links-form";
import { SettingsMetadataForm } from "@/features/admin/settings/metadata-form";
import { SettingsOperationsForm } from "@/features/admin/settings/operations-form";
import { EmailConfiguration } from "@/features/admin/settings/email-configuration";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { adminPath } from "@/lib/admin/paths";
import { cn } from "@/lib/utils";

const SETTINGS_TABS = [
  {
    value: "brand",
    label: "Brand",
    icon: Building2,
    hint: "Name & contacts",
  },
  {
    value: "metadata",
    label: "Metadata",
    icon: Search,
    hint: "SEO & sharing",
  },
  {
    value: "links",
    label: "Links",
    icon: Link2,
    hint: "Public URLs",
  },
  {
    value: "features",
    label: "Features",
    icon: ToggleLeft,
    hint: "On / off switches",
  },
  {
    value: "operations",
    label: "Operations",
    icon: MapPinned,
    hint: "Defaults & limits",
  },
  {
    value: "email",
    label: "Email",
    icon: MailCheck,
    hint: "SMTP & testing",
  },
] as const;

export type SettingsTabValue = (typeof SETTINGS_TABS)[number]["value"];

function isSettingsTab(value: string | null): value is SettingsTabValue {
  return SETTINGS_TABS.some((tab) => tab.value === value);
}

export function AdminSettingsPage({
  initialTab = "brand",
  fixedTab,
}: {
  initialTab?: SettingsTabValue;
  fixedTab?: SettingsTabValue;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const fromQuery = searchParams.get("tab");
  const tab = fixedTab ?? (isSettingsTab(fromQuery) ? fromQuery : initialTab);

  function onTabChange(value: string | number | null) {
    if (fixedTab) return;
    const next = String(value ?? "brand");
    if (!isSettingsTab(next)) return;
    const href = adminPath(`/settings/${next}`);
    if (pathname.startsWith(adminPath("/settings"))) {
      router.replace(href, { scroll: false });
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-extrabold tracking-tight text-brand-forest sm:text-3xl">
          Settings
        </h1>
        <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
          Update brand, links, feature switches, and operational defaults in one place.
        </p>
      </div>

      <Tabs value={tab} onValueChange={onTabChange} className="gap-5">
        {!fixedTab ? <div className="overflow-x-auto pb-1">
          <TabsList
            variant="default"
            className="flex h-12 w-full min-w-max items-stretch justify-start gap-1 rounded-full border border-border/70 bg-white p-1 shadow-sm sm:min-w-0"
          >
            {SETTINGS_TABS.map((item) => {
              const active = tab === item.value;
              return (
                <TabsTrigger
                  key={item.value}
                  value={item.value}
                  className={cn(
                    "h-full min-h-0 flex-none items-center justify-center gap-1.5 rounded-full border px-4 py-0 text-left transition-all sm:flex-1 sm:justify-center sm:text-center",
                    active
                      ? "border-transparent bg-brand-forest text-white shadow-sm hover:text-white data-active:bg-brand-forest data-active:text-white"
                      : "border-transparent bg-transparent text-muted-foreground hover:bg-muted hover:text-brand-forest data-active:bg-transparent",
                  )}
                >
                  <span className="flex items-center gap-1.5 text-sm font-semibold leading-none">
                    <item.icon
                      className={cn("size-3.5 shrink-0", active ? "opacity-100" : "opacity-70")}
                    />
                    {item.label}
                  </span>
                  <span
                    className={cn(
                      "hidden text-[11px] font-normal leading-none sm:inline",
                      active ? "text-white/75" : "text-muted-foreground",
                    )}
                  >
                    · {item.hint}
                  </span>
                </TabsTrigger>
              );
            })}
          </TabsList>
        </div> : null}

        <TabsContent value="brand" className="outline-none">
          <SettingsBrandForm embedded />
        </TabsContent>
        <TabsContent value="metadata" className="outline-none">
          <SettingsMetadataForm embedded />
        </TabsContent>
        <TabsContent value="links" className="outline-none">
          <SettingsLinksForm embedded />
        </TabsContent>
        <TabsContent value="features" className="outline-none">
          <SettingsFeaturesForm embedded />
        </TabsContent>
        <TabsContent value="operations" className="outline-none">
          <SettingsOperationsForm embedded />
        </TabsContent>
        <TabsContent value="email" className="outline-none">
          <EmailConfiguration />
        </TabsContent>
      </Tabs>
    </div>
  );
}
