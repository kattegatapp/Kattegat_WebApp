"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { KeyRound, Loader2, Save, Shield, UserRound } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

import {
  FieldBlock,
  SettingsGroup,
  SettingsLoading,
  SettingsPanel,
} from "@/features/admin/settings/form-shared";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ADMIN_LOGIN_PATH, adminPath } from "@/lib/admin/paths";
import { ApiRequestError } from "@/lib/api/client";
import {
  changeOwnAdminPassword,
  fetchAdminProfile,
  updateAdminProfile,
  type AdminProfile,
} from "@/lib/api/admin";
import { cn } from "@/lib/utils";

type AccountTab = "profile" | "security";

function isAccountTab(value: string | null): value is AccountTab {
  return value === "profile" || value === "security";
}

function initialsFrom(profile: AdminProfile) {
  const source = profile.businessName?.trim() || profile.username?.trim() || profile.email;
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase();
  }
  return source.slice(0, 2).toUpperCase();
}

export function AdminAccountPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  const fromQuery = searchParams.get("tab");
  const tab: AccountTab = isAccountTab(fromQuery) ? fromQuery : "profile";

  const profileQuery = useQuery({
    queryKey: ["admin", "profile"],
    queryFn: fetchAdminProfile,
    retry: false,
  });

  function onTabChange(value: string | number | null) {
    const next = String(value ?? "profile");
    if (!isAccountTab(next)) return;
    router.replace(`${adminPath("/account")}?tab=${next}`, { scroll: false });
  }

  if (profileQuery.isPending) {
    return <SettingsLoading />;
  }

  if (
    profileQuery.isError &&
    profileQuery.error instanceof ApiRequestError &&
    profileQuery.error.status === 401
  ) {
    return (
      <div className="mx-auto max-w-xl space-y-4">
        <Alert className="border-red-200 bg-red-50 text-red-800">
          <Shield />
          <AlertTitle>Please sign in again</AlertTitle>
          <AlertDescription>We could not load your account.</AlertDescription>
        </Alert>
        <Button onClick={() => router.replace(ADMIN_LOGIN_PATH)}>Back to login</Button>
      </div>
    );
  }

  if (profileQuery.isError || !profileQuery.data) {
    return (
      <div className="mx-auto max-w-xl space-y-4">
        <Alert className="border-red-200 bg-red-50 text-red-800">
          <UserRound />
          <AlertTitle>Could not load profile</AlertTitle>
          <AlertDescription>
            {profileQuery.error instanceof Error
              ? profileQuery.error.message
              : "Please try again."}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const profile = profileQuery.data;
  const displayName =
    profile.businessName?.trim() || profile.username?.trim() || profile.email;

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-extrabold tracking-tight text-brand-forest sm:text-3xl">
          Account
        </h1>
        <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
          Manage your profile details and sign-in password for this console.
        </p>
      </div>

      <div className="flex items-center gap-4 rounded-2xl border border-border/80 bg-white p-4 shadow-sm sm:p-5">
        <Avatar className="size-14 rounded-2xl">
          {profile.avatarUrl ? <AvatarImage src={profile.avatarUrl} alt="" /> : null}
          <AvatarFallback className="rounded-2xl bg-brand-forest text-base font-semibold text-white">
            {initialsFrom(profile)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="truncate text-base font-bold text-brand-forest">{displayName}</p>
            <Badge variant="outline" className="border-brand-forest/15 bg-brand-forest/5 text-brand-forest">
              Admin
            </Badge>
          </div>
          <p className="truncate text-sm text-muted-foreground">{profile.email}</p>
          {profile.phone ? (
            <p className="truncate text-sm text-muted-foreground">{profile.phone}</p>
          ) : null}
        </div>
      </div>

      <Tabs value={tab} onValueChange={onTabChange} className="gap-5">
        <div className="overflow-x-auto pb-1">
          <TabsList className="flex h-12 w-full min-w-max items-stretch justify-start gap-1 rounded-full border border-border/70 bg-white p-1 shadow-sm sm:min-w-0">
            <TabsTrigger
              value="profile"
              className={cn(
                "h-full flex-1 rounded-full border-transparent px-4",
                tab === "profile"
                  ? "bg-brand-forest text-white data-active:bg-brand-forest data-active:text-white"
                  : "text-muted-foreground hover:bg-muted",
              )}
            >
              <UserRound className="size-3.5" />
              Profile
            </TabsTrigger>
            <TabsTrigger
              value="security"
              className={cn(
                "h-full flex-1 rounded-full border-transparent px-4",
                tab === "security"
                  ? "bg-brand-forest text-white data-active:bg-brand-forest data-active:text-white"
                  : "text-muted-foreground hover:bg-muted",
              )}
            >
              <KeyRound className="size-3.5" />
              Password
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="profile" className="outline-none">
          <ProfileForm
            key={`${profile.id}-${profileQuery.dataUpdatedAt}`}
            profile={profile}
            onSaved={async () => {
              await queryClient.invalidateQueries({ queryKey: ["admin", "me"] });
              await queryClient.invalidateQueries({ queryKey: ["admin", "profile"] });
            }}
          />
        </TabsContent>

        <TabsContent value="security" className="outline-none" id="password">
          <PasswordForm />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ProfileForm({
  profile,
  onSaved,
}: {
  profile: AdminProfile;
  onSaved: () => Promise<void>;
}) {
  const [businessName, setBusinessName] = useState(profile.businessName ?? "");
  const [username, setUsername] = useState(profile.username ?? "");
  const [phone, setPhone] = useState(profile.phone ?? "");

  const mutation = useMutation({
    mutationFn: updateAdminProfile,
    onSuccess: async () => {
      await onSaved();
    },
  });

  const usernameInvalid = username.trim().length > 0 && username.trim().length < 3;

  return (
    <form
      className="space-y-5"
      onSubmit={(event) => {
        event.preventDefault();
        if (usernameInvalid) return;
        mutation.mutate({
          businessName: businessName.trim(),
          ...(username.trim().length >= 3 ? { username: username.trim() } : {}),
          phone: phone.trim(),
        });
      }}
    >
      <SettingsPanel
        title="Profile details"
        description="How you appear in the ops console. Email stays tied to your sign-in."
      >
        <SettingsGroup
          title="Identity"
          description="Name and username shown in the header menu."
        >
          <FieldBlock label="Full name" hint="Shown in the account menu.">
            <Input
              value={businessName}
              onChange={(event) => setBusinessName(event.target.value)}
              placeholder="Your name"
              autoComplete="name"
              className="h-10 rounded-xl"
            />
          </FieldBlock>
          <FieldBlock
            label="Username"
            hint={
              usernameInvalid
                ? "Must be at least 3 characters."
                : "Optional public handle, min 3 characters."
            }
          >
            <Input
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="e.g. kayzar"
              autoComplete="username"
              aria-invalid={usernameInvalid || undefined}
              className="h-10 rounded-xl"
            />
          </FieldBlock>
        </SettingsGroup>

        <SettingsGroup title="Contact" description="How the team can reach you.">
          <FieldBlock label="Phone number" hint="Include country code when possible.">
            <Input
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="+971 50 000 0000"
              autoComplete="tel"
              inputMode="tel"
              className="h-10 rounded-xl"
            />
          </FieldBlock>
          <FieldBlock label="Email" hint="Managed by your login — not editable here.">
            <Input
              value={profile.email}
              disabled
              readOnly
              className="h-10 rounded-xl bg-muted/50"
            />
          </FieldBlock>
        </SettingsGroup>
      </SettingsPanel>

      <FormSaveBar
        isPending={mutation.isPending}
        isSuccess={mutation.isSuccess}
        isError={mutation.isError}
        errorMessage={
          mutation.error instanceof Error ? mutation.error.message : undefined
        }
        disabled={usernameInvalid}
        label="Save profile"
      />
    </form>
  );
}

function PasswordForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const mutation = useMutation({
    mutationFn: changeOwnAdminPassword,
    onSuccess: () => {
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    },
  });

  const mismatch = confirmPassword.length > 0 && newPassword !== confirmPassword;
  const tooShort = newPassword.length > 0 && newPassword.length < 8;
  const canSave =
    currentPassword.length > 0 &&
    newPassword.length >= 8 &&
    !mismatch &&
    newPassword === confirmPassword;

  return (
    <form
      className="space-y-5"
      onSubmit={(event) => {
        event.preventDefault();
        if (!canSave) return;
        mutation.mutate({ currentPassword, newPassword });
      }}
    >
      <SettingsPanel
        title="Password"
        description="Choose a strong password you only use for this console."
      >
        <SettingsGroup
          title="Current access"
          description="Confirm it’s you before setting a new password."
        >
          <FieldBlock label="Current password" className="sm:col-span-2">
            <Input
              type="password"
              required
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
              autoComplete="current-password"
              className="h-10 rounded-xl"
            />
          </FieldBlock>
        </SettingsGroup>

        <SettingsGroup
          title="New password"
          description="At least 8 characters. You’ll use this next time you sign in."
        >
          <FieldBlock
            label="New password"
            hint={tooShort ? "Use at least 8 characters." : "Minimum 8 characters."}
          >
            <Input
              type="password"
              required
              minLength={8}
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              autoComplete="new-password"
              aria-invalid={tooShort || undefined}
              className="h-10 rounded-xl"
            />
          </FieldBlock>
          <FieldBlock
            label="Confirm new password"
            hint={mismatch ? "Passwords do not match." : undefined}
          >
            <Input
              type="password"
              required
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              autoComplete="new-password"
              aria-invalid={mismatch || undefined}
              className="h-10 rounded-xl"
            />
          </FieldBlock>
        </SettingsGroup>
      </SettingsPanel>

      <FormSaveBar
        isPending={mutation.isPending}
        isSuccess={mutation.isSuccess}
        isError={mutation.isError}
        errorMessage={
          mutation.error instanceof Error ? mutation.error.message : undefined
        }
        disabled={!canSave}
        label="Update password"
        successLabel="Password updated."
        idleLabel="Enter your current and new password to continue."
        icon={<KeyRound />}
      />
    </form>
  );
}

function FormSaveBar({
  isPending,
  isSuccess,
  isError,
  errorMessage,
  disabled,
  label,
  successLabel = "Saved successfully.",
  idleLabel = "Changes apply when you save.",
  icon,
}: {
  isPending: boolean;
  isSuccess: boolean;
  isError: boolean;
  errorMessage?: string;
  disabled?: boolean;
  label: string;
  successLabel?: string;
  idleLabel?: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="sticky bottom-0 z-10 -mx-1 mt-2 border-t border-border/80 bg-background/95 px-1 py-4 backdrop-blur">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-h-5 text-sm">
          {isSuccess ? <span className="text-emerald-700">{successLabel}</span> : null}
          {isError ? (
            <span className="text-red-600">{errorMessage ?? "Could not save. Try again."}</span>
          ) : null}
          {!isSuccess && !isError ? (
            <span className="text-muted-foreground">{idleLabel}</span>
          ) : null}
        </div>
        <Button
          type="submit"
          disabled={isPending || disabled}
          className="h-10 rounded-xl px-5 sm:min-w-40"
        >
          {isPending ? <Loader2 className="animate-spin" /> : (icon ?? <Save />)}
          {label}
        </Button>
      </div>
    </div>
  );
}
