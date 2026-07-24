/**
 * Wallet / withdrawal math — all money stays in integer fils (AED × 100).
 *
 * Ledger identity (backend):
 * - totalEarned = lifetime credits (referral + recommend + invoice) — never decreases
 * - paidOut     = successfully processed withdrawals
 * - pending     = still in the wallet (not yet paid out)
 * - reserved    = sum of withdrawal requests still awaiting admin review
 * - available   = pending − reserved  (what the member can request now)
 *
 * Source cards show lifetime earned per programme. Withdrawal is from the shared
 * available pool — not per source.
 */

export type WalletBreakdownFils = {
  referral: number;
  recommend: number;
  invoice: number;
};

export type WithdrawalMath = {
  totalEarnedFils: number;
  sourcesTotalFils: number;
  thisMonthFils: number;
  paidOutFils: number;
  walletPendingFils: number;
  reservedFils: number;
  availableFils: number;
  /** True when source cards sum matches wallet.totalEarned (within 0 fils). */
  sourcesMatchTotal: boolean;
};

export function asNonNegativeFils(value: unknown): number {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n) || n <= 0) return 0;
  return Math.max(0, Math.trunc(n));
}

export function sumWalletBreakdown(breakdown: Partial<WalletBreakdownFils> | null | undefined): number {
  return (
    asNonNegativeFils(breakdown?.referral) +
    asNonNegativeFils(breakdown?.recommend) +
    asNonNegativeFils(breakdown?.invoice)
  );
}

export function computeWithdrawalMath(input: {
  totalEarnedFils?: number | null;
  thisMonthFils?: number | null;
  paidOutFils?: number | null;
  walletPendingFils?: number | null;
  reservedFils?: number | null;
  availableFils?: number | null;
  breakdown?: Partial<WalletBreakdownFils> | null;
}): WithdrawalMath {
  const totalEarnedFils = asNonNegativeFils(input.totalEarnedFils);
  const thisMonthFils = asNonNegativeFils(input.thisMonthFils);
  const paidOutFils = asNonNegativeFils(input.paidOutFils);
  const walletPendingFils = asNonNegativeFils(input.walletPendingFils);
  const reservedFils = asNonNegativeFils(input.reservedFils);
  const sourcesTotalFils = sumWalletBreakdown(input.breakdown);

  // Prefer server availableFils when present; otherwise derive from pending − reserved.
  const availableFils =
    input.availableFils != null && Number.isFinite(input.availableFils)
      ? asNonNegativeFils(input.availableFils)
      : Math.max(0, walletPendingFils - reservedFils);

  return {
    totalEarnedFils,
    sourcesTotalFils,
    thisMonthFils,
    paidOutFils,
    walletPendingFils,
    reservedFils,
    availableFils,
    sourcesMatchTotal: sourcesTotalFils === totalEarnedFils,
  };
}

/** Parse an AED amount string into integer fils without float drift (max 2 decimals). */
export function aedInputToFils(raw: string): number | null {
  const trimmed = raw.trim().replace(/,/g, "");
  if (!trimmed) return null;
  if (!/^\d+(\.\d{0,2})?$/.test(trimmed)) return null;
  const [wholePart, fractionPart = ""] = trimmed.split(".");
  const whole = Number(wholePart);
  if (!Number.isInteger(whole) || whole < 0) return null;
  const frac = Number((fractionPart + "00").slice(0, 2));
  if (!Number.isInteger(frac) || frac < 0 || frac > 99) return null;
  return whole * 100 + frac;
}

export function formatAedFils(fils: number): string {
  const safe = asNonNegativeFils(fils);
  // Keep the AED token so <MoneyText> can swap it for the official Dirham symbol.
  return `AED ${(safe / 100).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatFilsNumber(
  fils: number,
  options?: { minimumFractionDigits?: number; maximumFractionDigits?: number },
): string {
  const safe = asNonNegativeFils(fils);
  return (safe / 100).toLocaleString(undefined, {
    minimumFractionDigits: options?.minimumFractionDigits ?? 2,
    maximumFractionDigits: options?.maximumFractionDigits ?? 2,
  });
}
