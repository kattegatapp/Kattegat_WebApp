"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronDown, LogIn, LogOut, UserPlus, UserRound } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { fetchMemberMe, logoutMember } from "@/lib/api/auth";
import { cn } from "@/lib/utils";

const menuItemClass =
  "cursor-pointer rounded-xl px-3 py-2.5 text-sm font-bold text-brand-forest focus:bg-brand-forest/6 focus:text-brand-forest data-highlighted:bg-brand-forest/6 data-highlighted:text-brand-forest [&_svg]:text-brand-forest/55 data-highlighted:[&_svg]:text-brand-mantis focus:[&_svg]:text-brand-mantis";

export function HeaderAccountMenu({
  className,
  onNavigate,
}: {
  className?: string;
  onNavigate?: () => void;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const me = useQuery({
    queryKey: ["member", "me"],
    queryFn: fetchMemberMe,
    staleTime: 60_000,
    retry: false,
  });

  const logout = useMutation({
    mutationFn: logoutMember,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["member"] });
      onNavigate?.();
      router.push("/login");
      router.refresh();
    },
  });

  const user = me.data;
  const label = user
    ? user.businessName || user.username || user.email.split("@")[0] || "Account"
    : "Account";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            className={cn(
              "h-11 gap-1.5 rounded-full border border-white/15 bg-white/10 px-4 text-sm font-extrabold text-white hover:bg-white/15 hover:text-brand-mantis aria-expanded:bg-white/15 aria-expanded:text-brand-mantis",
              className,
            )}
          />
        }
      >
        <UserRound className="size-4 shrink-0" />
        <span className="max-w-[7rem] truncate">{label}</span>
        <ChevronDown className="size-4 shrink-0 opacity-70" />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={10}
        className="z-[120] min-w-56 rounded-2xl border border-brand-forest/10 bg-white p-1.5 text-brand-forest shadow-[0_24px_60px_rgb(0_57_18/0.14)] ring-0"
      >
        {user ? (
          <>
            <DropdownMenuGroup>
            <DropdownMenuLabel className="px-3 py-2 font-normal">
              <span className="block truncate text-sm font-extrabold text-brand-forest">{label}</span>
              <span className="mt-0.5 block truncate text-xs font-medium text-brand-forest/55">
                {user.email}
              </span>
            </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator className="bg-brand-forest/10" />
            <DropdownMenuGroup>
            <DropdownMenuItem
              nativeButton={false}
              className={menuItemClass}
              render={<Link href="/account" onClick={onNavigate} />}
            >
              <UserRound className="size-4" />
              Your account
            </DropdownMenuItem>
            {user.sid ? (
              <DropdownMenuItem
                nativeButton={false}
                className={menuItemClass}
                render={<Link href="/billing" onClick={onNavigate} />}
              >
                Billing
              </DropdownMenuItem>
            ) : null}
            </DropdownMenuGroup>
            <DropdownMenuSeparator className="bg-brand-forest/10" />
            <DropdownMenuGroup>
            <DropdownMenuItem
              variant="destructive"
              className="cursor-pointer rounded-xl px-3 py-2.5 text-sm font-bold text-red-600 focus:bg-red-50 focus:text-red-700 data-highlighted:bg-red-50 data-highlighted:text-red-700 [&_svg]:text-red-500"
              disabled={logout.isPending}
              onClick={() => logout.mutate()}
            >
              <LogOut className="size-4" />
              Sign out
            </DropdownMenuItem>
            </DropdownMenuGroup>
          </>
        ) : (
          <DropdownMenuGroup>
            <DropdownMenuItem
              nativeButton={false}
              className={menuItemClass}
              render={<Link href="/login" onClick={onNavigate} />}
            >
              <LogIn className="size-4" />
              Sign in
            </DropdownMenuItem>
            <DropdownMenuItem
              nativeButton={false}
              className={menuItemClass}
              render={<Link href="/register" onClick={onNavigate} />}
            >
              <UserPlus className="size-4" />
              Create account
            </DropdownMenuItem>
          </DropdownMenuGroup>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
