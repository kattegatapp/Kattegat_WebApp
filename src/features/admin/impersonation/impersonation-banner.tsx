"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
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

  return (
    <div className="sticky top-0 z-[60] border-b border-amber-300/80 bg-amber-100 px-4 py-2.5 text-sm text-amber-950">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2">
        <p>
          <span className="font-extrabold">Signed in as member:</span>{" "}
          {status.data.targetLabel}
          <span className="text-amber-800/80"> ({status.data.targetEmail})</span>
        </p>
        <Button
          size="sm"
          variant="outline"
          className="border-amber-400 bg-white font-bold"
          disabled={exit.isPending}
          onClick={() => exit.mutate()}
        >
          {exit.isPending ? <Loader2 className="animate-spin" /> : <LogOut className="size-4" />}
          Exit member session
        </Button>
      </div>
    </div>
  );
}
