import { ArrowLeft, FileQuestion } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { adminPath } from "@/lib/admin/paths";

export default function AdminNotFound() {
  return (
    <div className="mx-auto flex min-h-64 max-w-lg items-center px-4 text-center">
      <div className="w-full rounded-2xl border border-dashed bg-white p-8">
        <FileQuestion className="mx-auto size-8 text-brand-forest" aria-hidden />
        <h2 className="mt-3 text-xl font-bold text-brand-forest">Admin page not found</h2>
        <p className="mt-1 text-sm text-muted-foreground">This section may have moved or is no longer available.</p>
        <Button className="mt-5" nativeButton={false} render={<Link href={adminPath()} />}><ArrowLeft /> Dashboard</Button>
      </div>
    </div>
  );
}
