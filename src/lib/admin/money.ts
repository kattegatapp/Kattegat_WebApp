/** Backend stores money as integer fils (100 fils = 1 AED). */

export function formatFilsAsAed(fils: number) {
  return new Intl.NumberFormat("en-AE", {
    style: "currency",
    currency: "AED",
    maximumFractionDigits: 0,
  }).format(fils / 100);
}

export function formatBudgetRange(min: number | null, max: number | null) {
  if (min == null && max == null) return "Not specified";
  if (min != null && max != null) return `${formatFilsAsAed(min)} – ${formatFilsAsAed(max)}`;
  if (min != null) return `From ${formatFilsAsAed(min)}`;
  return `Up to ${formatFilsAsAed(max!)}`;
}
