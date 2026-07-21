import { ImpersonationBanner } from "@/features/admin/impersonation/impersonation-banner";
import { MarketingHeader } from "@/features/marketing/marketing-header";
import { SiteFooter } from "@/features/marketing/site-footer";
import { readImpersonationState } from "@/lib/admin/impersonation";
import { getPublicAppSettings } from "@/lib/api/settings";
import { cn } from "@/lib/utils";

export async function MarketingPageShell({
  eyebrow,
  title,
  description,
  children,
  compact = false,
  heroVisual,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
  compact?: boolean;
  heroVisual?: React.ReactNode;
}) {
  const settings = await getPublicAppSettings();
  const impersonation = await readImpersonationState();
  return (
    <main className="marketing-site min-h-screen bg-[#F7F9F8] text-brand-forest">
      {impersonation ? <ImpersonationBanner /> : null}
      <div className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-4 lg:top-4 lg:px-6 lg:pt-0">
        <div className="mx-auto max-w-6xl">
          <MarketingHeader brandName={settings.brand.siteName} />
        </div>
      </div>

      <section
        className={cn(
          "border-b border-brand-forest/10 bg-white px-4 pt-24 sm:px-6 sm:pt-28",
          compact ? "pb-12 sm:pb-14 lg:pb-16 lg:pt-28" : "pb-14 sm:pb-20 lg:pb-24 lg:pt-32",
        )}
      >
        <div
          className={cn(
            "marketing-container",
            heroVisual && "grid items-center gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(24rem,0.78fr)] lg:gap-14",
          )}
        >
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.24em] text-brand-blue">
              {eyebrow}
            </p>
            <h1
              className={cn(
                "mt-4 max-w-4xl text-3xl font-extrabold leading-[1.02] tracking-[-0.05em] sm:text-5xl",
                heroVisual ? "lg:text-[3.5rem]" : "lg:text-6xl",
              )}
            >
              {title}
            </h1>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-brand-forest/60 sm:mt-6 sm:text-base sm:leading-8 lg:text-lg">
              {description}
            </p>
          </div>
          {heroVisual ? <div>{heroVisual}</div> : null}
        </div>
      </section>
      {children}
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
