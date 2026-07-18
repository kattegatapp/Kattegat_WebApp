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
    <main className="min-h-screen bg-[#F7F9F8] text-brand-forest">
      <div className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-4 lg:top-4 lg:px-6 lg:pt-0">
        <div className="mx-auto max-w-6xl">
          <MarketingHeader
            brandName={settings.brand.siteName}
            appStoreUrl={settings.links.appStoreUrl}
            playStoreUrl={settings.links.playStoreUrl}
            mobileAppUrl={settings.links.mobileAppUrl}
          />
        </div>
      </div>

      <section className="border-b border-brand-forest/10 bg-white px-5 pb-16 pt-28 sm:px-8 sm:pb-24 sm:pt-32">
        <div className="mx-auto max-w-6xl">
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
        instagramUrl={settings.links.instagramUrl}
        linkedinUrl={settings.links.linkedinUrl}
      />
    </main>
  );
}
