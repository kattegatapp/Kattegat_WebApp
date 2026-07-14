import { RequireCapability } from "@/features/admin/access/require-capability";
import { ContactAgentRequestsPage } from "@/features/admin/vetted/contact-agent-requests-page";

export default function AdminAgentRequestsRoute() {
  return (
    <RequireCapability
      anyOf={["chat.admin"]}
      title="Vetted chats"
      description="You need chat access to open Contact Agent conversations."
    >
      <ContactAgentRequestsPage />
    </RequireCapability>
  );
}
