export const PRICING_MODEL_TYPES = [
  "per_gig",
  "residency",
  "per_project",
  "per_unit",
  "revenue_share",
  "quote_request",
] as const;

export type PricingModelType = (typeof PRICING_MODEL_TYPES)[number];

export type PricingBlock = {
  id?: string;
  modelType: PricingModelType;
  amountAed?: number | null;
  unitLabel?: string | null;
  isFromPrice?: boolean;
  sellerSharePct?: number | null;
  sortOrder?: number;
};

export const PRICING_MODEL_META: Record<
  PricingModelType,
  { label: string; chip: string; hint: string }
> = {
  per_gig: {
    label: "Per Gig",
    chip: "+ Per Gig",
    hint: "One-off talent bookings — optional set label (2h / 3h / 4h).",
  },
  residency: {
    label: "Residency",
    chip: "+ Residency",
    hint: "Recurring venue engagements — amount + term.",
  },
  per_project: {
    label: "Per Project",
    chip: "+ Per Project",
    hint: "Fixed deliverable price, or toggle “from”.",
  },
  per_unit: {
    label: "Hourly / Per Item",
    chip: "+ Hourly / Per Item",
    hint: "Unit pricing — per hour, item, or class.",
  },
  revenue_share: {
    label: "Revenue Share",
    chip: "+ Revenue Share",
    hint: "Enter your share % — client share auto-calculates.",
  },
  quote_request: {
    label: "Quote on Request",
    chip: "+ Quote on Request",
    hint: "Buyers send a brief; reply with the Quote Generator.",
  },
};

export const RESIDENCY_TERM_OPTIONS = [
  { value: "per month", label: "Per month" },
  { value: "per 3-month term", label: "Per 3-month term" },
] as const;

export const PER_UNIT_OPTIONS = [
  { value: "per hour", label: "Per hour" },
  { value: "per item", label: "Per item" },
  { value: "per class", label: "Per class" },
] as const;

export function emptyPricingBlock(modelType: PricingModelType, sortOrder = 0): PricingBlock {
  return {
    modelType,
    amountAed: null,
    unitLabel:
      modelType === "residency"
        ? "per month"
        : modelType === "per_unit"
          ? "per hour"
          : modelType === "per_gig"
            ? null
            : null,
    isFromPrice: false,
    sellerSharePct: modelType === "revenue_share" ? 40 : null,
    sortOrder,
  };
}

export function blocksFromDefaults(defaults: PricingModelType[]): PricingBlock[] {
  return defaults.map((modelType, index) => emptyPricingBlock(modelType, index));
}

export function validatePricingBlocks(blocks: PricingBlock[], requireAtLeastOne: boolean): string | null {
  if (requireAtLeastOne && blocks.length === 0) {
    return "Add at least one way you charge before submitting for review.";
  }

  const counts = new Map<string, number>();
  for (const block of blocks) {
    counts.set(block.modelType, (counts.get(block.modelType) ?? 0) + 1);
  }
  for (const [modelType, count] of counts) {
    const max = modelType === "per_gig" ? 3 : 1;
    if (count > max) {
      return modelType === "per_gig"
        ? "Per Gig may appear at most three times."
        : `Only one ${PRICING_MODEL_META[modelType as PricingModelType]?.label ?? modelType} block is allowed.`;
    }
  }

  for (const block of blocks) {
    if (
      block.modelType === "per_gig" ||
      block.modelType === "residency" ||
      block.modelType === "per_project" ||
      block.modelType === "per_unit"
    ) {
      if (block.amountAed == null || !Number.isInteger(block.amountAed) || block.amountAed <= 0) {
        return `Enter an AED amount for ${PRICING_MODEL_META[block.modelType].label}.`;
      }
    }
    if (block.modelType === "revenue_share") {
      if (
        block.sellerSharePct == null ||
        !Number.isInteger(block.sellerSharePct) ||
        block.sellerSharePct < 1 ||
        block.sellerSharePct > 99
      ) {
        return "Revenue share must be an integer between 1 and 99.";
      }
    }
  }

  return null;
}

export function toPricingBlocksPayload(blocks: PricingBlock[]): PricingBlock[] {
  return blocks.map((block, index) => ({
    modelType: block.modelType,
    amountAed:
      block.modelType === "revenue_share" || block.modelType === "quote_request"
        ? null
        : block.amountAed ?? null,
    unitLabel: block.unitLabel?.trim() ? block.unitLabel.trim() : null,
    isFromPrice: block.modelType === "per_project" ? Boolean(block.isFromPrice) : false,
    sellerSharePct: block.modelType === "revenue_share" ? (block.sellerSharePct ?? null) : null,
    sortOrder: block.sortOrder ?? index,
  }));
}

/** Buyer-facing snapshot row for a single pricing block. */
export function formatPricingBlockSnapshot(block: PricingBlock): { label: string; value: string } {
  const label = PRICING_MODEL_META[block.modelType].label;
  if (block.modelType === "revenue_share" && block.sellerSharePct != null) {
    const clientShare = 100 - block.sellerSharePct;
    return {
      label,
      value: `You keep ${clientShare}% · Seller takes ${block.sellerSharePct}%`,
    };
  }
  if (block.modelType === "quote_request") {
    return { label, value: "Request a custom quote" };
  }
  const amount =
    block.amountAed != null
      ? new Intl.NumberFormat("en-AE", { maximumFractionDigits: 0 }).format(block.amountAed)
      : "—";
  const from = block.isFromPrice ? "From " : "";
  const unit = block.unitLabel ? ` · ${block.unitLabel}` : "";
  return { label, value: `${from}AED ${amount}${unit}` };
}

/** Card chip / compact label from server displayPrice or legacy fils pricing. */
export function formatListingDisplayPrice(input: {
  displayPrice?: string | null;
  pricing?: { amount?: number; unit?: string } | Record<string, unknown> | null;
}): string {
  if (input.displayPrice?.trim()) return input.displayPrice.trim();
  const pricing = input.pricing;
  if (!pricing || typeof pricing !== "object") return "Get a quote";
  const amount = "amount" in pricing ? pricing.amount : undefined;
  if (typeof amount !== "number" || !Number.isFinite(amount)) return "Get a quote";
  const aed = (amount / 100).toLocaleString("en-AE", { maximumFractionDigits: 0 });
  const unit = "unit" in pricing && typeof pricing.unit === "string" ? pricing.unit : undefined;
  return unit ? `from AED ${aed} / ${unit}` : `from AED ${aed}`;
}
