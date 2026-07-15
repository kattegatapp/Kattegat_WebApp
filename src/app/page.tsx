import { LaunchHome } from "@/features/marketing/launch-home";
import { ProductHome } from "@/features/marketing/product-home";
import { MaintenanceState } from "@/components/status/error-state";
import { getPublicAppSettings } from "@/lib/api/settings";

export default async function Home() {
  const settings = await getPublicAppSettings();

  if (settings.features.maintenanceMode) {
    return <MaintenanceState message={settings.features.maintenanceMessage} />;
  }

  if (settings.features.waitlistEnabled) {
    return <LaunchHome />;
  }

  return <ProductHome settings={settings} />;
}
