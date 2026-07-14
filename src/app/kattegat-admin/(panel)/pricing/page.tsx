import { RequireCapability } from "@/features/admin/access/require-capability";
import { AdminPricingForm } from "@/features/admin";

export default function Page() {
  return (
    <RequireCapability
      anyOf={["pricing.read", "pricing.write"]}
      title="Pricing"
      description="You need pricing access to view seller plan limits."
    >
      <AdminPricingForm />
    </RequireCapability>
  );
}
