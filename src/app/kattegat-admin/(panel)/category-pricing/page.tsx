import { RequireCapability } from "@/features/admin/access/require-capability";
import { AdminCategoryPricingForm } from "@/features/admin/catalog/category-pricing-form";

export default function Page() {
  return (
    <RequireCapability
      anyOf={["catalog.write"]}
      title="Category pricing"
      description="You need catalog access to edit listing pricing defaults."
    >
      <AdminCategoryPricingForm />
    </RequireCapability>
  );
}
