import { LaunchHome, ProductHome } from "@/features/marketing";
import { MaintenanceState } from "@/components/status/error-state";
import { getPublicAppSettings } from "@/lib/api/settings";

export default async function Home() {
  const settings = await getPublicAppSettings();

  if (settings.features.maintenanceMode) {
    return <MaintenanceState message={settings.features.maintenanceMessage} />;
  }

  // Admin "Waitlist registration" gate: on → launch waitlist home; off → production marketing site.
  if (settings.features.waitlistEnabled) {
    return <LaunchHome />;
  }

  return <ProductHome settings={settings} />;
}
