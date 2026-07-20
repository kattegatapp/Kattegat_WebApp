"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Loader2, Plus, Send, UserRoundCog } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { LoginAsUserButton } from "@/features/admin/impersonation/login-as-user-button";
import { formatAdminAccessError, USER_IMPERSONATE_ACCESS } from "@/lib/admin/capabilities";
import { useAdminAccess } from "@/features/admin/access/require-capability";
import { adminPath } from "@/lib/admin/paths";
import {
  createDelegatedListing,
  fetchDelegatedListings,
  startDelegateSession,
  submitDelegatedListing,
  updateDelegatedAccount,
  type DelegateListingInput,
} from "@/lib/api/admin/delegation";
import type { AdminUserDetail } from "@/lib/api/admin/growth";
import { getCatalogCategories, getCatalogSubcategories } from "@/lib/api/marketing";
import { cn } from "@/lib/utils";

const label = (value: string) =>
  value.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());

export function UserDelegateManagePage({ userId }: { userId: string }) {
  const client = useQueryClient();
  const access = useAdminAccess([...USER_IMPERSONATE_ACCESS]);
  const canImpersonate = access.can([...USER_IMPERSONATE_ACCESS]);
  const session = useQuery({
    queryKey: ["admin", "delegate-session", userId],
    queryFn: () => startDelegateSession(userId),
    retry: false,
  });

  const listings = useQuery({
    queryKey: ["admin", "delegate-listings", userId],
    queryFn: () => fetchDelegatedListings(userId),
    enabled: session.isSuccess,
    retry: false,
  });

  const categories = useQuery({
    queryKey: ["catalog", "categories"],
    queryFn: getCatalogCategories,
    staleTime: 300_000,
  });

  const user = session.data?.user;
  const seller = user?.sellerProfile;

  const [categoryId, setCategoryId] = useState("");
  const [subcategoryId, setSubcategoryId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");

  const subcategories = useQuery({
    queryKey: ["catalog", "subcategories", categoryId],
    queryFn: () => getCatalogSubcategories(categoryId),
    enabled: Boolean(categoryId),
    staleTime: 300_000,
  });

  const createListing = useMutation({
    mutationFn: () => {
      const input: DelegateListingInput = {
        categoryId,
        subcategoryId,
        title: title.trim(),
        description: description.trim() || undefined,
        location: location.trim() || undefined,
      };
      return createDelegatedListing(userId, input);
    },
    onSuccess: async () => {
      setTitle("");
      setDescription("");
      setLocation("");
      await client.invalidateQueries({ queryKey: ["admin", "delegate-listings", userId] });
    },
  });

  const submitListing = useMutation({
    mutationFn: (listingId: string) => submitDelegatedListing(userId, listingId),
    onSuccess: async () => {
      await client.invalidateQueries({ queryKey: ["admin", "delegate-listings", userId] });
    },
  });

  if (session.isPending) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-muted-foreground">
        <Loader2 className="size-6 animate-spin" />
      </div>
    );
  }

  if (session.isError || !session.data?.eligibility.eligible || !user) {
    return (
      <div className="mx-auto max-w-2xl space-y-4">
        <Button variant="outline" nativeButton={false} render={<Link href={adminPath("/users")} />}>
          <ArrowLeft />
          Back to users
        </Button>
        <Alert variant="destructive">
          <AlertTitle>Cannot manage this account on behalf</AlertTitle>
          <AlertDescription>
            {formatAdminAccessError(
              session.error,
              "Only accepted White Glove / vetted sellers can be managed on behalf.",
            )}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const displayLabel =
    user.businessName ||
    seller?.displayName ||
    user.username ||
    user.email;

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 pb-10">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Button
            variant="ghost"
            size="sm"
            className="mb-2 -ml-2"
            nativeButton={false}
            render={<Link href={adminPath("/users")} />}
          >
            <ArrowLeft />
            Users
          </Button>
          <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900 sm:text-3xl">
            Manage on behalf
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            You are acting as this seller&apos;s agent — changes are audited and attributed to your
            staff account, not a password login into their account.
          </p>
        </div>
        <Badge className="border-brand-mantis/30 bg-brand-mantis/15 font-bold text-brand-forest">
          <UserRoundCog className="mr-1 size-3.5" />
          {displayLabel}
        </Badge>
      </div>

      <Alert className="border-brand-blue/20 bg-brand-blue/5">
        <AlertTitle className="text-brand-forest">Acting for {displayLabel}</AlertTitle>
        <AlertDescription className="space-y-3">
          <p>
            SID {user.sid ?? "—"} · {label(session.data.eligibility.tier ?? "seller")} · Use admin
            tools below, or sign in as this member for billing/plan pages.
          </p>
          {canImpersonate ? <LoginAsUserButton userId={user.id} /> : null}
        </AlertDescription>
      </Alert>

      <div className="grid gap-6 lg:grid-cols-2">
        <AccountOnBehalfForm key={user.id} user={user} userId={userId} seller={seller ?? null} />

        <Card>
          <CardHeader>
            <CardTitle>Create listing</CardTitle>
            <CardDescription>New listing owned by this seller (starts as draft).</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label>Category</Label>
              <Select
                value={categoryId}
                onValueChange={(value) => {
                  if (!value) return;
                  setCategoryId(value);
                  setSubcategoryId("");
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {(categories.data ?? []).map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Subcategory</Label>
              <Select value={subcategoryId} onValueChange={(value) => value && setSubcategoryId(value)} disabled={!categoryId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select subcategory" />
                </SelectTrigger>
                <SelectContent>
                  {(subcategories.data ?? []).map((sub) => (
                    <SelectItem key={sub.id} value={sub.id}>
                      {sub.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Field label="Title" value={title} onChange={setTitle} />
            <Field label="Location" value={location} onChange={setLocation} />
            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                Description
              </Label>
              <Textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                rows={3}
              />
            </div>
            <Button
              className="w-full font-bold"
              disabled={
                createListing.isPending || !categoryId || !subcategoryId || title.trim().length < 3
              }
              onClick={() => createListing.mutate()}
            >
              {createListing.isPending ? (
                <Loader2 className="animate-spin" />
              ) : (
                <Plus />
              )}
              Create listing on behalf
            </Button>
            {createListing.isError ? (
              <p className="text-sm text-red-600">
                {formatAdminAccessError(createListing.error, "Could not create listing.")}
              </p>
            ) : null}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Seller listings</CardTitle>
          <CardDescription>Draft and live listings for this account.</CardDescription>
        </CardHeader>
        <CardContent>
          {listings.isPending ? (
            <div className="flex justify-center py-8">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          ) : listings.isError ? (
            <p className="text-sm text-red-600">
              {formatAdminAccessError(listings.error, "Could not load listings.")}
            </p>
          ) : !listings.data?.length ? (
            <p className="text-sm text-muted-foreground">No listings yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {listings.data.map((listing) => (
                  <TableRow key={listing.id}>
                    <TableCell className="font-semibold">{listing.title}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={statusTone(listing.status)}>
                        {label(listing.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {listing.status === "draft" || listing.status === "rejected" ? (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={submitListing.isPending}
                          onClick={() => submitListing.mutate(listing.id)}
                        >
                          <Send className="size-3.5" />
                          Submit for review
                        </Button>
                      ) : null}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function AccountOnBehalfForm({
  user,
  userId,
  seller,
}: {
  user: AdminUserDetail;
  userId: string;
  seller: AdminUserDetail["sellerProfile"];
}) {
  const client = useQueryClient();
  const [username, setUsername] = useState(user.username ?? "");
  const [phone, setPhone] = useState(user.phone ?? "");
  const [businessName, setBusinessName] = useState(user.businessName ?? "");
  const [displayName, setDisplayName] = useState(seller?.displayName ?? "");
  const [bio, setBio] = useState(seller?.bio ?? "");

  const saveAccount = useMutation({
    mutationFn: () =>
      updateDelegatedAccount(userId, {
        username: username.trim() || undefined,
        phone: phone.trim() || undefined,
        businessName: businessName.trim() || undefined,
        sellerProfile: seller
          ? {
              displayName: displayName.trim() || undefined,
              bio: bio.trim() || undefined,
            }
          : undefined,
      }),
    onSuccess: async () => {
      await client.invalidateQueries({ queryKey: ["admin", "delegate-session", userId] });
      await client.invalidateQueries({ queryKey: ["admin", "user", userId] });
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Account &amp; profile</CardTitle>
        <CardDescription>Contact and public seller details for this member.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Field label="Username" value={username} onChange={setUsername} />
        <Field label="Phone" value={phone} onChange={setPhone} />
        <Field label="Business name" value={businessName} onChange={setBusinessName} />
        {seller ? (
          <>
            <Field label="Display name" value={displayName} onChange={setDisplayName} />
            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Bio</Label>
              <Textarea value={bio} onChange={(event) => setBio(event.target.value)} rows={4} />
            </div>
          </>
        ) : null}
        <Button
          className="w-full font-bold"
          disabled={saveAccount.isPending}
          onClick={() => saveAccount.mutate()}
        >
          {saveAccount.isPending ? <Loader2 className="animate-spin" /> : null}
          Save profile on behalf
        </Button>
        {saveAccount.isError ? (
          <p className="text-sm text-red-600">
            {formatAdminAccessError(saveAccount.error, "Could not save profile.")}
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}

function Field({
  label: fieldLabel,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-bold uppercase tracking-wider text-zinc-500">{fieldLabel}</Label>
      <Input value={value} onChange={(event) => onChange(event.target.value)} />
    </div>
  );
}

function statusTone(status: string) {
  return cn(
    status === "live"
      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
      : status === "pending_review"
        ? "border-blue-200 bg-blue-50 text-blue-800"
        : "border-amber-200 bg-amber-50 text-amber-900",
  );
}
