"use client";

import { ArrowUpRight, Smartphone } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState, useSyncExternalStore } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type Platform = "ios" | "android" | "other";

type ContinueInAppProps = {
  title: string;
  description: string;
  /** App path, e.g. `/listing/{id}` — opens that exact screen in the app. */
  deepLinkPath: string;
  appStoreUrl: string | null;
  playStoreUrl: string | null;
  mobileAppUrl: string | null;
  /** Absolute site origin for HTTPS universal links, e.g. https://kattegat.app */
  webOrigin?: string;
  className?: string;
  buttonLabel?: string;
  variant?: "primary" | "outline";
};

function detectPlatform(): Platform {
  if (typeof navigator === "undefined") return "other";
  const ua = navigator.userAgent || "";
  if (/iPhone|iPad|iPod/i.test(ua)) return "ios";
  if (/Android/i.test(ua)) return "android";
  return "other";
}

function subscribe() {
  return () => undefined;
}

function normalizePath(path: string) {
  const trimmed = path.trim();
  if (!trimmed) return "/";
  return trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
}

export function ContinueInApp({
  title,
  description,
  deepLinkPath,
  appStoreUrl,
  playStoreUrl,
  mobileAppUrl,
  webOrigin,
  className,
  buttonLabel = "Continue in app",
  variant = "primary",
}: ContinueInAppProps) {
  const [open, setOpen] = useState(false);
  const platform = useSyncExternalStore(subscribe, detectPlatform, () => "other" as Platform);

  const path = normalizePath(deepLinkPath);
  const origin =
    (webOrigin || (typeof window !== "undefined" ? window.location.origin : "")).replace(
      /\/$/,
      "",
    ) || "https://kattegat.app";

  // HTTPS universal / app link — preferred on iOS & Android when the app is installed.
  const httpsDeepLink = `${origin}${path}`;
  // Custom scheme fallback (works even before Universal Links are fully verified).
  const customScheme = `kattegat://${path.replace(/^\//, "")}`;
  const downloadHref = `/download?next=${encodeURIComponent(path)}`;

  const storePrimary = useMemo(() => {
    if (platform === "ios" && appStoreUrl) {
      return { href: appStoreUrl, label: "Download on the App Store" };
    }
    if (platform === "android" && playStoreUrl) {
      return { href: playStoreUrl, label: "Get it on Google Play" };
    }
    if (appStoreUrl) return { href: appStoreUrl, label: "Download on the App Store" };
    if (playStoreUrl) return { href: playStoreUrl, label: "Get it on Google Play" };
    if (mobileAppUrl) return { href: mobileAppUrl, label: "Open Kattegat app" };
    return null;
  }, [platform, appStoreUrl, playStoreUrl, mobileAppUrl]);

  const storeSecondary = useMemo(() => {
    if (platform === "ios" && playStoreUrl) {
      return { href: playStoreUrl, label: "Get it on Google Play" };
    }
    if (platform === "android" && appStoreUrl) {
      return { href: appStoreUrl, label: "Download on the App Store" };
    }
    if (platform === "other") {
      if (appStoreUrl && storePrimary?.href !== appStoreUrl) {
        return { href: appStoreUrl, label: "Download on the App Store" };
      }
      if (playStoreUrl && storePrimary?.href !== playStoreUrl) {
        return { href: playStoreUrl, label: "Get it on Google Play" };
      }
    }
    return null;
  }, [platform, appStoreUrl, playStoreUrl, storePrimary]);

  function openInApp() {
    // 1) Try HTTPS first — on iOS this is the Universal Link for /listing/{id}.
    // 2) Also fire the custom scheme shortly after for installs that only handle kattegat://.
    // 3) If the app is not installed, the page stays put and we show the store dialog.
    const started = Date.now();
    window.location.href = httpsDeepLink;

    window.setTimeout(() => {
      // If the browser is still visible, Universal Link didn't hand off — try scheme.
      if (document.visibilityState === "visible") {
        window.location.href = customScheme;
      }
    }, 250);

    window.setTimeout(() => {
      // Still here after ~1s → show download UI (platform-aware store buttons).
      if (document.visibilityState === "visible" && Date.now() - started > 800) {
        setOpen(true);
      }
    }, 1100);
  }

  return (
    <>
      <button
        type="button"
        onClick={openInApp}
        className={cn(
          "inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl px-6 text-sm font-extrabold transition",
          variant === "outline"
            ? "border border-brand-forest/15 bg-white text-brand-forest hover:bg-brand-forest/[0.03]"
            : "bg-brand-mantis text-brand-forest hover:brightness-95",
          className,
        )}
      >
        <Smartphone className="size-4" />
        {buttonLabel}
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="border-brand-forest/10 bg-[#F7F9F8] sm:max-w-md">
          <DialogHeader>
            <div className="mb-2 flex size-11 items-center justify-center rounded-2xl bg-brand-mantis/20 text-brand-forest">
              <Smartphone className="size-5" />
            </div>
            <DialogTitle className="text-xl font-extrabold tracking-[-0.03em]">
              {title}
            </DialogTitle>
            <DialogDescription className="text-sm leading-6 text-brand-forest/60">
              {description}
            </DialogDescription>
          </DialogHeader>

          <p className="rounded-xl bg-white px-3 py-2 text-xs font-bold text-brand-forest/55">
            Opens this screen in the app:{" "}
            <span className="text-brand-forest">{path}</span>
          </p>

          <div className="mt-2 space-y-3">
            {storePrimary ? (
              <a
                href={storePrimary.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between rounded-2xl bg-brand-forest px-4 py-3 text-sm font-extrabold text-white transition hover:bg-brand-forest/90"
              >
                {storePrimary.label}
                <ArrowUpRight className="size-4" />
              </a>
            ) : (
              <Link
                href="/contact"
                className="flex items-center justify-between rounded-2xl bg-brand-forest px-4 py-3 text-sm font-extrabold text-white"
              >
                Contact us for access
                <ArrowUpRight className="size-4" />
              </Link>
            )}

            {storeSecondary ? (
              <a
                href={storeSecondary.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between rounded-2xl border border-brand-forest/15 bg-white px-4 py-3 text-sm font-extrabold transition hover:border-brand-forest/30"
              >
                {storeSecondary.label}
                <ArrowUpRight className="size-4" />
              </a>
            ) : null}

            <Link
              href={downloadHref}
              className="flex items-center justify-between rounded-2xl border border-brand-forest/15 bg-white px-4 py-3 text-sm font-extrabold transition hover:border-brand-forest/30"
            >
              App download page
              <ArrowUpRight className="size-4" />
            </Link>

            <div className="flex items-center justify-center gap-4 pt-1">
              {(platform === "ios" || platform === "other") && appStoreUrl ? (
                <a href={appStoreUrl} target="_blank" rel="noopener noreferrer">
                  <Image
                    src="/brand/stores/app-store-badge.svg"
                    alt="Download on the App Store"
                    width={120}
                    height={40}
                    className="h-9 w-auto"
                  />
                </a>
              ) : null}
              {(platform === "android" || platform === "other") && playStoreUrl ? (
                <a href={playStoreUrl} target="_blank" rel="noopener noreferrer">
                  <Image
                    src="/brand/stores/google-play-badge.png"
                    alt="Get it on Google Play"
                    width={135}
                    height={40}
                    className="h-9 w-auto"
                  />
                </a>
              ) : null}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
