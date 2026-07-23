"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  BriefcaseBusiness,
  CalendarDays,
  Check,
  Download,
  Loader2,
  MapPin,
  MessageCircle,
  RefreshCw,
  Star,
  Trophy,
} from "lucide-react";
import { useMemo, useState } from "react";

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
import { ApiRequestError } from "@/lib/api/client";
import { cn } from "@/lib/utils";

type WorkspaceTab = "awards" | "bookings";
const STAGES = ["Awarded", "Contract", "Confirmed", "In progress", "Completed"];

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
  return (
    <ol aria-label="Job progress" className="grid grid-cols-5">
      {STAGES.map((stage, index) => (
        <li key={stage} className="relative flex min-w-0 flex-col items-center text-center">
          {index > 0 ? (
            <span
              className={cn(
                "absolute left-0 top-2.5 h-0.5 w-1/2",
                index <= active ? "bg-brand-mantis" : "bg-brand-forest/10",
              )}
            />
          ) : null}
          {index < STAGES.length - 1 ? (
            <span
              className={cn(
                "absolute right-0 top-2.5 h-0.5 w-1/2",
                index < active ? "bg-brand-mantis" : "bg-brand-forest/10",
              )}
            />
          ) : null}
          <span
            className={cn(
              "relative z-10 grid size-5 place-items-center rounded-full border-2",
              index <= active
                ? "border-brand-mantis bg-brand-mantis text-brand-forest"
                : "border-brand-forest/15 bg-white",
            )}
          >
            {index <= active ? <Check className="size-3" aria-hidden /> : null}
          </span>
          <span className="mt-2 truncate text-[9px] font-bold text-brand-forest/55 sm:text-[10px]">
            {stage}
          </span>
        </li>
      ))}
    </ol>
  );
}

function WorkCard({
  item,
  conversationId,
  busy,
  onAccept,
  onTransition,
  onReview,
}: {
  item: AccountWorkItem;
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
          href={`/api/account/bookings/contracts/${item.contract.id}/document`}
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

export function AccountJobsBookingsView() {
  const client = useQueryClient();
  const [tab, setTab] = useState<WorkspaceTab>("awards");
  const [actionError, setActionError] = useState<string | null>(null);
  const workQuery = useQuery({ queryKey: ["account", "bookings"], queryFn: fetchAccountWork });
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
    mutationFn: acceptAccountContract,
    onSuccess: async () => {
      setActionError(null);
      await client.invalidateQueries({ queryKey: ["account", "bookings"] });
    },
    onError: (error) =>
      setActionError(error instanceof ApiRequestError ? error.message : "Could not accept contract."),
  });
  const transition = useMutation({
    mutationFn: ({ bookingId, action }: { bookingId: string; action: BookingAction }) =>
      transitionAccountBooking(bookingId, action),
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
