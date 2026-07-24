import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { CalendarDays, MapPin } from "lucide-react";

import { RequirementApplyCta } from "@/features/marketing/requirement-apply-cta";
import { MarketingHeader } from "@/features/marketing/marketing-header";
import { SiteFooter } from "@/features/marketing/site-footer";
import { loadAccountDashboard } from "@/lib/api/account";
import { formatAedRange, formatRelativeTime } from "@/lib/api/account-home";
import { MoneyText } from "@/components/currency";
import { getPublicRequirement } from "@/lib/api/marketing";
import { getPublicAppSettings } from "@/lib/api/settings";
import {
  decodePublicRouteParam,
  requirementPublicPath,
  shouldRedirectTitledPublicPath,
} from "@/lib/navigation/public-paths";
import { getSiteOrigin } from "@/lib/seo";
import { getMemberAccessToken } from "@/lib/auth/session";
import { JOB_TYPE_OPTIONS } from "@/lib/validations/requirement";

type PageProps = {
  params: Promise<{ requirementId: string }>;
};

function jobTypeLabel(jobType: string) {
  return (
    JOB_TYPE_OPTIONS.find((option) => option.value === jobType)?.label ??
    jobType.replaceAll("_", " ")
  );
}

function formatScheduleDate(iso: string | null) {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("en-AE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { requirementId: requirementKey } = await params;
  const requirementId = decodePublicRouteParam(requirementKey);
  const accessToken = await getMemberAccessToken();
  const [requirement, origin] = await Promise.all([
    getPublicRequirement(requirementId, accessToken),
    getSiteOrigin(),
  ]);

  if (!requirement) {
    return { title: "Requirement not found | Kattegat", robots: { index: false } };
  }

  const title = `${requirement.title} | Kattegat`;
  const description =
    requirement.description ||
    `Open ${jobTypeLabel(requirement.jobType).toLowerCase()} requirement in ${requirement.location} on Kattegat.`;
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
  const accessToken = await getMemberAccessToken();
  const [settings, requirement, origin, dashboard] = await Promise.all([
    getPublicAppSettings(),
    getPublicRequirement(requirementId, accessToken),
    getSiteOrigin(),
    loadAccountDashboard(),
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

  const publicPath = requirementPublicPath({ id: requirement.id, title: requirement.title });
  const budget = formatAedRange(requirement.budgetMin, requirement.budgetMax);
  const starts = formatScheduleDate(requirement.startsAt);
  const ends = formatScheduleDate(requirement.endsAt);
  const schedule =
    starts && ends ? `${starts} – ${ends}` : starts ? `From ${starts}` : ends ? `Until ${ends}` : null;
  const isOpen = requirement.status === "open" || requirement.status === "shortlisting";
  const isSignedIn = Boolean(dashboard);
  const hasSellerId = Boolean(dashboard?.user.sid);
  const hasBuyerId = Boolean(dashboard?.user.bid);

  return (
    <main className="marketing-site min-h-screen bg-[#F7F9F8] text-brand-forest">
      <div className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-4 lg:top-4 lg:px-6 lg:pt-0">
        <div className="mx-auto w-full max-w-7xl">
          <MarketingHeader brandName={settings.brand.siteName} />
        </div>
      </div>

      <article className="mx-auto max-w-6xl px-5 pb-16 pt-28 sm:px-8 sm:pb-24 sm:pt-32">
        <nav className="flex flex-wrap items-center gap-2 text-xs font-bold text-brand-forest/45">
          <Link href="/" className="hover:text-brand-blue">
            Home
          </Link>
          <span>/</span>
          <Link href="/account?view=requirements" className="hover:text-brand-blue">
            Requirements
          </Link>
          <span>/</span>
          <span className="line-clamp-1 text-brand-forest/70">{requirement.title}</span>
        </nav>

        <p className="mt-6 text-xs font-extrabold uppercase tracking-[0.24em] text-brand-blue">
          Open requirement · {jobTypeLabel(requirement.jobType)}
        </p>
        <h1 className="mt-3 max-w-3xl text-4xl font-extrabold tracking-[-0.05em] sm:text-5xl">
          {requirement.title}
        </h1>
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm font-semibold text-brand-forest/55">
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="size-3.5 shrink-0" />
            {requirement.location}
          </span>
          {budget ? <MoneyText>{budget}</MoneyText> : null}
          <span className="capitalize">{requirement.status.replaceAll("_", " ")}</span>
          {requirement.createdAt ? (
            <span>Posted {formatRelativeTime(requirement.createdAt)}</span>
          ) : null}
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-[1.75rem] border border-brand-forest/10 bg-white p-6 sm:p-8">
            <h2 className="text-sm font-extrabold uppercase tracking-[0.16em] text-muted-foreground">
              What the buyer needs
            </h2>
            <p className="mt-4 whitespace-pre-wrap text-base leading-7 text-brand-forest/75">
              {requirement.description ||
                "This buyer requirement is live on Kattegat. Details will appear here once available."}
            </p>

            {schedule ? (
              <div className="mt-8 flex items-start gap-3 rounded-2xl border border-brand-forest/8 bg-[#F7F9F8] px-4 py-3.5">
                <CalendarDays className="mt-0.5 size-4 shrink-0 text-brand-forest/45" />
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                    Schedule
                  </p>
                  <p className="mt-1 text-sm font-semibold text-brand-forest">{schedule}</p>
                </div>
              </div>
            ) : null}
          </div>

          <aside className="space-y-5">
            <div className="rounded-[1.75rem] border border-brand-forest/10 bg-white p-6">
              <h2 className="text-lg font-extrabold tracking-tight">Apply as a seller</h2>
              <p className="mt-2 text-sm leading-6 text-brand-forest/60">
                {isOpen
                  ? "Review this post on the web and send a pitch from your Kattegat account — no app required."
                  : "This requirement is no longer open for new applications."}
              </p>

              <dl className="mt-5 space-y-3 border-t border-brand-forest/8 pt-5 text-sm">
                <div className="flex justify-between gap-3">
                  <dt className="text-brand-forest/50">Job type</dt>
                  <dd className="font-bold text-brand-forest">{jobTypeLabel(requirement.jobType)}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-brand-forest/50">Location</dt>
                  <dd className="text-right font-bold text-brand-forest">{requirement.location}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-brand-forest/50">Budget</dt>
                  <dd className="font-bold text-brand-mantis">
                    <MoneyText>{budget}</MoneyText>
                  </dd>
                </div>
              </dl>

              {isOpen ? (
                <div className="mt-6">
                  <RequirementApplyCta
                    requirementId={requirement.id}
                    requirementTitle={requirement.title}
                    publicPath={publicPath}
                    isSignedIn={isSignedIn}
                    hasSellerId={hasSellerId}
                    hasBuyerId={hasBuyerId}
                    isOpen={isOpen}
                    webOrigin={origin}
                    appStoreUrl={settings.links.appStoreUrl}
                    playStoreUrl={settings.links.playStoreUrl}
                    mobileAppUrl={settings.links.mobileAppUrl}
                  />
                </div>
              ) : (
                <Link
                  href="/search"
                  className="mt-6 inline-flex min-h-12 items-center rounded-2xl border border-brand-forest/15 bg-white px-5 text-sm font-extrabold"
                >
                  Browse services
                </Link>
              )}
            </div>

            <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm font-extrabold">
              <Link href="/account?view=requirements" className="text-brand-blue hover:underline">
                Browse more requirements
              </Link>
              <Link href="/search" className="text-brand-blue hover:underline">
                Search services
              </Link>
            </div>
          </aside>
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
