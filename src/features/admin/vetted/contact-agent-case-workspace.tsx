"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  CheckCircle2,
  ClipboardCopy,
  ImageIcon,
  Loader2,
  PanelRight,
  UserRound,
  XCircle,
} from "lucide-react";
import { useCallback, useMemo, useRef, useState, useSyncExternalStore } from "react";

import { MoneyText } from "@/components/currency";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { ContactAgentThreadPane } from "@/features/admin/vetted/contact-agent-thread-pane";
import { ListingPreviewSheet } from "@/features/admin/vetted/listing-preview-sheet";
import {
  fetchAdminStaff,
  updateContactAgentRequest,
  type AdminContactAgentRequest,
  type ContactAgentRequestStatus,
} from "@/lib/api/admin";
import { cn } from "@/lib/utils";

const SPLIT_CHATS_MQ = "(min-width: 1100px)";

function subscribeSplitChats(onChange: () => void) {
  const mql = window.matchMedia(SPLIT_CHATS_MQ);
  mql.addEventListener("change", onChange);
  return () => mql.removeEventListener("change", onChange);
}

function useSplitChatsLayout() {
  return useSyncExternalStore(
    subscribeSplitChats,
    () => window.matchMedia(SPLIT_CHATS_MQ).matches,
    () => false,
  );
}

const STATUS_COPY: Record<ContactAgentRequestStatus, { label: string; tone: string }> = {
  new: { label: "New", tone: "border-amber-200 bg-amber-50 text-amber-900" },
  in_progress: { label: "Working", tone: "border-sky-200 bg-sky-50 text-sky-900" },
  contacted: { label: "Buyer updated", tone: "border-brand-blue/20 bg-brand-blue/5 text-brand-blue" },
  resolved: { label: "Complete", tone: "border-emerald-200 bg-emerald-50 text-emerald-900" },
  closed: { label: "Closed", tone: "border-border bg-muted text-muted-foreground" },
};

function formatMoney(pricing: AdminContactAgentRequest["listingPricing"]) {
  if (!pricing || typeof pricing.amount !== "number") return null;
  const aed = pricing.amount / 100;
  const unit = pricing.unit ? ` / ${pricing.unit}` : "";
  return `AED ${aed.toLocaleString("en-AE")}${unit}`;
}

function sellerRelayDraft(request: AdminContactAgentRequest) {
  const service = request.listingTitle?.trim() || "their services";
  return [
    `Hi ${request.sellerName.split(" ")[0] || request.sellerName},`,
    "",
    `Following up on the buyer enquiry about ${service}.`,
    "",
    "Could you confirm availability and pricing so we can reply to them?",
    "",
    "Thank you,",
    "Kattegat.Vetted",
  ].join("\n");
}

function buyerAckDraft(request: AdminContactAgentRequest) {
  const first = request.buyerName.split(" ")[0] || request.buyerName;
  return [
    `Hi ${first},`,
    "",
    "Thanks for reaching out through Contact Agent. I am checking with the seller now and will send the details here.",
    "",
    "Kattegat.Vetted",
  ].join("\n");
}

interface ContactAgentCaseWorkspaceProps {
  request: AdminContactAgentRequest;
  onBack?: () => void;
  showBack?: boolean;
  /** Fired after Close erases the case so the inbox can drop it from view. */
  onSessionRemoved?: () => void;
}

