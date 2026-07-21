"use client";

import { useMutation } from "@tanstack/react-query";
import { Loader2, LogIn } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { formatAdminAccessError } from "@/lib/admin/capabilities";
import { impersonateManagedUser } from "@/lib/api/admin/impersonation";
import { cn } from "@/lib/utils";

export function LoginAsUserButton({
  userId,
  className,
  compact = false,
}: {
  userId: string;
  className?: string;
  compact?: boolean;
}) {
  const router = useRouter();
  const login = useMutation({
    mutationFn: () => impersonateManagedUser(userId),
    onSuccess: (data) => {
      router.push(data.redirectTo);
    },
  });

  return (
    <div className={cn("space-y-2", className)}>
      <Button
        className="w-full font-bold"
        variant="secondary"
        disabled={login.isPending}
        onClick={() => login.mutate()}
      >
        {login.isPending ? <Loader2 className="animate-spin" /> : <LogIn />}
        Sign in as this user
      </Button>
      {!compact ? (
        <p className="text-xs leading-5 text-muted-foreground">
          Opens a real member session for browsing (billing, plans, public pages). Your admin
          session stays active — exit anytime from the amber banner. Prefer{" "}
          <span className="font-semibold text-foreground">Manage on behalf</span> for editing
          listings and profile.
        </p>
      ) : null}
      {login.isError ? (
        <p className="text-sm text-red-600">
          {formatAdminAccessError(login.error, "Could not sign in as this user.")}
        </p>
      ) : null}
    </div>
  );
}
