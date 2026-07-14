import { RequireCapability } from "@/features/admin/access/require-capability";
import { ModerationReportsPage } from "@/features/admin/moderation/moderation-reports-page";

export default function Page() {
  return (
    <RequireCapability
      anyOf={["moderation.write"]}
      title="Moderation reports"
      description="You need moderation access to review reported content."
    >
      <ModerationReportsPage />
    </RequireCapability>
  );
}
