import { UsersManagementPage } from "@/features/admin/users/users-management-page";

export default async function UserAccountPage({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;
  return <UsersManagementPage initialSelectedId={userId} />;
}
