"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ChevronDown,
  KeyRound,
  Loader2,
  Plus,
  Shield,
  UserPlus,
  UserRound,
  UserX,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { ADMIN_LOGIN_PATH } from "@/lib/admin/paths";
import {
  createAdminStaff,
  deactivateAdminStaff,
  fetchAdminMe,
  fetchAdminRoleCatalog,
  fetchAdminStaff,
  resetAdminStaffPassword,
  updateAdminRolePermissions,
  updateAdminStaffRole,
  type AdminAssignableCapability,
  type AdminRole,
  type AdminRoleCatalog,
  type AdminRoleCatalogItem,
  type AdminStaffMember,
} from "@/lib/api/admin";
import { ApiRequestError } from "@/lib/api/client";
import { cn } from "@/lib/utils";

const ROLE_ORDER: AdminRole[] = ["super_admin", "admin", "ops_agent", "finance", "moderator"];

/** Short, everyday names — avoid jargon. */
const ROLE_FRIENDLY: Record<
  AdminRole,
  { title: string; blurb: string; tone: string }
> = {
  super_admin: {
    title: "Owner",
    blurb: "Can do everything, including adding or removing people.",
    tone: "bg-brand-forest text-white",
  },
  admin: {
    title: "Manager",
    blurb: "Runs day-to-day work. Cannot add or remove staff.",
    tone: "bg-brand-blue text-white",
  },
  ops_agent: {
    title: "Operations",
    blurb: "Checks listings, users, and support queues.",
    tone: "bg-brand-emerald/90 text-brand-forest",
  },
  finance: {
    title: "Finance",
    blurb: "Looks after plans, pricing, and commercial settings.",
    tone: "bg-amber-100 text-amber-950",
  },
  moderator: {
    title: "Reviewer",
    blurb: "Reviews content and trust & safety items.",
    tone: "bg-violet-100 text-violet-950",
  },
};

function normalizeRoleCatalog(data: AdminRoleCatalog | AdminRoleCatalogItem[] | undefined): {
  roles: AdminRoleCatalogItem[];
  assignableCapabilities: AdminAssignableCapability[];
} {
  if (!data) return { roles: [], assignableCapabilities: [] };
  if (Array.isArray(data)) {
    return {
      roles: data.map((role) => ({
        ...role,
        editable: role.editable ?? role.role !== "super_admin",
        permissionKeys: role.permissionKeys ?? [],
      })),
      assignableCapabilities: [],
    };
  }
  return {
    roles: data.roles ?? [],
    assignableCapabilities: data.assignableCapabilities ?? [],
  };
}

function initialsFromEmail(email: string) {
  const local = email.split("@")[0] ?? "A";
  return local.slice(0, 2).toUpperCase();
}

