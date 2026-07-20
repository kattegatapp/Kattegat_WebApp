import Link from "next/link";
import { CreditCard, Download, UserRound } from "lucide-react";

import { ImpersonationBanner } from "@/features/admin/impersonation/impersonation-banner";
import { readImpersonationState } from "@/lib/admin/impersonation";
import { adminPath } from "@/lib/admin/paths";
import { redirect } from "next/navigation";

export default async function AsUserPage() {
  const impersonation = await readImpersonationState();
  if (!impersonation) {
    redirect(adminPath("/users"));
  }

  return (
    <div className="min-h-screen bg-[#F7F9F8]">
      <ImpersonationBanner />
      <main className="mx-auto max-w-3xl px-4 py-10">
        <div className="rounded-[1.75rem] border border-brand-forest/10 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex items-start gap-3">
            <span className="flex size-12 items-center justify-center rounded-2xl bg-brand-mantis/20 text-brand-forest">
              <UserRound className="size-6" />
            </span>
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-brand-forest">
                Member session
              </h1>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                You are browsing as <strong>{impersonation.targetLabel}</strong>. Billing and plan
                pages use this member session. The mobile app is still the full seller experience —
                use <strong>Manage on behalf</strong> in admin for listings and profile without
                leaving the panel.
              </p>
            </div>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
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
              href={adminPath(`/users/${encodeURIComponent(impersonation.targetUserId)}/manage`)}
              className="flex min-h-14 items-center gap-3 rounded-2xl border border-brand-mantis/30 bg-brand-mantis/10 px-4 py-3 font-bold text-brand-forest transition hover:bg-brand-mantis/20 sm:col-span-2"
            >
              <UserRound className="size-5" />
              Admin: manage on behalf (listings &amp; profile)
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
