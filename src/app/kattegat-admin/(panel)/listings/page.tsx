import { Suspense } from "react";
import { ListingsManagementPage } from "@/features/admin/content/content-management-pages";
import { Loader2 } from "lucide-react";
export default function Page() { return <Suspense fallback={<div className="flex min-h-64 items-center justify-center"><Loader2 className="size-6 animate-spin text-brand-forest" /></div>}><ListingsManagementPage /></Suspense>; }
