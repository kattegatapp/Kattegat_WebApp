"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  BriefcaseBusiness,
  CheckCircle2,
  Clock3,
  Download,
  FileText,
  Loader2,
  Plus,
  ReceiptText,
  Send,
  Sparkles,
  Users,
  Wallet,
} from "lucide-react";
import { useState, type ReactNode } from "react";

import {
  AccountAvatar,
  AccountGlass,
  AccountListCard,
  AccountViewIntro,
  AccountViewWrap,
} from "@/features/account/account-shared";
import { AccountCardGridSkeleton } from "@/features/account/account-loading";
import { QuoteComposer } from "@/features/account/quote-composer";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  createSellerClient,
  fetchSellerClients,
  fetchSellerInvoices,
  fetchSellerQuotes,
  invoiceAction,
  quoteAction,
  type SellerClient,
  type SellerInvoice,
  type SellerQuote,
} from "@/lib/api/account-seller-tools";
import { MoneyText } from "@/components/currency";
import { cn } from "@/lib/utils";

type Tab = "quotes" | "invoices" | "clients";

const money = (value: number) =>
  `AED ${(value / 100).toLocaleString("en-AE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const QUOTE_STATUS: Record<
  SellerQuote["status"],
  { label: string; className: string; tone: string }
> = {
  draft: {
    label: "Draft",
    className: "border-brand-forest/15 bg-brand-forest/[0.06] text-brand-forest/75",
    tone: "Ready to send",
  },
  sent: {
    label: "Awaiting response",
    className: "border-amber-300/60 bg-amber-50 text-amber-900",
    tone: "Sent to client",
  },
  accepted: {
    label: "Accepted",
    className: "border-emerald-300/70 bg-emerald-50 text-emerald-800",
    tone: "Converted",
  },
  declined: {
    label: "Declined",
    className: "border-red-200 bg-red-50 text-red-700",
    tone: "Closed",
  },
  expired: {
    label: "Expired",
    className: "border-brand-forest/10 bg-brand-forest/[0.04] text-brand-forest/50",
    tone: "No longer valid",
  },
};

const INVOICE_STATUS: Record<
  SellerInvoice["status"],
  { label: string; className: string }
> = {
  unpaid: {
    label: "Unpaid",
    className: "border-amber-300/60 bg-amber-50 text-amber-900",
  },
  overdue: {
    label: "Overdue",
    className: "border-red-200 bg-red-50 text-red-700",
  },
  paid: {
    label: "Paid",
    className: "border-emerald-300/70 bg-emerald-50 text-emerald-800",
  },
};

function formatShortDate(value: string | null | undefined) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("en-AE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function StatChip({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof FileText;
  label: string;
  value: number;
}) {
  return (
    <div className="flex min-w-0 items-center gap-3 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur-sm">
      <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-brand-mantis/20 text-brand-mantis">
        <Icon className="size-4" aria-hidden />
      </span>
      <div className="min-w-0">
        <p className="text-lg font-extrabold tracking-tight text-white">{value}</p>
        <p className="truncate text-[11px] font-semibold uppercase tracking-[0.12em] text-white/55">
          {label}
        </p>
      </div>
    </div>
  );
}

function EmptyPanel({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: typeof FileText;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <AccountGlass className="rounded-[1.35rem] px-6 py-12 text-center sm:px-10">
      <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-brand-mantis/15 text-brand-mantis">
        <Icon className="size-6" aria-hidden />
      </span>
      <h3 className="mt-5 text-lg font-extrabold text-brand-forest">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-brand-forest/60">{description}</p>
      {action ? <div className="mt-6 flex justify-center">{action}</div> : null}
    </AccountGlass>
  );
}

function QuoteCard({
  item,
  busy,
  isActing,
  onAction,
}: {
  item: SellerQuote;
  busy: boolean;
  isActing: (name: string) => boolean;
  onAction: (name: "send" | "accept" | "decline") => void;
}) {
  const status = QUOTE_STATUS[item.status];
  const preview = item.lineItems
    .slice(0, 2)
    .map((line) => line.description)
    .join(" · ");
  const more = Math.max(0, item.lineItems.length - 2);

  return (
    <AccountListCard className="flex h-full flex-col overflow-hidden p-0">
      <div className="flex items-start gap-3 border-b border-brand-forest/8 bg-gradient-to-br from-[#F7F9F8] to-white px-4 py-4 sm:px-5">
        <AccountAvatar name={item.client.name} className="size-11 shrink-0 rounded-2xl" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate text-base font-extrabold text-brand-forest">
              {item.client.name}
            </h3>
            <span
              className={cn(
                "rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.08em]",
                status.className,
              )}
            >
              {status.label}
            </span>
          </div>
          <p className="mt-1 truncate text-xs text-muted-foreground">
            {preview || "Quoted services"}
            {more > 0 ? ` +${more} more` : ""}
          </p>
          <p className="mt-1 text-[11px] font-medium text-brand-forest/45">{status.tone}</p>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-4 px-4 py-4 sm:px-5">
        <div className="rounded-2xl border border-brand-forest/8 bg-[#F7F9F8] p-3.5">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                Quote total
              </p>
              <p className="mt-1 text-2xl font-extrabold tracking-tight text-brand-forest">
                <MoneyText>{money(item.total)}</MoneyText>
              </p>
            </div>
            <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-bold text-brand-forest/55 ring-1 ring-brand-forest/8">
              {item.lineItems.length} item{item.lineItems.length === 1 ? "" : "s"}
            </span>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 border-t border-brand-forest/8 pt-3 text-xs">
            <div>
              <p className="text-muted-foreground">Subtotal</p>
              <MoneyText className="mt-0.5 font-bold text-brand-forest">
                {money(item.subtotal)}
              </MoneyText>
            </div>
            <div className="text-right">
              <p className="text-muted-foreground">
                VAT ({((item.vatRate || 0.05) * 100).toFixed(0)}%)
              </p>
              <MoneyText className="mt-0.5 font-bold text-brand-forest">
                {money(item.vat)}
              </MoneyText>
            </div>
          </div>
        </div>

        <div className="mt-auto flex flex-wrap gap-2">
          {item.status === "draft" ? (
            <Button
              size="sm"
              disabled={busy}
              onClick={() => onAction("send")}
              className="bg-brand-forest text-white hover:bg-brand-forest/90"
            >
              {isActing("send") ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Send className="size-3.5" />
              )}
              Send quote
            </Button>
          ) : null}
          {item.status === "sent" ? (
            <>
              <Button
                size="sm"
                disabled={busy}
                onClick={() => onAction("accept")}
                className="bg-brand-mantis text-brand-forest hover:bg-brand-forest hover:text-white"
              >
                {isActing("accept") ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <CheckCircle2 className="size-3.5" />
                )}
                Mark accepted & invoice
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={busy}
                onClick={() => onAction("decline")}
              >
                {isActing("decline") ? <Loader2 className="size-3.5 animate-spin" /> : null}
                Decline
              </Button>
            </>
          ) : null}
          <a
            className={buttonVariants({ size: "sm", variant: "outline" })}
            href={`/api/account/seller-tools/quotes/${item.id}/document`}
            download
          >
            <Download className="size-3.5" />
            Download PDF
          </a>
        </div>
      </div>
    </AccountListCard>
  );
}

function InvoiceCard({
  item,
  busy,
  isActing,
  onSend,
  onMarkPaid,
}: {
  item: SellerInvoice;
  busy: boolean;
  isActing: (name: string) => boolean;
  onSend: () => void;
  onMarkPaid: () => void;
}) {
  const status = INVOICE_STATUS[item.status];
  const due = formatShortDate(item.dueDate);

  return (
    <AccountListCard className="flex h-full flex-col overflow-hidden p-0">
      <div className="flex items-start justify-between gap-3 border-b border-brand-forest/8 bg-gradient-to-br from-[#F7F9F8] to-white px-4 py-4 sm:px-5">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-extrabold text-brand-forest">{item.number}</h3>
            <span
              className={cn(
                "rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.08em]",
                status.className,
              )}
            >
              {status.label}
            </span>
          </div>
          <p className="mt-1 truncate text-sm text-muted-foreground">{item.clientName}</p>
        </div>
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-blue/10 text-brand-blue">
          <ReceiptText className="size-4.5" aria-hidden />
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-4 px-4 py-4 sm:px-5">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
            Amount due
          </p>
          <MoneyText className="mt-1 text-2xl font-extrabold tracking-tight text-brand-forest">
            {money(item.total)}
          </MoneyText>
          <p className="mt-1 text-xs text-muted-foreground">
            {due ? `Due ${due}` : "Due on receipt"}
            {item.sentAt ? " · Sent" : " · Not sent yet"}
          </p>
        </div>

        <div className="mt-auto flex flex-wrap gap-2">
          {!item.sentAt ? (
            <Button
              size="sm"
              disabled={busy}
              onClick={onSend}
              className="bg-brand-forest text-white hover:bg-brand-forest/90"
            >
              {isActing("send") ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Send className="size-3.5" />
              )}
              Send invoice
            </Button>
          ) : null}
          {item.status !== "paid" ? (
            <Button size="sm" variant="outline" disabled={busy} onClick={onMarkPaid}>
              {isActing("mark-paid") ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Wallet className="size-3.5" />
              )}
              Record offline payment
            </Button>
          ) : (
            <span className="inline-flex h-7 items-center gap-1.5 rounded-lg bg-emerald-50 px-2.5 text-xs font-bold text-emerald-800">
              <CheckCircle2 className="size-3.5" />
              Payment recorded
            </span>
          )}
          <a
            className={buttonVariants({ size: "sm", variant: "outline" })}
            href={`/api/account/seller-tools/invoices/${item.id}/document`}
            download
          >
            <Download className="size-3.5" />
            PDF
          </a>
        </div>
      </div>
    </AccountListCard>
  );
}

function ClientCard({ item }: { item: SellerClient }) {
  return (
    <AccountListCard className="flex items-start gap-3 p-4">
      <AccountAvatar name={item.name} className="size-11 shrink-0 rounded-2xl" />
      <div className="min-w-0 flex-1">
        <h3 className="truncate font-extrabold text-brand-forest">{item.name}</h3>
        <p className="mt-0.5 truncate text-sm text-muted-foreground">
          {item.email || item.phone || "No contact details"}
        </p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {(
            [
              [`${item.quoteCount} quotes`, FileText],
              [`${item.invoiceCount} invoices`, ReceiptText],
              [`${item.bookingCount} bookings`, BriefcaseBusiness],
            ] as const
          ).map(([label, Icon]) => (
            <span
              key={label}
              className="inline-flex items-center gap-1 rounded-full bg-brand-forest/[0.05] px-2.5 py-1 text-[10px] font-bold text-brand-forest/65"
            >
              <Icon className="size-3" aria-hidden />
              {label}
            </span>
          ))}
        </div>
      </div>
    </AccountListCard>
  );
}

export function AccountSellerToolsView() {
  const client = useQueryClient();
  const [tab, setTab] = useState<Tab>("quotes");
  const [error, setError] = useState<string | null>(null);
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [quoteComposerOpen, setQuoteComposerOpen] = useState(false);

  const clients = useQuery({
    queryKey: ["account", "seller-tools", "clients"],
    queryFn: fetchSellerClients,
  });
  const quotes = useQuery({
    queryKey: ["account", "seller-tools", "quotes"],
    queryFn: fetchSellerQuotes,
  });
  const invoices = useQuery({
    queryKey: ["account", "seller-tools", "invoices"],
    queryFn: fetchSellerInvoices,
  });

  const refresh = async () => {
    setError(null);
    await client.invalidateQueries({ queryKey: ["account", "seller-tools"] });
  };

  const createClient = useMutation({
    mutationFn: createSellerClient,
    onSuccess: async () => {
      setClientName("");
      setClientEmail("");
      await refresh();
    },
    onError: (cause) => setError(cause instanceof Error ? cause.message : "Could not add client."),
  });

  const action = useMutation({
    mutationFn: async ({
      type,
      id,
      name,
    }: {
      type: "quote" | "invoice";
      id: string;
      name: string;
    }) => {
      if (type === "quote") return quoteAction(id, name as "send" | "accept" | "decline");
      return invoiceAction(id, name as "send" | "mark-paid");
    },
    onSuccess: refresh,
    onError: (cause) =>
      setError(cause instanceof Error ? cause.message : "Could not update Seller Tools."),
  });

  const isActing = (type: "quote" | "invoice", id: string, name: string) =>
    action.isPending &&
    action.variables?.type === type &&
    action.variables?.id === id &&
    action.variables?.name === name;

  const anyActionPending = action.isPending;
  const loading = clients.isPending || quotes.isPending || invoices.isPending;
  const proRequired = [clients.error, quotes.error, invoices.error].some(
    (cause) => cause instanceof Error && cause.message.toLowerCase().includes("pro"),
  );

  const quoteList = quotes.data ?? [];
  const invoiceList = invoices.data ?? [];
  const clientList = clients.data ?? [];

  const stats = {
    quotes: quoteList.length,
    invoices: invoiceList.length,
    clients: clientList.length,
    awaiting: quoteList.filter((q) => q.status === "sent").length,
    unpaid: invoiceList.filter((i) => i.status !== "paid").length,
    pipeline: quoteList
      .filter((q) => q.status === "draft" || q.status === "sent")
      .reduce((sum, q) => sum + q.total, 0),
  };

  if (proRequired) {
    return (
      <AccountViewWrap>
        <AccountViewIntro
          title="Seller Tools"
          badge="Marketplace"
          description="Professional quotes, invoices, and client management."
        />
        <AccountGlass className="rounded-[1.5rem] p-10 text-center">
          <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-brand-mantis/15 text-brand-mantis">
            <Sparkles className="size-6" aria-hidden />
          </span>
          <h2 className="mt-5 text-xl font-extrabold text-brand-forest">Seller Tools requires Pro</h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
            Upgrade on the Kattegat website to create professional quotes and invoices with branded
            PDFs.
          </p>
          <a
            href="/plans"
            className="mt-6 inline-flex h-11 items-center justify-center rounded-xl bg-brand-mantis px-5 text-sm font-extrabold text-brand-forest transition hover:brightness-95"
          >
            View plans
          </a>
        </AccountGlass>
      </AccountViewWrap>
    );
  }

  return (
    <AccountViewWrap>
      <section className="relative mb-5 overflow-hidden rounded-[1.5rem] border border-brand-forest/10 bg-gradient-to-br from-brand-forest via-[#0a2e1a] to-brand-blue p-5 text-white sm:p-7">
        <div
          className="pointer-events-none absolute -right-16 -top-16 size-56 rounded-full bg-brand-mantis/20 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-20 left-10 size-48 rounded-full bg-brand-emerald/15 blur-3xl"
          aria-hidden
        />
        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0 max-w-xl">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-brand-mantis">
              Marketplace workspace
            </p>
            <h2 className="mt-2 text-2xl font-extrabold tracking-tight sm:text-[1.75rem]">
              Seller Tools
            </h2>
            <p className="mt-2 text-sm leading-6 text-white/70">
              Build itemised quotes, send branded invoices, and keep your client book organised —
              all under the Kattegat brand.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              onClick={() => {
                setTab("quotes");
                setQuoteComposerOpen(true);
              }}
              disabled={!clientList.length}
              className="h-11 rounded-xl bg-brand-mantis px-5 font-extrabold text-brand-forest hover:brightness-95"
            >
              <Plus className="size-4" />
              New quote
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setTab("clients")}
              className="h-11 rounded-xl border-white/20 bg-white/10 px-5 font-bold text-white hover:bg-white/15 hover:text-white"
            >
              <Users className="size-4" />
              Clients
            </Button>
          </div>
        </div>

        <div className="relative mt-6 grid gap-3 sm:grid-cols-3">
          <StatChip icon={FileText} label="Quotes" value={stats.quotes} />
          <StatChip icon={ReceiptText} label="Invoices" value={stats.invoices} />
          <StatChip icon={Users} label="Clients" value={stats.clients} />
        </div>

        {!loading && (stats.awaiting > 0 || stats.unpaid > 0 || stats.pipeline > 0) ? (
          <div className="relative mt-4 flex flex-wrap gap-x-4 gap-y-1 text-xs text-white/60">
            {stats.awaiting > 0 ? (
              <span className="inline-flex items-center gap-1.5">
                <Clock3 className="size-3.5 text-brand-mantis" />
                {stats.awaiting} quote{stats.awaiting === 1 ? "" : "s"} awaiting response
              </span>
            ) : null}
            {stats.unpaid > 0 ? (
              <span className="inline-flex items-center gap-1.5">
                <Wallet className="size-3.5 text-brand-mantis" />
                {stats.unpaid} unpaid invoice{stats.unpaid === 1 ? "" : "s"}
              </span>
            ) : null}
            {stats.pipeline > 0 ? (
              <span className="inline-flex items-center gap-1.5">
                <Sparkles className="size-3.5 text-brand-mantis" />
                <MoneyText>{money(stats.pipeline)}</MoneyText> in open quotes
              </span>
            ) : null}
          </div>
        ) : null}
      </section>

      <AccountGlass className="mb-5 rounded-[1.25rem] p-1.5">
        <div role="tablist" aria-label="Seller tools" className="grid grid-cols-3 gap-1.5">
          {(
            [
              ["quotes", "Quotes", FileText, stats.quotes],
              ["invoices", "Invoices", ReceiptText, stats.invoices],
              ["clients", "Clients", Users, stats.clients],
            ] as const
          ).map(([id, label, Icon, count]) => {
            const selected = tab === id;
            return (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => setTab(id)}
                className={cn(
                  "flex min-h-11 items-center justify-center gap-2 rounded-xl px-2 text-sm font-bold transition",
                  selected
                    ? "bg-brand-forest text-white shadow-sm"
                    : "text-brand-forest/65 hover:bg-brand-forest/[0.04]",
                )}
              >
                <Icon className="size-4 shrink-0" aria-hidden />
                <span className="truncate">{label}</span>
                <span
                  className={cn(
                    "rounded-full px-1.5 py-0.5 text-[10px] font-extrabold",
                    selected ? "bg-white/15 text-white" : "bg-brand-forest/8 text-brand-forest/55",
                  )}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </AccountGlass>

      {error ? (
        <p
          role="alert"
          className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700"
        >
          {error}
        </p>
      ) : null}

      {loading ? <AccountCardGridSkeleton count={4} columns={2} /> : null}

      {tab === "quotes" && !loading ? (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-extrabold text-brand-forest">Your quotes</h3>
              <p className="text-xs text-muted-foreground">
                UAE 5% VAT is included on every quote automatically.
              </p>
            </div>
            <Button
              onClick={() => setQuoteComposerOpen(true)}
              disabled={!clientList.length}
              className="gap-1.5 bg-brand-forest text-white hover:bg-brand-forest/90"
            >
              <Plus className="size-3.5" />
              New quote
            </Button>
          </div>

          {!clientList.length ? (
            <EmptyPanel
              icon={Users}
              title="Add a client first"
              description="Quotes need a client so history stays organised. Add one in Clients, or quote directly from a chat."
              action={
                <Button type="button" onClick={() => setTab("clients")}>
                  Open clients
                </Button>
              }
            />
          ) : quoteList.length ? (
            <div className="grid gap-4 md:grid-cols-2">
              {quoteList.map((item) => (
                <QuoteCard
                  key={item.id}
                  item={item}
                  busy={anyActionPending}
                  isActing={(name) => isActing("quote", item.id, name)}
                  onAction={(name) => action.mutate({ type: "quote", id: item.id, name })}
                />
              ))}
            </div>
          ) : (
            <EmptyPanel
              icon={FileText}
              title="No quotes yet"
              description="Create an itemised quote with line items and VAT, then send it to your client in one tap."
              action={
                <Button
                  type="button"
                  onClick={() => setQuoteComposerOpen(true)}
                  className="bg-brand-mantis font-extrabold text-brand-forest hover:brightness-95"
                >
                  <Plus className="size-4" />
                  Create first quote
                </Button>
              }
            />
          )}
        </div>
      ) : null}

      {tab === "invoices" && !loading ? (
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-extrabold text-brand-forest">Invoices</h3>
            <p className="text-xs text-muted-foreground">
              Accept a quote to create its invoice automatically, or record offline payments here.
            </p>
          </div>
          {invoiceList.length ? (
            <div className="grid gap-4 md:grid-cols-2">
              {invoiceList.map((item) => (
                <InvoiceCard
                  key={item.id}
                  item={item}
                  busy={anyActionPending}
                  isActing={(name) => isActing("invoice", item.id, name)}
                  onSend={() => action.mutate({ type: "invoice", id: item.id, name: "send" })}
                  onMarkPaid={() => {
                    if (
                      window.confirm(
                        "Confirm that you already received this payment outside Kattegat.",
                      )
                    ) {
                      action.mutate({ type: "invoice", id: item.id, name: "mark-paid" });
                    }
                  }}
                />
              ))}
            </div>
          ) : (
            <EmptyPanel
              icon={ReceiptText}
              title="No invoices yet"
              description="When a quote is accepted, Kattegat creates the matching invoice automatically."
              action={
                <Button type="button" variant="outline" onClick={() => setTab("quotes")}>
                  Go to quotes
                </Button>
              }
            />
          )}
        </div>
      ) : null}

      {tab === "clients" && !loading ? (
        <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
          <AccountGlass className="h-fit space-y-4 rounded-[1.35rem] p-5">
            <div>
              <h3 className="font-extrabold text-brand-forest">Add client</h3>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                Manual clients are for your records. In-app Accept/Decline works for buyers already
                on Kattegat (linked from a conversation or booking).
              </p>
            </div>
            <div className="space-y-1.5">
              <Label>Name</Label>
              <Input
                value={clientName}
                onChange={(event) => setClientName(event.target.value)}
                placeholder="Client or company name"
                className="h-10 rounded-xl"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Email (optional)</Label>
              <Input
                value={clientEmail}
                onChange={(event) => setClientEmail(event.target.value)}
                placeholder="client@email.com"
                type="email"
                className="h-10 rounded-xl"
              />
            </div>
            <Button
              disabled={!clientName.trim() || createClient.isPending}
              onClick={() =>
                createClient.mutate({
                  name: clientName.trim(),
                  email: clientEmail.trim() || undefined,
                })
              }
              className="w-full bg-brand-forest text-white hover:bg-brand-forest/90"
            >
              {createClient.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Plus className="size-4" />
              )}
              Save client
            </Button>
          </AccountGlass>

          <div className="space-y-3">
            {clientList.length ? (
              clientList.map((item) => <ClientCard key={item.id} item={item} />)
            ) : (
              <EmptyPanel
                icon={Users}
                title="Your client book is empty"
                description="Add a contact manually, or they&apos;ll appear automatically from chats and bookings."
              />
            )}
          </div>
        </div>
      ) : null}

      {quoteComposerOpen ? (
        <QuoteComposer
          onClose={() => setQuoteComposerOpen(false)}
          clients={clients.data}
          onSent={() => setQuoteComposerOpen(false)}
        />
      ) : null}
    </AccountViewWrap>
  );
}
