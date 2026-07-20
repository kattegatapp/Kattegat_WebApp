"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Ban,
  Building2,
  CalendarDays,
  Inbox,
  Loader2,
  Mail,
  MessageCircle,
  Phone,
  RotateCcw,
  Save,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  UserRoundCog,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useAdminAccess } from "@/features/admin/access/require-capability";
import { formatAdminAccessError, USER_DELEGATE_ACCESS, USER_IMPERSONATE_ACCESS } from "@/lib/admin/capabilities";
import { LoginAsUserButton } from "@/features/admin/impersonation/login-as-user-button";
import { adminPath } from "@/lib/admin/paths";
import { ADMIN_ME_QUERY_OPTIONS } from "@/lib/admin/query";
import {
  fetchManagedUser,
  fetchManagedUsers,
  updateManagedUser,
  type AdminUserDetail,
  type AdminUserUpdate,
} from "@/lib/api/admin";
import { cn } from "@/lib/utils";

const label = (value: string) =>
  value.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
const tone = (status: string) =>
  cn(
    "border",
    status === "active"
      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
      : status === "banned"
        ? "border-red-200 bg-red-50 text-red-800"
        : "border-amber-200 bg-amber-50 text-amber-900",
  );

export function UsersManagementPage({
  initialSelectedId = null,
}: {
  initialSelectedId?: string | null;
}) {
  const client = useQueryClient();
  const access = useAdminAccess(["users.read"]);
  const canWrite = access.can(["users.write"]);
  const canChat = access.can(["chat.admin"]);
  const canDelegate = access.can([...USER_DELEGATE_ACCESS]);
  const canImpersonate = access.can([...USER_IMPERSONATE_ACCESS]);

  const [draft, setDraft] = useState("");
  const [q, setQ] = useState("");
  const [role, setRole] = useState("all");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(initialSelectedId);

  const users = useQuery({
    queryKey: ["admin", "users", q, role, status, page],
    queryFn: () => fetchManagedUsers(q, page, { role, status }),
    retry: false,
  });
  const me = useQuery({ ...ADMIN_ME_QUERY_OPTIONS });
  const detail = useQuery({
    queryKey: ["admin", "user", selectedId],
    queryFn: () => fetchManagedUser(selectedId!),
    enabled: Boolean(selectedId),
    retry: false,
  });
  const update = useMutation({
    mutationFn: ({ id, input }: { id: string; input: AdminUserUpdate }) =>
      updateManagedUser(id, input),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: ["admin", "users"] });
      void client.invalidateQueries({ queryKey: ["admin", "user", selectedId] });
    },
  });
  const filtered = Boolean(q || role !== "all" || status !== "all");

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900 sm:text-3xl">
            User accounts
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Review and manage account access, contact details, and buyer or seller profiles.
          </p>
        </div>
        <Badge variant="outline" className="bg-white">
          {users.data?.meta?.total ?? 0} users
        </Badge>
      </div>

      <Card className="bg-white">
        <CardContent className="space-y-4 p-4">
          <form
            className="flex flex-col gap-2 sm:flex-row"
            onSubmit={(event) => {
              event.preventDefault();
              setQ(draft.trim());
              setPage(1);
            }}
          >
            <div className="relative flex-1">
              <Label htmlFor="users-search" className="sr-only">
                Search users
              </Label>
              <Search
                className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
              <Input
                id="users-search"
                className="h-11 pl-9"
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder="Name, email, phone, BID or SID"
              />
            </div>
            <Button className="h-11 font-bold">
              <Search />
              Search users
            </Button>
          </form>
          <div className="flex flex-wrap items-center gap-2">
            <SlidersHorizontal className="size-4 text-muted-foreground" />
            <UserFilter
              value={role}
              onChange={(value) => {
                setRole(value);
                setPage(1);
              }}
              options={["all", "buyer", "seller"]}
              allLabel="All user types"
            />
            <UserFilter
              value={status}
              onChange={(value) => {
                setStatus(value);
                setPage(1);
              }}
              options={["all", "active", "pending_verification", "suspended", "banned", "deleted"]}
              allLabel="All statuses"
            />
            {filtered ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setDraft("");
                  setQ("");
                  setRole("all");
                  setStatus("all");
                  setPage(1);
                }}
              >
                <RotateCcw />
                Clear all
              </Button>
            ) : null}
          </div>
        </CardContent>
      </Card>

      {users.isPending ? (
        <Loading />
      ) : users.isError ? (
        <Alert className="ios-glass-pane rounded-2xl border-red-200/60 bg-red-50/35 text-red-950 backdrop-blur-xl">
          <XCircle />
          <AlertTitle>Could not load users</AlertTitle>
          <AlertDescription>
            {formatAdminAccessError(users.error, "Please try again shortly.")}
          </AlertDescription>
        </Alert>
      ) : !users.data?.data.length ? (
        <Empty filtered={filtered} />
      ) : (
        <Card className="overflow-hidden bg-white">
          <div className="admin-table-scroll">
            <Table className="min-w-[36rem]">
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Manage</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.data.data.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <p className="font-semibold text-brand-forest">
                        {user.businessName || user.username || user.email}
                      </p>
                      <p className="break-all text-xs text-muted-foreground">{user.email}</p>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {user.sid ? <Badge variant="outline">Seller</Badge> : null}
                        {user.bid ? <Badge variant="outline">Buyer</Badge> : null}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={tone(user.status)}>{label(user.status)}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-10 sm:h-8"
                        onClick={() => setSelectedId(user.id)}
                      >
                        <UserRoundCog />
                        Open account
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="flex justify-between gap-2 border-t p-3">
            <Button
              size="sm"
              variant="outline"
              className="h-10 min-w-20 sm:h-8"
              disabled={page === 1}
              onClick={() => setPage((value) => value - 1)}
            >
              Previous
            </Button>
            <span className="text-xs text-muted-foreground">Page {page}</span>
            <Button
              size="sm"
              variant="outline"
              className="h-10 min-w-20 sm:h-8"
              disabled={users.data.data.length < 20}
              onClick={() => setPage((value) => value + 1)}
            >
              Next
            </Button>
          </div>
        </Card>
      )}

      <Sheet open={Boolean(selectedId)} onOpenChange={(open) => !open && setSelectedId(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-2xl">
          <SheetHeader>
            <SheetTitle>Full account editor</SheetTitle>
            <SheetDescription>
              Protected IDs, authentication secrets, ratings, reviews, and financial history are
              read-only.
            </SheetDescription>
          </SheetHeader>
          {detail.isPending ? (
            <Loading />
          ) : detail.isError ? (
            <Card className="mx-4 border-red-200 bg-red-50">
              <CardContent className="p-4">
                <p className="font-bold text-red-800">User profile could not be opened</p>
                <p className="mt-1 text-sm text-red-700">
                  {formatAdminAccessError(detail.error, "Please try again.")}
                </p>
                <Button className="mt-4" variant="outline" onClick={() => detail.refetch()}>
                  Try again
                </Button>
              </CardContent>
            </Card>
          ) : detail.data ? (
            <AccountEditor
              key={`${detail.data.id}-${detail.data.status}-${detail.data.sellerProfile?.tier}`}
              user={detail.data}
              isSelf={detail.data.id === me.data?.id}
              pending={update.isPending}
              canWrite={canWrite}
              canChat={canChat}
              canDelegate={canDelegate}
              canImpersonate={canImpersonate}
              onSave={(input) => update.mutate({ id: detail.data!.id, input })}
              saveError={
                update.isError
                  ? formatAdminAccessError(update.error, "Could not save changes.")
                  : null
              }
            />
          ) : (
            <Card className="mx-4 border-amber-200 bg-amber-50">
              <CardContent className="p-4 text-sm text-amber-900">
                This user account is not available.
              </CardContent>
            </Card>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function AccountEditor({
  user,
  isSelf,
  pending,
  canWrite,
  canChat,
  canDelegate,
  canImpersonate,
  onSave,
  saveError,
}: {
  user: AdminUserDetail;
  isSelf: boolean;
  pending: boolean;
  canWrite: boolean;
  canChat: boolean;
  canDelegate: boolean;
  canImpersonate: boolean;
  onSave: (input: AdminUserUpdate) => void;
  saveError?: string | null;
}) {
  const [username, setUsername] = useState(user.username ?? "");
  const [phone, setPhone] = useState(user.phone ?? "");
  const [businessName, setBusinessName] = useState(user.businessName ?? "");
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl ?? "");
  const seller = user.sellerProfile;
  const [displayName, setDisplayName] = useState(seller?.displayName ?? "");
  const [bio, setBio] = useState(seller?.bio ?? "");
  const [slug, setSlug] = useState(seller?.customSlug ?? "");
  const [tier, setTier] = useState(seller?.tier ?? "starter");
  const [vat, setVat] = useState(seller?.vatRegistered ?? false);
  const [tags, setTags] = useState(seller?.tags.join(", ") ?? "");
  const [social, setSocial] = useState(JSON.stringify(seller?.socialLinks ?? {}, null, 2));

  function save() {
    if (!canWrite) return;
    let socialLinks: Record<string, string>;
    try {
      socialLinks = JSON.parse(social) as Record<string, string>;
    } catch {
      return;
    }
    onSave({
      username,
      phone,
      businessName,
      avatarUrl: avatarUrl || null,
      ...(seller && {
        sellerProfile: {
          displayName,
          bio: bio || null,
          customSlug: slug || null,
          tier,
          vatRegistered: vat,
          tags: tags.split(",").map((tag) => tag.trim()).filter(Boolean),
          socialLinks,
        },
      }),
    });
  }

  const profileName = businessName || displayName || username || user.email;
  const initials = profileName
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const joined = new Intl.DateTimeFormat("en-AE", { dateStyle: "medium" }).format(
    new Date(user.createdAt),
  );

  return (
    <div className="space-y-6 px-4 pb-8">
      <section className="overflow-hidden rounded-2xl border border-brand-forest/10 bg-white">
        <div className="h-24 bg-gradient-to-r from-brand-forest via-brand-forest/90 to-brand-blue" />
        <div className="bg-white px-5 pb-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <Avatar className="-mt-10 size-20 border-4 border-white bg-white shadow-md">
              <AvatarImage src={user.avatarUrl || undefined} alt={profileName} />
              <AvatarFallback className="bg-brand-mantis/20 text-xl font-extrabold text-brand-forest">
                {initials || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1 py-3 sm:py-2">
              <p className="text-[10px] font-bold tracking-[0.16em] text-muted-foreground uppercase">
                User profile
              </p>
              <h2 className="text-xl leading-tight font-extrabold break-words text-brand-forest">
                {profileName}
              </h2>
              <p className="mt-1 text-sm font-medium break-all text-slate-600">{user.email}</p>
            </div>
            <Badge className={cn("mb-3 sm:mb-2", tone(user.status))}>{label(user.status)}</Badge>
          </div>
          <div className="mt-2 grid gap-3 sm:grid-cols-2">
            <ProfileFact icon={<Mail />} label="Email address" value={user.email} />
            <ProfileFact icon={<Phone />} label="Phone number" value={user.phone || "Not provided"} />
            <ProfileFact
              icon={<Building2 />}
              label="Account type"
              value={
                user.sid
                  ? "Seller account"
                  : user.bid
                    ? "Buyer account"
                    : label(user.originalRole)
              }
            />
            <ProfileFact icon={<CalendarDays />} label="Joined Kattegat" value={joined} />
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {user.bid ? (
              <Badge variant="outline" className="bg-white">
                BID {user.bid}
              </Badge>
            ) : null}
            {user.sid ? (
              <Badge variant="outline" className="bg-white">
                SID {user.sid}
              </Badge>
            ) : null}
            {user.adminProfile ? (
              <Badge variant="outline" className="bg-white">
                Admin · {label(user.adminProfile.adminRole)}
              </Badge>
            ) : null}
          </div>
        </div>
      </section>

      {!canWrite ? (
        <section className="rounded-2xl border border-border bg-muted/40 p-4 text-sm text-muted-foreground">
          You can view this account, but you do not have permission to edit it.
        </section>
      ) : null}

      <fieldset disabled={!canWrite} className="space-y-6 disabled:opacity-70">
        <EditorSection title="Account profile">
          <Field label="Username" value={username} setValue={setUsername} />
          <Field label="Phone" value={phone} setValue={setPhone} />
          <Field label="Business name" value={businessName} setValue={setBusinessName} />
          <Field label="Avatar URL" value={avatarUrl} setValue={setAvatarUrl} wide />
        </EditorSection>
        {seller ? (
          <>
            <EditorSection title="Seller profile">
              <Field label="Display name" value={displayName} setValue={setDisplayName} />
              <Field label="Public profile slug" value={slug} setValue={setSlug} />
              <label className="space-y-1 text-sm font-semibold sm:col-span-2">
                Biography
                <Textarea
                  className="min-h-28"
                  value={bio}
                  onChange={(event) => setBio(event.target.value)}
                />
              </label>
              <Field label="Tags (comma separated)" value={tags} setValue={setTags} wide />
              <label className="space-y-1 text-sm font-semibold">
                Plan tier
                <Select value={tier} onValueChange={(value) => setTier(value ?? "starter")}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["starter", "pro", "white_glove"].map((value) => (
                      <SelectItem key={value} value={value}>
                        {label(value)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </label>
              <label className="flex items-center gap-2 self-end rounded-xl border p-3 text-sm font-semibold">
                <input
                  type="checkbox"
                  checked={vat}
                  onChange={(event) => setVat(event.target.checked)}
                />
                VAT registered
              </label>
              <label className="space-y-1 text-sm font-semibold sm:col-span-2">
                Social links (JSON)
                <Textarea
                  className="min-h-32 font-mono text-xs"
                  value={social}
                  onChange={(event) => setSocial(event.target.value)}
                />
              </label>
            </EditorSection>
            <div className="rounded-xl border p-3 text-sm text-muted-foreground">
              Computed data: rating {seller.aggregateRating} · {seller.reviewCount} reviews. These
              values are read-only.
            </div>
          </>
        ) : null}
      </fieldset>

      {canWrite ? (
        <Button className="w-full" disabled={pending} onClick={save}>
          {pending ? <Loader2 className="animate-spin" /> : <Save />}
          Save all profile changes
        </Button>
      ) : null}
      {saveError ? <p className="text-sm font-medium text-red-600">{saveError}</p> : null}

      {isSelf ? (
        <section className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <p className="font-bold text-amber-900">Your administrator account is protected</p>
          <p className="mt-1 text-sm text-amber-800">
            You cannot ban, suspend, delete, change status, or start a chat with the account you are
            currently using.
          </p>
        </section>
      ) : (
        <>
          {canWrite ? (
            <section className="rounded-2xl border p-4">
              <p className="font-bold text-brand-forest">Account access</p>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {user.status === "banned" ? (
                  <Button onClick={() => onSave({ status: "active" })}>
                    <ShieldCheck />
                    Remove ban
                  </Button>
                ) : (
                  <Button variant="destructive" onClick={() => onSave({ status: "banned" })}>
                    <Ban />
                    Ban user
                  </Button>
                )}
                {user.status === "suspended" ? (
                  <Button variant="outline" onClick={() => onSave({ status: "active" })}>
                    Reactivate
                  </Button>
                ) : (
                  <Button variant="outline" onClick={() => onSave({ status: "suspended" })}>
                    Suspend
                  </Button>
                )}
              </div>
            </section>
          ) : null}
          {canImpersonate && !isSelf ? (
            <LoginAsUserButton userId={user.id} />
          ) : null}
          {canDelegate && user.sid ? (
            <Button
              className="w-full font-bold"
              nativeButton={false}
              render={
                <Link href={adminPath(`/users/${encodeURIComponent(user.id)}/manage`)} />
              }
            >
              <UserRoundCog />
              Manage on behalf
            </Button>
          ) : null}
          {canChat ? (
            <Button
              className="w-full font-bold"
              variant="outline"
              nativeButton={false}
              render={<Link href={adminPath(`/users/${encodeURIComponent(user.id)}/chat`)} />}
            >
              <MessageCircle />
              Open chat screen
            </Button>
          ) : null}
        </>
      )}
    </div>
  );
}

function EditorSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="mb-3 font-bold text-brand-forest">{title}</h3>
      <div className="grid gap-4 sm:grid-cols-2">{children}</div>
    </section>
  );
}
function ProfileFact({
  icon,
  label: factLabel,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex min-w-0 items-center gap-3 rounded-xl border border-border/70 bg-muted/20 p-3">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-forest/5 text-brand-forest [&_svg]:size-4">
        {icon}
      </span>
      <span className="min-w-0">
        <span className="block text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
          {factLabel}
        </span>
        <span className="block text-sm font-semibold break-words text-brand-forest">{value}</span>
      </span>
    </div>
  );
}
function Field({
  label: fieldLabel,
  value,
  setValue,
  wide,
}: {
  label: string;
  value: string;
  setValue: (value: string) => void;
  wide?: boolean;
}) {
  return (
    <label className={cn("space-y-1 text-sm font-semibold", wide && "sm:col-span-2")}>
      {fieldLabel}
      <Input value={value} onChange={(event) => setValue(event.target.value)} />
    </label>
  );
}
function UserFilter({
  value,
  onChange,
  options,
  allLabel,
}: {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  allLabel: string;
}) {
  return (
    <Select value={value} onValueChange={(next) => onChange(next ?? "all")}>
      <SelectTrigger className="w-full min-w-0 sm:min-w-40 sm:w-auto">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option} value={option}>
            {option === "all" ? allLabel : label(option)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
function Loading() {
  return <div className="min-h-40" role="status" aria-live="polite" aria-busy="true"><span className="sr-only">Loading</span></div>;
}
function Empty({ filtered }: { filtered: boolean }) {
  return (
    <Card className="border-dashed">
      <CardContent className="flex min-h-56 flex-col items-center justify-center text-center">
        <Inbox className="mb-3 size-9 text-brand-forest" />
        <p className="font-bold text-brand-forest">
          {filtered ? "No users match these filters" : "No users yet"}
        </p>
      </CardContent>
    </Card>
  );
}
