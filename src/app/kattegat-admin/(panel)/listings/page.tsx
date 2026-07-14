import { Suspense } from "react";
import { Loader2 } from "lucide-react";

import { RequireCapability } from "@/features/admin/access/require-capability";
import { ListingsManagementPage } from "@/features/admin/content/content-management-pages";

export default function Page() {
  return (
    <RequireCapability
      anyOf={["moderation.write"]}
      title="Listings"
      description="You need moderation access to manage marketplace listings."
    >
      <Suspense
        fallback={
          <div className="flex min-h-64 items-center justify-center">
            <Loader2 className="size-6 animate-spin text-brand-forest" />
          </div>
        }
      >
        <ListingsManagementPage />
      </Suspense>
    </RequireCapability>
  );
}
