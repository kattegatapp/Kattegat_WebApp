"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Check, ImageIcon, Loader2, Send } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { adminPath } from "@/lib/admin/paths";
import {
  fetchConversationMessages,
  fetchManagedUser,
  openAdminUserConversation,
  sendConversationImage,
  sendConversationMessage,
  type AdminConversationMessage,
} from "@/lib/api/admin";
import { CHAT_MESSAGE_MAX_LENGTH, validateChatMessageInput } from "@/lib/sanitize/chat-message";
import { cn } from "@/lib/utils";

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

function MessageBubble({
  message,
  fromUser,
}: {
  message: AdminConversationMessage;
  fromUser: boolean;
}) {
  const isImage = message.type === "image" && Boolean(message.body?.startsWith("https://"));

  return (
    <div className={cn("flex", fromUser ? "justify-start" : "justify-end")}>
      <div
        className={cn(
          "max-w-[min(92%,34rem)] px-3.5 py-2.5 text-[15px] leading-relaxed shadow-[0_8px_24px_-16px_rgb(0_57_18_/0.45)]",
          fromUser
            ? "rounded-2xl rounded-tl-sm border border-white/80 bg-white text-brand-forest"
            : "rounded-2xl rounded-tr-sm bg-[#0d3b20] text-white",
        )}
      >
        <p
          className={cn(
            "mb-1 text-[10px] font-bold uppercase tracking-[0.14em]",
            fromUser ? "text-muted-foreground" : "text-brand-mantis",
          )}
        >
          {fromUser ? "Member" : "Kattegat.Vetted"}
        </p>
        {isImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={message.body!}
            alt=""
            className="mt-1 max-h-64 w-full rounded-xl object-cover"
          />
        ) : (
          <p className="whitespace-pre-wrap">{message.body}</p>
        )}
        <p
          className={cn(
            "mt-1.5 flex items-center justify-end gap-1 text-[10px]",
            fromUser ? "text-muted-foreground" : "text-white/55",
          )}
        >
          {formatTime(message.createdAt)}
          {!fromUser ? <Check className="size-3" /> : null}
        </p>
      </div>
    </div>
  );
}

