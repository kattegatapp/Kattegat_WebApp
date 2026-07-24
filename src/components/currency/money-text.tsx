import type { ReactNode } from "react";

import { DirhamSymbol } from "@/components/currency/dirham-symbol";
import { cn } from "@/lib/utils";

type MoneyTextProps = {
  children: string | null | undefined;
  className?: string;
  symbolClassName?: string;
  symbolSize?: number;
};

/**
 * Renders a money label and swaps every “AED” token for the official Dirham symbol.
 * Use for API strings like displayPrice ("from AED 1,200") and marketing copy.
 */
export function MoneyText({
  children,
  className,
  symbolClassName,
  symbolSize = 13,
}: MoneyTextProps) {
  const text = (children ?? "").trim();
  if (!text) return null;

  const nodes: ReactNode[] = [];
  const re = /AED\s*/gi;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;
  let replaced = false;

  while ((match = re.exec(text))) {
    replaced = true;
    if (match.index > lastIndex) {
      nodes.push(<span key={`t-${key++}`}>{text.slice(lastIndex, match.index)}</span>);
    }
    nodes.push(
      <DirhamSymbol
        key={`d-${key++}`}
        size={symbolSize}
        className={cn("text-brand-mantis", symbolClassName)}
      />,
    );
    lastIndex = match.index + match[0].length;
  }

  if (!replaced) {
    return <span className={className}>{text}</span>;
  }

  if (lastIndex < text.length) {
    nodes.push(<span key={`t-${key++}`}>{text.slice(lastIndex)}</span>);
  }

  return (
    <span className={cn("inline-flex items-center gap-1 flex-wrap", className)}>{nodes}</span>
  );
}
