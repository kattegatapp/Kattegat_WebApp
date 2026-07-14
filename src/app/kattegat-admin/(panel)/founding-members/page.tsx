import { RequireCapability } from "@/features/admin/access/require-capability";
import { FoundingMembersPage } from "@/features/admin/growth/operations-pages";

export default function Page() {
  return (
    <RequireCapability
      anyOf={["growth.write"]}
      title="Founding Members"
      description="You need growth tools access to review founding contributor applications."
    >
      <FoundingMembersPage />
    </RequireCapability>
  );
}
