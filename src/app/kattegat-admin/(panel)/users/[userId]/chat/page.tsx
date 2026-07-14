import { RequireCapability } from "@/features/admin/access/require-capability";
import { UserDirectChatPage } from "@/features/admin/users/user-direct-chat-page";

export default async function Page({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;
  return (
    <RequireCapability
      anyOf={["chat.admin"]}
      title="Direct chat"
      description="You need chat access to message members from the control room."
    >
      <UserDirectChatPage userId={userId} />
    </RequireCapability>
  );
}
