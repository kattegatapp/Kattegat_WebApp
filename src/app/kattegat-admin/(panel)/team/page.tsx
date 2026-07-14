import { RequireCapability } from "@/features/admin/access/require-capability";
import { AdminTeamPage } from "@/features/admin/team/team-page";

export default function TeamPage() {
  return (
    <RequireCapability
      superAdminOnly
      title="Control Room"
      description="Only owners can manage who has access to this control room."
    >
      <AdminTeamPage />
    </RequireCapability>
  );
}
