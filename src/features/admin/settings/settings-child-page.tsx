import { Suspense } from "react";

import { SettingsLoading } from "@/features/admin/settings/form-shared";
import { AdminSettingsPage, type SettingsTabValue } from "@/features/admin/settings/settings-page";

export function SettingsChildPage({ tab }: { tab: SettingsTabValue }) {
  return <Suspense fallback={<SettingsLoading />}><AdminSettingsPage fixedTab={tab} /></Suspense>;
}
