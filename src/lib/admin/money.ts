/** Backend stores money as integer fils (100 fils = 1 AED). */

/**
 * Formats fils as an AED-token string so `<MoneyText>` can swap in the Dirham symbol.
 * Do not use Intl `style: "currency"` — it emits a locale currency code that MoneyText cannot replace.
 */
export function formatFilsAsAed(fils: number) {
  const amount = (fils / 100).toLocaleString("en-AE", {
    maximumFractionDigits: 0,
  });
  return `AED ${amount}`;
}

export function formatBudgetRange(min: number | null, max: number | null) {
  if (min == null && max == null) return "Not specified";
  if (min != null && max != null) return `${formatFilsAsAed(min)} – ${formatFilsAsAed(max)}`;
  if (min != null) return `From ${formatFilsAsAed(min)}`;
  return `Up to ${formatFilsAsAed(max!)}`;
}
