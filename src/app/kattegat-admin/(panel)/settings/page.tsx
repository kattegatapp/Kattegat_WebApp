import { redirect } from "next/navigation";

import { adminPath } from "@/lib/admin/paths";

export default function AdminSettingsIndexPage() {
  redirect(adminPath("/settings/brand"));
}
