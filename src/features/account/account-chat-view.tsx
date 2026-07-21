"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, MessageCircle, Search, Send } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { AccountAvatar } from "@/features/account/account-shared";
import { ChatConversationListSkeleton, ChatMessagesSkeleton } from "@/features/account/account-loading";
import type { AccountIdentity } from "@/features/account/types";
import { Button } from "@/components/ui/button";
import type { AccountDashboard } from "@/lib/api/account";
import { formatRelativeTime } from "@/lib/api/account-home";
import {
  fetchAccountConversationMessages,
  fetchAccountConversations,
  sendAccountConversationMessage,
  type AccountChatMessage,
  type AccountConversation,
} from "@/lib/api/account-chat";
import { cn } from "@/lib/utils";

type AccountChatViewProps = {
  dashboard: AccountDashboard;
  identity?: AccountIdentity;
  initialConversationId?: string;
};

export function AccountChatView({
  dashboard,
  identity,
  initialConversationId,
}: AccountChatViewProps) {
  const queryClient = useQueryClient();
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [activeThread, setActiveThread] = useState<string | null>(initialConversationId ?? null);
  const [draft, setDraft] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [openedThreads, setOpenedThreads] = useState<string[]>(
    initialConversationId ? [initialConversationId] : [],
  );

  const tier = dashboard.sellerProfile?.tier ?? "starter";
  const isStarter = tier === "starter" || tier === "free";
  const isSeller = identity === "seller";
  const myUserId = dashboard.user.id;

  const conversationsQuery = useQuery({
    queryKey: ["account", "chat", "conversations"],
    queryFn: fetchAccountConversations,
  });

  const conversations = useMemo(() => {
    const all = conversationsQuery.data ?? [];
    return all.filter((thread) => {
      if (identity === "seller") return thread.sellerId === myUserId;
      if (identity === "buyer") return thread.buyerId === myUserId;
      return true;
    });
  }, [conversationsQuery.data, identity, myUserId]);

  const filteredConversations = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return conversations;
    return conversations.filter((thread) => {
      const haystack = `${thread.counterpartyName ?? ""} ${thread.lastMessagePreview ?? ""}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [conversations, searchQuery]);

  const selectedThread = conversations.find((thread) => thread.id === activeThread) ?? null;

  const messagesQuery = useQuery({
    queryKey: ["account", "chat", "messages", selectedThread?.id],
    queryFn: () => fetchAccountConversationMessages(selectedThread!.id),
    enabled: Boolean(selectedThread?.id),
  });

  const threadMessages = messagesQuery.data ?? [];

  const sendMessage = useMutation({
    mutationFn: async () => {
      if (!selectedThread) throw new Error("Choose a conversation first.");
      const text = draft.trim();
      if (!text) throw new Error("Write a message first.");
      return sendAccountConversationMessage(selectedThread.id, text);
    },
    onSuccess: async () => {
      setDraft("");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["account", "chat", "conversations"] }),
        queryClient.invalidateQueries({ queryKey: ["account", "chat", "messages", selectedThread?.id] }),
      ]);
    },
  });

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;
    container.scrollTop = container.scrollHeight;
  }, [threadMessages.length, selectedThread?.id]);

  function openThread(threadId: string) {
    setActiveThread(threadId);
    setOpenedThreads((current) => (current.includes(threadId) ? current : [...current, threadId]));
  }

  function previewText(thread: AccountConversation) {
    if (thread.status === "closed") return "Conversation closed";
    if (!thread.lastMessagePreview?.trim()) return "Tap to view";
    return thread.lastMessagePreview;
  }

  function hasUnread(thread: AccountConversation) {
    return Boolean(
      thread.lastMessageSenderId &&
        thread.lastMessageSenderId !== myUserId &&
        !openedThreads.includes(thread.id),
    );
  }

  const emptyTitle = isSeller
    ? isStarter
      ? "Direct chat is locked"
      : "No buyer conversations yet"
    : "No conversations yet";
  const emptyBody = isSeller
    ? isStarter
      ? "Upgrade to Pro or White Glove to receive direct buyer chats."
      : "When buyers message you, threads will appear here."
    : "Message a seller from their profile or listing to start chatting.";

  const showListOnMobile = !selectedThread;

  return (
    <div className="account-chat">
      <div className="account-chat-grid">
        <aside
          className={cn(
            "account-chat-panel is-open flex min-h-0 flex-col border-brand-forest/10 bg-white lg:border-r",
            !showListOnMobile && "max-lg:hidden",
          )}
        >
          <div className="shrink-0 border-b border-brand-forest/10 bg-[#f7f9f8] px-4 py-4">
            <p className="text-lg font-extrabold text-brand-forest">
              {isSeller ? "Seller chats" : "Buyer chats"}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {isSeller ? "Conversations received as a seller" : "Conversations started as a buyer"}
            </p>
            {conversations.length ? (
              <div className="mt-3 flex items-center gap-2 rounded-full border border-brand-forest/10 bg-white px-3 py-2 shadow-sm">
                <Search className="size-4 shrink-0 text-muted-foreground" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search chats"
                  className="min-w-0 flex-1 bg-transparent text-sm text-brand-forest outline-none placeholder:text-muted-foreground"
                />
              </div>
            ) : null}
          </div>

          <div className="account-chat-list">
            {conversationsQuery.isPending ? (
              <ChatConversationListSkeleton />
            ) : filteredConversations.length ? (
              filteredConversations.map((thread) => {
                const unread = hasUnread(thread);
                const selected = selectedThread?.id === thread.id;
                return (
                  <button
                    key={thread.id}
                    type="button"
                    onClick={() => openThread(thread.id)}
                    className={cn(
                      "flex w-full items-center gap-3 border-b border-brand-forest/6 px-4 py-3.5 text-left transition",
                      selected ? "bg-brand-mantis/12" : "hover:bg-brand-forest/[0.03]",
                    )}
                  >
                    <AccountAvatar
                      name={thread.counterpartyName ?? "Conversation"}
                      imageUrl={thread.counterpartyAvatarUrl}
                      className="size-12 rounded-full text-sm"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p
                          className={cn(
                            "truncate text-[15px]",
                            unread ? "font-extrabold text-brand-forest" : "font-semibold text-brand-forest",
                          )}
                        >
                          {thread.counterpartyName ?? "Conversation"}
                        </p>
                        <span className="shrink-0 text-[11px] text-muted-foreground">
                          {thread.lastMessageAt ? formatRelativeTime(thread.lastMessageAt) : ""}
                        </span>
                      </div>
                      <div className="mt-1 flex items-center gap-2">
                        <p
                          className={cn(
                            "line-clamp-1 flex-1 text-[13px]",
                            unread ? "font-medium text-brand-forest" : "text-brand-forest/60",
                          )}
                        >
                          {previewText(thread)}
                        </p>
                        {unread ? (
                          <span className="grid size-5 shrink-0 place-items-center rounded-full bg-brand-mantis text-[10px] font-bold text-brand-forest">
                            •
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="flex flex-col items-center px-6 py-14 text-center">
                <MessageCircle className="size-7 text-brand-mantis" />
                <p className="mt-4 font-bold text-brand-forest">{emptyTitle}</p>
                <p className="mt-1 max-w-xs text-[13px] leading-6 text-brand-forest/65">{emptyBody}</p>
              </div>
            )}
          </div>

          {isStarter && isSeller ? (
            <div className="shrink-0 border-t border-brand-forest/10 bg-brand-mantis/8 px-4 py-3 text-[12px] leading-5 text-brand-forest/70">
              Starter sellers route inquiries through Kattegat Vetted. Upgrade to Pro for direct chat.
            </div>
          ) : null}
        </aside>

        {selectedThread ? (
          <section className="account-chat-panel is-open flex min-h-0 min-w-0 flex-1 flex-col bg-white">
              <header className="flex shrink-0 items-center gap-3 border-b border-brand-forest/10 bg-[#f7f9f8] px-3 py-3 sm:px-4">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-9 shrink-0 rounded-full lg:hidden"
                  onClick={() => setActiveThread(null)}
                  aria-label="Back to chats"
                >
                  <ArrowLeft className="size-4" />
                </Button>
                <AccountAvatar
                  name={selectedThread.counterpartyName ?? "Conversation"}
                  imageUrl={selectedThread.counterpartyAvatarUrl}
                  className="size-10 rounded-full text-sm"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-bold text-brand-forest">
                    {selectedThread.counterpartyName ?? "Conversation"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {selectedThread.status === "closed" ? "Closed" : "Active now"}
                  </p>
                </div>
              </header>

              <div
                ref={messagesContainerRef}
                className="account-chat-wallpaper account-chat-messages px-3 py-4 sm:px-5"
              >
                {messagesQuery.isPending ? (
                  <ChatMessagesSkeleton />
                ) : threadMessages.length ? (
                  <div className="flex flex-col gap-2">
                    {threadMessages.map((msg: AccountChatMessage) => {
                      const fromMe = msg.senderId === myUserId;
                      return (
                        <div key={msg.id} className={cn("flex", fromMe ? "justify-end" : "justify-start")}>
                          <div
                            className={cn(
                              "max-w-[min(85%,28rem)] px-3 py-2 shadow-sm",
                              fromMe
                                ? "rounded-2xl rounded-br-md bg-[#dcf8c6] text-brand-forest"
                                : "rounded-2xl rounded-bl-md border border-brand-forest/8 bg-white text-brand-forest",
                            )}
                          >
                            <p className="whitespace-pre-wrap text-[14px] leading-6">{msg.body ?? ""}</p>
                            <p className="mt-1 text-right text-[10px] text-brand-forest/50">
                              {formatRelativeTime(msg.createdAt)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No messages yet. Say hello.</p>
                )}
              </div>

              <footer className="shrink-0 border-t border-brand-forest/10 bg-[#f7f9f8] px-3 py-3 sm:px-4">
                <div className="flex items-end gap-2">
                  <input
                    type="text"
                    value={draft}
                    onChange={(event) => setDraft(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" && !sendMessage.isPending) {
                        void sendMessage.mutateAsync();
                      }
                    }}
                    placeholder={
                      selectedThread.status === "closed"
                        ? "This conversation is closed"
                        : "Type a message"
                    }
                    disabled={selectedThread.status === "closed" || sendMessage.isPending}
                    className="min-w-0 flex-1 rounded-full border border-brand-forest/10 bg-white px-4 py-2.5 text-sm text-brand-forest outline-none placeholder:text-muted-foreground focus:border-brand-mantis/50 disabled:cursor-not-allowed disabled:opacity-70"
                  />
                  <button
                    type="button"
                    onClick={() => void sendMessage.mutateAsync()}
                    disabled={
                      selectedThread.status === "closed" ||
                      sendMessage.isPending ||
                      !draft.trim()
                    }
                    className="grid size-11 shrink-0 place-items-center rounded-full bg-brand-mantis text-brand-forest shadow-sm transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50"
                    aria-label="Send message"
                  >
                    <Send className="size-4" />
                  </button>
                </div>
              </footer>
          </section>
        ) : (
          <section className="account-chat-panel is-open hidden min-h-0 flex-col bg-white lg:flex">
            <div className="account-chat-wallpaper account-chat-messages flex flex-col items-center justify-center px-6 text-center">
              <MessageCircle className="size-10 text-brand-mantis/80" />
              <p className="mt-4 text-lg font-bold text-brand-forest">Kattegat messages</p>
              <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                Select a conversation to view messages. Only the chat list and message area scroll.
              </p>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
