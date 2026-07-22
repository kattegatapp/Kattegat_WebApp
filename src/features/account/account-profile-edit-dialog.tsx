"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Plus, Trash2, Upload } from "lucide-react";
import { useMemo, useRef, useState } from "react";

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
import { isCloudinaryConfigured, uploadImage } from "@/lib/cloudinary";
import { needsBusinessNameField } from "@/lib/auth/profile-completion";
import { INPUT_LIMITS } from "@/lib/security/input";
import {
  profileDetailsSchema,
  profileDetailsWithBusinessSchema,
  sellerSetupSchema,
} from "@/lib/validations/profile";

type ProfileMediaDraft = {
  id?: string;
  type: "photo" | "video_link";
  url: string;
  sortOrder: number;
};

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
            Update your account details. Seller display name, bio, tags, and portfolio appear on
            your public profile.
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
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const mediaInputRef = useRef<HTMLInputElement>(null);
  const { user, sellerProfile } = dashboard;
  const showBusinessName = needsBusinessNameField(user) && identity === "buyer";
  const isSeller = identity === "seller" && Boolean(user.sid);

  const [username, setUsername] = useState(user.username ?? "");
  const [phone, setPhone] = useState(user.phone ?? "");
  const [businessName, setBusinessName] = useState(user.businessName ?? "");
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl || sellerProfile?.avatarUrl || "");
  const [displayName, setDisplayName] = useState(sellerProfile?.displayName ?? "");
  const [bio, setBio] = useState(sellerProfile?.bio ?? "");
  const [tagsText, setTagsText] = useState((sellerProfile?.tags ?? []).join(", "));
  const [instagram, setInstagram] = useState(sellerProfile?.socialLinks?.instagram ?? "");
  const [website, setWebsite] = useState(sellerProfile?.socialLinks?.website ?? "");
  const [linkedin, setLinkedin] = useState(sellerProfile?.socialLinks?.linkedin ?? "");
  const [profileMedia, setProfileMedia] = useState<ProfileMediaDraft[]>(
    (sellerProfile?.profileMedia ?? []).map((item, index) => ({
      id: item.id,
      type: item.type,
      url: item.url,
      sortOrder: item.sortOrder ?? index,
    })),
  );
  const [uploading, setUploading] = useState<"avatar" | "media" | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const accountSchema = useMemo(
    () => (showBusinessName ? profileDetailsWithBusinessSchema : profileDetailsSchema),
    [showBusinessName],
  );

  async function handleAvatarFile(file: File | undefined) {
    if (!file) return;
    if (!isCloudinaryConfigured()) {
      setFormError("Photo uploads are not configured yet.");
      return;
    }
    setUploading("avatar");
    setFormError(null);
    try {
      // Same as mobile: upload, then PATCH /users/me so the backend can delete the previous
      // Cloudinary asset after the new URL is saved (see users.service updateMe).
      const uploaded = await uploadImage(file, `avatars/${user.id}`);
      await updateAccountProfile({ avatarUrl: uploaded.secureUrl });
      setAvatarUrl(uploaded.secureUrl);
      await client.invalidateQueries({ queryKey: ["account"] });
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Avatar upload failed.");
    } finally {
      setUploading(null);
    }
  }

  async function handleMediaFile(file: File | undefined) {
    if (!file) return;
    if (!isCloudinaryConfigured()) {
      setFormError("Photo uploads are not configured yet.");
      return;
    }
    if (profileMedia.length >= 12) {
      setFormError("You can add up to 12 portfolio photos.");
      return;
    }
    setUploading("media");
    setFormError(null);
    try {
      const uploaded = await uploadImage(file, `seller-portfolio/${user.id}`);
      setProfileMedia((current) => [
        ...current,
        { type: "photo", url: uploaded.secureUrl, sortOrder: current.length },
      ]);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Portfolio upload failed.");
    } finally {
      setUploading(null);
    }
  }

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
        avatarUrl: avatarUrl.trim() || undefined,
      });

      if (isSeller) {
        const sellerParsed = sellerSetupSchema.safeParse({
          displayName: displayName.trim(),
          bio: bio.trim() || undefined,
        });
        if (!sellerParsed.success) {
          throw new Error(sellerParsed.error.issues[0]?.message ?? "Check seller profile fields.");
        }

        const tags = tagsText
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean)
          .slice(0, 8);

        const socialLinks: Record<string, string> = {};
        if (instagram.trim()) socialLinks.instagram = instagram.trim();
        if (website.trim()) socialLinks.website = website.trim();
        if (linkedin.trim()) socialLinks.linkedin = linkedin.trim();

        await updateSellerProfile({
          displayName: sellerParsed.data.displayName,
          bio: sellerParsed.data.bio,
          tags,
          socialLinks,
          profileMedia: profileMedia.map((item, index) => ({
            id: item.id,
            type: item.type,
            url: item.url,
            sortOrder: index,
          })),
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
          <Label>Avatar</Label>
          <div className="flex items-center gap-3">
            {/* Avatar preview — remote Cloudinary URL; next/image not required here */}
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarUrl} alt="" className="size-14 rounded-full object-cover" />
            ) : (
              <div className="grid size-14 place-items-center rounded-full bg-brand-mantis/15 text-sm font-bold text-brand-forest">
                {(username || user.email).slice(0, 1).toUpperCase()}
              </div>
            )}
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(event) => void handleAvatarFile(event.target.files?.[0])}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={uploading !== null || saveMutation.isPending}
              onClick={() => avatarInputRef.current?.click()}
            >
              {uploading === "avatar" ? <Loader2 className="animate-spin" /> : <Upload className="size-4" />}
              Upload photo
            </Button>
          </div>
        </div>

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
            <div className="space-y-1.5">
              <Label htmlFor="profile-tags">Tags</Label>
              <Input
                id="profile-tags"
                value={tagsText}
                onChange={(event) => setTagsText(event.target.value)}
                placeholder="Piano, DJ, Photography"
              />
              <p className="text-[11px] text-muted-foreground">Comma-separated, up to 8 tags.</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-1">
              <div className="space-y-1.5">
                <Label htmlFor="profile-instagram">Instagram URL</Label>
                <Input
                  id="profile-instagram"
                  value={instagram}
                  onChange={(event) => setInstagram(event.target.value)}
                  placeholder="https://instagram.com/..."
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="profile-website">Website</Label>
                <Input
                  id="profile-website"
                  value={website}
                  onChange={(event) => setWebsite(event.target.value)}
                  placeholder="https://"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="profile-linkedin">LinkedIn URL</Label>
                <Input
                  id="profile-linkedin"
                  value={linkedin}
                  onChange={(event) => setLinkedin(event.target.value)}
                  placeholder="https://linkedin.com/in/..."
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <Label>Portfolio media</Label>
                <input
                  ref={mediaInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(event) => void handleMediaFile(event.target.files?.[0])}
                />
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={uploading !== null || saveMutation.isPending}
                  onClick={() => mediaInputRef.current?.click()}
                >
                  {uploading === "media" ? <Loader2 className="animate-spin" /> : <Plus className="size-4" />}
                  Add photo
                </Button>
              </div>
              {profileMedia.length ? (
                <div className="grid grid-cols-3 gap-2">
                  {profileMedia.map((item, index) => (
                    <div key={`${item.url}-${index}`} className="relative overflow-hidden rounded-lg border">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={item.url} alt="" className="aspect-square w-full object-cover" />
                      <button
                        type="button"
                        className="absolute top-1 right-1 rounded-md bg-white/90 p-1 text-red-600"
                        onClick={() =>
                          setProfileMedia((current) => current.filter((_, itemIndex) => itemIndex !== index))
                        }
                        aria-label="Remove photo"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[12px] text-muted-foreground">No portfolio photos yet.</p>
              )}
            </div>
          </>
        ) : null}

        {formError ? <p className="text-sm text-red-600">{formError}</p> : null}
      </div>

      <DialogFooter>
        <Button
          type="button"
          disabled={saveMutation.isPending || uploading !== null}
          onClick={() => saveMutation.mutate()}
        >
          {saveMutation.isPending ? <Loader2 className="animate-spin" /> : null}
          Save profile
        </Button>
      </DialogFooter>
    </>
  );
}
