"use client";

import { useLayoutEffect, useRef } from "react";

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  delayMs?: number;
  as?: keyof React.JSX.IntrinsicElements;
}

function prefersReducedMotion() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function isInViewport(node: HTMLElement) {
  const rect = node.getBoundingClientRect();
  const vh = window.innerHeight || document.documentElement.clientHeight || 0;
  return rect.top < vh && rect.bottom > 0;
}

/**
 * Scroll polish only — children stay fully visible on load/reload.
 * A transform animation is applied via classList when the block enters view.
 */
export function Reveal({ children, className, delayMs = 0, as: Tag = "div" }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const node = ref.current;
    if (!node || prefersReducedMotion()) return;

    const play = () => {
      if (delayMs > 0) node.style.animationDelay = `${delayMs}ms`;
      node.classList.add("animate-marketing-reveal");
    };

    if (isInViewport(node)) {
      play();
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          play();
          observer.disconnect();
        }
      },
      { threshold: 0.06, rootMargin: "0px 0px 6% 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [delayMs]);

  const Element = Tag as React.ElementType;

  return (
    <Element ref={ref} className={className}>
      {children}
    </Element>
  );
}
