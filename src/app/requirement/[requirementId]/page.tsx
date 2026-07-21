import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { MapPin } from "lucide-react";

import { ContinueInApp } from "@/features/marketing/continue-in-app";
import { MarketingHeader } from "@/features/marketing/marketing-header";
import { SiteFooter } from "@/features/marketing/site-footer";
import { formatAedRange } from "@/lib/api/account-home";
import { getPublicRequirement } from "@/lib/api/marketing";
import { getPublicAppSettings } from "@/lib/api/settings";
import {
  decodePublicRouteParam,
  requirementPublicPath,
  shouldRedirectTitledPublicPath,
} from "@/lib/navigation/public-paths";
import { getSiteOrigin } from "@/lib/seo";

type PageProps = {
  params: Promise<{ requirementId: string }>;
};

function formatJobType(jobType: string) {
  return jobType.replaceAll("_", " ");
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { requirementId: requirementKey } = await params;
  const requirementId = decodePublicRouteParam(requirementKey);
  const [requirement, origin] = await Promise.all([
    getPublicRequirement(requirementId),
    getSiteOrigin(),
  ]);

  if (!requirement) {
    return { title: "Requirement not found | Kattegat", robots: { index: false } };
  }

  const title = `${requirement.title} | Kattegat`;
  const description =
    requirement.description ||
    `Open requirement in ${requirement.location} on Kattegat. Continue in the app to apply.`;
  const canonicalPath = requirementPublicPath({ id: requirement.id, title: requirement.title });

  return {
    title,
    description,
    alternates: { canonical: `${origin}${canonicalPath}` },
    openGraph: {
      title,
      description,
      url: `${origin}${canonicalPath}`,
      type: "website",
    },
  };
}

export default async function RequirementPage({ params }: PageProps) {
  const { requirementId: requirementKey } = await params;
  const requirementId = decodePublicRouteParam(requirementKey);
  const [settings, requirement, origin] = await Promise.all([
    getPublicAppSettings(),
    getPublicRequirement(requirementId),
    getSiteOrigin(),
  ]);

  if (!requirement) notFound();

  if (
    shouldRedirectTitledPublicPath(requirementKey, {
      id: requirement.id,
      title: requirement.title,
    })
  ) {
    redirect(requirementPublicPath({ id: requirement.id, title: requirement.title }));
  }

  const budget = formatAedRange(requirement.budgetMin, requirement.budgetMax);

  return (
    <main className="marketing-site min-h-screen bg-[#F7F9F8] text-brand-forest">
      <div className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-4 lg:top-4 lg:px-6 lg:pt-0">
        <div className="mx-auto max-w-6xl">
          <MarketingHeader brandName={settings.brand.siteName} />
        </div>
      </div>

      <article className="mx-auto max-w-6xl px-5 pb-16 pt-28 sm:px-8 sm:pb-24 sm:pt-32">
        <p className="text-xs font-extrabold uppercase tracking-[0.24em] text-brand-blue">
          Open requirement · {formatJobType(requirement.jobType)}
        </p>
        <h1 className="mt-3 max-w-3xl text-4xl font-extrabold tracking-[-0.05em] sm:text-5xl">
          {requirement.title}
        </h1>
        <div className="mt-3 flex flex-wrap items-center gap-3 text-sm font-semibold text-brand-forest/55">
          <span className="inline-flex items-center gap-1">
            <MapPin className="size-3.5" />
            {requirement.location}
          </span>
          {budget ? <span>{budget}</span> : null}
        </div>

        <div className="mt-8 max-w-3xl rounded-[1.75rem] border border-brand-forest/10 bg-white p-6">
          <p className="text-sm leading-7 text-brand-forest/65">
            {requirement.description ||
              "This buyer requirement is live on Kattegat. Continue in the app to view details and apply."}
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <ContinueInApp
              title="Download the app to continue"
              description={`Open Kattegat to view “${requirement.title}” and apply as a seller.`}
              deepLinkPath={`/requirement/${requirement.id}`}
              webOrigin={origin}
              appStoreUrl={settings.links.appStoreUrl}
              playStoreUrl={settings.links.playStoreUrl}
              mobileAppUrl={settings.links.mobileAppUrl}
            />
            <Link
              href="/search"
              className="inline-flex min-h-12 items-center rounded-2xl border border-brand-forest/15 bg-white px-5 text-sm font-extrabold"
            >
              Browse services
            </Link>
          </div>
        </div>
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
