import { RequireCapability } from "@/features/admin/access/require-capability";
import { WhiteGloveApplicationsPage } from "@/features/admin/vetted/white-glove-applications-page";
import { VETTED_APPLICATION_ACCESS } from "@/lib/admin/capabilities";

export default function Page() {
  return (
    <RequireCapability
      anyOf={[...VETTED_APPLICATION_ACCESS]}
      title="White Glove applications"
      description="You need vetted desk access to review White Glove applications."
    >
      <WhiteGloveApplicationsPage />
    </RequireCapability>
  );
}
