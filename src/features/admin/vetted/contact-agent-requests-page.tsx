"use client";

import { useQuery } from "@tanstack/react-query";
import {
  ConciergeBell,
  ImageIcon,
  Loader2,
  MessagesSquare,
  Search,
  Sparkles,
  XCircle,
} from "lucide-react";
import { useMemo, useState } from "react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ContactAgentCaseWorkspace } from "@/features/admin/vetted/contact-agent-case-workspace";
import { formatAdminAccessError } from "@/lib/admin/capabilities";
import {
  fetchContactAgentRequests,
  type AdminContactAgentRequest,
  type ContactAgentRequestStatus,
} from "@/lib/api/admin";
import { cn } from "@/lib/utils";

const SEEN_STORAGE_KEY = "kattegat.vetted-chats.seen-v1";

const statuses: Array<{ value: "all" | ContactAgentRequestStatus; label: string }> = [
  { value: "all", label: "All chats" },
  { value: "new", label: "New" },
  { value: "in_progress", label: "Working" },
  { value: "contacted", label: "Buyer updated" },
  { value: "resolved", label: "Complete" },
];

const STATUS_PILL: Record<ContactAgentRequestStatus, string> = {
  new: "border-amber-200/80 bg-amber-50 text-amber-900",
  in_progress: "border-sky-200/80 bg-sky-50 text-sky-900",
  contacted: "border-brand-blue/20 bg-brand-blue/5 text-brand-blue",
  resolved: "border-emerald-200/80 bg-emerald-50 text-emerald-900",
  closed: "border-border bg-muted text-muted-foreground",
};

const STATUS_LABEL: Record<ContactAgentRequestStatus, string> = {
  new: "New",
  in_progress: "Working",
  contacted: "Updated",
  resolved: "Done",
  closed: "Closed",
};

function shortDate(value: string) {
  return new Intl.DateTimeFormat("en-AE", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function readSeenMap(): Record<string, string> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(SEEN_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, string>;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function writeSeenMap(map: Record<string, string>) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SEEN_STORAGE_KEY, JSON.stringify(map));
}

function activityAt(item: AdminContactAgentRequest) {
  return item.lastActivityAt || item.updatedAt || item.createdAt;
}

function isUnread(item: AdminContactAgentRequest, seenAt: string | undefined) {
  // Unread is only for counterparty (buyer/seller) traffic — never for messages we sent.
  const count = typeof item.unreadCount === "number" ? item.unreadCount : 0;
  if (count <= 0) return false;
  if (!seenAt) return true;
  // Opening the case clears the badge until a newer member message arrives.
  return activityAt(item) > seenAt;
}

function unreadBadgeCount(item: AdminContactAgentRequest, unread: boolean) {
  if (!unread) return 0;
  const count = typeof item.unreadCount === "number" ? item.unreadCount : 0;
  return Math.max(1, count);
}

function RequestRow({
  item,
  selected,
  unread,
  onSelect,
}: {
  item: AdminContactAgentRequest;
  selected: boolean;
  unread: boolean;
  onSelect: () => void;
}) {
  const preview = item.lastMessagePreview || item.message;
  const badge = unreadBadgeCount(item, unread);

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "flex w-full gap-3 border-l-2 px-3 py-3.5 text-left transition",
        selected
          ? "border-l-brand-mantis bg-white/[0.08]"
          : unread
            ? "border-l-[#25d366] bg-[#25d366]/10 hover:bg-[#25d366]/14"
            : "border-l-transparent hover:bg-white/[0.04]",
      )}
    >
      <div className="relative size-12 shrink-0 overflow-hidden rounded-2xl bg-white/10 ring-1 ring-white/10">
        {item.listingCoverImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.listingCoverImage} alt="" className="size-full object-cover" />
        ) : (
          <div className="flex size-full items-center justify-center text-sm font-extrabold text-brand-mantis">
            {(item.buyerName.trim()[0] || "?").toUpperCase()}
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p
            className={cn(
              "truncate text-[15px] text-white",
              unread ? "font-extrabold" : "font-semibold",
            )}
          >
            {item.buyerName}
          </p>
          <span
            className={cn(
              "shrink-0 text-[11px]",
              unread ? "font-bold text-[#25d366]" : "text-white/45",
            )}
          >
            {shortDate(activityAt(item))}
          </span>
        </div>
        <p className="mt-0.5 truncate text-xs text-brand-mantis/90">
          {item.listingTitle || item.sellerName}
        </p>
        <div className="mt-1.5 flex items-center gap-2">
          <p
            className={cn(
              "min-w-0 flex-1 truncate text-xs",
              unread ? "font-semibold text-white" : "text-white/55",
            )}
          >
            {preview}
          </p>
          {badge > 0 ? (
            <span className="inline-flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-[#25d366] px-1.5 text-[11px] font-extrabold leading-none text-[#052e16] shadow-[0_0_0_2px_rgb(11_31_21)]">
              {badge > 99 ? "99+" : badge}
            </span>
          ) : (
            <Badge variant="outline" className={cn("shrink-0 border text-[9px]", STATUS_PILL[item.status])}>
              {STATUS_LABEL[item.status]}
            </Badge>
          )}
        </div>
      </div>
    </button>
  );
}

