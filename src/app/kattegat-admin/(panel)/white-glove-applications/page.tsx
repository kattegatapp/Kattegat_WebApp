import { RequireCapability } from "@/features/admin/access/require-capability";
import { WhiteGloveApplicationsPage } from "@/features/admin/vetted/white-glove-applications-page";

export default function Page() {
  return (
    <RequireCapability
      anyOf={["growth.write"]}
      title="White Glove applications"
      description="You need growth tools access to review White Glove applications."
    >
      <WhiteGloveApplicationsPage />
    </RequireCapability>
  );
}
