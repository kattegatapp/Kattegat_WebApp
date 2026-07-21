import Link from "next/link";
import { CreditCard, Download, LayoutDashboard, UserRoundCog } from "lucide-react";
import { redirect } from "next/navigation";

import { ImpersonationBanner } from "@/features/admin/impersonation/impersonation-banner";
import { readImpersonationState } from "@/lib/admin/impersonation";
import { adminPath } from "@/lib/admin/paths";

export default async function AsUserPage() {
  const impersonation = await readImpersonationState();
  if (!impersonation) {
    redirect(adminPath("/users"));
  }

  const manageHref = adminPath(
    `/users/${encodeURIComponent(impersonation.targetUserId)}/manage`,
  );

  return (
    <div className="min-h-screen bg-[#F7F9F8]">
      <ImpersonationBanner />
      <main className="mx-auto max-w-3xl px-4 py-10">
        <div className="rounded-[1.75rem] border border-brand-forest/10 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex items-start gap-3">
            <span className="flex size-12 items-center justify-center rounded-2xl bg-brand-mantis/20 text-brand-forest">
              <LayoutDashboard className="size-6" />
            </span>
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-brand-forest">
                Member browse hub
              </h1>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                You are browsing as <strong>{impersonation.targetLabel}</strong>. Pick the right
                tool below.
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-3 rounded-2xl border border-brand-forest/10 bg-[#F7F9F8] p-4 text-sm leading-6 text-brand-forest/80">
            <p>
              <strong className="text-brand-forest">Browse like them</strong> — billing, plans, and
              public pages use this member session.
            </p>
            <p>
              <strong className="text-brand-forest">Edit for them</strong> — use Manage on behalf
              for profile and listings. That stays in admin and is audited to your staff account.
            </p>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <Link
              href="/account"
              className="flex min-h-14 items-center gap-3 rounded-2xl border border-brand-mantis/30 bg-brand-mantis/10 px-4 py-3 font-bold text-brand-forest transition hover:bg-brand-mantis/20 sm:col-span-2"
            >
              <LayoutDashboard className="size-5" />
              Open member account (profile &amp; listings)
            </Link>
            <Link
              href="/billing"
              className="flex min-h-14 items-center gap-3 rounded-2xl border border-brand-forest/12 px-4 py-3 font-bold text-brand-forest transition hover:border-brand-mantis/50"
            >
              <CreditCard className="size-5 text-brand-blue" />
              Billing &amp; payments
            </Link>
            <Link
              href="/plans"
              className="flex min-h-14 items-center gap-3 rounded-2xl border border-brand-forest/12 px-4 py-3 font-bold text-brand-forest transition hover:border-brand-mantis/50"
            >
              <CreditCard className="size-5 text-brand-emerald" />
              Plans &amp; upgrade
            </Link>
            <Link
              href="/download"
              className="flex min-h-14 items-center gap-3 rounded-2xl border border-brand-forest/12 px-4 py-3 font-bold text-brand-forest transition hover:border-brand-mantis/50 sm:col-span-2"
            >
              <Download className="size-5 text-brand-blue" />
              Download the mobile app (full seller tools)
            </Link>
            <Link
              href={manageHref}
              className="flex min-h-14 items-center gap-3 rounded-2xl border border-brand-forest/12 px-4 py-3 font-bold text-brand-forest transition hover:border-brand-mantis/50 sm:col-span-2"
            >
              <UserRoundCog className="size-5" />
              Manage on behalf — listings &amp; profile
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
