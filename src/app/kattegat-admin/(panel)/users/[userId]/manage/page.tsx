import { RequireCapability } from "@/features/admin/access/require-capability";
import { UserDelegateManagePage } from "@/features/admin/users/user-delegate-manage-page";
import { USER_DELEGATE_ACCESS } from "@/lib/admin/capabilities";

export default async function Page({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;
  return (
    <RequireCapability
      anyOf={[...USER_DELEGATE_ACCESS]}
      title="Manage on behalf"
      description="You need act-on-behalf access to manage vetted seller accounts."
    >
      <UserDelegateManagePage userId={userId} />
    </RequireCapability>
  );
}
