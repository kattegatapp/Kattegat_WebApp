"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  BriefcaseBusiness,
  LayoutGrid,
  List,
  Loader2,
  RotateCcw,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

import { AdminApprovalsPage } from "@/features/admin/approvals/approvals-page";
import { ListingEditSheet } from "@/features/admin/content/listing-edit-sheet";
import {
  AdminEmptyState,
  AdminLoadingState,
  AdminPageHeader,
  AdminQueryError,
} from "@/features/admin/shared/query-state";
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
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MoneyText } from "@/components/currency";
import { formatBudgetRange } from "@/lib/admin/money";
import { adminPath } from "@/lib/admin/paths";
import {
  fetchAllListings,
  fetchAllRequirements,
  updateListingAvailability,
  updateRequirementAvailability,
  type AdminListingRecord,
} from "@/lib/api/admin";
import { cn } from "@/lib/utils";

const label = (value: string) =>
  value.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());

const date = (value: string) =>
  new Intl.DateTimeFormat("en-AE", { dateStyle: "medium" }).format(new Date(value));

const tone = (status: string) =>
  cn(
    "border",
    status === "live" || status === "open"
      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
      : status === "rejected" || status === "expired"
        ? "border-red-200 bg-red-50 text-red-800"
        : status === "pending_review"
          ? "border-blue-200 bg-blue-50 text-blue-800"
          : "border-amber-200 bg-amber-50 text-amber-900",
  );

