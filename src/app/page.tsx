import { ProductHome } from "@/features/marketing";
import { MaintenanceState } from "@/components/status/error-state";
import { getPublicAppSettings } from "@/lib/api/settings";
import { getFeaturedSellers } from "@/lib/api/marketing";

export default async function Home() {
  const settings = await getPublicAppSettings();

  if (settings.features.maintenanceMode) {
    return <MaintenanceState message={settings.features.maintenanceMessage} />;
  }

  // The public homepage is always the production marketing site. Waitlist
  // registration remains available on its dedicated `/waitlist` route.
  const featuredSellers = await getFeaturedSellers();
  return <ProductHome settings={settings} featuredSellers={featuredSellers} />;
}
