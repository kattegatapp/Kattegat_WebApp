import { RequireCapability } from "@/features/admin/access/require-capability";
import { AdminPaymentsPage } from "@/features/admin/billing/payments-page";

export default function KattegatAdminPaymentsPage() {
  return (
    <RequireCapability
      anyOf={["settings.read", "settings.write"]}
      title="Payments"
      description="You need settings access to view payment history."
    >
      <AdminPaymentsPage />
    </RequireCapability>
  );
}
