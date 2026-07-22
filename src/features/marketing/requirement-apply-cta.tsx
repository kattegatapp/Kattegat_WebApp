"use client";

import { Send } from "lucide-react";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import { ApplyToRequirementDialog } from "@/features/account/account-applications-view";
import { ContinueInApp } from "@/features/marketing/continue-in-app";
import { Button } from "@/components/ui/button";
import {
  canActAsSeller,
  resolveActiveMemberIdentity,
  writeStoredMemberIdentity,
  type MemberIdentity,
} from "@/lib/auth/member-identity";

type RequirementApplyCtaProps = {
  requirementId: string;
  requirementTitle: string;
  publicPath: string;
  isSignedIn: boolean;
  hasSellerId: boolean;
  hasBuyerId?: boolean;
  isOpen: boolean;
  webOrigin: string;
  appStoreUrl: string | null;
  playStoreUrl: string | null;
  mobileAppUrl: string | null;
};

export function RequirementApplyCta({
  requirementId,
  requirementTitle,
  publicPath,
  isSignedIn,
  hasSellerId,
  hasBuyerId = false,
  isOpen,
  webOrigin,
  appStoreUrl,
  playStoreUrl,
  mobileAppUrl,
}: RequirementApplyCtaProps) {
  const queryClient = useQueryClient();
  const [applyOpen, setApplyOpen] = useState(false);
  const [identity, setIdentity] = useState<MemberIdentity>(() =>
    resolveActiveMemberIdentity(hasSellerId, hasBuyerId),
  );
  const loginHref = `/login?next=${encodeURIComponent(publicPath)}`;

  useEffect(() => {
    setIdentity(resolveActiveMemberIdentity(hasSellerId, hasBuyerId));
  }, [hasBuyerId, hasSellerId]);

  const actingAsSeller = canActAsSeller(identity, hasSellerId);
  const canApply = isOpen && actingAsSeller;

  function switchToSeller() {
    if (!hasSellerId) return;
    writeStoredMemberIdentity("seller");
    setIdentity("seller");
    void queryClient.invalidateQueries({ queryKey: ["account"] });
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-3">
        {canApply ? (
          <Button
            type="button"
            className="min-h-12 rounded-2xl bg-brand-mantis px-6 text-sm font-extrabold text-brand-forest hover:brightness-95"
            onClick={() => setApplyOpen(true)}
          >
            <Send className="size-4" />
            Apply on web
          </Button>
        ) : isSignedIn && hasSellerId && !actingAsSeller ? (
          <Button
            type="button"
            className="min-h-12 rounded-2xl bg-brand-mantis px-6 text-sm font-extrabold text-brand-forest hover:brightness-95"
            onClick={switchToSeller}
          >
            Switch to Seller to apply
          </Button>
        ) : isSignedIn ? (
          <Link
            href="/account?view=dashboard"
            className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-brand-mantis px-6 text-sm font-extrabold text-brand-forest transition hover:brightness-95"
          >
            {hasSellerId ? "Open seller workspace" : "Add seller to apply"}
          </Link>
        ) : (
          <Link
            href={loginHref}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-brand-mantis px-6 text-sm font-extrabold text-brand-forest transition hover:brightness-95"
          >
            <Send className="size-4" />
            Sign in to apply
          </Link>
        )}

        <ContinueInApp
          title="Prefer the mobile app?"
          description={`You can also open “${requirementTitle}” in the Kattegat app.`}
          deepLinkPath={`/requirement/${requirementId}`}
          webOrigin={webOrigin}
          appStoreUrl={appStoreUrl}
          playStoreUrl={playStoreUrl}
          mobileAppUrl={mobileAppUrl}
          buttonLabel="Open in app"
          variant="outline"
        />
      </div>

      {isSignedIn && hasSellerId && !actingAsSeller ? (
        <p className="text-[13px] leading-6 text-brand-forest/60">
          You’re browsing as Buyer. Switch to Seller to send a pitch on this requirement.
        </p>
      ) : null}

      {isSignedIn && !hasSellerId ? (
        <p className="text-[13px] leading-6 text-brand-forest/60">
          Applying needs a seller identity. Add one in your account, then return here to send a pitch.
        </p>
      ) : null}

      <ApplyToRequirementDialog
        open={applyOpen}
        onOpenChange={setApplyOpen}
        requirementId={requirementId}
        requirementTitle={requirementTitle}
      />
    </div>
  );
}