function PermissionPicks({
  options,
  selected,
  onChange,
  disabled = false,
}: {
  options: AdminAssignableCapability[];
  selected: string[];
  onChange: (next: string[]) => void;
  disabled?: boolean;
}) {
  if (!options.length) return null;

  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {options.map((option) => {
        const checked = selected.includes(option.key);
        return (
          <button
            key={option.key}
            type="button"
            disabled={disabled}
            onClick={() => {
              if (checked) onChange(selected.filter((key) => key !== option.key));
              else onChange([...selected, option.key]);
            }}
            className={cn(
              "rounded-xl border px-3 py-3 text-left transition-colors",
              checked
                ? "border-brand-mantis bg-brand-mantis/15 shadow-sm"
                : "border-border bg-white hover:bg-muted/50",
              disabled && "opacity-60",
            )}
          >
            <div className="flex items-start gap-3">
              <span
                className={cn(
                  "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-md border text-[11px] font-bold",
                  checked
                    ? "border-brand-forest bg-brand-forest text-white"
                    : "border-border bg-muted text-transparent",
                )}
              >
                ✓
              </span>
              <span>
                <span className="block text-sm font-semibold text-brand-forest">
                  {option.label}
                </span>
                <span className="mt-0.5 block text-xs leading-5 text-muted-foreground">
                  {option.description}
                </span>
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}

function RolePicker({
  value,
  onChange,
  roles,
}: {
  value: AdminRole;
  onChange: (role: AdminRole) => void;
  roles: AdminRole[];
}) {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {roles.map((role) => {
        const meta = ROLE_FRIENDLY[role];
        const selected = value === role;
        return (
          <button
            key={role}
            type="button"
            onClick={() => onChange(role)}
            className={cn(
              "rounded-2xl border p-4 text-left transition-all",
              selected
                ? "border-brand-forest bg-brand-forest/5 ring-2 ring-brand-forest/20"
                : "border-border bg-white hover:border-brand-forest/30",
            )}
          >
            <Badge className={cn("mb-2 border-0", meta.tone)}>{meta.title}</Badge>
            <p className="text-sm leading-5 text-muted-foreground">{meta.blurb}</p>
          </button>
        );
      })}
    </div>
  );
}

export function AdminTeamPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteStep, setInviteStep] = useState<1 | 2 | 3>(1);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [adminRole, setAdminRole] = useState<AdminRole>("ops_agent");
  const [extraCapabilities, setExtraCapabilities] = useState<string[]>([]);

  const [resetTarget, setResetTarget] = useState<AdminStaffMember | null>(null);
  const [removeTarget, setRemoveTarget] = useState<AdminStaffMember | null>(null);
  const [resetPassword, setResetPassword] = useState("");
  const [editMember, setEditMember] = useState<AdminStaffMember | null>(null);
  const [editRole, setEditRole] = useState<AdminRole>("ops_agent");
  const [editExtras, setEditExtras] = useState<string[]>([]);
  const [roleDraftOverrides, setRoleDraftOverrides] = useState<Record<string, string[]>>({});
  const [advancedOpen, setAdvancedOpen] = useState(false);

  const meQuery = useQuery({ queryKey: ["admin", "me"], queryFn: fetchAdminMe, retry: false });
  const staffQuery = useQuery({
    queryKey: ["admin", "staff"],
    queryFn: fetchAdminStaff,
    retry: false,
  });
  const rolesQuery = useQuery({
    queryKey: ["admin", "staff", "roles"],
    queryFn: fetchAdminRoleCatalog,
    retry: false,
  });

  const catalog = useMemo(
    () =>
      normalizeRoleCatalog(
        rolesQuery.data as AdminRoleCatalog | AdminRoleCatalogItem[] | undefined,
      ),
    [rolesQuery.data],
  );

  function roleDraftFor(role: AdminRoleCatalogItem) {
    return roleDraftOverrides[role.role] ?? role.permissionKeys;
  }

  /** Extras are only powers the chosen job type does not already include. */
  function assignableBeyondRole(role: AdminRole) {
    if (role === "super_admin") return [] as AdminAssignableCapability[];
    const roleRow = catalog.roles.find((item) => item.role === role);
    const held = new Set(roleRow ? roleDraftFor(roleRow) : []);
    return assignable.filter((option) => !held.has(option.key));
  }

  function pruneExtrasToRole(role: AdminRole, extras: string[]) {
    const allowed = new Set(assignableBeyondRole(role).map((option) => option.key));
    return extras.filter((key) => allowed.has(key));
  }

  function resetInvite() {
    setInviteStep(1);
    setEmail("");
    setPassword("");
    setAdminRole("ops_agent");
    setExtraCapabilities([]);
  }

  const createMutation = useMutation({
    mutationFn: createAdminStaff,
    onSuccess: async () => {
      setInviteOpen(false);
      resetInvite();
      await queryClient.invalidateQueries({ queryKey: ["admin", "staff"] });
    },
  });

  const roleMutation = useMutation({
    mutationFn: ({
      userId,
      adminRole: nextRole,
      extraCapabilities: extras,
    }: {
      userId: string;
      adminRole: AdminRole;
      extraCapabilities?: string[];
    }) => updateAdminStaffRole(userId, { adminRole: nextRole, extraCapabilities: extras }),
    onSuccess: async () => {
      setEditMember(null);
      await queryClient.invalidateQueries({ queryKey: ["admin", "staff"] });
    },
  });

  const rolePermsMutation = useMutation({
    mutationFn: ({ role, capabilities }: { role: AdminRole; capabilities: string[] }) =>
      updateAdminRolePermissions(role, capabilities),
    onSuccess: async (_data, variables) => {
      setRoleDraftOverrides((current) => {
        const next = { ...current };
        delete next[variables.role];
        return next;
      });
      await queryClient.invalidateQueries({ queryKey: ["admin", "staff", "roles"] });
    },
  });

  const resetMutation = useMutation({
    mutationFn: ({ userId, password: next }: { userId: string; password: string }) =>
      resetAdminStaffPassword(userId, next),
    onSuccess: () => {
      setResetTarget(null);
      setResetPassword("");
    },
  });

  const deactivateMutation = useMutation({
    mutationFn: (userId: string) => deactivateAdminStaff(userId),
    onSuccess: async () => {
      setRemoveTarget(null);
      await queryClient.invalidateQueries({ queryKey: ["admin", "staff"] });
    },
  });

  if (meQuery.isPending || staffQuery.isPending || rolesQuery.isPending) {
    return (
      <div className="flex min-h-64 flex-col items-center justify-center gap-3">
        <Loader2 className="h-7 w-7 animate-spin text-brand-forest" />
        <p className="text-sm text-muted-foreground">Loading control room…</p>
      </div>
    );
  }

  if (meQuery.isError || staffQuery.isError || rolesQuery.isError) {
    const error = meQuery.error ?? staffQuery.error ?? rolesQuery.error;
    const unauthorized = error instanceof ApiRequestError && error.status === 401;
    return (
      <div className="mx-auto max-w-xl space-y-4">
        <Alert className="border-red-200 bg-red-50 text-red-800">
          <Shield />
          <AlertTitle>
            {unauthorized ? "Please sign in again" : "Could not load control room"}
          </AlertTitle>
          <AlertDescription>
            {error instanceof Error
              ? error.message
              : "Check your connection and try again."}
          </AlertDescription>
        </Alert>
        {unauthorized ? (
          <Button onClick={() => router.replace(ADMIN_LOGIN_PATH)}>Back to login</Button>
        ) : (
          <Button
            variant="outline"
            onClick={() => {
              void meQuery.refetch();
              void staffQuery.refetch();
              void rolesQuery.refetch();
            }}
          >
            Try again
          </Button>
        )}
      </div>
    );
  }

  const isSuperAdmin = meQuery.data?.adminRole === "super_admin";
  const staff = staffQuery.data ?? [];
  const assignable = catalog.assignableCapabilities;
  const inviteExtraOptions = assignableBeyondRole(adminRole);
  const editExtraOptions = assignableBeyondRole(editRole);
  const sortedRoles = [...catalog.roles].sort(
    (a, b) => ROLE_ORDER.indexOf(a.role) - ROLE_ORDER.indexOf(b.role),
  );

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <h1 className="text-2xl font-extrabold tracking-tight text-brand-forest sm:text-3xl">
            Control Room
          </h1>
          <p className="max-w-xl text-sm leading-6 text-muted-foreground">
            These are the people who can open this control panel. Add someone when you want to
            share the work.
          </p>
        </div>
        {isSuperAdmin ? (
          <Button
            size="lg"
            className="h-11 rounded-xl px-5"
            onClick={() => {
              resetInvite();
              createMutation.reset();
              setInviteOpen(true);
            }}
          >
            <UserPlus />
            Add someone
          </Button>
        ) : null}
      </div>

      {!isSuperAdmin ? (
        <Alert>
          <Shield />
          <AlertTitle>You can view this page</AlertTitle>
          <AlertDescription>
            Only an owner can add people, change access, or reset passwords.
          </AlertDescription>
        </Alert>
      ) : null}

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-sm font-bold uppercase tracking-[0.16em] text-brand-blue">
            People ({staff.length})
          </h2>
        </div>

        {staff.length === 0 ? (
          <Card className="border-dashed border-border/80 bg-white">
            <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-brand-forest/5 text-brand-forest">
                <UserRound className="size-6" />
              </div>
              <div className="space-y-1">
                <p className="font-semibold text-brand-forest">No one here yet</p>
                <p className="text-sm text-muted-foreground">
                  Add the first person who should help run the console.
                </p>
              </div>
              {isSuperAdmin ? (
                <Button
                  className="mt-2"
                  onClick={() => {
                    resetInvite();
                    setInviteOpen(true);
                  }}
                >
                  <Plus />
                  Add someone
                </Button>
              ) : null}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3">
            {staff.map((member) => {
              const friendly = ROLE_FRIENDLY[member.adminRole] ?? {
                title: member.adminRole,
                blurb: "",
                tone: "bg-muted text-foreground",
              };
              const extrasCount = (member.extraCapabilities ?? []).length;
              const isYou = member.userId === meQuery.data?.id;

              return (
                <Card key={member.userId} className="border-border/80 bg-white shadow-none">
                  <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
                    <div className="flex min-w-0 items-start gap-3">
                      <Avatar className="size-12 rounded-2xl">
                        <AvatarFallback className="rounded-2xl bg-brand-forest text-sm font-bold text-white">
                          {initialsFromEmail(member.email)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="truncate text-base font-semibold text-brand-forest">
                            {member.email}
                          </p>
                          {isYou ? (
                            <Badge className="border-brand-forest/15 bg-brand-forest/5 text-brand-forest">
                              You
                            </Badge>
                          ) : null}
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge className={cn("border-0", friendly.tone)}>{friendly.title}</Badge>
                          <span className="text-xs text-muted-foreground">
                            {member.status === "active" ? "Active" : member.status}
                            {extrasCount > 0
                              ? ` · ${extrasCount} extra access item${extrasCount === 1 ? "" : "s"}`
                              : ""}
                          </span>
                        </div>
                      </div>
                    </div>

                    {isSuperAdmin ? (
                      <div className="flex flex-wrap gap-2 sm:justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-lg"
                          onClick={() => {
                            setEditMember(member);
                            setEditRole(member.adminRole);
                            setEditExtras(
                              pruneExtrasToRole(
                                member.adminRole,
                                member.extraCapabilities ?? [],
                              ),
                            );
                            roleMutation.reset();
                          }}
                        >
                          Change access
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-lg"
                          onClick={() => {
                            setResetTarget(member);
                            setResetPassword("");
                            resetMutation.reset();
                          }}
                        >
                          <KeyRound />
                          New password
                        </Button>
                        {!isYou ? (
                          <Button
                            variant="outline"
                            size="sm"
                            className="rounded-lg text-red-700 hover:bg-red-50 hover:text-red-800"
                            disabled={deactivateMutation.isPending}
                            onClick={() => setRemoveTarget(member)}
                          >
                            <UserX />
                            Remove
                          </Button>
                        ) : null}
                      </div>
                    ) : null}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-bold uppercase tracking-[0.16em] text-brand-blue">
          Job types
        </h2>
        <p className="text-sm text-muted-foreground">
          Each person gets a job type. Owners can also give someone a few extra powers if needed.
        </p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {sortedRoles.map((role) => {
            const friendly = ROLE_FRIENDLY[role.role];
            return (
              <Card key={role.role} className="border-border/80 bg-white">
                <CardHeader className="pb-3">
                  <Badge className={cn("w-fit border-0", friendly.tone)}>{friendly.title}</Badge>
                  <CardTitle className="text-base text-brand-forest">{friendly.title}</CardTitle>
                  <CardDescription className="leading-5">{friendly.blurb}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-1.5 text-sm text-muted-foreground">
                    {(role.capabilities.length ? role.capabilities.slice(0, 4) : ["Full access"]).map(
                      (item) => (
                        <li key={item} className="flex gap-2">
                          <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-brand-mantis" />
                          <span>{item}</span>
                        </li>
                      ),
                    )}
                    {role.capabilities.length > 4 ? (
                      <li className="text-xs text-muted-foreground/80">
                        +{role.capabilities.length - 4} more
                      </li>
                    ) : null}
                  </ul>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {isSuperAdmin && assignable.length > 0 ? (
        <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
          <Card className="border-border/80 bg-white">
            <CardHeader className="pb-3">
              <CollapsibleTrigger
                className={cn(
                  buttonVariants({ variant: "ghost" }),
                  "h-auto w-full justify-between px-0 py-0 hover:bg-transparent",
                )}
              >
                <div className="text-left">
                  <CardTitle className="text-base text-brand-forest">
                    Advanced: change what a job type can do
                  </CardTitle>
                  <CardDescription className="mt-1">
                    Only needed if you want Finance or Reviewer to include different powers.
                  </CardDescription>
                </div>
                <ChevronDown
                  className={cn(
                    "size-5 text-muted-foreground transition-transform",
                    advancedOpen && "rotate-180",
                  )}
                />
              </CollapsibleTrigger>
            </CardHeader>
            <CollapsibleContent>
              <CardContent className="space-y-6 border-t border-border/70 pt-5">
                {sortedRoles
                  .filter((role) => role.editable)
                  .map((role) => (
                    <div key={role.role} className="space-y-3">
                      <div>
                        <p className="font-semibold text-brand-forest">
                          {ROLE_FRIENDLY[role.role].title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Tick what this job type should always include.
                        </p>
                      </div>
                      <PermissionPicks
                        options={assignable}
                        selected={roleDraftFor(role)}
                        onChange={(next) =>
                          setRoleDraftOverrides((current) => ({
                            ...current,
                            [role.role]: next,
                          }))
                        }
                        disabled={rolePermsMutation.isPending}
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-lg"
                        disabled={rolePermsMutation.isPending}
                        onClick={() =>
                          rolePermsMutation.mutate({
                            role: role.role,
                            capabilities: roleDraftFor(role),
                          })
                        }
                      >
                        {rolePermsMutation.isPending ? (
                          <Loader2 className="animate-spin" />
                        ) : null}
                        Save {ROLE_FRIENDLY[role.role].title} powers
                      </Button>
                    </div>
                  ))}
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      ) : null}

      {/* Invite wizard */}
      <Dialog
        open={inviteOpen}
        onOpenChange={(open) => {
          setInviteOpen(open);
          if (!open) {
            resetInvite();
            createMutation.reset();
          }
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {inviteStep === 1
                ? "Add someone — step 1 of 3"
                : inviteStep === 2
                  ? "Choose their job — step 2 of 3"
                  : "Extra access — step 3 of 3"}
            </DialogTitle>
            <DialogDescription>
              {inviteStep === 1
                ? "Enter their email and a temporary password they can change later."
                : inviteStep === 2
                  ? "Pick the closest match. You can fine-tune on the next step."
                  : "Optional. Only powers this job type does not already have — pick extras if needed."}
            </DialogDescription>
          </DialogHeader>

          {inviteStep === 1 ? (
            <FieldGroup className="gap-4">
              <Field>
                <FieldLabel>Email address</FieldLabel>
                <Input
                  type="email"
                  required
                  autoFocus
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="name@company.com"
                  className="h-11"
                />
              </Field>
              <Field>
                <FieldLabel>Temporary password</FieldLabel>
                <Input
                  type="password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="At least 8 characters"
                  className="h-11"
                />
                <FieldError>
                  {password.length > 0 && password.length < 8
                    ? "Use at least 8 characters."
                    : null}
                </FieldError>
              </Field>
            </FieldGroup>
          ) : null}

          {inviteStep === 2 ? (
            <RolePicker
              value={adminRole}
              onChange={(role) => {
                setAdminRole(role);
                setExtraCapabilities((prev) =>
                  role === "super_admin" ? [] : pruneExtrasToRole(role, prev),
                );
              }}
              roles={ROLE_ORDER}
            />
          ) : null}

          {inviteStep === 3 ? (
            adminRole === "super_admin" ? (
              <div className="rounded-xl border border-border bg-muted/40 px-4 py-5 text-sm text-muted-foreground">
                Owners already have full access. No extras needed.
              </div>
            ) : inviteExtraOptions.length === 0 ? (
              <div className="rounded-xl border border-border bg-muted/40 px-4 py-5 text-sm text-muted-foreground">
                This job type already includes every assignable power. No extras to add.
              </div>
            ) : (
              <PermissionPicks
                options={inviteExtraOptions}
                selected={extraCapabilities}
                onChange={setExtraCapabilities}
              />
            )
          ) : null}

          {createMutation.isError ? (
            <p className="text-sm text-red-600">
              {createMutation.error instanceof Error
                ? createMutation.error.message
                : "Could not add this person. Please try again."}
            </p>
          ) : null}

          <DialogFooter className="gap-2 sm:justify-between">
            <div>
              {inviteStep > 1 ? (
                <Button variant="ghost" onClick={() => setInviteStep((step) => (step === 3 ? 2 : 1))}>
                  Back
                </Button>
              ) : (
                <Button variant="ghost" onClick={() => setInviteOpen(false)}>
                  Cancel
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              {inviteStep < 3 ? (
                <Button
                  disabled={
                    inviteStep === 1 &&
                    (email.trim().length < 3 || !email.includes("@") || password.length < 8)
                  }
                  onClick={() => setInviteStep((step) => (step === 1 ? 2 : 3))}
                >
                  Continue
                </Button>
              ) : (
                <Button
                  disabled={createMutation.isPending}
                  onClick={() =>
                    createMutation.mutate({
                      email,
                      password,
                      adminRole,
                      extraCapabilities:
                        adminRole === "super_admin" ? [] : extraCapabilities,
                    })
                  }
                >
                  {createMutation.isPending ? <Loader2 className="animate-spin" /> : <UserPlus />}
                  Add person
                </Button>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit access */}
      <Dialog
        open={Boolean(editMember)}
        onOpenChange={(open) => {
          if (!open) setEditMember(null);
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Change access</DialogTitle>
            <DialogDescription>
              Update the job type for {editMember?.email}. Extra powers only show what this job
              type does not already include.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-5">
            <RolePicker
              value={editRole}
              onChange={(role) => {
                setEditRole(role);
                setEditExtras((prev) =>
                  role === "super_admin" ? [] : pruneExtrasToRole(role, prev),
                );
              }}
              roles={ROLE_ORDER}
            />
            {editRole !== "super_admin" && editExtraOptions.length > 0 ? (
              <div className="space-y-2">
                <p className="text-sm font-semibold text-brand-forest">Extra powers (optional)</p>
                <PermissionPicks
                  options={editExtraOptions}
                  selected={editExtras}
                  onChange={setEditExtras}
                />
              </div>
            ) : editRole !== "super_admin" ? (
              <div className="rounded-xl border border-border bg-muted/40 px-4 py-5 text-sm text-muted-foreground">
                This job type already includes every assignable power. No extras to add.
              </div>
            ) : null}
            {roleMutation.isError ? (
              <p className="text-sm text-red-600">
                {roleMutation.error instanceof Error
                  ? roleMutation.error.message
                  : "Could not save changes."}
              </p>
            ) : null}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditMember(null)}>
              Cancel
            </Button>
            <Button
              disabled={roleMutation.isPending || !editMember}
              onClick={() => {
                if (!editMember) return;
                roleMutation.mutate({
                  userId: editMember.userId,
                  adminRole: editRole,
                  extraCapabilities: editRole === "super_admin" ? [] : editExtras,
                });
              }}
            >
              {roleMutation.isPending ? <Loader2 className="animate-spin" /> : null}
              Save changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reset password */}
      <Dialog
        open={Boolean(resetTarget)}
        onOpenChange={(open) => {
          if (!open) {
            setResetTarget(null);
            setResetPassword("");
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Give a new password</DialogTitle>
            <DialogDescription>
              Create a temporary password for {resetTarget?.email}. Ask them to change it after
              they sign in.
            </DialogDescription>
          </DialogHeader>
          <Field>
            <FieldLabel>New password</FieldLabel>
            <Input
              type="password"
              minLength={8}
              value={resetPassword}
              onChange={(event) => setResetPassword(event.target.value)}
              placeholder="At least 8 characters"
              className="h-11"
            />
            <FieldError>
              {resetPassword.length > 0 && resetPassword.length < 8
                ? "Use at least 8 characters."
                : null}
            </FieldError>
          </Field>
          {resetMutation.isError ? (
            <p className="text-sm text-red-600">
              {resetMutation.error instanceof Error
                ? resetMutation.error.message
                : "Could not update password."}
            </p>
          ) : null}
          <DialogFooter>
            <Button variant="outline" onClick={() => setResetTarget(null)}>
              Cancel
            </Button>
            <Button
              disabled={resetPassword.length < 8 || resetMutation.isPending || !resetTarget}
              onClick={() => {
                if (!resetTarget) return;
                resetMutation.mutate({
                  userId: resetTarget.userId,
                  password: resetPassword,
                });
              }}
            >
              {resetMutation.isPending ? <Loader2 className="animate-spin" /> : null}
              Save password
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(removeTarget)} onOpenChange={(open) => !open && setRemoveTarget(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Remove staff access?</DialogTitle>
            <DialogDescription>
              {removeTarget?.email} will be removed from the control room and will no longer be
              able to sign in. Their main account is not deleted.
            </DialogDescription>
          </DialogHeader>
          {deactivateMutation.isError ? (
            <p className="text-sm text-red-600">
              {deactivateMutation.error instanceof Error
                ? deactivateMutation.error.message
                : "Could not remove staff access."}
            </p>
          ) : null}
          <DialogFooter>
            <Button variant="outline" onClick={() => setRemoveTarget(null)}>Cancel</Button>
            <Button
              variant="destructive"
              disabled={!removeTarget || deactivateMutation.isPending}
              onClick={() => removeTarget && deactivateMutation.mutate(removeTarget.userId)}
            >
              {deactivateMutation.isPending ? <Loader2 className="animate-spin" /> : <UserX />}
              Remove access
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
