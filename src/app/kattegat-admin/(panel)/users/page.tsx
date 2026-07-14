import { RequireCapability } from "@/features/admin/access/require-capability";
import { UsersManagementPage } from "@/features/admin/users/users-management-page";

export default function Page() {
  return (
    <RequireCapability
      anyOf={["users.read"]}
      title="User accounts"
      description="You need user access to search and open accounts. Ask an owner if you should have this."
    >
      <UsersManagementPage />
    </RequireCapability>
  );
}
