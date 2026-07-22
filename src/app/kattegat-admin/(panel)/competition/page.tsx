import { RequireCapability } from "@/features/admin/access/require-capability";
import { CompetitionAdminPage } from "@/features/admin/growth/competition-page";

export default function Page() {
  return <RequireCapability anyOf={["growth.write"]} title="Referral competition" description="You need growth tools access to manage the competition."><CompetitionAdminPage /></RequireCapability>;
}
