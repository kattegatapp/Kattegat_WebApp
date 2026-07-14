import { Suspense } from "react";
import { Loader2 } from "lucide-react";

import { RequireCapability } from "@/features/admin/access/require-capability";
import { RequirementsManagementPage } from "@/features/admin/content/content-management-pages";

export default function Page() {
  return (
    <RequireCapability
      anyOf={["moderation.write"]}
      title="Requirements"
      description="You need moderation access to manage buyer requirements."
    >
      <Suspense
        fallback={
          <div className="flex min-h-64 items-center justify-center">
            <Loader2 className="size-6 animate-spin text-brand-forest" />
          </div>
        }
      >
        <RequirementsManagementPage />
      </Suspense>
    </RequireCapability>
  );
}
