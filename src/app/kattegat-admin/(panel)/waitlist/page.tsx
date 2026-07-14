import { RequireCapability } from "@/features/admin/access/require-capability";
import { WaitlistPage } from "@/features/admin/growth/waitlist-page";

export default function Page() {
  return (
    <RequireCapability
      anyOf={["users.read"]}
      title="Waitlist"
      description="You need user access to view the waitlist."
    >
      <WaitlistPage />
    </RequireCapability>
  );
}
