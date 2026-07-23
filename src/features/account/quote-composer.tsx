"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MessageCircle, Plus, Send, Trash2 } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  createSellerQuote,
  quoteAction,
  type SellerClient,
} from "@/lib/api/account-seller-tools";
import { cn } from "@/lib/utils";

const UAE_VAT_RATE = 0.05;
const money = (fils: number) =>
  new Intl.NumberFormat("en-AE", { style: "currency", currency: "AED" }).format(fils / 100);

type DraftItem = { description: string; quantity: string; unitPrice: string };
const blankItem = (): DraftItem => ({ description: "", quantity: "1", unitPrice: "" });

type QuoteComposerProps = {
  /** Rendered only while a quote is being composed — mounting fresh each time is what
   * gives the form a clean slate, rather than resetting state via an effect. */
  onClose: () => void;
  /** Client Book mode — omit when composing straight from a conversation. */
  clients?: SellerClient[];
  /** Conversation mode — the backend resolves/creates the Client Book entry from the buyer. */
  conversationId?: string;
  counterpartyName?: string | null;
  onSent: () => void;
};

export function QuoteComposer({
  onClose,
  clients,
  conversationId,
  counterpartyName,
  onSent,
}: QuoteComposerProps) {
  const queryClient = useQueryClient();
  const fromConversation = Boolean(conversationId);
  const [clientRef, setClientRef] = useState("");
  const [items, setItems] = useState<DraftItem[]>([blankItem()]);
  const [discount, setDiscount] = useState("");
  const [error, setError] = useState<string | null>(null);
  // Both actions below chain through the same `create` mutation (send = create -> send,
  // draft = create alone) — tracking which button was actually pressed keeps their loading
  // states from bleeding into each other. See the mobile fix for the same anti-pattern.
  const [pendingAction, setPendingAction] = useState<"send" | "draft" | null>(null);

  const normalized = items.map((item) => ({
    description: item.description.trim(),
    quantity: Number(item.quantity),
    unitPrice: Math.round(Number(item.unitPrice || 0) * 100),
  }));
  const subtotal = normalized.reduce(
    (sum, item) => sum + (Number.isFinite(item.quantity * item.unitPrice) ? item.quantity * item.unitPrice : 0),
    0,
  );
  const discountFils = Math.min(Math.round((Number(discount) || 0) * 100), Math.max(0, subtotal));
  const taxable = Math.max(0, subtotal - discountFils);
  const vat = Math.round(taxable * UAE_VAT_RATE);
  const total = taxable + vat;
  const valid =
    (fromConversation || Boolean(clientRef)) &&
    normalized.every((item) => item.description && item.quantity > 0 && item.unitPrice >= 0);

  const create = useMutation({ mutationFn: createSellerQuote });
  const send = useMutation({ mutationFn: (id: string) => quoteAction(id, "send") });
  const busy = create.isPending || send.isPending;

  function updateItem(index: number, patch: Partial<DraftItem>) {
    setItems((current) => current.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item)));
  }

  async function refreshLists() {
    await queryClient.invalidateQueries({ queryKey: ["account", "seller-tools"] });
  }

  function submit(action: "send" | "draft") {
    if (!valid || busy) return;
    setError(null);
    setPendingAction(action);
    create.mutate(
      {
        clientRef: fromConversation ? undefined : clientRef,
        conversationId,
        lineItems: normalized,
        discount: Math.max(0, discountFils),
      },
      {
        onSuccess: (quote) => {
          if (action === "draft") {
            void refreshLists();
            onSent();
            return;
          }
          send.mutate(quote.id, {
            onSuccess: () => {
              void refreshLists();
              onSent();
            },
            onError: (cause) =>
              setError(
                cause instanceof Error
                  ? `Quote saved as a draft, but sending failed: ${cause.message}`
                  : "Quote saved as a draft, but sending failed.",
              ),
          });
        },
        onError: (cause) => setError(cause instanceof Error ? cause.message : "Could not create quote."),
      },
    );
  }

  return (
    <Dialog open onOpenChange={(next) => !busy && !next && onClose()}>
      <DialogContent className="max-h-[85vh] w-full max-w-lg overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{fromConversation ? "Send a quote" : "New itemised quote"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {fromConversation ? (
            <div className="flex items-start gap-2.5 rounded-xl border border-brand-forest/10 bg-brand-mantis/8 p-3">
              <MessageCircle className="mt-0.5 size-4 shrink-0 text-brand-forest/70" />
              <p className="text-[13px] leading-5 text-brand-forest/75">
                Quoting {counterpartyName ? <span className="font-semibold">{counterpartyName}</span> : "this buyer"}{" "}
                directly from your conversation — they&apos;ll see it in Jobs &amp; Bookings once sent.
              </p>
            </div>
          ) : (
            <div className="space-y-1.5">
              <Label>Client</Label>
              <Select value={clientRef} onValueChange={(value) => setClientRef(value ?? "")}>
                <SelectTrigger className="h-10 w-full rounded-lg">
                  <SelectValue placeholder="Choose a client" />
                </SelectTrigger>
                <SelectContent>
                  {(clients ?? []).map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <Label>Line items</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setItems((current) => [...current, blankItem()])}
              >
                <Plus className="size-3.5" />
                Add item
              </Button>
            </div>
            <div className="space-y-2.5">
              {items.map((item, index) => (
                <div key={index} className="space-y-2 rounded-xl border border-brand-forest/10 bg-white p-3">
                  <div className="flex items-center gap-2">
                    <Input
                      value={item.description}
                      onChange={(event) => updateItem(index, { description: event.target.value })}
                      placeholder="Photography package"
                      className="h-9 flex-1 rounded-lg"
                    />
                    {items.length > 1 ? (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        aria-label="Remove item"
                        onClick={() => setItems((current) => current.filter((_, itemIndex) => itemIndex !== index))}
                      >
                        <Trash2 className="size-3.5 text-brand-forest/50" />
                      </Button>
                    ) : null}
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1 space-y-1">
                      <Label className="text-[11px] font-normal text-muted-foreground">Quantity</Label>
                      <Input
                        value={item.quantity}
                        onChange={(event) => updateItem(index, { quantity: event.target.value })}
                        type="number"
                        min="0.5"
                        step="0.5"
                        className="h-9 rounded-lg"
                      />
                    </div>
                    <div className="flex-[1.4] space-y-1">
                      <Label className="text-[11px] font-normal text-muted-foreground">Unit price (AED)</Label>
                      <Input
                        value={item.unitPrice}
                        onChange={(event) => updateItem(index, { unitPrice: event.target.value })}
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        className="h-9 rounded-lg"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Discount (AED)</Label>
            <Input
              value={discount}
              onChange={(event) => setDiscount(event.target.value)}
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              className="h-9 rounded-lg"
            />
          </div>

          <div className="space-y-2 rounded-xl bg-brand-forest/[0.04] px-4 py-3 text-sm">
            <div className="flex items-center justify-between text-brand-forest/70">
              <span>Subtotal</span>
              <span className="font-semibold">{money(subtotal)}</span>
            </div>
            {discountFils > 0 ? (
              <div className="flex items-center justify-between text-brand-forest/70">
                <span>Discount</span>
                <span className="font-semibold">−{money(discountFils)}</span>
              </div>
            ) : null}
            <div className="flex items-center justify-between text-brand-forest/70">
              <span>VAT (5%)</span>
              <span className="font-semibold">{money(vat)}</span>
            </div>
            <div className="flex items-center justify-between border-t border-brand-forest/10 pt-2">
              <span className="font-bold text-brand-forest">Total incl. VAT</span>
              <span className="text-lg font-extrabold text-brand-forest">{money(total)}</span>
            </div>
            <p className="text-[11px] leading-4 text-muted-foreground">
              UAE VAT at 5% is mandatory on every quote.
            </p>
          </div>

          {error ? <p className="text-sm font-semibold text-red-600">{error}</p> : null}
        </div>

        <DialogFooter className={cn(fromConversation && "sm:flex-row-reverse")}>
          <Button
            type="button"
            disabled={!valid || busy}
            onClick={() => submit("send")}
            className="bg-brand-forest text-white hover:bg-brand-forest/90"
          >
            {pendingAction === "send" && busy ? (
              <span className="size-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
            ) : (
              <Send className="size-3.5" />
            )}
            Send quote now
          </Button>
          <Button type="button" variant="outline" disabled={!valid || busy} onClick={() => submit("draft")}>
            {pendingAction === "draft" && create.isPending ? (
              <span className="size-3.5 animate-spin rounded-full border-2 border-brand-forest/30 border-t-brand-forest" />
            ) : null}
            Save as draft
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
