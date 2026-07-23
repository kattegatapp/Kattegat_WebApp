"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  BriefcaseBusiness,
  CalendarDays,
  Check,
  CreditCard,
  Download,
  Loader2,
  MapPin,
  MessageCircle,
  Receipt,
  RefreshCw,
  Star,
  Trophy,
} from "lucide-react";
import { useMemo, useState, useSyncExternalStore } from "react";

import {
  AccountAvatar,
  AccountGlass,
  AccountListCard,
  AccountViewIntro,
  AccountViewWrap,
} from "@/features/account/account-shared";
import { AccountCardGridSkeleton } from "@/features/account/account-loading";
import { Button, buttonVariants } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  acceptAccountContract,
  fetchAccountWork,
  submitAccountBookingReview,
  transitionAccountBooking,
  type AccountWorkItem,
  type BookingAction,
} from "@/lib/api/account-bookings";
import { fetchAccountConversations } from "@/lib/api/account-chat";
import {
  createAccountInvoiceCheckoutSession,
  fetchAccountReceivedInvoices,
  type AccountInvoice,
} from "@/lib/api/account-invoices";
import {
  fetchAccountReceivedQuotes,
  respondToAccountQuote,
  type AccountQuote,
} from "@/lib/api/account-quotes";
import { ApiRequestError } from "@/lib/api/client";
import type { AccountIdentity } from "@/features/account/types";
import { cn } from "@/lib/utils";

type WorkspaceTab = "awards" | "bookings";
const STAGES = ["Awarded", "Contract", "Confirmed", "In progress", "Completed"];

function subscribeNoop() {
  return () => undefined;
}

function readInvoicePaidFlag() {
  return Boolean(new URLSearchParams(window.location.search).get("invoicePaid"));
}

function stageIndex(item: AccountWorkItem) {
  if (item.booking?.status === "completed") return 4;
  if (item.booking?.status === "in_progress" || item.booking?.status === "seller_completed") return 3;
  if (item.booking) return 2;
  if (item.contract.buyerAcceptedAt || item.contract.sellerAcceptedAt) return 1;
  return 0;
}

function nextAction(item: AccountWorkItem): { label: string; action: BookingAction } | null {
  if (!item.booking) return null;
  if (item.viewerRole === "seller" && item.booking.status === "confirmed") {
    return { label: "Start work", action: "start" };
  }
  if (item.viewerRole === "seller" && item.booking.status === "in_progress") {
    return { label: "Submit for completion", action: "submit_completion" };
  }
  if (item.viewerRole === "buyer" && item.booking.status === "seller_completed") {
    return { label: "Confirm completion", action: "confirm_completion" };
  }
  return null;
}

