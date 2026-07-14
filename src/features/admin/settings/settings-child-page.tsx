import { Suspense } from "react";

import { RequireCapability } from "@/features/admin/access/require-capability";
import { SettingsLoading } from "@/features/admin/settings/form-shared";
import { AdminSettingsPage, type SettingsTabValue } from "@/features/admin/settings/settings-page";

export function SettingsChildPage({ tab }: { tab: SettingsTabValue }) {
  return (
    <RequireCapability
      anyOf={["settings.read", "settings.write"]}
      title="Settings"
      description="You need settings access to view brand and operations configuration."
    >
      <Suspense fallback={<SettingsLoading />}>
        <AdminSettingsPage fixedTab={tab} />
      </Suspense>
    </RequireCapability>
  );
}
