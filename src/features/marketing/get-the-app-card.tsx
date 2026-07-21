import { MessageCircle, Search, ShieldCheck, Smartphone } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/utils";

export function StoreLinks({
  appStoreUrl,
  playStoreUrl,
  mobileAppUrl,
  layout = "stacked",
  variant = "light",
}: {
  appStoreUrl: string | null;
  playStoreUrl: string | null;
  mobileAppUrl?: string | null;
  layout?: "stacked" | "row";
  variant?: "light" | "dark";
}) {
  const placeholderClass =
    variant === "dark"
      ? "rounded-xl border border-white/15 bg-white/5 px-3 py-3 text-white/60"
      : "rounded-xl border border-brand-forest/10 bg-brand-forest/5 px-3 py-3 text-brand-forest/60";

  return (
    <div
      className={cn(
        "grid gap-3 text-left",
        layout === "row" && "grid-cols-2 items-center gap-2 sm:max-w-md",
      )}
    >
      {appStoreUrl ? (
        <a
          href={appStoreUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block rounded-xl transition hover:opacity-90 focus-visible:outline-2 focus-visible:outline-brand-mantis"
        >
          <Image
            src="/brand/stores/app-store-badge.svg"
            alt="Download on the App Store"
            width={156}
            height={52}
            className={cn(
              "h-12 w-auto",
              layout === "row" && "h-auto max-h-11 w-full object-contain",
            )}
          />
        </a>
      ) : (
        <div className={placeholderClass}>
          <p className="text-sm font-extrabold">App Store</p>
          <p className="mt-0.5 text-[11px] font-semibold">Coming soon</p>
        </div>
      )}

      {playStoreUrl ? (
        <a
          href={playStoreUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            "block rounded-xl transition hover:opacity-90 focus-visible:outline-2 focus-visible:outline-brand-mantis",
            layout === "row" && "-ml-1",
          )}
        >
          <Image
            src="/brand/stores/google-play-badge.png"
            alt="Get it on Google Play"
            width={180}
            height={70}
            className={cn(
              "h-[3.65rem] w-auto",
              layout === "row" && "h-auto max-h-12 w-full object-contain",
            )}
          />
        </a>
      ) : (
        <div className={placeholderClass}>
          <p className="text-sm font-extrabold">Google Play</p>
          <p className="mt-0.5 text-[11px] font-semibold">Coming soon</p>
        </div>
      )}

      {mobileAppUrl ? (
        <Link
          href={mobileAppUrl}
          className={cn(
            "text-sm font-bold transition",
            variant === "dark"
              ? "text-brand-mantis hover:text-white"
              : "text-brand-blue hover:text-brand-forest",
            layout === "row" && "col-span-2",
          )}
        >
          Open the installed app
        </Link>
      ) : null}
    </div>
  );
}

const APP_FEATURES = [
  { icon: Search, label: "Discover" },
  { icon: ShieldCheck, label: "Review" },
  { icon: MessageCircle, label: "Chat" },
] as const;

export function GetTheAppCard({
  appStoreUrl,
  playStoreUrl,
  mobileAppUrl = null,
  className,
}: {
  appStoreUrl: string | null;
  playStoreUrl: string | null;
  mobileAppUrl?: string | null;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-[1.75rem] bg-[#003912] p-6 text-white shadow-[0_24px_80px_rgb(0_0_0/0.22)] sm:p-8 lg:p-10",
        className,
      )}
      aria-labelledby="get-the-app-heading"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-brand-mantis/15 blur-3xl"
      />
      <div className="relative grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end lg:gap-10">
        <div className="min-w-0">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 px-2.5 py-1">
            <Smartphone className="size-3 text-brand-mantis" aria-hidden />
            <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-brand-mantis">
              Kattegat in your pocket
            </p>
          </div>
          <h2
            id="get-the-app-heading"
            className="mt-3 text-2xl font-extrabold tracking-[-0.04em] text-balance sm:text-3xl lg:text-4xl"
          >
            Find the right connection wherever the work happens.
          </h2>
          <p className="mt-2.5 max-w-2xl text-sm leading-7 text-white/65 sm:text-base">
            Discover services, review sellers, and continue the conversation from the Kattegat
            app — buyer and seller on one account.
          </p>
          <ul className="mt-4 flex flex-wrap gap-2">
            {APP_FEATURES.map(({ icon: Icon, label }) => (
              <li
                key={label}
                className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-2.5 py-1.5 text-xs font-semibold text-white/90"
              >
                <Icon className="size-3 text-brand-mantis" aria-hidden />
                {label}
              </li>
            ))}
          </ul>
          <Link
            href="/download"
            className="mt-4 inline-flex text-sm font-bold text-brand-mantis underline-offset-4 hover:text-white hover:underline"
          >
            Learn more about the app
          </Link>
        </div>
        <StoreLinks
          appStoreUrl={appStoreUrl}
          playStoreUrl={playStoreUrl}
          mobileAppUrl={mobileAppUrl}
          layout="row"
          variant="dark"
        />
      </div>
    </section>
  );
}
