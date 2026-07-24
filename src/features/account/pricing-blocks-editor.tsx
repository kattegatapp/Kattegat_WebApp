"use client";

import { Plus, Trash2, Wallet } from "lucide-react";

import {
  EditorFormSection,
} from "@/features/account/editor-form-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DirhamSymbol } from "@/components/currency";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  emptyPricingBlock,
  PER_UNIT_OPTIONS,
  PRICING_MODEL_META,
  PRICING_MODEL_TYPES,
  RESIDENCY_TERM_OPTIONS,
  type PricingBlock,
  type PricingModelType,
} from "@/lib/pricing-blocks";
import { cn } from "@/lib/utils";

export function PricingBlocksEditor({
  blocks,
  onChange,
  disabled,
}: {
  blocks: PricingBlock[];
  onChange: (blocks: PricingBlock[]) => void;
  disabled?: boolean;
}) {
  const usedTypes = new Set(blocks.map((block) => block.modelType));
  const availableChips = PRICING_MODEL_TYPES.filter((type) => {
    if (type === "per_gig") {
      return blocks.filter((block) => block.modelType === "per_gig").length < 3;
    }
    return !usedTypes.has(type);
  });

  function updateBlock(index: number, patch: Partial<PricingBlock>) {
    onChange(blocks.map((block, i) => (i === index ? { ...block, ...patch } : block)));
  }

  function removeBlock(index: number) {
    onChange(blocks.filter((_, i) => i !== index).map((block, i) => ({ ...block, sortOrder: i })));
  }

  function addBlock(modelType: PricingModelType) {
    onChange([...blocks, emptyPricingBlock(modelType, blocks.length)]);
  }

  return (
    <EditorFormSection
      icon={Wallet}
      title="How do you charge?"
      description="Add every way you price this service. Category suggestions open as cards — delete any that don’t apply."
    >
      {blocks.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-brand-forest/15 bg-brand-forest/[0.03] px-3.5 py-4 text-sm text-muted-foreground">
          No price blocks yet. Tap a chip below to add how you charge.
        </p>
      ) : (
        <div className="space-y-3">
          {blocks.map((block, index) => (
            <PricingBlockCard
              key={`${block.modelType}-${index}`}
              block={block}
              disabled={disabled}
              onChange={(patch) => updateBlock(index, patch)}
              onRemove={() => removeBlock(index)}
            />
          ))}
        </div>
      )}

      {availableChips.length > 0 && !disabled ? (
        <div className="flex flex-wrap gap-2 pt-1">
          {availableChips.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => addBlock(type)}
              className="inline-flex items-center gap-1 rounded-full border border-brand-mantis/35 bg-brand-mantis/10 px-3 py-1.5 text-[12px] font-semibold text-brand-forest transition hover:border-brand-mantis/55 hover:bg-brand-mantis/16"
            >
              <Plus className="size-3.5" />
              {PRICING_MODEL_META[type].label}
            </button>
          ))}
        </div>
      ) : null}
    </EditorFormSection>
  );
}

