import { cn } from "@/lib/utils";

type DirhamSymbolProps = {
  className?: string;
  /** Pixel height of the glyph (width scales with the artwork ratio). */
  size?: number;
};

const ASPECT = 960 / 836;

/**
 * Official UAE Dirham symbol (CBUAE artwork).
 * Rendered as a real image so it always shows — CSS-mask-only approaches were
 * invisible in some account layouts when `currentColor` / mask support failed.
 */
export function DirhamSymbol({ className, size = 14 }: DirhamSymbolProps) {
  const width = size * ASPECT;

  return (
    // eslint-disable-next-line @next/next/no-img-element -- brand glyph; tint via parent filter if needed
    <img
      src="/brand/dirham-symbol.png"
      alt=""
      width={Math.round(width)}
      height={size}
      draggable={false}
      className={cn("inline-block shrink-0 object-contain align-middle", className)}
      style={{ width, height: size }}
    />
  );
}
