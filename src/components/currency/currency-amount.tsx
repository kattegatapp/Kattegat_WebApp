import type { ReactNode } from "react";

import { DirhamSymbol } from "@/components/currency/dirham-symbol";
import { cn } from "@/lib/utils";
import { asNonNegativeFils } from "@/lib/wallet-math";

type CurrencyAmountProps = {
  fils: number;
  rangeEndFils?: number;
  prefix?: ReactNode;
  suffix?: ReactNode;
  className?: string;
  symbolClassName?: string;
  showDecimals?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
};

const SIZE = {
  sm: { symbol: 12, text: "text-sm" },
  md: { symbol: 14, text: "text-base" },
  lg: { symbol: 18, text: "text-lg" },
  xl: { symbol: 28, text: "text-3xl" },
} as const;

function formatNumber(fils: number, showDecimals?: boolean) {
  const aed = asNonNegativeFils(fils) / 100;
  const decimals = showDecimals ?? aed % 1 !== 0;
  return aed.toLocaleString(undefined, {
    minimumFractionDigits: decimals ? 2 : 0,
    maximumFractionDigits: 2,
  });
}

/** Official Dirham symbol + amount. Prefer this over plain “AED …” strings. */
export function CurrencyAmount({
  fils,
  rangeEndFils,
  prefix,
  suffix,
  className,
  symbolClassName,
  showDecimals,
  size = "md",
}: CurrencyAmountProps) {
  const tokens = SIZE[size];
  const label = `${prefix ? `${String(prefix)} ` : ""}${formatNumber(fils, showDecimals)} dirhams${
    rangeEndFils != null ? ` to ${formatNumber(rangeEndFils, showDecimals)} dirhams` : ""
  }${suffix ? ` ${String(suffix)}` : ""}`;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 font-extrabold tabular-nums text-brand-forest",
        tokens.text,
        className,
      )}
      aria-label={label}
    >
      {prefix ? <span className="font-semibold text-brand-forest/70">{prefix}</span> : null}
      <DirhamSymbol size={tokens.symbol} className={cn("text-brand-mantis", symbolClassName)} />
      <span>{formatNumber(fils, showDecimals)}</span>
      {rangeEndFils != null ? (
        <>
          <span>–</span>
          <DirhamSymbol size={tokens.symbol} className={cn("text-brand-mantis", symbolClassName)} />
          <span>{formatNumber(rangeEndFils, showDecimals)}</span>
        </>
      ) : null}
      {suffix ? <span className="font-semibold text-brand-forest/70">{suffix}</span> : null}
    </span>
  );
}