function formatMoney(fils: number) {
  return `AED ${(fils / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatSchedule(value: string | null) {
  if (!value) return "To be agreed";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString("en-AE", { day: "numeric", month: "short", year: "numeric" });
}

function Timeline({ item }: { item: AccountWorkItem }) {
  const active = stageIndex(item);
  // Fraction of the way from the first to the last milestone — drives the animated fill.
  // Dot centers sit at the midpoint of each 1/STAGES.length column, so the track itself
  // only needs to span from the first dot's center to the last dot's (10%..90% of width).
  // Clamped defensively — stageIndex should always be in range, but a stray value here
  // would otherwise silently under/overshoot the fill instead of erroring.
  const rawProgress = STAGES.length > 1 ? active / (STAGES.length - 1) : 0;
  const progress = Math.min(1, Math.max(0, rawProgress));
  const isLive = active < STAGES.length - 1;

  return (
    // `<ol>` may only contain `<li>` (or script-supporting) children per the HTML content
    // model — the connector lines live in this wrapping `relative` div instead, so they're
    // siblings of the list rather than invalid direct children of it, which server-rendered
    // HTML would otherwise hand the browser's parser as malformed markup on first paint.
    <div className="relative">
      <span
        aria-hidden
        className="absolute left-[10%] right-[10%] top-2.5 h-0.5 -translate-y-1/2 rounded-full bg-brand-forest/10"
      />
      <span
        aria-hidden
        className="absolute left-[10%] top-2.5 h-0.5 -translate-y-1/2 rounded-full bg-brand-mantis transition-[width] duration-700 ease-out"
        style={{ width: `${progress * 80}%` }}
      />
      <ol aria-label="Job progress" className="relative flex items-start">
        {STAGES.map((stage, index) => {
          const complete = index <= active;
          const isCurrent = index === active && isLive;
          return (
            <li
              key={stage}
              className="relative flex min-w-0 flex-1 flex-col items-center text-center"
            >
              <span className="relative grid size-5 place-items-center">
                {isCurrent ? (
                  <span className="absolute inset-0 animate-ping rounded-full bg-brand-mantis/60" />
                ) : null}
                <span
                  className={cn(
                    "relative z-10 grid size-5 place-items-center rounded-full border-2 transition-all duration-500 ease-out",
                    complete
                      ? "scale-100 border-brand-mantis bg-brand-mantis text-brand-forest"
                      : "scale-90 border-brand-forest/15 bg-white",
                  )}
                >
                  {complete ? <Check className="size-3" aria-hidden /> : null}
                </span>
              </span>
              <span className="mt-2 truncate text-[9px] font-bold text-brand-forest/55 sm:text-[10px]">
                {stage}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function WorkCard({
  item,
  identity,
  conversationId,
  busy,
  onAccept,
  onTransition,
  onReview,
}: {
  item: AccountWorkItem;
  identity: AccountIdentity;
  conversationId?: string;
  busy: boolean;
  onAccept: () => void;
  onTransition: (action: BookingAction) => void;
  onReview: (input: { bookingId: string; sellerId: string; rating: number; text: string }) => void;
}) {
  const [showReview, setShowReview] = useState(false);
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const counterpart = item.viewerRole === "seller" ? item.buyer : item.seller;
  const viewerAccepted =
    item.viewerRole === "seller"
      ? Boolean(item.contract.sellerAcceptedAt)
      : Boolean(item.contract.buyerAcceptedAt);
  const action = nextAction(item);
  return (
    <AccountListCard className="flex h-full flex-col gap-5 p-4 sm:p-5">
      <div className="flex items-start gap-3">
        <AccountAvatar
          name={counterpart.name}
          imageUrl={counterpart.avatarUrl}
          className="size-11 shrink-0 rounded-full"
        />
        <div className="min-w-0 flex-1">
          <span className="rounded-full border border-brand-mantis/30 bg-brand-mantis/10 px-2.5 py-1 text-[10px] font-bold capitalize text-brand-forest">
            {item.booking?.status.replaceAll("_", " ") ??
              item.contract.status.replaceAll("_", " ")}
          </span>
          <h2 className="mt-2 line-clamp-2 text-base font-extrabold text-brand-forest">
            {item.requirement.title}
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            {item.viewerRole === "seller" ? "Buyer" : "Seller"} · {counterpart.name}
          </p>
        </div>
      </div>

      <Timeline item={item} />

      <div className="rounded-xl border border-brand-forest/8 bg-[#F7F9F8] p-3">
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
          Scope of work
        </p>
        <p className="mt-1.5 line-clamp-4 text-xs leading-5 text-brand-forest/75">
          {item.contract.scope}
        </p>
      </div>

      <div className="rounded-xl border border-brand-forest/8 p-3">
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
          Cancellation terms
        </p>
        <p className="mt-1.5 text-xs leading-5 text-brand-forest/75">
          {item.contract.cancellationTerms}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 text-xs">
        <div>
          <p className="font-semibold text-muted-foreground">Accepted quote</p>
          <p className="mt-1 font-extrabold text-brand-forest">{formatMoney(item.contract.price)}</p>
        </div>
        <div>
          <p className="font-semibold text-muted-foreground">Schedule</p>
          <p className="mt-1 font-bold text-brand-forest">
            {formatSchedule(item.contract.startsAt)}
          </p>
        </div>
        {item.contract.location ? (
          <p className="col-span-2 flex items-center gap-1 text-brand-forest/60">
            <MapPin className="size-3.5" aria-hidden />
            {item.contract.location}
          </p>
        ) : null}
      </div>

      {!item.booking ? (
        <div className="rounded-xl border border-brand-blue/15 bg-brand-blue/5 p-3 text-xs text-brand-forest/70">
          Buyer: {item.contract.buyerAcceptedAt ? "Accepted" : "Waiting"} · Seller:{" "}
          {item.contract.sellerAcceptedAt ? "Accepted" : "Waiting"}
        </div>
      ) : item.booking.status === "seller_completed" ? (
        <p className="text-xs leading-5 text-brand-forest/65">
          Seller completion is waiting for buyer confirmation.
        </p>
      ) : null}

      <div className="mt-auto flex flex-wrap gap-2 border-t border-brand-forest/8 pt-4">
        {!item.booking && !viewerAccepted ? (
          <Button type="button" size="sm" disabled={busy} onClick={onAccept}>
            {busy ? <Loader2 className="size-3.5 animate-spin" /> : null}
            Review & accept contract
          </Button>
        ) : null}
        {action ? (
          <Button type="button" size="sm" disabled={busy} onClick={() => onTransition(action.action)}>
            {action.label}
          </Button>
        ) : null}
        <a
          className={buttonVariants({ size: "sm", variant: "outline" })}
          href={`/api/account/bookings/contracts/${item.contract.id}/document?identity=${identity}`}
          download
        >
            <Download className="size-3.5" aria-hidden />
            Contract PDF
        </a>
        {conversationId ? (
          <a
            className={buttonVariants({ size: "sm", variant: "outline" })}
            href={`/chat/${conversationId}`}
          >
              <MessageCircle className="size-3.5" aria-hidden />
              Message {item.viewerRole === "seller" ? "buyer" : "seller"}
          </a>
        ) : null}
        {item.viewerRole === "buyer" && item.booking?.status === "completed" ? (
          <Button type="button" size="sm" variant="outline" onClick={() => setShowReview((value) => !value)}>
            Review seller
          </Button>
        ) : null}
      </div>

      {showReview && item.booking ? (
        <div className="space-y-3 border-t border-brand-forest/8 pt-4">
          <div>
            <p className="text-sm font-extrabold text-brand-forest">Verified booking review</p>
            <p className="text-xs text-muted-foreground">Only reviews linked to completed bookings receive this mark.</p>
          </div>
          <div className="flex gap-1" aria-label={`${rating} out of 5 stars`}>
            {[1, 2, 3, 4, 5].map((value) => (
              <button key={value} type="button" aria-label={`${value} stars`} onClick={() => setRating(value)}>
                <Star className={cn("size-6", value <= rating ? "fill-brand-mantis text-brand-mantis" : "text-brand-forest/20")} />
              </button>
            ))}
          </div>
          <Textarea
            value={reviewText}
            onChange={(event) => setReviewText(event.target.value)}
            placeholder="How was your experience with this seller?"
            minLength={10}
          />
          <Button
            type="button"
            size="sm"
            disabled={busy || reviewText.trim().length < 10}
            onClick={() => {
              onReview({
                bookingId: item.booking!.id,
                sellerId: item.contract.sellerId,
                rating,
                text: reviewText.trim(),
              });
              setShowReview(false);
            }}
          >
            Submit verified review
          </Button>
        </div>
      ) : null}
    </AccountListCard>
  );
}

/**
 * Buyer-only. Quotes sent in-app (buyer_id-linked clients) appear here so the buyer can
 * accept or decline without relying on the seller's "Accept & invoice" shortcut.
 */
function ReceivedQuotesSection() {
  const client = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const quotesQuery = useQuery({
    queryKey: ["account", "quotes", "received"],
    queryFn: fetchAccountReceivedQuotes,
  });
  const respond = useMutation({
    mutationFn: ({ quoteId, response }: { quoteId: string; response: "accept" | "decline" }) =>
      respondToAccountQuote(quoteId, response),
    onSuccess: async (_data, variables) => {
      setError(null);
      setNotice(
        variables.response === "accept"
          ? "Quote accepted. Your booking and invoice are ready."
          : "Quote declined.",
      );
      await Promise.all([
        client.invalidateQueries({ queryKey: ["account", "quotes", "received"] }),
        client.invalidateQueries({ queryKey: ["account", "bookings"] }),
        client.invalidateQueries({ queryKey: ["account", "invoices", "received"] }),
      ]);
    },
    onError: (err) =>
      setError(err instanceof ApiRequestError ? err.message : "Could not update quote."),
  });

  const pending = (quotesQuery.data ?? []).filter((quote) => quote.status === "sent");
  if (quotesQuery.isPending || !pending.length) {
    return notice ? (
      <p className="mb-5 rounded-xl border border-brand-mantis/25 bg-brand-mantis/10 px-4 py-3 text-sm font-medium text-brand-forest">
        {notice}
      </p>
    ) : null;
  }

  return (
    <div className="mb-5">
      <h2 className="mb-3 text-sm font-extrabold uppercase tracking-wide text-brand-forest/70">
        Quotes awaiting your response
      </h2>
      {notice ? (
        <p className="mb-3 rounded-xl border border-brand-mantis/25 bg-brand-mantis/10 px-4 py-3 text-sm font-medium text-brand-forest">
          {notice}
        </p>
      ) : null}
      {error ? <p className="mb-3 text-sm font-medium text-red-600">{error}</p> : null}
      <div className="grid gap-3 md:grid-cols-2">
        {pending.map((quote: AccountQuote) => (
          <AccountGlass key={quote.id} className="rounded-[18px] p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-bold text-brand-forest">Professional quote</p>
                <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                  {quote.lineItems.map((item) => item.description).join(", ") || "Quoted services"}
                </p>
              </div>
              <span className="shrink-0 rounded-full border border-brand-mantis/30 bg-brand-mantis/10 px-2.5 py-1 text-[10px] font-bold capitalize text-brand-forest">
                {quote.status}
              </span>
            </div>
            <p className="mt-3 text-2xl font-extrabold text-brand-forest">{formatMoney(quote.total)}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Incl. VAT ({((quote.vatRate || 0.05) * 100).toFixed(0)}%): {formatMoney(quote.vat)}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button
                type="button"
                size="sm"
                disabled={respond.isPending}
                onClick={() => respond.mutate({ quoteId: quote.id, response: "accept" })}
              >
                {respond.isPending &&
                respond.variables?.quoteId === quote.id &&
                respond.variables.response === "accept" ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : null}
                Accept quote
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={respond.isPending}
                onClick={() => respond.mutate({ quoteId: quote.id, response: "decline" })}
              >
                {respond.isPending &&
                respond.variables?.quoteId === quote.id &&
                respond.variables.response === "decline" ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : null}
                Decline
              </Button>
            </div>
          </AccountGlass>
        ))}
      </div>
    </div>
  );
}

/**
 * Buyer-only. Two ways to settle an invoice, both lead to the same `paid` status: the
 * seller marks it paid manually once they've received payment some other way (bank
 * transfer, cash — the pre-existing path, unchanged), or the buyer pays online here via
 * Stripe Checkout, which marks it paid automatically the moment the webhook lands. No
 * platform commission is taken; money goes to Kattegat's own Stripe balance the same way
 * subscription payments do, and the seller withdraws it through the existing manual,
 * admin-approved payout flow — there's no Stripe Connect here.
 */
function ReceivedInvoicesSection() {
  const invoicePaid = useSyncExternalStore(subscribeNoop, readInvoicePaidFlag, () => false);
  const [error, setError] = useState<string | null>(null);
  const invoicesQuery = useQuery({
    queryKey: ["account", "invoices", "received"],
    queryFn: fetchAccountReceivedInvoices,
  });
  const payNow = useMutation({
    mutationFn: createAccountInvoiceCheckoutSession,
    onSuccess: ({ url }) => {
      window.location.href = url;
    },
    onError: (err) =>
      setError(err instanceof ApiRequestError ? err.message : "Could not start checkout."),
  });
  const outstanding = (invoicesQuery.data ?? []).filter((invoice) => invoice.status !== "paid");

  if (invoicesQuery.isPending) return null;
  if (!outstanding.length && !invoicePaid) return null;

  return (
    <div className="mb-5">
      {invoicePaid ? (
        <p className="mb-3 rounded-xl border border-brand-mantis/25 bg-brand-mantis/10 px-4 py-3 text-sm font-medium text-brand-forest">
          Payment received. Your invoice will show as paid once Stripe confirms — usually within a
          few seconds.
        </p>
      ) : null}
      {outstanding.length ? (
        <h2 className="mb-3 text-sm font-extrabold uppercase tracking-wide text-brand-forest/70">
          Invoices awaiting payment
        </h2>
      ) : null}
      {error ? <p className="mb-3 text-sm font-medium text-red-600">{error}</p> : null}
      {outstanding.length ? (
      <div className="grid gap-3 md:grid-cols-2">
        {outstanding.map((invoice: AccountInvoice) => (
          <AccountGlass key={invoice.id} className="rounded-[18px] p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-[12px] bg-brand-mantis/10 text-brand-mantis">
                  <Receipt className="size-4.5" aria-hidden />
                </span>
                <div>
                  <p className="font-bold text-brand-forest">{invoice.number}</p>
                  <p className="text-xs text-muted-foreground">{invoice.clientName}</p>
                </div>
              </div>
              <span
                className={cn(
                  "shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold capitalize",
                  invoice.status === "overdue"
                    ? "bg-red-50 text-red-600"
                    : "border border-brand-mantis/30 bg-brand-mantis/10 text-brand-forest",
                )}
              >
                {invoice.status}
              </span>
            </div>
            <p className="mt-3 text-2xl font-extrabold text-brand-forest">{formatMoney(invoice.total)}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Incl. VAT (5%): {formatMoney(invoice.vat)}
              {invoice.dueDate ? ` · Due ${formatSchedule(invoice.dueDate)}` : " · Due on receipt"}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button
                type="button"
                size="sm"
                disabled={payNow.isPending}
                onClick={() => payNow.mutate(invoice.id)}
              >
                {payNow.isPending && payNow.variables === invoice.id ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <CreditCard className="size-3.5" aria-hidden />
                )}
                Pay {formatMoney(invoice.total)} now
              </Button>
              <a
                className={buttonVariants({ size: "sm", variant: "outline" })}
                href={`/api/account/invoices/received/${invoice.id}/document`}
                download
              >
                <Download className="size-3.5" aria-hidden />
                Invoice PDF
              </a>
            </div>
            <p className="mt-3 text-[11px] leading-4 text-muted-foreground">
              Already paid your seller directly? No action needed here — they&apos;ll mark it paid once
              received.
            </p>
          </AccountGlass>
        ))}
      </div>
      ) : null}
    </div>
  );
}

export function AccountJobsBookingsView({ identity }: { identity: AccountIdentity }) {
  const client = useQueryClient();
  const [tab, setTab] = useState<WorkspaceTab>("awards");
  const [actionError, setActionError] = useState<string | null>(null);
  const workQuery = useQuery({
    queryKey: ["account", "bookings", identity],
    queryFn: () => fetchAccountWork(identity),
  });
  const conversationsQuery = useQuery({
    queryKey: ["account", "chat", "conversations"],
    queryFn: fetchAccountConversations,
  });
  const items = workQuery.data ?? [];
  const awards = items.filter((item) => !item.booking);
  const bookings = items.filter((item) => item.booking);
  const displayed = tab === "awards" ? awards : bookings;
  const conversationByPair = useMemo(
    () =>
      new Map(
        (conversationsQuery.data ?? []).map((conversation) => [
          `${conversation.buyerId}:${conversation.sellerId}`,
          conversation.id,
        ]),
      ),
    [conversationsQuery.data],
  );

  const accept = useMutation({
    mutationFn: (contractId: string) => acceptAccountContract(contractId, identity),
    onSuccess: async () => {
      setActionError(null);
      await client.invalidateQueries({ queryKey: ["account", "bookings"] });
    },
    onError: (error) =>
      setActionError(error instanceof ApiRequestError ? error.message : "Could not accept contract."),
  });
  const transition = useMutation({
    mutationFn: ({ bookingId, action }: { bookingId: string; action: BookingAction }) =>
      transitionAccountBooking(bookingId, action, identity),
    onSuccess: async () => {
      setActionError(null);
      await client.invalidateQueries({ queryKey: ["account", "bookings"] });
    },
    onError: (error) =>
      setActionError(error instanceof ApiRequestError ? error.message : "Could not update booking."),
  });
  const review = useMutation({
    mutationFn: submitAccountBookingReview,
    onSuccess: () => setActionError(null),
    onError: (error) =>
      setActionError(error instanceof ApiRequestError ? error.message : "Could not submit review."),
  });
  const busy = accept.isPending || transition.isPending || review.isPending;

  return (
    <AccountViewWrap>
      <AccountViewIntro
        title="Jobs & Bookings"
        badge="Marketplace"
        description="Contracts, schedules, delivery and completed work."
      />

      {identity === "buyer" ? (
        <>
          <ReceivedQuotesSection />
          <ReceivedInvoicesSection />
        </>
      ) : null}

      <div className="mb-5 grid grid-cols-2 gap-3">
        <AccountGlass className="flex items-center gap-3 rounded-[18px] p-4">
          <Trophy className="size-5 text-brand-mantis" />
          <div><p className="text-xl font-extrabold text-brand-forest">{awards.length}</p><p className="text-xs text-muted-foreground">Contract pending</p></div>
        </AccountGlass>
        <AccountGlass className="flex items-center gap-3 rounded-[18px] p-4">
          <CalendarDays className="size-5 text-brand-mantis" />
          <div><p className="text-xl font-extrabold text-brand-forest">{bookings.length}</p><p className="text-xs text-muted-foreground">Bookings</p></div>
        </AccountGlass>
      </div>

      <AccountGlass className="mb-5 rounded-[18px] p-1.5">
        <div role="tablist" aria-label="Jobs and bookings" className="grid grid-cols-2 gap-1.5">
          {[
            { id: "awards" as const, label: "Awarded jobs", count: awards.length },
            { id: "bookings" as const, label: "Bookings", count: bookings.length },
          ].map((item) => (
            <button key={item.id} type="button" role="tab" aria-selected={tab === item.id} onClick={() => setTab(item.id)} className={cn("min-h-11 rounded-xl px-3 text-sm font-bold transition", tab === item.id ? "bg-brand-forest text-white shadow-sm" : "text-brand-forest/65 hover:bg-brand-forest/[0.04]")}>
              {item.label} ({item.count})
            </button>
          ))}
        </div>
      </AccountGlass>

      {actionError ? <p className="mb-4 text-sm font-medium text-red-600">{actionError}</p> : null}

      {workQuery.isPending ? (
        <AccountCardGridSkeleton count={4} columns={2} />
      ) : workQuery.isError ? (
        <AccountGlass className="rounded-[18px] p-10 text-center">
          <BriefcaseBusiness className="mx-auto size-8 text-brand-mantis" />
          <h2 className="mt-4 font-extrabold text-brand-forest">Jobs and bookings temporarily unavailable</h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-brand-forest/65">We couldn&apos;t retrieve your work right now. Please try again shortly.</p>
          <Button type="button" variant="outline" className="mt-5" onClick={() => void workQuery.refetch()}><RefreshCw className="size-4" />Try again</Button>
        </AccountGlass>
      ) : displayed.length ? (
        <div className="grid gap-4 md:grid-cols-2">
          {displayed.map((item) => (
            <WorkCard
              key={item.contract.id}
              item={item}
              identity={identity}
              conversationId={conversationByPair.get(`${item.contract.buyerId}:${item.contract.sellerId}`)}
              busy={busy}
              onAccept={() => accept.mutate(item.contract.id)}
              onTransition={(action) => item.booking && transition.mutate({ bookingId: item.booking.id, action })}
              onReview={(input) => review.mutate(input)}
            />
          ))}
        </div>
      ) : (
        <AccountGlass className="rounded-[18px] p-10 text-center">
          {tab === "awards" ? <Trophy className="mx-auto size-8 text-brand-mantis" /> : <CalendarDays className="mx-auto size-8 text-brand-mantis" />}
          <h2 className="mt-4 font-extrabold text-brand-forest">{tab === "awards" ? "No contracts awaiting booking" : "No bookings yet"}</h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-brand-forest/65">{tab === "awards" ? "Newly awarded jobs remain here until both parties accept the contract." : "A booking appears automatically after both parties accept its contract."}</p>
        </AccountGlass>
      )}
    </AccountViewWrap>
  );
}
