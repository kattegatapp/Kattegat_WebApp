import { formatFilsAsAed } from "@/lib/admin/money";
import type { BillingPlan } from "@/lib/api/billing";

/** Annual plan = pay for 10 months, get 12 (2 months free). Matches Stripe annual positioning. */
export const ANNUAL_FREE_MONTHS = 2;

export type ProBillingQuote = {
  monthlyPriceFils: number;
  annualPriceFils: number;
  annualListFils: number;
  savingsFils: number;
  savingsPercent: number;
  effectiveMonthlyFils: number;
};

export function computeProBillingQuote(monthlyPriceFils: number | null): ProBillingQuote | null {
  if (monthlyPriceFils == null || monthlyPriceFils <= 0) return null;

  const annualListFils = monthlyPriceFils * 12;
  const annualPriceFils = monthlyPriceFils * (12 - ANNUAL_FREE_MONTHS);
  const savingsFils = annualListFils - annualPriceFils;
  const savingsPercent = Math.round((savingsFils / annualListFils) * 100);

  return {
    monthlyPriceFils,
    annualPriceFils,
    annualListFils,
    savingsFils,
    savingsPercent,
    effectiveMonthlyFils: Math.round(annualPriceFils / 12),
  };
}

export function checkoutTotalFils(plan: BillingPlan, quote: ProBillingQuote | null) {
  if (!quote) return null;
  return plan === "pro_annual" ? quote.annualPriceFils : quote.monthlyPriceFils;
}

export function formatCheckoutTotal(plan: BillingPlan, quote: ProBillingQuote | null) {
  const total = checkoutTotalFils(plan, quote);
  if (total == null) return "—";
  return formatFilsAsAed(total);
}

export function billingCycleLabel(plan: BillingPlan) {
  return plan === "pro_annual" ? "Annual" : "Monthly";
}
