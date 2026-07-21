import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { MarketingHeader } from "@/features/marketing/marketing-header";
import { SiteFooter } from "@/features/marketing/site-footer";
import { getPublicAppSettings } from "@/lib/api/settings";

export const metadata: Metadata = {
  title: "Download the Kattegat app",
  description: "Get the Kattegat app to message sellers, manage bookings, and continue from web deep links.",
  robots: { index: false, follow: true },
};

type DownloadPageProps = {
  searchParams: Promise<{ next?: string | string[] }>;
};

function firstParam(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

export default async function DownloadPage({ searchParams }: DownloadPageProps) {
  const params = await searchParams;
  const nextPath = firstParam(params.next);
  const settings = await getPublicAppSettings();
  const safeNext =
    nextPath.startsWith("/") && !nextPath.startsWith("//") ? nextPath : "/search";

  return (
    <main className="marketing-site min-h-screen bg-[#F7F9F8] text-brand-forest">
      <div className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-4 lg:top-4 lg:px-6 lg:pt-0">
        <div className="mx-auto max-w-6xl">
          <MarketingHeader brandName={settings.brand.siteName} />
        </div>
      </div>

      <section className="mx-auto flex max-w-xl flex-col items-start px-5 pb-16 pt-28 sm:px-8 sm:pb-24 sm:pt-32">
        <p className="text-xs font-extrabold uppercase tracking-[0.24em] text-brand-blue">
          Get the app
        </p>
        <h1 className="mt-3 text-4xl font-extrabold tracking-[-0.05em]">
          Continue in Kattegat
        </h1>
        <p className="mt-4 text-base leading-7 text-brand-forest/60">
          Messaging, booking, and full profiles live in the mobile app. Download it to open{" "}
          <span className="font-semibold text-brand-forest">{safeNext}</span>.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          {settings.links.appStoreUrl ? (
            <a href={settings.links.appStoreUrl} target="_blank" rel="noopener noreferrer">
              <Image
                src="/brand/stores/app-store-badge.svg"
                alt="Download on the App Store"
                width={156}
                height={52}
                className="h-12 w-auto"
              />
            </a>
          ) : null}
          {settings.links.playStoreUrl ? (
            <a href={settings.links.playStoreUrl} target="_blank" rel="noopener noreferrer">
              <Image
                src="/brand/stores/google-play-badge.png"
                alt="Get it on Google Play"
                width={168}
                height={52}
                className="h-12 w-auto"
              />
            </a>
          ) : null}
        </div>

        <Link href={safeNext} className="mt-8 text-sm font-extrabold text-brand-blue hover:underline">
          Stay on web
        </Link>
      </section>

      <SiteFooter
        brandName={settings.brand.siteName}
        supportEmail={settings.brand.supportEmail}
        appStoreUrl={settings.links.appStoreUrl}
        playStoreUrl={settings.links.playStoreUrl}
        mobileAppUrl={settings.links.mobileAppUrl}
        instagramUrl={settings.links.instagramUrl}
        linkedinUrl={settings.links.linkedinUrl}
      />
    </main>
  );
}
