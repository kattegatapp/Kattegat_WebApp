import { RequireCapability } from "@/features/admin/access/require-capability";
import { PayoutsPage } from "@/features/admin/growth/payouts-page";

export default function Page() {
  return (
    <RequireCapability
      anyOf={["growth.write"]}
      title="Payouts"
      description="You need growth tools access to process withdrawal requests."
    >
      <PayoutsPage />
    </RequireCapability>
  );
}
