"use client";

import { useMutation } from "@tanstack/react-query";
import {
  ChevronDown,
  Download,
  Headphones,
  HelpCircle,
  KeyRound,
  LogOut,
  Gift,
  Megaphone,
  Settings,
  ShieldCheck,
  CreditCard,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { AccountAvatar } from "@/features/account/account-shared";
import type { AccountIdentity } from "@/features/account/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { changeMemberPassword } from "@/lib/api/auth";
import { cn } from "@/lib/utils";

const menuItemClass =
  "cursor-pointer rounded-xl px-3 py-2.5 text-sm font-bold text-brand-forest focus:bg-brand-forest/6 focus:text-brand-forest data-highlighted:bg-brand-forest/6 data-highlighted:text-brand-forest [&_svg]:text-brand-forest/55 data-highlighted:[&_svg]:text-brand-mantis focus:[&_svg]:text-brand-mantis";

type AccountProfileMenuProps = {
  displayName: string;
  email: string;
  avatarUrl?: string | null;
  publicId?: string | null;
  identity: AccountIdentity;
  hasSellerId: boolean;
  signingOut?: boolean;
  onOpenSettings: () => void;
  onOpenMembership?: () => void;
  onOpenReferrals?: () => void;
  onOpenRecommend?: () => void;
  onOpenVipSupport?: () => void;
  onSignOut: () => void;
};

export function AccountProfileMenu({
  displayName,
  email,
  avatarUrl,
  publicId,
  identity,
  hasSellerId,
  signingOut,
  onOpenSettings,
  onOpenMembership,
  onOpenReferrals,
  onOpenRecommend,
  onOpenVipSupport,
  onSignOut,
}: AccountProfileMenuProps) {
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const changePassword = useMutation({
    mutationFn: () =>
      changeMemberPassword({
        currentPassword,
        newPassword,
      }),
    onSuccess: () => {
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordOpen(false);
    },
  });

  const mismatch = confirmPassword.length > 0 && newPassword !== confirmPassword;
  const canSave =
    currentPassword.length > 0 &&
    newPassword.length >= 8 &&
    newPassword === confirmPassword &&
    !changePassword.isPending;

  function openPasswordDialog() {
    setPasswordOpen(true);
  }

  function closePasswordDialog() {
    if (changePassword.isPending) return;
    setPasswordOpen(false);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    changePassword.reset();
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              type="button"
              variant="ghost"
              className="h-9 shrink-0 gap-1 rounded-xl px-1.5 sm:h-11 sm:px-2"
              aria-label="Account menu"
            />
          }
        >
          <AccountAvatar
            name={displayName}
            imageUrl={avatarUrl}
            className="size-9 rounded-xl text-sm sm:size-10"
          />
          <ChevronDown className="hidden size-4 shrink-0 text-brand-forest/55 sm:block" />
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          sideOffset={10}
          className="z-[120] w-[min(100vw-2rem,280px)] rounded-2xl border border-brand-forest/10 bg-white p-1.5 text-brand-forest shadow-[0_24px_60px_rgb(0_57_18/0.14)] ring-0"
        >
          <DropdownMenuGroup>
            <DropdownMenuLabel className="px-3 py-2 font-normal">
              <span className="block truncate text-sm font-extrabold text-brand-forest">{displayName}</span>
              <span className="mt-0.5 block truncate text-xs font-medium text-brand-forest/55">
                {publicId ?? email}
              </span>
            </DropdownMenuLabel>
          </DropdownMenuGroup>

          <DropdownMenuSeparator className="bg-brand-forest/10" />

          <DropdownMenuGroup>
            <DropdownMenuItem className={menuItemClass} onClick={onOpenSettings}>
              <Settings className="size-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem className={menuItemClass} onClick={openPasswordDialog}>
              <KeyRound className="size-4" />
              Reset password
            </DropdownMenuItem>
          </DropdownMenuGroup>

          <DropdownMenuSeparator className="bg-brand-forest/10" />

          <DropdownMenuGroup>
            {identity === "seller" && onOpenMembership ? (
              <DropdownMenuItem className={menuItemClass} onClick={onOpenMembership}>
                <ShieldCheck className="size-4" />
                Membership
              </DropdownMenuItem>
            ) : null}
            {hasSellerId ? (
              <DropdownMenuItem
                nativeButton={false}
                className={menuItemClass}
                render={<Link href="/billing" />}
              >
                <CreditCard className="size-4" />
                Billing
              </DropdownMenuItem>
            ) : null}
            {onOpenReferrals ? (
              <DropdownMenuItem className={menuItemClass} onClick={onOpenReferrals}>
                <Gift className="size-4" />
                Referrals
              </DropdownMenuItem>
            ) : null}
            {onOpenRecommend ? (
              <DropdownMenuItem className={menuItemClass} onClick={onOpenRecommend}>
                <Megaphone className="size-4" />
                Recommend &amp; earn
              </DropdownMenuItem>
            ) : null}
            {onOpenVipSupport ? (
              <DropdownMenuItem className={menuItemClass} onClick={onOpenVipSupport}>
                <Headphones className="size-4" />
                VIP Support
              </DropdownMenuItem>
            ) : null}
            <DropdownMenuItem
              nativeButton={false}
              className={menuItemClass}
              render={<Link href="/support" />}
            >
              <HelpCircle className="size-4" />
              Help &amp; support
            </DropdownMenuItem>
            <DropdownMenuItem
              nativeButton={false}
              className={menuItemClass}
              render={<Link href="/download" />}
            >
              <Download className="size-4" />
              Get the app
            </DropdownMenuItem>
          </DropdownMenuGroup>

          <DropdownMenuSeparator className="bg-brand-forest/10" />

          <DropdownMenuGroup>
            <DropdownMenuItem
              variant="destructive"
              className="cursor-pointer rounded-xl px-3 py-2.5 text-sm font-bold text-red-600 focus:bg-red-50 focus:text-red-700 data-highlighted:bg-red-50 data-highlighted:text-red-700 [&_svg]:text-red-500"
              disabled={signingOut}
              onClick={onSignOut}
            >
              {signingOut ? <Spinner className="size-4" /> : <LogOut className="size-4" />}
              {signingOut ? "Signing out…" : "Sign out"}
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={passwordOpen} onOpenChange={(open) => (open ? setPasswordOpen(true) : closePasswordDialog())}>
        <DialogContent className="rounded-2xl border-brand-forest/10 bg-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-brand-forest">Reset password</DialogTitle>
            <DialogDescription>
              Enter your current password, then choose a new one. You&apos;ll use it the next time you sign in.
            </DialogDescription>
          </DialogHeader>

          <form
            className="space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              if (!canSave) return;
              changePassword.mutate();
            }}
          >
            <div className="space-y-2">
              <label htmlFor="current-password" className="text-sm font-bold text-brand-forest">
                Current password
              </label>
              <Input
                id="current-password"
                type="password"
                autoComplete="current-password"
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
                className="h-10 rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="new-password" className="text-sm font-bold text-brand-forest">
                New password
              </label>
              <Input
                id="new-password"
                type="password"
                autoComplete="new-password"
                minLength={8}
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                className="h-10 rounded-xl"
              />
              <p className="text-xs text-muted-foreground">At least 8 characters.</p>
            </div>

            <div className="space-y-2">
              <label htmlFor="confirm-password" className="text-sm font-bold text-brand-forest">
                Confirm new password
              </label>
              <Input
                id="confirm-password"
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                aria-invalid={mismatch || undefined}
                className={cn("h-10 rounded-xl", mismatch && "border-red-400")}
              />
              {mismatch ? <p className="text-xs text-red-600">Passwords don&apos;t match.</p> : null}
            </div>

            {changePassword.isError ? (
              <p className="text-sm text-red-600">
                {changePassword.error instanceof Error
                  ? changePassword.error.message
                  : "Could not update your password. Try again."}
              </p>
            ) : null}

            {changePassword.isSuccess ? (
              <p className="text-sm font-semibold text-brand-mantis">Password updated.</p>
            ) : null}

            <div className="flex justify-end gap-2 pt-1">
              <Button type="button" variant="outline" className="rounded-xl" onClick={closePasswordDialog}>
                Cancel
              </Button>
              <Button type="submit" className="rounded-xl" disabled={!canSave}>
                {changePassword.isPending ? <Spinner className="size-4" /> : null}
                Update password
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
