import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { SellerPublicProfile } from "@/features/marketing/seller-public-profile";
import { MarketingHeader } from "@/features/marketing/marketing-header";
import { SiteFooter } from "@/features/marketing/site-footer";
import { loadAccountDashboard } from "@/lib/api/account";
import { getCatalogCategories, getPublicReviewsBySeller, getPublicSeller } from "@/lib/api/marketing";
import { DEFAULT_PUBLIC_PLANS, getPublicPlanFeatures } from "@/lib/api/plans";
import { getPublicAppSettings } from "@/lib/api/settings";
import {
  decodePublicRouteParam,
  sellerPublicPath,
  shouldRedirectSellerPublicPath,
} from "@/lib/navigation/public-paths";
import {
  getSiteOrigin,
  jsonLdScript,
  sellerPageDescription,
  sellerPageTitle,
} from "@/lib/seo";

type PageProps = {
  params: Promise<{ sellerId: string }>;
};

function sellerPathInput(seller: NonNullable<Awaited<ReturnType<typeof getPublicSeller>>>) {
  return {
    userId: seller.userId,
    customSlug: seller.customSlug,
    displayName: seller.displayName,
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { sellerId: sellerKey } = await params;
  const sellerId = decodePublicRouteParam(sellerKey);
  const [seller, origin] = await Promise.all([getPublicSeller(sellerId), getSiteOrigin()]);
  if (!seller) {
    return { title: "Seller not found | Kattegat", robots: { index: false } };
  }

  const name = seller.displayName || "Kattegat seller";
  const title = sellerPageTitle(name, "Dubai");
  const description = sellerPageDescription({ name, bio: seller.bio, location: "Dubai" });
  const canonicalPath = sellerPublicPath(sellerPathInput(seller));

  return {
    title,
    description,
    alternates: { canonical: `${origin}${canonicalPath}` },
    openGraph: {
      title,
      description,
      url: `${origin}${canonicalPath}`,
      images: seller.avatarUrl ? [{ url: seller.avatarUrl }] : undefined,
    },
  };
}

export default async function SellerPage({ params }: PageProps) {
  const { sellerId: sellerKey } = await params;
  const sellerId = decodePublicRouteParam(sellerKey);
  const seller = await getPublicSeller(sellerId);

  if (!seller) notFound();

  const [settings, categories, reviews, origin, plans, dashboard] = await Promise.all([
    getPublicAppSettings(),
    getCatalogCategories(),
    getPublicReviewsBySeller(seller.userId),
    getSiteOrigin(),
    getPublicPlanFeatures(),
    loadAccountDashboard(),
  ]);

  const pathInput = sellerPathInput(seller);
  if (shouldRedirectSellerPublicPath(sellerId, pathInput)) {
    redirect(sellerPublicPath(pathInput));
  }

  const name = seller.displayName || "Kattegat seller";
  const publicPath = sellerPublicPath(pathInput);
  const sellerTier = seller.tier ?? "starter";
  const tierFeatures =
    plans.find((plan) => plan.tier === sellerTier) ??
    DEFAULT_PUBLIC_PLANS.find((plan) => plan.tier === sellerTier) ??
    DEFAULT_PUBLIC_PLANS[0]!;
  const canChatDirectly =
    Boolean(settings.features.chatEnabled) &&
    (Boolean(settings.features.freeAccessMode) || Boolean(tierFeatures.canChatDirectly));
  const contactAgentEnabled =
    Boolean(settings.features.contactAgentEnabled) && Boolean(settings.features.chatEnabled);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name,
    description: seller.bio,
    url: `${origin}${publicPath}`,
    image: seller.avatarUrl || undefined,
    aggregateRating:
      seller.reviewCount > 0
        ? {
            "@type": "AggregateRating",
            ratingValue: seller.aggregateRating,
            reviewCount: seller.reviewCount,
          }
        : undefined,
  };

  return (
    <main className="marketing-site min-h-screen bg-background text-foreground">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(jsonLd)} />

      <div className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-4 lg:top-4 lg:px-6 lg:pt-0">
        <div className="mx-auto w-full max-w-7xl">
          <MarketingHeader brandName={settings.brand.siteName} />
        </div>
      </div>

      <article className="pt-[4.75rem] sm:pt-24">
        <SellerPublicProfile
          seller={seller}
          categories={categories}
          reviews={reviews}
          reviewsEnabled={settings.features.reviewsEnabled}
          origin={origin}
          appStoreUrl={settings.links.appStoreUrl}
          playStoreUrl={settings.links.playStoreUrl}
          mobileAppUrl={settings.links.mobileAppUrl}
          canChatDirectly={canChatDirectly}
          contactAgentEnabled={contactAgentEnabled}
          viewer={{
            signedIn: Boolean(dashboard),
            userId: dashboard?.user.id ?? null,
            hasBuyerId: Boolean(dashboard?.user.bid),
            hasSellerId: Boolean(dashboard?.user.sid),
          }}
        />
      </article>

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