export function UserDirectChatPage({ userId }: { userId: string }) {
  const client = useQueryClient();
  const [draft, setDraft] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [showImageField, setShowImageField] = useState(false);
  const [inputError, setInputError] = useState<string | null>(null);
  const [role, setRole] = useState<"buyer" | "seller" | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const userQuery = useQuery({
    queryKey: ["admin", "user", userId],
    queryFn: () => fetchManagedUser(userId),
    retry: false,
  });

  const availableRoles = useMemo(() => {
    const roles: Array<"buyer" | "seller"> = [];
    if (userQuery.data?.bid) roles.push("buyer");
    if (userQuery.data?.sid) roles.push("seller");
    if (!roles.length) roles.push("buyer");
    return roles;
  }, [userQuery.data?.bid, userQuery.data?.sid]);

  const activeRole = role && availableRoles.includes(role) ? role : availableRoles[0]!;

  const threadQuery = useQuery({
    queryKey: ["admin", "user-direct-chat", userId, activeRole],
    queryFn: () => openAdminUserConversation(userId, activeRole),
    enabled: Boolean(userQuery.data),
    retry: 1,
    staleTime: 60_000,
  });

  const conversationId = threadQuery.data?.id ?? null;

  const messagesQuery = useQuery({
    queryKey: ["admin", "user-direct-chat-messages", conversationId],
    queryFn: () => fetchConversationMessages(conversationId as string),
    enabled: Boolean(conversationId),
    refetchInterval: 15_000,
    refetchIntervalInBackground: false,
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messagesQuery.data?.length, conversationId]);

  const send = useMutation({
    mutationFn: async () => {
      if (!conversationId) throw new Error("Chat is not ready yet");
      const text = draft.trim();
      const image = imageUrl.trim();
      if (text) {
        const validated = validateChatMessageInput(text);
        if (!validated.ok) throw new Error(validated.error);
        await sendConversationMessage(conversationId, validated.value);
      }
      if (image) {
        await sendConversationImage(conversationId, image);
      }
      if (!text && !image) throw new Error("Write a message or add an image URL");
    },
    onSuccess: () => {
      setDraft("");
      setImageUrl("");
      setShowImageField(false);
      setInputError(null);
      void client.invalidateQueries({
        queryKey: ["admin", "user-direct-chat-messages", conversationId],
      });
    },
    onError: (error) => {
      setInputError(error instanceof Error ? error.message : "Could not send message");
    },
  });

  const user = userQuery.data;
  const displayName =
    user?.businessName ||
    user?.sellerProfile?.displayName ||
    user?.username ||
    user?.email ||
    "Member";
  const initials = displayName
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const messages = messagesQuery.data ?? [];

  if (userQuery.isPending) {
    return (
      <div className="flex h-full min-h-0 flex-1 items-center justify-center bg-[#07140e]">
        <Loader2 className="size-6 animate-spin text-brand-mantis" />
      </div>
    );
  }

  if (userQuery.isError || !user) {
    return (
      <div className="flex h-full min-h-0 flex-1 flex-col items-center justify-center gap-3 bg-[#f4f7f5] px-6 text-center">
        <p className="font-bold text-brand-forest">This user could not be loaded</p>
        <Button variant="outline" nativeButton={false} render={<Link href={adminPath("/users")} />}>
          Back to users
        </Button>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 w-full flex-1 flex-col overflow-hidden bg-[#07140e]">
      <header className="flex shrink-0 items-center gap-3 border-b border-white/8 bg-[#0b2a18] px-3 py-3 text-white sm:px-4">
        <Button
          type="button"
          size="icon"
          variant="ghost"
          className="size-10 rounded-full text-white hover:bg-white/10 hover:text-white"
          nativeButton={false}
          render={<Link href={adminPath(`/users/${encodeURIComponent(userId)}`)} />}
          aria-label="Back to user profile"
        >
          <ArrowLeft />
        </Button>
        <Avatar className="size-10 border border-white/15">
          <AvatarImage src={user.avatarUrl || undefined} alt="" />
          <AvatarFallback className="bg-brand-mantis/25 text-sm font-extrabold text-brand-mantis">
            {initials || "U"}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[15px] font-extrabold tracking-tight">{displayName}</p>
          <p className="truncate text-xs text-white/60">
            Direct chat · {activeRole === "seller" ? "Seller" : "Buyer"} identity
          </p>
        </div>
        <Badge className="shrink-0 border-brand-mantis/30 bg-brand-mantis/15 text-[10px] font-bold uppercase tracking-[0.14em] text-brand-mantis">
          Vetted
        </Badge>
      </header>

      {availableRoles.length > 1 ? (
        <div className="flex shrink-0 flex-wrap gap-2 border-b border-white/8 bg-[#0f2419] px-3 py-2 sm:px-4">
          {availableRoles.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setRole(option)}
              className={cn(
                "min-h-10 rounded-full px-3 py-2 text-xs font-bold transition sm:min-h-0 sm:py-1.5",
                activeRole === option
                  ? "bg-brand-mantis text-brand-forest"
                  : "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white",
              )}
            >
              Chat as {option}
            </button>
          ))}
        </div>
      ) : null}

      <div
        className="min-h-0 flex-1 space-y-3 overflow-y-auto px-3 py-4 sm:px-5"
        style={{
          backgroundImage:
            "radial-gradient(circle at 12% 0%, rgb(111 219 66 / 0.10), transparent 34%), radial-gradient(circle at 88% 10%, rgb(28 71 89 / 0.09), transparent 30%), linear-gradient(180deg, #e7f0e9 0%, #d8e6db 100%)",
        }}
      >
        {threadQuery.isPending || !conversationId ? (
          <div className="flex min-h-48 flex-col items-center justify-center gap-2 text-sm text-brand-forest/70">
            <Loader2 className="size-5 animate-spin" />
            Opening chat…
          </div>
        ) : threadQuery.isError ? (
          <div className="flex min-h-48 flex-col items-center justify-center gap-3 text-center">
            <p className="text-sm font-semibold text-red-700">Could not open this chat</p>
            <Button type="button" size="sm" variant="outline" onClick={() => threadQuery.refetch()}>
              Try again
            </Button>
          </div>
        ) : messagesQuery.isPending ? (
          <div className="flex min-h-48 items-center justify-center">
            <Loader2 className="size-5 animate-spin text-brand-forest" />
          </div>
        ) : messages.length ? (
          messages.map((message, index) => {
            const prev = messages[index - 1];
            const showDay = !prev || !sameDay(prev.createdAt, message.createdAt);
            return (
              <div key={message.id} className="space-y-3">
                {showDay ? (
                  <div className="flex justify-center">
                    <span className="rounded-full bg-white/90 px-3 py-1 text-[11px] font-semibold text-brand-forest shadow-sm">
                      {formatDay(message.createdAt)}
                    </span>
                  </div>
                ) : null}
                <MessageBubble message={message} fromUser={message.senderId === userId} />
              </div>
            );
          })
        ) : (
          <div className="mx-auto mt-16 max-w-md rounded-3xl bg-white/90 px-5 py-6 text-center shadow-sm">
            <p className="text-base font-extrabold text-brand-forest">Start the conversation</p>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              Message this member directly as Kattegat.Vetted. This stays in-app — no modal, full chat
              screen.
            </p>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <footer className="shrink-0 border-t border-black/5 bg-white/95 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur sm:p-4 sm:pb-4">
        {inputError ? (
          <p className="mb-2 text-xs font-semibold text-red-700">{inputError}</p>
        ) : null}
        {showImageField ? (
          <Input
            value={imageUrl}
            onChange={(event) => setImageUrl(event.target.value)}
            placeholder="Optional HTTPS image URL"
            className="mb-2 h-10 rounded-xl"
          />
        ) : null}
        <div className="mx-auto flex max-w-4xl items-end gap-2">
          <Button
            type="button"
            size="icon"
            variant="outline"
            className="size-11 shrink-0 rounded-xl"
            onClick={() => setShowImageField((value) => !value)}
            aria-label="Attach image URL"
          >
            <ImageIcon />
          </Button>
          <Textarea
            value={draft}
            onChange={(event) => setDraft(event.target.value.slice(0, CHAT_MESSAGE_MAX_LENGTH))}
            placeholder="Write a message as Kattegat.Vetted…"
            className="min-h-11 max-h-36 flex-1 resize-none rounded-2xl border-border/70 bg-white px-3 py-2.5"
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                if (!send.isPending && (draft.trim() || imageUrl.trim())) send.mutate();
              }
            }}
          />
          <Button
            type="button"
            className="h-11 shrink-0 rounded-xl px-4 font-bold"
            disabled={send.isPending || (!draft.trim() && !imageUrl.trim()) || !conversationId}
            onClick={() => send.mutate()}
          >
            {send.isPending ? <Loader2 className="animate-spin" /> : <Send />}
            Send
          </Button>
        </div>
      </footer>
    </div>
  );
}
