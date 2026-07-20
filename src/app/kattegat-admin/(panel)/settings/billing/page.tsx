import { redirect } from "next/navigation";

import { adminPath } from "@/lib/admin/paths";

export default function AdminSettingsBillingRedirectPage() {
  redirect(adminPath("/billing"));
}
