"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Check,
  ClipboardList,
  ExternalLink,
  Eye,
  FileWarning,
  ImageIcon,
  Loader2,
  MapPin,
  Shield,
  X,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, type ReactNode } from "react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldLabel } from "@/components/ui/field";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatBudgetRange, formatFilsAsAed } from "@/lib/admin/money";
import { adminPath } from "@/lib/admin/paths";
import { goToAdminLogin } from "@/lib/admin/session-client";
import { ApiRequestError } from "@/lib/api/client";
import {
  approveListing,
  approveRequirement,
  fetchPendingListings,
  fetchPendingRequirements,
  rejectListing,
  rejectRequirement,
  type ListingRejectReasonCode,
  type PendingListing,
  type PendingRequirement,
} from "@/lib/api/admin";
import { cn } from "@/lib/utils";

type ApprovalTab = "listings" | "requirements";

type SelectedItem =
  | { kind: "listing"; item: PendingListing }
  | { kind: "requirement"; item: PendingRequirement };

const LISTING_REJECT_REASONS: Array<{ code: ListingRejectReasonCode; label: string }> = [
  { code: "low_quality_media", label: "Low quality photos or media" },
  { code: "irrelevant_category", label: "Wrong category" },
  { code: "explicit_or_prohibited_content", label: "Prohibited content" },
  { code: "incomplete_information", label: "Incomplete information" },
  { code: "duplicate_listing", label: "Duplicate listing" },
  { code: "other", label: "Other" },
];

function isApprovalTab(value: string | null): value is ApprovalTab {
  return value === "listings" || value === "requirements";
}

