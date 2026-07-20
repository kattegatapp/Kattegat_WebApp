import { RequireCapability } from "@/features/admin/access/require-capability";
import { BillingConfiguration } from "@/features/admin/settings/billing-configuration";

export default function AdminBillingPage() {
  return (
    <RequireCapability
      anyOf={["settings.read", "settings.write"]}
      title="Billing"
      description="You need settings access to configure Stripe billing."
    >
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <BillingConfiguration />
      </div>
    </RequireCapability>
  );
}
