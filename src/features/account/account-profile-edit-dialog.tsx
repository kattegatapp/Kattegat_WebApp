"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { AccountDashboard } from "@/lib/api/account";
import { updateAccountProfile, updateSellerProfile } from "@/lib/api/account-actions";
import { ApiRequestError } from "@/lib/api/client";
import { needsBusinessNameField } from "@/lib/auth/profile-completion";
import { INPUT_LIMITS } from "@/lib/security/input";
import {
  profileDetailsSchema,
  profileDetailsWithBusinessSchema,
  sellerSetupSchema,
} from "@/lib/validations/profile";

export function AccountProfileEditDialog({
  open,
  onOpenChange,
  dashboard,
  identity,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dashboard: AccountDashboard;
  identity: "buyer" | "seller";
}) {
  const formKey = open
    ? `${dashboard.user.id}-${identity}-${dashboard.user.username ?? "user"}`
    : "closed";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit profile</DialogTitle>
          <DialogDescription>
            Update your account details. Seller display name and bio appear on your public profile.
          </DialogDescription>
        </DialogHeader>

        {open ? (
          <AccountProfileEditForm
            key={formKey}
            dashboard={dashboard}
            identity={identity}
            onClose={() => onOpenChange(false)}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function AccountProfileEditForm({
  dashboard,
  identity,
  onClose,
}: {
  dashboard: AccountDashboard;
  identity: "buyer" | "seller";
  onClose: () => void;
}) {
  const client = useQueryClient();
  const { user, sellerProfile } = dashboard;
  const showBusinessName = needsBusinessNameField(user) && identity === "buyer";
  const isSeller = identity === "seller" && Boolean(user.sid);

  const [username, setUsername] = useState(user.username ?? "");
  const [phone, setPhone] = useState(user.phone ?? "");
  const [businessName, setBusinessName] = useState(user.businessName ?? "");
  const [displayName, setDisplayName] = useState(sellerProfile?.displayName ?? "");
  const [bio, setBio] = useState(sellerProfile?.bio ?? "");
  const [formError, setFormError] = useState<string | null>(null);

  const accountSchema = useMemo(
    () => (showBusinessName ? profileDetailsWithBusinessSchema : profileDetailsSchema),
    [showBusinessName],
  );

  const saveMutation = useMutation({
    mutationFn: async () => {
      setFormError(null);
      const accountParsed = accountSchema.safeParse({
        username: username.trim(),
        phone: phone.trim() || undefined,
        businessName: businessName.trim() || undefined,
      });
      if (!accountParsed.success) {
        throw new Error(accountParsed.error.issues[0]?.message ?? "Check account fields.");
      }

      await updateAccountProfile({
        username: accountParsed.data.username,
        phone: accountParsed.data.phone,
        businessName: showBusinessName ? accountParsed.data.businessName : undefined,
      });

      if (isSeller) {
        const sellerParsed = sellerSetupSchema.safeParse({
          displayName: displayName.trim(),
          bio: bio.trim() || undefined,
        });
        if (!sellerParsed.success) {
          throw new Error(sellerParsed.error.issues[0]?.message ?? "Check seller profile fields.");
        }
        await updateSellerProfile({
          displayName: sellerParsed.data.displayName,
          bio: sellerParsed.data.bio,
        });
      }
    },
    onSuccess: async () => {
      await client.invalidateQueries({ queryKey: ["account"] });
      onClose();
      window.location.reload();
    },
    onError: (error) => {
      setFormError(
        error instanceof ApiRequestError
          ? error.message
          : error instanceof Error
            ? error.message
            : "Could not save profile.",
      );
    },
  });

  return (
    <>
      <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="profile-email">Email</Label>
            <Input id="profile-email" value={user.email} disabled className="bg-muted/40" />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="profile-username">Username</Label>
            <Input
              id="profile-username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              maxLength={INPUT_LIMITS.username}
              autoComplete="username"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="profile-phone">Phone</Label>
            <Input
              id="profile-phone"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              maxLength={INPUT_LIMITS.phone}
              autoComplete="tel"
              placeholder="+971 50 000 0000"
            />
          </div>

          {showBusinessName ? (
            <div className="space-y-1.5">
              <Label htmlFor="profile-business">Business name</Label>
              <Input
                id="profile-business"
                value={businessName}
                onChange={(event) => setBusinessName(event.target.value)}
                maxLength={INPUT_LIMITS.businessName}
              />
            </div>
          ) : null}

          {isSeller ? (
            <>
              <div className="space-y-1.5">
                <Label htmlFor="profile-display-name">Display name</Label>
                <Input
                  id="profile-display-name"
                  value={displayName}
                  onChange={(event) => setDisplayName(event.target.value)}
                  maxLength={INPUT_LIMITS.displayName}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="profile-bio">Bio</Label>
                <Textarea
                  id="profile-bio"
                  value={bio}
                  onChange={(event) => setBio(event.target.value)}
                  rows={4}
                  maxLength={2000}
                  placeholder="Tell buyers about your services and experience"
                />
              </div>
            </>
          ) : null}

          {formError ? <p className="text-sm text-red-600">{formError}</p> : null}
        </div>

        <DialogFooter>
          <Button type="button" disabled={saveMutation.isPending} onClick={() => saveMutation.mutate()}>
            {saveMutation.isPending ? <Loader2 className="animate-spin" /> : null}
            Save profile
          </Button>
        </DialogFooter>
    </>
  );
}
