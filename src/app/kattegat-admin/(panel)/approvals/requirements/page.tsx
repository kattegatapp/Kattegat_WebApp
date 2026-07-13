import { redirect } from "next/navigation";
import { adminPath } from "@/lib/admin/paths";

export default function RequirementApprovalsPage() {
  redirect(`${adminPath("/requirements")}?view=pending`);
}
