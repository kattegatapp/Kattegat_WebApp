import { RequireCapability } from "@/features/admin/access/require-capability";
import { ContactSubmissionsPage } from "@/features/admin/growth/contact-submissions-page";

export default function Page() {
  return (
    <RequireCapability
      anyOf={["users.read"]}
      title="Contact inbox"
      description="You need user access to view contact submissions."
    >
      <ContactSubmissionsPage />
    </RequireCapability>
  );
}
