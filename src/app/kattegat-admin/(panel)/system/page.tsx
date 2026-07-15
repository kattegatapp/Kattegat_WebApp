import { RequireCapability } from "@/features/admin/access/require-capability";
import { AdminSystemPage } from "@/features/admin/system/system-page";

export default function Page() {
  return (
    <RequireCapability>
      <AdminSystemPage />
    </RequireCapability>
  );
}
