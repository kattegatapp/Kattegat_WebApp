import { RequireCapability } from "@/features/admin/access/require-capability";
import { AcceptedWhiteGloveApplicationsPage } from "@/features/admin/vetted/white-glove-applications-page";
import { VETTED_APPLICATION_ACCESS } from "@/lib/admin/capabilities";

export default function Page() {
  return (
    <RequireCapability
      anyOf={[...VETTED_APPLICATION_ACCESS]}
      title="Accepted Applications"
      description="You need vetted desk access to view accepted White Glove sellers."
    >
      <AcceptedWhiteGloveApplicationsPage />
    </RequireCapability>
  );
}