function Filters({
  draft,
  setDraft,
  q,
  setQ,
  status,
  setStatus,
  statuses,
  setPage,
  searchLabel,
}: {
  draft: string;
  setDraft: (value: string) => void;
  q: string;
  setQ: (value: string) => void;
  status: string;
  setStatus: (value: string) => void;
  statuses: string[];
  setPage: (value: number) => void;
  searchLabel: string;
}) {
  const filtered = Boolean(q || status !== "all");
  const searchId = "content-search";

  return (
    <Card className="ios-glass-pane border-white/80 bg-transparent">
      <CardContent className="space-y-4 p-4">
        <form
          className="flex flex-col gap-2 sm:flex-row"
          onSubmit={(event) => {
            event.preventDefault();
            setQ(draft.trim());
            setPage(1);
          }}
        >
          <div className="relative min-w-0 flex-1">
            <Label htmlFor={searchId} className="sr-only">
              {searchLabel}
            </Label>
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <Input
              id={searchId}
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Search title, description, or location"
              className="h-11 pl-9"
            />
          </div>
          <Button type="submit" className="h-11 font-bold">
            <Search />
            Search
          </Button>
        </form>
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            <SlidersHorizontal className="size-4" aria-hidden />
            Status
          </span>
          <Select
            value={status}
            onValueChange={(value) => {
              setStatus(value ?? "all");
              setPage(1);
            }}
          >
            <SelectTrigger
              className="h-10 w-full min-w-0 bg-white sm:h-9 sm:w-auto sm:min-w-48"
              aria-label="Filter by status"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {statuses.map((item) => (
                <SelectItem key={item} value={item}>
                  {label(item)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {filtered ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setDraft("");
                setQ("");
                setStatus("all");
                setPage(1);
              }}
            >
              <RotateCcw />
              Clear filters
            </Button>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}

function ManagementViews({
  kind,
  pending,
}: {
  kind: "listings" | "requirements";
  pending: boolean;
}) {
  const base = adminPath(`/${kind}`);

  return (
    <div className="flex w-full max-w-full flex-wrap gap-1 rounded-2xl border border-white/80 bg-white/45 p-1 shadow-sm backdrop-blur-xl sm:inline-flex sm:w-fit sm:flex-nowrap sm:rounded-full">
      <Button
        size="sm"
        className="h-10 flex-1 sm:h-8 sm:flex-none"
        variant={!pending ? "default" : "ghost"}
        nativeButton={false}
        render={<Link href={base} />}
      >
        All {kind}
      </Button>
      <Button
        size="sm"
        className="h-10 flex-1 sm:h-8 sm:flex-none"
        variant={pending ? "default" : "ghost"}
        nativeButton={false}
        render={<Link href={`${base}?view=pending`} />}
      >
        Awaiting approval
      </Button>
    </div>
  );
}

function ContentPageChrome({
  title,
  description,
  count,
  pending,
}: {
  title: string;
  description: string;
  count?: number;
  pending: boolean;
}) {
  const kind = title.toLowerCase().includes("requirement") ? "requirements" : "listings";

  return (
    <div className="space-y-4">
      <AdminPageHeader title={title} description={description} count={count} />
      <ManagementViews kind={kind} pending={pending} />
    </div>
  );
}

function Pagination({
  page,
  count,
  setPage,
}: {
  page: number;
  count: number;
  setPage: (value: number) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <Button variant="outline" disabled={page === 1} onClick={() => setPage(page - 1)}>
        Previous
      </Button>
      <span className="text-xs text-muted-foreground">Page {page}</span>
      <Button variant="outline" disabled={count < 20} onClick={() => setPage(page + 1)}>
        Next
      </Button>
    </div>
  );
}

export function ListingsManagementPage() {
  const pendingView = useSearchParams().get("view") === "pending";
  const client = useQueryClient();
  const [draft, setDraft] = useState("");
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [layout, setLayout] = useState<"list" | "grid">("list");
  const [editingListingId, setEditingListingId] = useState<string | null>(null);

  const query = useQuery({
    queryKey: ["admin", "all-listings", q, status, page],
    queryFn: () => fetchAllListings({ q, status, page }),
    enabled: !pendingView,
    retry: false,
  });

  const mutation = useMutation({
    mutationFn: ({ id, available }: { id: string; available: boolean }) =>
      updateListingAvailability(id, available),
    onSuccess: () => client.invalidateQueries({ queryKey: ["admin", "all-listings"] }),
  });

  const items = query.data?.data ?? [];

  function toggleAvailability(item: AdminListingRecord) {
    if (item.status !== "live" && item.status !== "unpublished") return;
    mutation.mutate({
      id: item.id,
      available: item.status !== "live",
    });
  }

  if (pendingView) {
    return (
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <ContentPageChrome
          title="Listings"
          description="Manage every listing and review new seller submissions from one workspace."
          pending
        />
        <AdminApprovalsPage mode="listings" embedded />
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <ContentPageChrome
        title="All listings"
        description="Search every seller listing, filter by publishing status, and control whether approved listings are available to buyers."
        count={query.data?.meta?.total ?? 0}
        pending={false}
      />
      <Filters
        draft={draft}
        setDraft={setDraft}
        q={q}
        setQ={setQ}
        status={status}
        setStatus={setStatus}
        setPage={setPage}
        statuses={["draft", "pending_review", "live", "unpublished", "rejected"]}
        searchLabel="Search listings"
      />

      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">
          Dense views for large catalogs — open a listing to edit full details.
        </p>
        <div
          className="inline-flex rounded-xl border border-brand-forest/10 bg-white/70 p-1 shadow-sm"
          role="group"
          aria-label="Layout"
        >
          <Button
            type="button"
            size="sm"
            variant={layout === "list" ? "default" : "ghost"}
            className="h-8 gap-1.5 rounded-lg px-2.5"
            onClick={() => setLayout("list")}
          >
            <List className="size-3.5" />
            List
          </Button>
          <Button
            type="button"
            size="sm"
            variant={layout === "grid" ? "default" : "ghost"}
            className="h-8 gap-1.5 rounded-lg px-2.5"
            onClick={() => setLayout("grid")}
          >
            <LayoutGrid className="size-3.5" />
            Grid
          </Button>
        </div>
      </div>

      {query.isError ? (
        <AdminQueryError
          error={query.error}
          title="Listings could not be loaded"
          onRetry={() => void query.refetch()}
        />
      ) : query.isPending ? (
        <AdminLoadingState label="Loading listings" />
      ) : !items.length ? (
        <AdminEmptyState
          title="No listings match these filters"
          description="Try another search or status filter."
          icon={<Search className="size-7" aria-hidden />}
        />
      ) : layout === "list" ? (
        <Card className="ios-glass-pane overflow-hidden border-white/80 bg-transparent">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="min-w-[12rem]">Listing</TableHead>
                <TableHead className="hidden md:table-cell">Seller</TableHead>
                <TableHead className="hidden sm:table-cell">Location</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden lg:table-cell">Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => {
                const editable = item.status === "live" || item.status === "unpublished";
                const pending = mutation.isPending && mutation.variables?.id === item.id;

                return (
                  <TableRow key={item.id}>
                    <TableCell className="max-w-[18rem]">
                      <p className="truncate font-semibold text-brand-forest">{item.title}</p>
                      <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground md:hidden">
                        {item.sellerDisplayName || "Seller"} · {item.location || "—"}
                      </p>
                    </TableCell>
                    <TableCell className="hidden max-w-[10rem] md:table-cell">
                      <Link
                        href={adminPath(`/users/${item.sellerId}`)}
                        className="truncate font-medium text-brand-forest hover:underline"
                      >
                        {item.sellerDisplayName || "View seller"}
                      </Link>
                    </TableCell>
                    <TableCell className="hidden max-w-[9rem] truncate text-muted-foreground sm:table-cell">
                      {item.location || "—"}
                    </TableCell>
                    <TableCell>
                      <Badge className={cn("whitespace-nowrap", tone(item.status))}>
                        {label(item.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden whitespace-nowrap text-muted-foreground lg:table-cell">
                      {date(item.createdAt)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-2">
                        {editable ? (
                          <div className="flex items-center gap-2">
                            {pending ? <Loader2 className="size-3.5 animate-spin text-muted-foreground" /> : null}
                            <Switch
                              checked={item.status === "live"}
                              disabled={mutation.isPending}
                              onCheckedChange={() => toggleAvailability(item)}
                              aria-label={
                                item.status === "live" ? "Unpublish listing" : "Make listing live"
                              }
                            />
                          </div>
                        ) : (
                          <span className="text-[11px] text-muted-foreground">—</span>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8"
                          onClick={() => setEditingListingId(item.id)}
                        >
                          Edit
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => {
            const editable = item.status === "live" || item.status === "unpublished";
            const pending = mutation.isPending && mutation.variables?.id === item.id;

            return (
              <Card
                key={item.id}
                className="ios-glass-pane overflow-hidden border-white/80 bg-transparent"
              >
                <CardContent className="space-y-3 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-[15px] font-extrabold text-brand-forest">
                        {item.title}
                      </p>
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">
                        {item.location || "No location"} · {date(item.createdAt)}
                      </p>
                    </div>
                    <Badge className={cn("shrink-0", tone(item.status))}>{label(item.status)}</Badge>
                  </div>

                  <div className="flex items-center justify-between gap-2 text-sm">
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        Seller
                      </p>
                      <Link
                        href={adminPath(`/users/${item.sellerId}`)}
                        className="truncate font-semibold text-brand-forest hover:underline"
                      >
                        {item.sellerDisplayName || "View seller"}
                      </Link>
                    </div>
                    {editable ? (
                      <div className="flex shrink-0 items-center gap-2">
                        {pending ? <Loader2 className="size-3.5 animate-spin text-muted-foreground" /> : null}
                        <Switch
                          checked={item.status === "live"}
                          disabled={mutation.isPending}
                          onCheckedChange={() => toggleAvailability(item)}
                          aria-label={
                            item.status === "live" ? "Unpublish listing" : "Make listing live"
                          }
                        />
                      </div>
                    ) : null}
                  </div>

                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 w-full"
                    onClick={() => setEditingListingId(item.id)}
                  >
                    Edit listing
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
      <Pagination page={page} count={items.length} setPage={setPage} />
      <ListingEditSheet
        listingId={editingListingId}
        open={Boolean(editingListingId)}
        onOpenChange={(open) => {
          if (!open) setEditingListingId(null);
        }}
      />
    </div>
  );
}

export function RequirementsManagementPage() {
  const pendingView = useSearchParams().get("view") === "pending";
  const client = useQueryClient();
  const [draft, setDraft] = useState("");
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);

  const query = useQuery({
    queryKey: ["admin", "all-requirements", q, status, page],
    queryFn: () => fetchAllRequirements({ q, status, page }),
    enabled: !pendingView,
    retry: false,
  });

  const mutation = useMutation({
    mutationFn: ({ id, available }: { id: string; available: boolean }) =>
      updateRequirementAvailability(id, available),
    onSuccess: () => client.invalidateQueries({ queryKey: ["admin", "all-requirements"] }),
  });

  const items = query.data?.data ?? [];

  if (pendingView) {
    return (
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <ContentPageChrome
          title="Requirements"
          description="Manage every buyer requirement and review new submissions from one workspace."
          pending
        />
        <AdminApprovalsPage mode="requirements" embedded />
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <ContentPageChrome
        title="All requirements"
        description="Search every buyer request, filter by service stage, and close or reopen eligible requirements."
        count={query.data?.meta?.total ?? 0}
        pending={false}
      />
      <Filters
        draft={draft}
        setDraft={setDraft}
        q={q}
        setQ={setQ}
        status={status}
        setStatus={setStatus}
        setPage={setPage}
        statuses={[
          "pending_review",
          "open",
          "shortlisting",
          "awarded",
          "closed",
          "expired",
          "rejected",
        ]}
        searchLabel="Search requirements"
      />
      {query.isError ? (
        <AdminQueryError
          error={query.error}
          title="Requirements could not be loaded"
          onRetry={() => void query.refetch()}
        />
      ) : query.isPending ? (
        <AdminLoadingState label="Loading requirements" />
      ) : !items.length ? (
        <AdminEmptyState
          title="No requirements match these filters"
          description="Try another search or status filter."
          icon={<BriefcaseBusiness className="size-7" aria-hidden />}
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {items.map((item) => {
            const editable = item.status === "open" || item.status === "closed";
            const pending = mutation.isPending && mutation.variables?.id === item.id;

            return (
              <Card key={item.id} className="ios-glass-pane border-white/80 bg-transparent">
                <CardHeader className="border-b border-border/60">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <CardTitle className="break-words text-lg text-brand-forest">
                        {item.title}
                      </CardTitle>
                      <CardDescription>
                        {item.location} · {label(item.jobType)} · {date(item.createdAt)}
                      </CardDescription>
                    </div>
                    <Badge className={tone(item.status)}>{label(item.status)}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 pt-1">
                  <p className="line-clamp-3 text-sm leading-6 text-muted-foreground">
                    {item.description}
                  </p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <div className="rounded-xl bg-muted/40 p-3 text-sm">
                      <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Buyer
                      </span>
                      <div>
                        <Link
                          href={adminPath(`/users/${item.buyerId}`)}
                          className="font-semibold text-brand-forest hover:underline"
                        >
                          {item.buyerDisplayName || item.buyerEmail || "View buyer account"}
                        </Link>
                      </div>
                    </div>
                    <div className="rounded-xl bg-muted/40 p-3 text-sm">
                      <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Budget
                      </span>
                      <div className="font-semibold text-brand-forest">
                        <MoneyText>{formatBudgetRange(item.budgetMin, item.budgetMax)}</MoneyText>
                      </div>
                    </div>
                  </div>
                  {editable ? (
                    <div className="rounded-xl border border-brand-forest/10 p-4">
                      <p className="font-bold text-brand-forest">Requirement availability</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {item.status === "open"
                          ? "Sellers can currently discover this requirement."
                          : "This requirement is closed to sellers."}
                      </p>
                      <Button
                        className="mt-3"
                        variant={item.status === "open" ? "destructive" : "default"}
                        disabled={mutation.isPending}
                        onClick={() =>
                          mutation.mutate({
                            id: item.id,
                            available: item.status !== "open",
                          })
                        }
                      >
                        {pending ? <Loader2 className="animate-spin" /> : null}
                        {item.status === "open" ? "Close requirement" : "Reopen requirement"}
                      </Button>
                    </div>
                  ) : (
                    <p className="rounded-xl bg-muted p-3 text-xs text-muted-foreground">
                      Availability cannot be changed during this service stage.
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
      <Pagination page={page} count={items.length} setPage={setPage} />
    </div>
  );
}
