import { redirect } from "next/navigation";
import { adminPath } from "@/lib/admin/paths";

export default function ListingApprovalsPage() {
  redirect(`${adminPath("/listings")}?view=pending`);
}
