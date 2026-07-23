"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BriefcaseBusiness, FileText, ReceiptText, Users } from "lucide-react";
import { useState } from "react";

import { AccountGlass, AccountViewIntro, AccountViewWrap } from "@/features/account/account-shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  createSellerClient,
  createSellerQuote,
  fetchSellerClients,
  fetchSellerInvoices,
  fetchSellerQuotes,
  invoiceAction,
  quoteAction,
} from "@/lib/api/account-seller-tools";
import { cn } from "@/lib/utils";

type Tab = "quotes" | "invoices" | "clients";
const money = (value: number) => new Intl.NumberFormat("en-AE", { style: "currency", currency: "AED" }).format(value / 100);

export function AccountSellerToolsView() {
  const client = useQueryClient();
  const [tab, setTab] = useState<Tab>("quotes");
  const [error, setError] = useState<string | null>(null);
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [quoteClient, setQuoteClient] = useState("");
  const [description, setDescription] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [unitPrice, setUnitPrice] = useState("");
  const [applyVat, setApplyVat] = useState(false);
  const clients = useQuery({ queryKey: ["account", "seller-tools", "clients"], queryFn: fetchSellerClients });
  const quotes = useQuery({ queryKey: ["account", "seller-tools", "quotes"], queryFn: fetchSellerQuotes });
  const invoices = useQuery({ queryKey: ["account", "seller-tools", "invoices"], queryFn: fetchSellerInvoices });
  const refresh = async () => {
    setError(null);
    await client.invalidateQueries({ queryKey: ["account", "seller-tools"] });
  };
  const createClient = useMutation({
    mutationFn: createSellerClient,
    onSuccess: async () => { setClientName(""); setClientEmail(""); await refresh(); },
    onError: (cause) => setError(cause instanceof Error ? cause.message : "Could not add client."),
  });
  const createQuote = useMutation({
    mutationFn: createSellerQuote,
    onSuccess: async () => { setDescription(""); setUnitPrice(""); await refresh(); },
    onError: (cause) => setError(cause instanceof Error ? cause.message : "Could not create quote."),
  });
  const action = useMutation({
    mutationFn: async ({ type, id, name }: { type: "quote" | "invoice"; id: string; name: string }) => {
      if (type === "quote") return quoteAction(id, name as "send" | "accept" | "decline");
      return invoiceAction(id, name as "send" | "mark-paid");
    },
    onSuccess: refresh,
    onError: (cause) => setError(cause instanceof Error ? cause.message : "Could not update Seller Tools."),
  });
  const loading = clients.isPending || quotes.isPending || invoices.isPending;
  const proRequired = [clients.error, quotes.error, invoices.error].some(
    (cause) => cause instanceof Error && cause.message.toLowerCase().includes("pro"),
  );

  if (proRequired) {
    return (
      <AccountViewWrap>
        <AccountViewIntro title="Seller Tools" badge="Marketplace" description="Professional quotes, invoices, bookings, clients and earnings." />
        <AccountGlass className="rounded-2xl p-10 text-center">
          <BriefcaseBusiness className="mx-auto size-9 text-brand-mantis" />
          <h2 className="mt-4 text-xl font-extrabold text-brand-forest">Seller Tools requires Pro</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">Upgrade on the Kattegat website to create professional quotes and invoices.</p>
        </AccountGlass>
      </AccountViewWrap>
    );
  }

  return (
    <AccountViewWrap>
      <AccountViewIntro title="Seller Tools" badge="Marketplace" description="Quote, invoice and manage clients without leaving Kattegat." />
      <div className="mb-5 grid grid-cols-3 gap-2 rounded-2xl border bg-white/70 p-1.5">
        {([
          ["quotes", "Quotes", FileText],
          ["invoices", "Invoices", ReceiptText],
          ["clients", "Clients", Users],
        ] as const).map(([id, label, Icon]) => (
          <button key={id} type="button" onClick={() => setTab(id)} className={cn("flex min-h-11 items-center justify-center gap-2 rounded-xl text-sm font-bold", tab === id ? "bg-brand-forest text-white" : "text-brand-forest/65")}>
            <Icon className="size-4" />{label}
          </button>
        ))}
      </div>
      {error ? <p className="mb-4 text-sm font-semibold text-red-600">{error}</p> : null}
      {loading ? <AccountGlass className="rounded-2xl p-8 text-sm text-muted-foreground">Loading Seller Tools…</AccountGlass> : null}

      {tab === "clients" && !loading ? (
        <div className="grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
          <AccountGlass className="space-y-3 rounded-2xl p-5">
            <h2 className="font-extrabold text-brand-forest">Add client</h2>
            <Input value={clientName} onChange={(event) => setClientName(event.target.value)} placeholder="Client name" />
            <Input value={clientEmail} onChange={(event) => setClientEmail(event.target.value)} placeholder="Email (optional)" />
            <Button disabled={!clientName.trim() || createClient.isPending} onClick={() => createClient.mutate({ name: clientName.trim(), email: clientEmail.trim() || undefined })}>Save client</Button>
          </AccountGlass>
          <div className="grid gap-3">
            {(clients.data ?? []).map((item) => (
              <AccountGlass key={item.id} className="rounded-2xl p-4">
                <h3 className="font-extrabold text-brand-forest">{item.name}</h3>
                <p className="text-sm text-muted-foreground">{item.email || item.phone || "No contact details"}</p>
                <p className="mt-3 text-xs text-brand-forest/55">{item.quoteCount} quotes · {item.invoiceCount} invoices · {item.bookingCount} bookings</p>
              </AccountGlass>
            ))}
          </div>
        </div>
      ) : null}

      {tab === "quotes" && !loading ? (
        <div className="space-y-4">
          <AccountGlass className="grid gap-3 rounded-2xl p-5 md:grid-cols-2">
            <h2 className="font-extrabold text-brand-forest md:col-span-2">New itemised quote</h2>
            <select className="h-10 rounded-lg border bg-white px-3 text-sm" value={quoteClient} onChange={(event) => setQuoteClient(event.target.value)}>
              <option value="">Choose client</option>
              {(clients.data ?? []).map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
            </select>
            <Input value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Line-item description" />
            <Input value={quantity} onChange={(event) => setQuantity(event.target.value)} type="number" min="0.5" step="0.5" placeholder="Quantity" />
            <Input value={unitPrice} onChange={(event) => setUnitPrice(event.target.value)} type="number" min="0" step="0.01" placeholder="Unit price (AED)" />
            <label className="flex items-center gap-2 text-sm text-brand-forest"><input type="checkbox" checked={applyVat} onChange={(event) => setApplyVat(event.target.checked)} />Apply VAT if registered</label>
            <Button disabled={!quoteClient || !description.trim() || !unitPrice || createQuote.isPending} onClick={() => createQuote.mutate({ clientRef: quoteClient, lineItems: [{ description: description.trim(), quantity: Number(quantity), unitPrice: Math.round(Number(unitPrice) * 100) }], discount: 0, applyVat })}>Save draft quote</Button>
          </AccountGlass>
          <div className="grid gap-4 md:grid-cols-2">
            {(quotes.data ?? []).map((item) => (
              <AccountGlass key={item.id} className="rounded-2xl p-5">
                <div className="flex justify-between gap-3"><div><h3 className="font-extrabold text-brand-forest">{item.client.name}</h3><p className="text-xs capitalize text-muted-foreground">{item.status}</p></div><p className="font-extrabold text-brand-forest">{money(item.total)}</p></div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {item.status === "draft" ? <Button size="sm" onClick={() => action.mutate({ type: "quote", id: item.id, name: "send" })}>Send</Button> : null}
                  {item.status === "sent" ? <><Button size="sm" onClick={() => action.mutate({ type: "quote", id: item.id, name: "accept" })}>Accept & invoice</Button><Button size="sm" variant="outline" onClick={() => action.mutate({ type: "quote", id: item.id, name: "decline" })}>Decline</Button></> : null}
                  <a className="inline-flex h-7 items-center rounded-lg border px-2.5 text-xs font-semibold" href={`/api/account/seller-tools/quotes/${item.id}/document`} download>PDF</a>
                </div>
              </AccountGlass>
            ))}
          </div>
        </div>
      ) : null}

      {tab === "invoices" && !loading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {(invoices.data ?? []).map((item) => (
            <AccountGlass key={item.id} className="rounded-2xl p-5">
              <div className="flex justify-between gap-3"><div><h3 className="font-extrabold text-brand-forest">{item.number}</h3><p className="text-sm text-muted-foreground">{item.clientName} · <span className="capitalize">{item.status}</span></p></div><p className="font-extrabold text-brand-forest">{money(item.total)}</p></div>
              <div className="mt-4 flex gap-2">
                {!item.sentAt ? <Button size="sm" onClick={() => action.mutate({ type: "invoice", id: item.id, name: "send" })}>Send</Button> : null}
                {item.status !== "paid" ? <Button size="sm" variant="outline" onClick={() => {
                  if (window.confirm("Confirm that you already received this payment outside Kattegat.")) {
                    action.mutate({ type: "invoice", id: item.id, name: "mark-paid" });
                  }
                }}>Record offline payment</Button> : null}
                <a className="inline-flex h-7 items-center rounded-lg border px-2.5 text-xs font-semibold" href={`/api/account/seller-tools/invoices/${item.id}/document`} download>PDF</a>
              </div>
            </AccountGlass>
          ))}
        </div>
      ) : null}
    </AccountViewWrap>
  );
}
