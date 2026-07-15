import { redirect } from "next/navigation";

import { adminPath } from "@/lib/admin/paths";

/** Legacy path — queues live under Listings / Requirements ?view=pending. */
export default async function AdminReviewsRedirectPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string | string[] }>;
}) {
  const params = await searchParams;
  const tab = Array.isArray(params.tab) ? params.tab[0] : params.tab;
  if (tab === "listings" || tab === "requirements") {
    redirect(`${adminPath(tab === "requirements" ? "/requirements" : "/listings")}?view=pending`);
  }
  redirect(`${adminPath("/listings")}?view=pending`);
}
