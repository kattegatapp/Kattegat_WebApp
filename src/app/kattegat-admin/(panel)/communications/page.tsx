import { RequireCapability } from "@/features/admin/access/require-capability";
import { AdminCommunicationsPage } from "@/features/admin/communications/communications-page";

export default function Page() {
  return (
    <RequireCapability
      anyOf={["growth.write"]}
      title="Communications"
      description="You need growth tools access to send announcements."
    >
      <AdminCommunicationsPage />
    </RequireCapability>
  );
}