export function ContactAgentCaseWorkspace({
  request,
  onBack,
  showBack = false,
  onSessionRemoved,
}: ContactAgentCaseWorkspaceProps) {
  const client = useQueryClient();
  const [note, setNote] = useState(request.adminNote ?? "");
  const [sellerDraft, setSellerDraft] = useState<string | null>(null);
  const [buyerDraft, setBuyerDraft] = useState<string | null>(null);
  const [mobileTab, setMobileTab] = useState("buyer");
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [previewListingId, setPreviewListingId] = useState<string | null>(null);
  const splitChats = useSplitChatsLayout();
  const autoStartedRef = useRef(false);

  const statusMeta = STATUS_COPY[request.status];
  const terminal = request.status === "resolved" || request.status === "closed";
  const chatLocked = request.status === "closed";
  const priceLabel = formatMoney(request.listingPricing);
  const listingPaneProps = {
    listingId: request.listingId,
    listingTitle: request.listingTitle,
    listingCoverImage: request.listingCoverImage,
    listingPricing: request.listingPricing,
    sellerName: request.sellerName,
  };

  const staffQuery = useQuery({
    queryKey: ["admin", "staff"],
    queryFn: fetchAdminStaff,
    staleTime: 5 * 60_000,
    retry: false,
  });

  const mutation = useMutation({
    mutationFn: (input: {
      status?: Exclude<ContactAgentRequestStatus, "new">;
      adminNote?: string;
      assignedTo?: string | null;
    }) => updateContactAgentRequest(request.id, input),
    onSuccess: (_data, variables) => {
      void client.invalidateQueries({ queryKey: ["admin", "contact-agent-requests"] });
      void client.invalidateQueries({ queryKey: ["admin", "contact-agent-thread"] });
      void client.removeQueries({ queryKey: ["admin", "contact-agent-thread", request.id] });
      if (variables.status === "closed") {
        onSessionRemoved?.();
      }
    },
  });

  const markInProgressIfNew = useCallback(() => {
    if (request.status !== "new" || mutation.isPending || autoStartedRef.current) return;
    autoStartedRef.current = true;
    mutation.mutate({ status: "in_progress", adminNote: note.trim() || undefined });
  }, [mutation, note, request.status]);

  const consumeSellerDraft = useCallback(() => setSellerDraft(null), []);
  const consumeBuyerDraft = useCallback(() => setBuyerDraft(null), []);

  const nextAction = useMemo(() => {
    if (request.status === "new") return { status: "in_progress" as const, label: "Start" };
    if (request.status === "in_progress") return { status: "contacted" as const, label: "Buyer updated" };
    if (request.status === "contacted") return { status: "resolved" as const, label: "Complete" };
    return null;
  }, [request.status]);

  return (
    <div className="flex h-full min-h-0 w-full flex-1 flex-col overflow-hidden">
      {/* Slim toolbar — wraps cleanly on narrow phones */}
      <div className="flex shrink-0 flex-wrap items-center gap-2 border-b border-[#0b2a18]/10 bg-white/90 px-2 py-2 backdrop-blur-md sm:px-4">
        {showBack ? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-10 shrink-0 lg:hidden"
            onClick={onBack}
            aria-label="Back to inbox"
          >
            <ArrowLeft />
          </Button>
        ) : null}

        <div className="relative hidden size-9 shrink-0 overflow-hidden rounded-xl bg-brand-forest/10 sm:block">
          {request.listingCoverImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={request.listingCoverImage} alt="" className="size-full object-cover" />
          ) : (
            <div className="flex size-full items-center justify-center text-brand-forest/40">
              <ImageIcon className="size-4" />
            </div>
          )}
        </div>

        <button
          type="button"
          className="min-w-0 flex-1 basis-[min(100%,12rem)] rounded-xl px-1 py-0.5 text-left transition hover:bg-brand-forest/[0.04] disabled:hover:bg-transparent"
          disabled={!request.listingId}
          onClick={() => request.listingId && setPreviewListingId(request.listingId)}
        >
          <div className="flex flex-wrap items-center gap-2">
            <p className="truncate text-sm font-extrabold text-brand-forest sm:text-[15px]">
              {request.buyerName}
              <span className="mx-1.5 font-semibold text-muted-foreground">↔</span>
              {request.sellerName}
            </p>
            <Badge variant="outline" className={cn("border text-[10px]", statusMeta.tone)}>
              {statusMeta.label}
            </Badge>
          </div>
          <p className="truncate text-xs text-muted-foreground">
            {request.listingTitle || "General enquiry"}
            {priceLabel ? <> · <MoneyText>{priceLabel}</MoneyText></> : null}
            {request.listingId ? " · Tap for listing" : ""}
          </p>
        </button>

        <div className="ml-auto flex shrink-0 items-center gap-1.5">
          <Select
            value={request.assignedTo ?? "unassigned"}
            onValueChange={(value) =>
              mutation.mutate({
                assignedTo: !value || value === "unassigned" ? null : value,
                adminNote: note.trim() || undefined,
              })
            }
            disabled={mutation.isPending || terminal}
          >
            <SelectTrigger className="hidden h-9 w-[170px] rounded-full bg-muted/40 md:flex">
              <UserRound className="size-3.5 text-muted-foreground" />
              <SelectValue placeholder="Assign" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="unassigned">Unassigned</SelectItem>
              {(staffQuery.data ?? []).map((member) => (
                <SelectItem key={member.userId} value={member.userId}>
                  {member.email}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {nextAction ? (
            <Button
              type="button"
              size="sm"
              className="h-10 rounded-full px-3 font-bold sm:h-9"
              disabled={mutation.isPending}
              onClick={() =>
                mutation.mutate({
                  status: nextAction.status,
                  adminNote: note.trim() || undefined,
                })
              }
            >
              {mutation.isPending ? <Loader2 className="animate-spin" /> : <CheckCircle2 />}
              <span className="max-w-[7.5rem] truncate sm:max-w-none">{nextAction.label}</span>
            </Button>
          ) : null}

          <Sheet open={detailsOpen} onOpenChange={setDetailsOpen}>
            <SheetTrigger
              render={
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="h-10 rounded-full px-2.5 sm:h-9 sm:px-3"
                  aria-label="Case details"
                />
              }
            >
              <PanelRight />
              <span className="hidden sm:inline">Details</span>
            </SheetTrigger>
            <SheetContent className="w-full sm:max-w-md">
              <SheetHeader>
                <SheetTitle>Case details</SheetTitle>
                <SheetDescription>
                  Listing quote, drafts, assignment, and private notes. Chats stay full-screen behind this panel.
                  White Glove sellers are managed from their user profile — this desk is only for Contact Agent relays.
                </SheetDescription>
              </SheetHeader>

              <div className="mt-4 space-y-4">
                <button
                  type="button"
                  disabled={!request.listingId}
                  onClick={() => request.listingId && setPreviewListingId(request.listingId)}
                  className="w-full overflow-hidden rounded-2xl border border-border/70 bg-muted/20 text-left transition hover:bg-muted/40 disabled:hover:bg-muted/20"
                >
                  <div className="flex gap-3 p-3">
                    <div className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-brand-forest/10">
                      {request.listingCoverImage ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={request.listingCoverImage} alt="" className="size-full object-cover" />
                      ) : (
                        <div className="flex size-full items-center justify-center text-brand-forest/35">
                          <ImageIcon className="size-5" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-brand-blue">
                        {request.listingId ? "Listing · tap to preview" : "Listing"}
                      </p>
                      <p className="mt-1 text-sm font-extrabold text-brand-forest">
                        {request.listingTitle || "General seller enquiry"}
                      </p>
                      {priceLabel ? <MoneyText className="mt-0.5 text-xs font-semibold">{priceLabel}</MoneyText> : null}
                      {request.listingId ? (
                        <p className="mt-1 font-mono text-[11px] text-muted-foreground">
                          /listing/{request.listingId}
                        </p>
                      ) : null}
                    </div>
                  </div>
                  <div className="border-t border-border/60 px-3 py-2.5">
                    <p className="text-xs leading-5 text-brand-forest/85">{request.message}</p>
                  </div>
                </button>

                <div className="grid grid-cols-1 gap-2 min-[380px]:grid-cols-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setBuyerDraft(buyerAckDraft(request));
                      setMobileTab("buyer");
                      markInProgressIfNew();
                      setDetailsOpen(false);
                    }}
                  >
                    <ClipboardCopy />
                    Draft buyer
                  </Button>
                  <Button
                    type="button"
                    className="font-bold"
                    onClick={() => {
                      setSellerDraft(sellerRelayDraft(request));
                      setMobileTab("seller");
                      markInProgressIfNew();
                      setDetailsOpen(false);
                    }}
                  >
                    <ClipboardCopy />
                    Draft seller
                  </Button>
                </div>

                <div className="space-y-2 sm:hidden">
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">Assign</p>
                  <Select
                    value={request.assignedTo ?? "unassigned"}
                    onValueChange={(value) =>
                      mutation.mutate({
                        assignedTo: !value || value === "unassigned" ? null : value,
                        adminNote: note.trim() || undefined,
                      })
                    }
                    disabled={mutation.isPending || terminal}
                  >
                    <SelectTrigger className="w-full rounded-xl">
                      <SelectValue placeholder="Assign admin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unassigned">Unassigned</SelectItem>
                      {(staffQuery.data ?? []).map((member) => (
                        <SelectItem key={member.userId} value={member.userId}>
                          {member.email}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">Private note</p>
                  <Textarea
                    className="min-h-28 rounded-xl"
                    value={note}
                    onChange={(event) => setNote(event.target.value)}
                    placeholder="Internal only…"
                    disabled={terminal}
                  />
                  {!terminal ? (
                    <Button
                      type="button"
                      variant="secondary"
                      className="w-full"
                      disabled={mutation.isPending}
                      onClick={() =>
                        mutation.mutate({
                          status:
                            request.status === "new"
                              ? "in_progress"
                              : (request.status as Exclude<ContactAgentRequestStatus, "new">),
                          adminNote: note.trim() || undefined,
                        })
                      }
                    >
                      Save note
                    </Button>
                  ) : null}
                </div>

                {!terminal ? (
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    disabled={mutation.isPending}
                    onClick={() => mutation.mutate({ status: "closed", adminNote: note.trim() || undefined })}
                  >
                    Close & erase from desk
                  </Button>
                ) : null}

                {mutation.isError ? (
                  <p className="flex items-center gap-2 text-xs font-medium text-red-600">
                    <XCircle className="size-3.5" />
                    {mutation.error instanceof Error ? mutation.error.message : "Update failed."}
                  </p>
                ) : null}
                {mutation.isSuccess ? (
                  <p className="flex items-center gap-2 text-xs font-medium text-emerald-700">
                    <CheckCircle2 className="size-3.5" />
                    Saved.
                  </p>
                ) : null}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Full-bleed chat boards */}
      {splitChats ? (
        <div className="grid min-h-0 flex-1 grid-cols-2 divide-x divide-[#0b2a18]/10 overflow-hidden">
          <ContactAgentThreadPane
            key={`buyer-${request.id}-${request.status}`}
            requestId={request.id}
            role="buyer"
            counterpartyName={request.buyerName}
            counterpartyId={request.buyerId}
            {...listingPaneProps}
            suggestedDraft={buyerDraft}
            onSuggestedDraftConsumed={consumeBuyerDraft}
            onThreadReady={markInProgressIfNew}
            readOnly={chatLocked}
          />
          <ContactAgentThreadPane
            key={`seller-${request.id}-${request.status}`}
            requestId={request.id}
            role="seller"
            counterpartyName={request.sellerName}
            counterpartyId={request.sellerId}
            {...listingPaneProps}
            suggestedDraft={sellerDraft}
            onSuggestedDraftConsumed={consumeSellerDraft}
            onThreadReady={markInProgressIfNew}
            readOnly={chatLocked}
          />
        </div>
      ) : (
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <div className="shrink-0 border-b border-[#0b2a18]/10 bg-white px-3 py-2">
            <Tabs value={mobileTab} onValueChange={setMobileTab}>
              <TabsList className="grid h-10 w-full grid-cols-2 rounded-xl">
                <TabsTrigger value="buyer" className="rounded-lg">Buyer</TabsTrigger>
                <TabsTrigger value="seller" className="rounded-lg">Seller</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          {mobileTab === "buyer" ? (
            <ContactAgentThreadPane
              key={`buyer-m-${request.id}-${request.status}`}
              requestId={request.id}
              role="buyer"
              counterpartyName={request.buyerName}
              counterpartyId={request.buyerId}
              {...listingPaneProps}
              suggestedDraft={buyerDraft}
              onSuggestedDraftConsumed={consumeBuyerDraft}
              onThreadReady={markInProgressIfNew}
              readOnly={chatLocked}
            />
          ) : (
            <ContactAgentThreadPane
              key={`seller-m-${request.id}-${request.status}`}
              requestId={request.id}
              role="seller"
              counterpartyName={request.sellerName}
              counterpartyId={request.sellerId}
              {...listingPaneProps}
              suggestedDraft={sellerDraft}
              onSuggestedDraftConsumed={consumeSellerDraft}
              onThreadReady={markInProgressIfNew}
              readOnly={chatLocked}
            />
          )}
        </div>
      )}

      <ListingPreviewSheet
        listingId={previewListingId}
        open={Boolean(previewListingId)}
        onOpenChange={(open) => {
          if (!open) setPreviewListingId(null);
        }}
        fallback={{
          title: request.listingTitle,
          coverImage: request.listingCoverImage,
          pricing: request.listingPricing,
          sellerName: request.sellerName,
        }}
      />
    </div>
  );
}