function formatWhen(value: string | null | undefined) {
  if (!value) return "Unknown time";
  return new Date(value).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function formatWhenShort(value: string | null | undefined) {
  if (!value) return "Unknown";
  return new Date(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

function formatBudget(min: number | null, max: number | null) {
  if (min == null && max == null) return "Budget not set";
  return formatBudgetRange(min, max);
}

function formatListingPricing(pricing: Record<string, unknown> | null | undefined) {
  if (!pricing || typeof pricing !== "object") return "Not set";
  const amount = pricing.amount;
  const unit = typeof pricing.unit === "string" && pricing.unit.trim() ? pricing.unit.trim() : null;
  if (typeof amount !== "number" || !Number.isFinite(amount)) {
    return unit ? `Unit: ${unit}` : "Not set";
  }
  const aed = formatFilsAsAed(amount);
  return unit ? `${aed} / ${unit}` : aed;
}

function isLikelyImageUrl(url: string) {
  if (/\.(jpe?g|png|gif|webp|avif|bmp|heic)(\?|#|$)/i.test(url)) return true;
  if (/\/image\/upload\//i.test(url)) return true;
  if (/res\.cloudinary\.com/i.test(url) && !/\.(pdf|docx?|xlsx?|zip)(\?|#|$)/i.test(url)) {
    return true;
  }
  return !/\.(pdf|docx?|xlsx?|zip|mp4|mov)(\?|#|$)/i.test(url);
}

export function AdminApprovalsPage({ mode, embedded = false }: { mode?: ApprovalTab; embedded?: boolean }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const tab = mode ?? (isApprovalTab(searchParams.get("tab")) ? searchParams.get("tab")! : "listings");

  const [selected, setSelected] = useState<SelectedItem | null>(null);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectReasonCode, setRejectReasonCode] = useState<ListingRejectReasonCode>("other");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const listingsQuery = useQuery({
    queryKey: ["admin", "approvals", "listings"],
    queryFn: () => fetchPendingListings(1, 50),
    retry: false,
    enabled: !mode || mode === "listings",
  });

  const requirementsQuery = useQuery({
    queryKey: ["admin", "approvals", "requirements"],
    queryFn: () => fetchPendingRequirements(1, 50),
    retry: false,
    enabled: !mode || mode === "requirements",
  });

  const approveListingMutation = useMutation({
    mutationFn: approveListing,
    onSuccess: async () => {
      setSelected(null);
      await queryClient.invalidateQueries({ queryKey: ["admin", "approvals", "listings"] });
      await queryClient.invalidateQueries({ queryKey: ["admin", "overview"] });
    },
  });

  const approveRequirementMutation = useMutation({
    mutationFn: approveRequirement,
    onSuccess: async () => {
      setSelected(null);
      await queryClient.invalidateQueries({ queryKey: ["admin", "approvals", "requirements"] });
      await queryClient.invalidateQueries({ queryKey: ["admin", "overview"] });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async () => {
      if (!selected || rejectReason.trim().length < 3) {
        throw new Error("Please write a short reason.");
      }
      if (selected.kind === "listing") {
        return rejectListing(selected.item.id, {
          reason: rejectReason.trim(),
          reasonCode: rejectReasonCode,
        });
      }
      return rejectRequirement(selected.item.id, rejectReason.trim());
    },
    onSuccess: async () => {
      const kind = selected?.kind;
      setRejectOpen(false);
      setRejectReason("");
      setRejectReasonCode("other");
      setSelected(null);
      if (kind === "listing") {
        await queryClient.invalidateQueries({ queryKey: ["admin", "approvals", "listings"] });
      } else {
        await queryClient.invalidateQueries({ queryKey: ["admin", "approvals", "requirements"] });
      }
      await queryClient.invalidateQueries({ queryKey: ["admin", "overview"] });
    },
  });

  function onTabChange(value: string | number | null) {
    if (mode) return;
    const next = String(value ?? "listings");
    if (!isApprovalTab(next)) return;
    setSelected(null);
    setRejectOpen(false);
    setRejectReason("");
    setRejectReasonCode("other");
    router.replace(`${adminPath("/approvals")}?tab=${next}`, { scroll: false });
  }

  const listingsLoading = listingsQuery.isPending;
  const requirementsLoading = requirementsQuery.isPending;
  const sessionError =
    (listingsQuery.error instanceof ApiRequestError && listingsQuery.error.status === 401) ||
    (requirementsQuery.error instanceof ApiRequestError && requirementsQuery.error.status === 401);

  if (sessionError) {
    return (
      <div className="mx-auto max-w-xl space-y-4">
        <Alert className="ios-glass-pane rounded-2xl border-red-200/60 bg-red-50/35 text-red-950 backdrop-blur-xl">
          <Shield />
          <AlertTitle>Please sign in again</AlertTitle>
          <AlertDescription>We could not load the approval queues.</AlertDescription>
        </Alert>
        <Button onClick={() => void goToAdminLogin((path) => router.replace(path))}>Back to login</Button>
      </div>
    );
  }

  const listingTotal = listingsQuery.data?.total ?? 0;
  const requirementTotal = requirementsQuery.data?.total ?? 0;
  const approvePending =
    selected?.kind === "listing"
      ? approveListingMutation.isPending
      : selected?.kind === "requirement"
        ? approveRequirementMutation.isPending
        : false;

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      {!embedded ? <div className="space-y-2">
        <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900 sm:text-3xl">
          {mode === "listings"
            ? "Listings awaiting approval"
            : mode === "requirements"
              ? "Requirements awaiting approval"
              : "Awaiting approval"}
        </h1>
        <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
          Scan the queue, open an item to review the full details, then approve or reject.
        </p>
      </div> : null}

      <Tabs value={tab} onValueChange={onTabChange} className="gap-5">
        {!mode ? <div className="overflow-x-auto pb-1">
          <TabsList className="flex h-12 w-full min-w-max items-stretch justify-start gap-1 rounded-full border border-white/80 bg-white/45 p-1 shadow-sm backdrop-blur-xl sm:min-w-0">
            <TabsTrigger
              value="listings"
              className={cn(
                "h-full flex-1 rounded-full border-transparent px-4",
                tab === "listings"
                  ? "bg-brand-forest text-white data-active:bg-brand-forest data-active:text-white"
                  : "text-muted-foreground hover:bg-muted",
              )}
            >
              <ClipboardList className="size-3.5" />
              Listings
              <Badge
                className={cn(
                  "ml-1 border-0",
                  tab === "listings" ? "bg-white/20 text-white" : "bg-muted text-foreground",
                )}
              >
                {listingTotal}
              </Badge>
            </TabsTrigger>
            <TabsTrigger
              value="requirements"
              className={cn(
                "h-full flex-1 rounded-full border-transparent px-4",
                tab === "requirements"
                  ? "bg-brand-forest text-white data-active:bg-brand-forest data-active:text-white"
                  : "text-muted-foreground hover:bg-muted",
              )}
            >
              <FileWarning className="size-3.5" />
              Requirements
              <Badge
                className={cn(
                  "ml-1 border-0",
                  tab === "requirements" ? "bg-white/20 text-white" : "bg-muted text-foreground",
                )}
              >
                {requirementTotal}
              </Badge>
            </TabsTrigger>
          </TabsList>
        </div> : null}

        <TabsContent value="listings" className="outline-none">
          {listingsLoading ? (
            <LoadingState label="Loading listings…" />
          ) : listingsQuery.isError ? (
            <QueueError
              message={
                listingsQuery.error instanceof Error
                  ? listingsQuery.error.message
                  : "Could not load listings."
              }
            />
          ) : (
            <QueueList
              emptyTitle="No listings waiting"
              emptyHint="New seller listings will show up here for approval."
              items={listingsQuery.data?.items ?? []}
              renderItem={(item) => (
                <QueueRow
                  key={item.id}
                  title={item.title}
                  thumbUrl={item.coverImage}
                  primary={item.sellerDisplayName ?? "Unknown seller"}
                  secondary={item.location?.trim() || "No location"}
                  submitted={formatWhenShort(item.submittedAt ?? item.createdAt)}
                  selected={selected?.kind === "listing" && selected.item.id === item.id}
                  onView={() => setSelected({ kind: "listing", item })}
                />
              )}
            />
          )}
        </TabsContent>

        <TabsContent value="requirements" className="outline-none">
          {requirementsLoading ? (
            <LoadingState label="Loading requirements…" />
          ) : requirementsQuery.isError ? (
            <QueueError
              message={
                requirementsQuery.error instanceof Error
                  ? requirementsQuery.error.message
                  : "Could not load requirements."
              }
            />
          ) : (
            <QueueList
              emptyTitle="No requirements waiting"
              emptyHint="New buyer requirements will show up here for approval."
              items={requirementsQuery.data?.items ?? []}
              renderItem={(item) => (
                <QueueRow
                  key={item.id}
                  title={item.title}
                  thumbUrl={item.attachments?.[0] ?? null}
                  primary={formatBudget(item.budgetMin, item.budgetMax)}
                  secondary={item.location?.trim() || "No location"}
                  submitted={formatWhenShort(item.submittedAt ?? item.createdAt)}
                  selected={selected?.kind === "requirement" && selected.item.id === item.id}
                  onView={() => setSelected({ kind: "requirement", item })}
                />
              )}
            />
          )}
        </TabsContent>
      </Tabs>

      <Sheet
        open={Boolean(selected)}
        onOpenChange={(open) => {
          if (!open) {
            setSelected(null);
            setRejectOpen(false);
            setRejectReason("");
          }
        }}
      >
        <SheetContent className="flex w-full flex-col gap-0 overflow-hidden sm:max-w-xl">
          {selected ? (
            <>
              <SheetHeader className="border-b border-border/70 pb-4">
                <SheetTitle className="pr-8 text-brand-forest">{selected.item.title}</SheetTitle>
                <SheetDescription>
                  Review the full details, then approve or reject this{" "}
                  {selected.kind === "listing" ? "listing" : "requirement"}.
                </SheetDescription>
                <Badge className="w-fit border-amber-200 bg-amber-50 text-amber-900">
                  Status: Waiting for approval
                </Badge>
              </SheetHeader>

              <div className="flex-1 space-y-5 overflow-y-auto px-4 py-4">
                {selected.kind === "listing" ? (
                  <ListingDetails item={selected.item} onPreview={setPreviewUrl} />
                ) : (
                  <RequirementDetails item={selected.item} onPreview={setPreviewUrl} />
                )}
              </div>

              <SheetFooter className="border-t border-white/60 bg-white/45 backdrop-blur-xl">
                {(approveListingMutation.isError || approveRequirementMutation.isError) && (
                  <p className="w-full text-sm text-red-600">
                    {approveListingMutation.error instanceof Error
                      ? approveListingMutation.error.message
                      : approveRequirementMutation.error instanceof Error
                        ? approveRequirementMutation.error.message
                        : "Could not approve. Try again."}
                  </p>
                )}
                <div className="flex w-full flex-wrap gap-2">
                  <Button
                    className="flex-1 rounded-xl"
                    disabled={approvePending}
                    onClick={() => {
                      approveListingMutation.reset();
                      approveRequirementMutation.reset();
                      if (selected.kind === "listing") {
                        approveListingMutation.mutate(selected.item.id);
                      } else {
                        approveRequirementMutation.mutate(selected.item.id);
                      }
                    }}
                  >
                    {approvePending ? <Loader2 className="animate-spin" /> : <Check />}
                    Approve
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 rounded-xl"
                    onClick={() => {
                      setRejectReason("");
                      setRejectReasonCode("other");
                      rejectMutation.reset();
                      setRejectOpen(true);
                    }}
                  >
                    <X />
                    Reject
                  </Button>
                </div>
              </SheetFooter>
            </>
          ) : null}
        </SheetContent>
      </Sheet>

      <Dialog
        open={rejectOpen}
        onOpenChange={(open) => {
          if (!open) {
            setRejectOpen(false);
            setRejectReason("");
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reject and update status</DialogTitle>
            <DialogDescription>
              This will mark{" "}
              <span className="font-medium text-foreground">
                {selected?.item.title ?? "this item"}
              </span>{" "}
              as rejected. Write a clear reason the user can understand.
            </DialogDescription>
          </DialogHeader>
          {selected?.kind === "listing" ? (
            <Field>
              <FieldLabel>Reason category</FieldLabel>
              <select
                value={rejectReasonCode}
                onChange={(event) =>
                  setRejectReasonCode(event.target.value as ListingRejectReasonCode)
                }
                className="flex h-10 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                {LISTING_REJECT_REASONS.map((option) => (
                  <option key={option.code} value={option.code}>
                    {option.label}
                  </option>
                ))}
              </select>
            </Field>
          ) : null}
          <Field>
            <FieldLabel>Reason</FieldLabel>
            <Textarea
              value={rejectReason}
              onChange={(event) => setRejectReason(event.target.value)}
              placeholder="Example: Please add clearer photos and a complete description."
              className="min-h-28 rounded-xl"
            />
          </Field>
          {rejectMutation.isError ? (
            <p className="text-sm text-red-600">
              {rejectMutation.error instanceof Error
                ? rejectMutation.error.message
                : "Could not reject. Try again."}
            </p>
          ) : null}
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={rejectReason.trim().length < 3 || rejectMutation.isPending}
              onClick={() => rejectMutation.mutate()}
            >
              {rejectMutation.isPending ? <Loader2 className="animate-spin" /> : <X />}
              Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(previewUrl)} onOpenChange={(open) => !open && setPreviewUrl(null)}>
        <DialogContent className="max-w-3xl overflow-hidden border-0 bg-brand-forest/95 p-2 sm:p-3">
          <DialogTitle className="sr-only">Attachment preview</DialogTitle>
          {previewUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={previewUrl}
              alt="Attachment preview"
              className="max-h-[80vh] w-full rounded-xl object-contain"
            />
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function LoadingState({ label }: { label: string }) {
  return (
    <div className="min-h-40" role="status" aria-live="polite" aria-busy="true">
      <span className="sr-only">{label}</span>
    </div>
  );
}

function QueueError({ message }: { message: string }) {
  return (
    <Alert className="ios-glass-pane rounded-2xl border-amber-200/60 bg-amber-50/35 text-amber-950 backdrop-blur-xl">
      <Shield />
      <AlertTitle>Could not open this queue</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
}

function QueueList<T>({
  items,
  emptyTitle,
  emptyHint,
  renderItem,
}: {
  items: T[];
  emptyTitle: string;
  emptyHint: string;
  renderItem: (item: T) => ReactNode;
}) {
  if (!items.length) {
    return (
      <Card className="border-dashed border-border/80 bg-white">
        <CardContent className="flex flex-col items-center gap-2 py-14 text-center">
          <p className="font-semibold text-brand-forest">{emptyTitle}</p>
          <p className="text-sm text-muted-foreground">{emptyHint}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden border-border/80 bg-white shadow-none">
      <div className="divide-y divide-border/70">{items.map(renderItem)}</div>
    </Card>
  );
}

function QueueRow({
  title,
  thumbUrl,
  primary,
  secondary,
  submitted,
  selected,
  onView,
}: {
  title: string;
  thumbUrl?: string | null;
  primary: string;
  secondary: string;
  submitted: string;
  selected: boolean;
  onView: () => void;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 px-3 py-3 sm:px-4",
        selected && "bg-brand-forest/5",
      )}
    >
      <div className="relative size-12 shrink-0 overflow-hidden rounded-xl bg-muted">
        {thumbUrl && isLikelyImageUrl(thumbUrl) ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={thumbUrl} alt="" className="size-full object-cover" />
        ) : (
          <div className="flex size-full items-center justify-center text-muted-foreground">
            <ImageIcon className="size-4" />
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-brand-forest">{title}</p>
        <p className="mt-0.5 truncate text-xs text-muted-foreground">
          <span className="font-medium text-foreground/70">{primary}</span>
          <span className="mx-1.5 text-border">·</span>
          {secondary}
          <span className="mx-1.5 text-border">·</span>
          {submitted}
        </p>
      </div>

      <Button
        size="sm"
        variant={selected ? "default" : "outline"}
        className="shrink-0 rounded-lg"
        onClick={onView}
      >
        <Eye className="size-3.5" />
        View
      </Button>
    </div>
  );
}

type DetailField = {
  label: string;
  value: string;
  icon?: typeof MapPin;
  capitalize?: boolean;
};

function DetailFields({ fields }: { fields: DetailField[] }) {
  return (
    <dl className="grid gap-2.5 sm:grid-cols-2">
      {fields.map((field) => {
        const Icon = field.icon;
        return (
          <div
            key={field.label}
            className="rounded-xl border border-border/70 bg-muted/30 px-3 py-2.5"
          >
            <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              {field.label}
            </dt>
            <dd className="mt-1 flex items-start gap-1.5 text-sm font-medium text-brand-forest">
              {Icon ? <Icon className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" /> : null}
              <span className={cn("min-w-0 break-words", field.capitalize && "capitalize")}>
                {field.value}
              </span>
            </dd>
          </div>
        );
      })}
    </dl>
  );
}

function DescriptionBlock({ description }: { description: string | null }) {
  return (
    <div className="space-y-1.5">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        Description
      </p>
      {description?.trim() ? (
        <p className="ios-glass-chip rounded-xl px-3 py-2.5 text-sm leading-6 text-foreground/85">
          {description}
        </p>
      ) : (
        <p className="rounded-xl border border-dashed border-border/80 bg-muted/30 px-3 py-2.5 text-sm text-muted-foreground">
          No description provided
        </p>
      )}
    </div>
  );
}

function ListingDetails({
  item,
  onPreview,
}: {
  item: PendingListing;
  onPreview: (url: string) => void;
}) {
  return (
    <>
      <DetailFields
        fields={[
          { label: "Seller", value: item.sellerDisplayName ?? "Unknown seller" },
          {
            label: "Pricing",
            value: formatListingPricing(item.pricing),
          },
          {
            label: "Location",
            value: item.location?.trim() ? item.location : "Not set",
            icon: MapPin,
          },
          {
            label: "Submitted",
            value: formatWhen(item.submittedAt ?? item.createdAt),
          },
        ]}
      />
      <DescriptionBlock description={item.description} />
      {item.coverImage ? (
        <AttachmentGallery urls={[item.coverImage]} onPreview={onPreview} label="Cover photo" />
      ) : (
        <EmptyAttachments label="Cover photo" />
      )}
    </>
  );
}

function RequirementDetails({
  item,
  onPreview,
}: {
  item: PendingRequirement;
  onPreview: (url: string) => void;
}) {
  const files = item.attachments ?? [];

  return (
    <>
      <DetailFields
        fields={[
          {
            label: "Job type",
            value: item.jobType.replaceAll("_", " "),
            capitalize: true,
          },
          { label: "Budget", value: formatBudget(item.budgetMin, item.budgetMax) },
          {
            label: "Location",
            value: item.location?.trim() ? item.location : "Not set",
            icon: MapPin,
          },
          {
            label: "Submitted",
            value: formatWhen(item.submittedAt ?? item.createdAt),
          },
        ]}
      />
      <DescriptionBlock description={item.description} />
      {files.length > 0 ? (
        <AttachmentGallery urls={files} onPreview={onPreview} label="Attachments" />
      ) : (
        <EmptyAttachments label="Attachments" />
      )}
    </>
  );
}

function EmptyAttachments({ label }: { label: string }) {
  return (
    <div className="space-y-1.5">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </p>
      <div className="flex items-center gap-2 rounded-xl border border-dashed border-border/80 bg-muted/40 px-3 py-2.5 text-xs text-muted-foreground">
        <ImageIcon className="size-3.5 shrink-0" />
        No photos attached
      </div>
    </div>
  );
}

function AttachmentGallery({
  urls,
  onPreview,
  label,
}: {
  urls: string[];
  onPreview: (url: string) => void;
  label: string;
}) {
  const unique = Array.from(new Set(urls.filter(Boolean)));
  if (!unique.length) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          {label}
        </p>
        <Badge variant="outline" className="h-5 px-1.5 text-[10px] tabular-nums">
          {unique.length}
        </Badge>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {unique.map((url, index) => {
          const image = isLikelyImageUrl(url);
          if (!image) {
            return (
              <a
                key={`${url}-${index}`}
                href={url}
                target="_blank"
                rel="noreferrer"
                className="flex min-h-24 items-center justify-center gap-1.5 rounded-xl border border-border/80 bg-muted/50 px-3 text-center text-xs font-medium text-brand-forest transition hover:border-brand-forest/30 hover:bg-muted"
              >
                <ExternalLink className="size-3.5 shrink-0" />
                Open file
              </a>
            );
          }

          return (
            <button
              key={`${url}-${index}`}
              type="button"
              onClick={() => onPreview(url)}
              className="group relative aspect-[4/3] overflow-hidden rounded-xl border border-border/70 bg-muted text-left transition hover:border-brand-forest/35"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt={`Attachment ${index + 1}`}
                className="h-full w-full object-cover transition duration-200 group-hover:scale-[1.03]"
              />
              <span className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-brand-forest/70 to-transparent px-2 py-1.5 text-[10px] font-medium text-white opacity-0 transition group-hover:opacity-100">
                Enlarge
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
