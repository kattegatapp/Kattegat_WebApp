"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, ImageIcon, Loader2, Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  fetchConversationMessages,
  openContactAgentThread,
  sendConversationMessage,
  touchContactAgentRequest,
  type AdminConversationMessage,
} from "@/lib/api/admin";
import { ListingPreviewSheet } from "@/features/admin/vetted/listing-preview-sheet";
import { CHAT_MESSAGE_MAX_LENGTH, validateChatMessageInput } from "@/lib/sanitize/chat-message";
import { cn } from "@/lib/utils";

export type ListingQuote = {
  title: string;
  listingId: string;
  message: string;
  coverImage?: string | null;
};

function parseListingQuote(body: string | null): ListingQuote | null {
  if (!body) return null;
  const match = body.match(
    /^Service inquiry: (.+)\nOpen service: \/listing\/([^\s]+)\n\n([\s\S]*)$/,
  );
  if (!match?.[1] || !match[2]) return null;
  return {
    title: match[1],
    listingId: match[2],
    message: match[3]?.trim() ?? "",
  };
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat("en-AE", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatDay(value: string) {
  return new Intl.DateTimeFormat("en-AE", {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

function sameDay(a: string, b: string) {
  return new Date(a).toDateString() === new Date(b).toDateString();
}

interface ContactAgentThreadPaneProps {
  requestId: string;
  role: "buyer" | "seller";
  counterpartyName: string;
  counterpartyId: string;
  listingId?: string | null;
  listingTitle?: string | null;
  listingCoverImage?: string | null;
  listingPricing?: { amount?: number; unit?: string | null } | null;
  sellerName?: string | null;
  suggestedDraft?: string | null;
  onSuggestedDraftConsumed?: () => void;
  onThreadReady?: () => void;
  /** Closed cases must not reopen or accept new messages. */
  readOnly?: boolean;
  className?: string;
}

function ListingQuoteCard({
  quote,
  coverImage,
  mine,
  onOpen,
}: {
  quote: ListingQuote;
  coverImage?: string | null;
  mine: boolean;
  onOpen?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={(event) => {
        event.stopPropagation();
        onOpen?.();
      }}
      className={cn(
        "mb-2 w-full overflow-hidden rounded-xl border text-left transition",
        mine ? "border-white/20 bg-black/15 hover:bg-black/25" : "border-border/70 bg-muted/40 hover:bg-muted/70",
        onOpen && "cursor-pointer",
      )}
    >
      <div className="flex gap-2.5 p-2">
        <div className="relative size-14 shrink-0 overflow-hidden rounded-lg bg-brand-forest/10">
          {coverImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={coverImage} alt="" className="size-full object-cover" />
          ) : (
            <div className="flex size-full items-center justify-center text-brand-forest/40">
              <ImageIcon className="size-5" />
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1 py-0.5">
          <p
            className={cn(
              "text-[10px] font-bold uppercase tracking-[0.14em]",
              mine ? "text-white/65" : "text-brand-blue",
            )}
          >
            Listing · tap to preview
          </p>
          <p className={cn("mt-0.5 line-clamp-2 text-sm font-bold", mine ? "text-white" : "text-brand-forest")}>
            {quote.title}
          </p>
          <p className={cn("mt-1 font-mono text-[10px]", mine ? "text-white/50" : "text-muted-foreground")}>
            /listing/{quote.listingId}
          </p>
        </div>
      </div>
    </button>
  );
}

function MessageBubble({
  message,
  fromCounterparty,
  role,
  coverImage,
  grouped,
  onOpenListing,
}: {
  message: AdminConversationMessage;
  fromCounterparty: boolean;
  role: "buyer" | "seller";
  coverImage?: string | null;
  grouped: boolean;
  onOpenListing?: (listingId: string) => void;
}) {
  const quote = parseListingQuote(message.body);
  const body = quote?.message || message.body || "";

  return (
    <div className={cn("flex", fromCounterparty ? "justify-start" : "justify-end", grouped ? "mt-1" : "mt-3")}>
      <div
        className={cn(
          "max-w-[min(94%,34rem)] px-3.5 py-2.5 text-[15px] leading-relaxed shadow-[0_8px_24px_-16px_rgb(0_57_18_/0.45)]",
          fromCounterparty
            ? cn("border border-white/80 bg-white text-brand-forest", grouped ? "rounded-2xl rounded-tl-md" : "rounded-2xl rounded-tl-sm")
            : cn("bg-[#0d3b20] text-white", grouped ? "rounded-2xl rounded-tr-md" : "rounded-2xl rounded-tr-sm"),
        )}
      >
        {!grouped ? (
          <p
            className={cn(
              "mb-1 text-[10px] font-bold uppercase tracking-[0.14em]",
              fromCounterparty ? "text-muted-foreground" : "text-brand-mantis",
            )}
          >
            {fromCounterparty ? (role === "buyer" ? "Buyer" : "Seller") : "Kattegat.Vetted"}
          </p>
        ) : null}
        {quote ? (
          <ListingQuoteCard
            quote={quote}
            coverImage={coverImage}
            mine={!fromCounterparty}
            onOpen={onOpenListing ? () => onOpenListing(quote.listingId) : undefined}
          />
        ) : null}
        {body ? <p className="whitespace-pre-wrap">{body}</p> : null}
        <p
          className={cn(
            "mt-1.5 flex items-center justify-end gap-1 text-[10px]",
            fromCounterparty ? "text-muted-foreground" : "text-white/55",
          )}
        >
          {formatTime(message.createdAt)}
          {!fromCounterparty ? <Check className="size-3" /> : null}
        </p>
      </div>
    </div>
  );
}

/**
 * Full-height WhatsApp-style chat pane for one concierge leg (admin ↔ buyer or seller).
 */
export function ContactAgentThreadPane({
  requestId,
  role,
  counterpartyName,
  counterpartyId,
  listingId,
  listingTitle,
  listingCoverImage,
  listingPricing,
  sellerName,
  suggestedDraft,
  onSuggestedDraftConsumed,
  onThreadReady,
  readOnly = false,
  className,
}: ContactAgentThreadPaneProps) {
  const [draft, setDraft] = useState("");
  const [inputError, setInputError] = useState<string | null>(null);
  const [seenSuggestion, setSeenSuggestion] = useState<string | null>(null);
  const [previewListingId, setPreviewListingId] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const readyNotified = useRef(false);
  const client = useQueryClient();
  const isBuyer = role === "buyer";

  if (!readOnly && suggestedDraft && suggestedDraft !== seenSuggestion) {
    setSeenSuggestion(suggestedDraft);
    setDraft(suggestedDraft);
    onSuggestedDraftConsumed?.();
  }

  const threadQuery = useQuery({
    queryKey: ["admin", "contact-agent-thread", requestId, role],
    queryFn: () => openContactAgentThread(requestId, role),
    retry: 1,
    staleTime: 60_000,
    enabled: !readOnly,
  });

  const conversationId = readOnly ? null : (threadQuery.data?.conversationId ?? null);

  useEffect(() => {
    if (readOnly || !conversationId || readyNotified.current) return;
    readyNotified.current = true;
    onThreadReady?.();
  }, [conversationId, onThreadReady, readOnly]);

  const messagesQuery = useQuery({
    queryKey: ["admin", "contact-agent-thread-messages", conversationId],
    queryFn: () => fetchConversationMessages(conversationId as string),
    enabled: Boolean(conversationId),
    // Desk polls both buyer + seller panes; keep interval modest and pause in background tabs.
    refetchInterval: 15_000,
    refetchIntervalInBackground: false,
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messagesQuery.data?.length, conversationId]);

  const send = useMutation({
    mutationFn: async (cleanBody: string) => {
      if (readOnly || !conversationId) {
        throw new Error("This case is closed.");
      }
      const message = await sendConversationMessage(conversationId, cleanBody);
      await touchContactAgentRequest(requestId).catch(() => undefined);
      return message;
    },
    onSuccess: () => {
      setDraft("");
      setInputError(null);
      client.invalidateQueries({
        queryKey: ["admin", "contact-agent-thread-messages", conversationId],
      });
      client.invalidateQueries({ queryKey: ["admin", "contact-agent-requests"] });
    },
  });

  function sendDraft() {
    if (readOnly || !conversationId || send.isPending) return;
    const validated = validateChatMessageInput(draft);
    if (!validated.ok) {
      setInputError(validated.error);
      return;
    }
    setInputError(null);
    send.mutate(validated.value);
  }

  const messages = messagesQuery.data ?? [];

  return (
    <section
      className={cn(
        "flex min-h-0 flex-1 flex-col overflow-hidden bg-[#dfeae2]",
        className,
      )}
    >
      <header className="flex shrink-0 items-center gap-3 border-b border-black/5 bg-[#0b2a18] px-4 py-3 text-white">
        <div
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-full text-sm font-extrabold ring-2 ring-white/10",
            isBuyer ? "bg-brand-blue/35 text-[#9fd0ff]" : "bg-brand-mantis/25 text-brand-mantis",
          )}
        >
          {(counterpartyName.trim()[0] || "?").toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[15px] font-extrabold tracking-tight">{counterpartyName}</p>
          <p className="truncate text-xs text-white/60">
            {readOnly ? "Case closed" : isBuyer ? "Buyer chat" : "Seller chat"}
            {listingTitle ? ` · ${listingTitle}` : ""}
          </p>
        </div>
        {listingId ? (
          <Button
            type="button"
            size="sm"
            variant="secondary"
            className="h-10 rounded-full bg-white/10 px-3 text-[11px] font-bold text-brand-mantis hover:bg-white/15 sm:h-8"
            onClick={() => setPreviewListingId(listingId)}
          >
            Listing
          </Button>
        ) : (
          <div className="rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-brand-mantis">
            Vetted
          </div>
        )}
      </header>

      <div
        className="min-h-0 flex-1 space-y-0 overflow-y-auto px-4 py-4 sm:px-5"
        style={{
          backgroundImage:
            "radial-gradient(circle at 10% 0%, rgb(111 219 66 / 0.10), transparent 32%), radial-gradient(circle at 90% 12%, rgb(28 71 89 / 0.08), transparent 28%), linear-gradient(180deg, #e7f0e9 0%, #d8e6db 100%)",
        }}
      >
        {readOnly ? (
          <div className="mx-auto mt-12 max-w-md rounded-3xl bg-white/85 px-5 py-6 text-center shadow-sm">
            <p className="text-base font-extrabold text-brand-forest">Chat closed</p>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              This Contact Agent session was closed and its messages were removed. Messaging is
              disabled.
            </p>
          </div>
        ) : threadQuery.isPending || !conversationId ? (
          <div className="flex min-h-40 items-center justify-center text-sm text-brand-forest/70">
            Opening chat…
          </div>
        ) : threadQuery.isError ? (
          <div className="flex min-h-40 flex-col items-center justify-center gap-3 text-center">
            <p className="text-sm font-semibold text-red-700">Could not open this chat</p>
            <Button type="button" size="sm" variant="outline" onClick={() => threadQuery.refetch()}>
              Try again
            </Button>
          </div>
        ) : messagesQuery.isPending ? (
          <div className="min-h-40" role="status" aria-live="polite" aria-busy="true">
            <span className="sr-only">Loading messages</span>
          </div>
        ) : messages.length ? (
          messages.map((message, index) => {
            const prev = messages[index - 1];
            const showDay = !prev || !sameDay(prev.createdAt, message.createdAt);
            const fromCounterparty = message.senderId === counterpartyId;
            const grouped =
              Boolean(prev) &&
              prev.senderId === message.senderId &&
              !showDay &&
              new Date(message.createdAt).getTime() - new Date(prev.createdAt).getTime() < 120_000;

            return (
              <div key={message.id}>
                {showDay ? (
                  <div className="my-4 flex justify-center">
                    <span className="rounded-full bg-white/90 px-3 py-1 text-[11px] font-semibold text-brand-forest shadow-sm">
                      {formatDay(message.createdAt)}
                    </span>
                  </div>
                ) : null}
                <MessageBubble
                  message={message}
                  fromCounterparty={fromCounterparty}
                  role={role}
                  coverImage={listingCoverImage}
                  grouped={grouped}
                  onOpenListing={(id) => setPreviewListingId(id)}
                />
              </div>
            );
          })
        ) : (
          <div className="mx-auto mt-12 max-w-md rounded-3xl bg-white/85 px-5 py-6 text-center shadow-sm">
            <p className="text-base font-extrabold text-brand-forest">Start the conversation</p>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              {isBuyer
                ? "Confirm what the buyer needs, then take it to the seller."
                : "Ask the seller for the details that will help the buyer."}
            </p>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <ListingPreviewSheet
        listingId={previewListingId}
        open={Boolean(previewListingId)}
        onOpenChange={(open) => {
          if (!open) setPreviewListingId(null);
        }}
        fallback={{
          title: listingTitle,
          coverImage: listingCoverImage,
          pricing: listingPricing,
          sellerName,
        }}
      />

      <footer className="shrink-0 border-t border-black/5 bg-white/95 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur sm:p-4 sm:pb-4">
        {readOnly ? (
          <p className="mx-auto max-w-4xl rounded-2xl bg-muted/60 px-4 py-3 text-center text-sm text-muted-foreground">
            Messaging is locked for closed cases.
          </p>
        ) : (
          <>
            <div className="mx-auto flex max-w-4xl items-end gap-2">
              <Textarea
                className="min-h-[52px] max-h-32 flex-1 resize-none rounded-[1.6rem] border-transparent bg-[#eef4f0] px-4 py-3 text-[15px] shadow-inner focus-visible:ring-brand-mantis/35"
                value={draft}
                maxLength={CHAT_MESSAGE_MAX_LENGTH}
                onChange={(event) => {
                  setDraft(event.target.value);
                  if (inputError) setInputError(null);
                }}
                placeholder={`Message ${isBuyer ? "buyer" : "seller"}…`}
                disabled={!conversationId || send.isPending}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    sendDraft();
                  }
                }}
              />
              <Button
                type="button"
                size="icon"
                className="size-12 shrink-0 rounded-full bg-[#0b2a18] text-white hover:bg-[#134022]"
                disabled={!conversationId || !draft.trim() || send.isPending}
                onClick={sendDraft}
              >
                {send.isPending ? <Loader2 className="animate-spin" /> : <Send className="size-4" />}
              </Button>
            </div>
            {inputError || send.isError ? (
              <p className="mx-auto mt-2 max-w-4xl text-xs font-medium text-red-600">
                {inputError ||
                  (send.error instanceof Error ? send.error.message : "Message could not be sent.")}
              </p>
            ) : (
              <p className="mx-auto mt-1.5 max-w-4xl text-[11px] text-muted-foreground">
                {draft.length}/{CHAT_MESSAGE_MAX_LENGTH} · scripts and unsafe markup are blocked
              </p>
            )}
          </>
        )}
      </footer>
    </section>
  );
}
