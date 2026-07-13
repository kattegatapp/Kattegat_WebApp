import { redirect } from "next/navigation";
import { adminPath } from "@/lib/admin/paths";

export default function AdminApprovalsRoutePage() {
  redirect(`${adminPath("/listings")}?view=pending`);
}
