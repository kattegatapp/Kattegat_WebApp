import { RequireCapability } from "@/features/admin/access/require-capability";
import { IdentityVerificationsPage } from "@/features/admin/users/identity-verifications-page";

export default function Page() {
  return (
    <RequireCapability
      anyOf={["moderation.write"]}
      title="Identity verification"
      description="You need moderation access to review identity applications."
    >
      <IdentityVerificationsPage />
    </RequireCapability>
  );
}
