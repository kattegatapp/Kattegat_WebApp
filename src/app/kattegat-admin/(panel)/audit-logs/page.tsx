import { RequireCapability } from "@/features/admin/access/require-capability";
import { AdminAuditLogsPage } from "@/features/admin/audit/audit-logs-page";

export default function Page() {
  return (
    <RequireCapability
      superAdminOnly
      title="Audit Logs"
      description="Only owners can review administrator action history."
    >
      <AdminAuditLogsPage />
    </RequireCapability>
  );
}
