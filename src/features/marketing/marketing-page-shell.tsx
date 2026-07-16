import { MarketingHeader } from "@/features/marketing/marketing-header";
import { SiteFooter } from "@/features/marketing/site-footer";
import { getPublicAppSettings } from "@/lib/api/settings";

export async function MarketingPageShell({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  const settings = await getPublicAppSettings();
  return (
    <main className="min-h-screen bg-[#f6f7f2] text-brand-forest">
      <div className="bg-[#f6f7f2] px-4 py-4 sm:px-8 sm:py-6">
        <div className="mx-auto max-w-[1344px]">
          <MarketingHeader
            brandName={settings.brand.siteName}
            appStoreUrl={settings.links.appStoreUrl}
            playStoreUrl={settings.links.playStoreUrl}
            mobileAppUrl={settings.links.mobileAppUrl}
          />
        </div>
      </div>
      <section className="border-b border-brand-forest/10 bg-white px-5 py-16 sm:px-8 sm:py-24">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs font-extrabold uppercase tracking-[0.24em] text-brand-blue">
            {eyebrow}
          </p>
          <h1 className="mt-4 max-w-4xl text-5xl font-extrabold leading-[0.98] tracking-[-0.05em] sm:text-7xl">
            {title}
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-8 text-brand-forest/60 sm:text-lg">
            {description}
          </p>
        </div>
      </section>
      {children}
      <SiteFooter
        brandName={settings.brand.siteName}
        supportEmail={settings.brand.supportEmail}
        appStoreUrl={settings.links.appStoreUrl}
        playStoreUrl={settings.links.playStoreUrl}
      />
    </main>
  );
}
