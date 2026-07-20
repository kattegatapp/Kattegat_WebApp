"use client";

import { useMutation } from "@tanstack/react-query";
import { Loader2, LogIn } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { formatAdminAccessError } from "@/lib/admin/capabilities";
import { impersonateManagedUser } from "@/lib/api/admin/impersonation";

export function LoginAsUserButton({
  userId,
  className,
}: {
  userId: string;
  className?: string;
}) {
  const router = useRouter();
  const login = useMutation({
    mutationFn: () => impersonateManagedUser(userId),
    onSuccess: (data) => {
      router.push(data.redirectTo);
    },
  });

  return (
    <div className={className}>
      <Button
        className="w-full font-bold"
        variant="secondary"
        disabled={login.isPending}
        onClick={() => login.mutate()}
      >
        {login.isPending ? <Loader2 className="animate-spin" /> : <LogIn />}
        Sign in as this user
      </Button>
      {login.isError ? (
        <p className="mt-2 text-sm text-red-600">
          {formatAdminAccessError(login.error, "Could not sign in as this user.")}
        </p>
      ) : null}
    </div>
  );
}