function PricingBlockCard({
  block,
  onChange,
  onRemove,
  disabled,
}: {
  block: PricingBlock;
  onChange: (patch: Partial<PricingBlock>) => void;
  onRemove: () => void;
  disabled?: boolean;
}) {
  const meta = PRICING_MODEL_META[block.modelType];
  const clientShare =
    block.modelType === "revenue_share" && block.sellerSharePct != null
      ? 100 - block.sellerSharePct
      : null;

  return (
    <div className="rounded-2xl border border-brand-forest/10 bg-gradient-to-b from-white to-brand-forest/[0.02] p-3.5 sm:p-4">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-brand-forest">{meta.label}</p>
          <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">{meta.hint}</p>
        </div>
        {!disabled ? (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="shrink-0 text-red-600 hover:bg-red-50 hover:text-red-700"
            onClick={onRemove}
            aria-label={`Remove ${meta.label}`}
          >
            <Trash2 className="size-3.5" />
          </Button>
        ) : null}
      </div>

      {block.modelType === "quote_request" ? (
        <p className="rounded-xl bg-brand-blue/5 px-3 py-2.5 text-[12px] leading-relaxed text-brand-blue">
          Buyers will send you a brief. Respond with the Quote Generator in Seller Tools.
        </p>
      ) : null}

      {block.modelType === "revenue_share" ? (
        <div className="space-y-2">
          <Label htmlFor={`share-${block.modelType}`}>Your share %</Label>
          <Input
            id={`share-${block.modelType}`}
            inputMode="numeric"
            disabled={disabled}
            value={block.sellerSharePct ?? ""}
            onChange={(event) => {
              const raw = event.target.value.trim();
              if (!raw) {
                onChange({ sellerSharePct: null });
                return;
              }
              const next = Number(raw);
              if (!Number.isFinite(next)) return;
              onChange({ sellerSharePct: Math.min(99, Math.max(1, Math.round(next))) });
            }}
            className="h-11 rounded-xl border-brand-forest/10"
            placeholder="e.g. 40"
          />
          {clientShare != null ? (
            <p className="text-[12px] font-medium text-brand-forest/70">
              Your client keeps {clientShare}%
            </p>
          ) : null}
        </div>
      ) : null}

      {block.modelType === "per_gig" ||
      block.modelType === "residency" ||
      block.modelType === "per_project" ||
      block.modelType === "per_unit" ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label className="inline-flex items-center gap-1.5">
              Amount
              <DirhamSymbol size={12} className="text-brand-mantis" />
            </Label>
            <Input
              inputMode="numeric"
              disabled={disabled}
              value={block.amountAed ?? ""}
              onChange={(event) => {
                const raw = event.target.value.trim();
                if (!raw) {
                  onChange({ amountAed: null });
                  return;
                }
                if (!/^\d+$/.test(raw)) return;
                onChange({ amountAed: Number(raw) });
              }}
              className="h-11 rounded-xl border-brand-forest/10"
              placeholder="e.g. 3000"
            />
          </div>

          {block.modelType === "per_gig" ? (
            <div className="space-y-1.5">
              <Label>Set label (optional)</Label>
              <Input
                disabled={disabled}
                value={block.unitLabel ?? ""}
                onChange={(event) => onChange({ unitLabel: event.target.value || null })}
                className="h-11 rounded-xl border-brand-forest/10"
                placeholder="2h / 3h / 4h"
                maxLength={40}
              />
            </div>
          ) : null}

          {block.modelType === "residency" ? (
            <div className="space-y-1.5">
              <Label>Term</Label>
              <Select
                value={block.unitLabel || "per month"}
                items={RESIDENCY_TERM_OPTIONS.map((option) => ({
                  value: option.value,
                  label: option.label,
                }))}
                onValueChange={(value) => value && onChange({ unitLabel: value })}
                disabled={disabled}
              >
                <SelectTrigger className="h-11 w-full rounded-xl border-brand-forest/10 bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {RESIDENCY_TERM_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value} label={option.label}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : null}

          {block.modelType === "per_unit" ? (
            <div className="space-y-1.5">
              <Label>Unit</Label>
              <Select
                value={block.unitLabel || "per hour"}
                items={PER_UNIT_OPTIONS.map((option) => ({
                  value: option.value,
                  label: option.label,
                }))}
                onValueChange={(value) => value && onChange({ unitLabel: value })}
                disabled={disabled}
              >
                <SelectTrigger className="h-11 w-full rounded-xl border-brand-forest/10 bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PER_UNIT_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value} label={option.label}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : null}

          {block.modelType === "per_project" ? (
            <div
              className={cn(
                "flex items-center justify-between gap-3 rounded-xl border border-brand-forest/10 px-3 py-2.5 sm:col-span-1",
              )}
            >
              <div>
                <Label htmlFor="from-price">From price</Label>
                <p className="inline-flex flex-wrap items-center gap-1 text-[11px] text-muted-foreground">
                  Show as “from <DirhamSymbol size={10} className="text-brand-mantis" /> …”
                </p>
              </div>
              <Switch
                id="from-price"
                checked={Boolean(block.isFromPrice)}
                onCheckedChange={(checked) => onChange({ isFromPrice: checked })}
                disabled={disabled}
              />
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
