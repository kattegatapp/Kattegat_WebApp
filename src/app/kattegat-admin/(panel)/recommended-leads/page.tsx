import { RequireCapability } from "@/features/admin/access/require-capability";
import { RecommendedLeadsPage } from "@/features/admin/growth/operations-pages";

export default function Page() {
  return (
    <RequireCapability
      anyOf={["growth.write"]}
      title="Recommended Leads"
      description="You need growth tools access to work recommended leads."
    >
      <RecommendedLeadsPage />
    </RequireCapability>
  );
}
