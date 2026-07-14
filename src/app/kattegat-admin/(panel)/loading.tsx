import { Loader2 } from "lucide-react";

export default function AdminLoading() {
  return (
    <div className="flex min-h-64 flex-col items-center justify-center gap-3" role="status">
      <Loader2 className="size-7 animate-spin text-brand-forest" aria-hidden />
      <span className="text-sm text-muted-foreground">Loading admin workspace…</span>
    </div>
  );
}
