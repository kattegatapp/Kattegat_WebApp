import { RequireCapability } from "@/features/admin/access/require-capability";
import { UsersManagementPage } from "@/features/admin/users/users-management-page";

export default async function Page({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;
  return (
    <RequireCapability
      anyOf={["users.read"]}
      title="User profile"
      description="You need user access to open account details."
    >
      <UsersManagementPage initialSelectedId={userId} />
    </RequireCapability>
  );
}
