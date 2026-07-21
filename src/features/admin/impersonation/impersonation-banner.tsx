"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, LogOut } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { adminPath } from "@/lib/admin/paths";
import { exitImpersonation, fetchImpersonationStatus } from "@/lib/api/admin/impersonation";

export function ImpersonationBanner() {
  const router = useRouter();
  const client = useQueryClient();
  const status = useQuery({
    queryKey: ["impersonation", "status"],
    queryFn: fetchImpersonationStatus,
    staleTime: 30_000,
  });

  const exit = useMutation({
    mutationFn: exitImpersonation,
    onSuccess: async (data) => {
      await client.invalidateQueries({ queryKey: ["impersonation"] });
      router.push(data.redirectTo);
    },
  });

  if (!status.data) return null;

  const manageHref = adminPath(
    `/users/${encodeURIComponent(status.data.targetUserId)}/manage`,
  );

  return (
    <div className="sticky top-0 z-[60] border-b border-amber-300/80 bg-amber-100 px-4 py-2.5 text-sm text-amber-950">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3">
        <div className="min-w-0 space-y-0.5">
          <p>
            <span className="font-extrabold">Browsing as member:</span>{" "}
            {status.data.targetLabel}
            <span className="text-amber-800/80"> ({status.data.targetEmail})</span>
          </p>
          <p className="text-xs leading-5 text-amber-900/75">
            Use this to see billing and public pages as they do. To edit listings or profile
            without leaving admin,{" "}
            <Link href={manageHref} className="font-bold underline underline-offset-2">
              manage on behalf
            </Link>
            .
          </p>
        </div>
        <Button
          size="sm"
          variant="outline"
          className="shrink-0 border-amber-400 bg-white font-bold"
          disabled={exit.isPending}
          onClick={() => exit.mutate()}
        >
          {exit.isPending ? <Loader2 className="animate-spin" /> : <LogOut className="size-4" />}
          Exit to admin
        </Button>
      </div>
    </div>
  );
}