export function ContactAgentRequestsPage() {
  const [status, setStatus] = useState<"all" | ContactAgentRequestStatus>("all");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mobileShowCase, setMobileShowCase] = useState(false);
  const [seenMap, setSeenMap] = useState<Record<string, string>>(() => readSeenMap());

  const query = useQuery({
    queryKey: ["admin", "contact-agent-requests", status],
    queryFn: () => fetchContactAgentRequests(status),
    retry: false,
    refetchInterval: 30_000,
    refetchIntervalInBackground: false,
  });

  const filtered = useMemo(() => {
    const items = [...(query.data ?? [])]
      .filter((item) => item.status !== "closed")
      .sort((a, b) => (activityAt(a) > activityAt(b) ? -1 : 1));
    const needle = search.trim().toLowerCase();
    if (!needle) return items;
    return items.filter((item) =>
      [item.buyerName, item.sellerName, item.listingTitle, item.message, item.lastMessagePreview, item.assignedName]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(needle),
    );
  }, [query.data, search]);

  const activeId =
    selectedId && filtered.some((item) => item.id === selectedId)
      ? selectedId
      : (filtered[0]?.id ?? null);

  const selected = filtered.find((item) => item.id === activeId) ?? null;
  const openCount = (query.data ?? []).filter(
    (item) => item.status === "new" || item.status === "in_progress" || item.status === "contacted",
  ).length;
  const unreadCount = filtered.reduce((total, item) => {
    const unread = item.id !== activeId && isUnread(item, seenMap[item.id]);
    return total + unreadBadgeCount(item, unread);
  }, 0);

  function markSeen(item: AdminContactAgentRequest) {
    const stamp = activityAt(item);
    setSeenMap((prev) => {
      const next = { ...prev, [item.id]: stamp };
      writeSeenMap(next);
      return next;
    });
  }

  return (
    <div className="flex h-full min-h-0 w-full flex-1 overflow-hidden bg-[#07140e]">
      <aside
        className={cn(
          "flex w-full min-h-0 flex-col border-r border-white/8 bg-[#0b1f15] lg:w-[320px] xl:w-[360px]",
          mobileShowCase ? "hidden lg:flex" : "flex",
        )}
      >
        <div className="shrink-0 space-y-3 border-b border-white/8 px-4 py-4">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-brand-mantis">
                <ConciergeBell className="size-3.5" />
                Kattegat.Vetted
              </p>
              <h1 className="mt-1 text-xl font-extrabold tracking-tight text-white">Vetted chats</h1>
            </div>
            <div className="flex flex-col items-end gap-1.5">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-mantis/15 px-2.5 py-1 text-[11px] font-bold text-brand-mantis">
                <MessagesSquare className="size-3.5" />
                {openCount} open
              </span>
              {unreadCount > 0 ? (
                <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[#25d366] px-1.5 text-[11px] font-extrabold text-[#052e16]">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              ) : null}
            </div>
          </div>
          <div className="relative">
            <Search
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-white/35"
              aria-hidden
            />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search conversations…"
              aria-label="Search conversations"
              className="h-11 rounded-2xl border-white/10 bg-white/5 pl-9 text-white placeholder:text-white/35"
            />
          </div>
          <Select value={status} onValueChange={(value) => setStatus((value as typeof status) ?? "all")}>
            <SelectTrigger className="h-10 w-full rounded-2xl border-white/10 bg-white/5 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {statuses.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">
          {query.isPending ? (
            <div className="flex min-h-48 items-center justify-center">
              <Loader2 className="size-6 animate-spin text-brand-mantis" />
            </div>
          ) : query.isError ? (
            <Alert className="m-3 border-red-200 bg-red-50 text-red-800">
              <XCircle />
              <AlertTitle>Could not load cases</AlertTitle>
              <AlertDescription>
                {formatAdminAccessError(query.error, "Please try again.")}
              </AlertDescription>
            </Alert>
          ) : !filtered.length ? (
            <div className="flex min-h-48 flex-col items-center justify-center px-6 text-center text-white/80">
              <Sparkles className="size-7 text-brand-mantis" />
              <p className="mt-3 font-bold">No cases here</p>
              <p className="mt-1 text-sm text-white/50">New Contact Agent requests show up here.</p>
            </div>
          ) : (
            filtered.map((item) => (
              <RequestRow
                key={item.id}
                item={item}
                selected={item.id === activeId}
                unread={item.id !== activeId && isUnread(item, seenMap[item.id])}
                onSelect={() => {
                  setSelectedId(item.id);
                  markSeen(item);
                  setMobileShowCase(true);
                }}
              />
            ))
          )}
        </div>
      </aside>

      <section
        className={cn(
          "flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-[#e8efe9]",
          mobileShowCase ? "flex" : "hidden lg:flex",
        )}
      >
        {selected ? (
          <ContactAgentCaseWorkspace
            key={selected.id}
            request={selected}
            showBack
            onBack={() => setMobileShowCase(false)}
            onSessionRemoved={() => {
              setSelectedId(null);
              setMobileShowCase(false);
            }}
          />
        ) : (
          <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-6 text-center">
            <div className="flex size-16 items-center justify-center rounded-3xl bg-brand-forest/10">
              <ImageIcon className="size-7 text-brand-forest/40" />
            </div>
            <p className="mt-4 text-xl font-extrabold text-brand-forest">Pick a Vetted chat</p>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              Open a Contact Agent case to relay between buyer and seller as Kattegat.Vetted.
              White Glove managed accounts are handled from the seller&apos;s user profile.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
