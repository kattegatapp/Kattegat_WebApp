import { RequireCapability } from "@/features/admin/access/require-capability";
import { AcceptedWhiteGloveApplicationsPage } from "@/features/admin/vetted/white-glove-applications-page";

export default function Page() {
  return (
    <RequireCapability
      anyOf={["growth.write"]}
      title="Accepted Applications"
      description="You need growth tools access to view accepted White Glove sellers."
    >
      <AcceptedWhiteGloveApplicationsPage />
    </RequireCapability>
  );
}
