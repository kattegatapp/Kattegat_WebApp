"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Loader2, MessageCircle, Users } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { ContinueInApp } from "@/features/marketing/continue-in-app";
import { Button } from "@/components/ui/button";
import {
  contactAgentForListing,
  startAccountConversation,
} from "@/lib/api/account-chat";
import { ApiRequestError } from "@/lib/api/client";
import {
  canActAsBuyer,
  resolveActiveMemberIdentity,
  writeStoredMemberIdentity,
  type MemberIdentity,
} from "@/lib/auth/member-identity";
import { cn } from "@/lib/utils";

export type ListingContactViewer = {
  signedIn: boolean;
  userId: string | null;
  hasBuyerId: boolean;
  hasSellerId?: boolean;
};

type ListingContactPanelProps = {
  listingId?: string;
  listingTitle?: string;
  sellerId: string;
  sellerName: string;
  sellerUserId: string;
  canChatDirectly: boolean;
  contactAgentEnabled: boolean;
  viewer: ListingContactViewer;
  publicPath: string;
  deepLinkPath: string;
  webOrigin: string;
  appStoreUrl: string | null;
  playStoreUrl: string | null;
  mobileAppUrl: string | null;
  /** Button-only layout for seller profile header / sticky bars. */
  compact?: boolean;
  className?: string;
};

export function ListingContactPanel({
  listingId,
  listingTitle,
  sellerId,
  sellerName,
  sellerUserId,
  canChatDirectly,
  contactAgentEnabled,
  viewer,
  publicPath,
  deepLinkPath,
  webOrigin,
  appStoreUrl,
  playStoreUrl,
  mobileAppUrl,
  compact = false,
  className,
}: ListingContactPanelProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [agentDone, setAgentDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [identity, setIdentity] = useState<MemberIdentity>(() =>
    resolveActiveMemberIdentity(viewer.hasSellerId, viewer.hasBuyerId),
  );

  useEffect(() => {
    setIdentity(resolveActiveMemberIdentity(viewer.hasSellerId, viewer.hasBuyerId));
  }, [viewer.hasBuyerId, viewer.hasSellerId]);

  const isOwnListing = Boolean(viewer.userId) && viewer.userId === sellerUserId;
  const showContact = !isOwnListing && (canChatDirectly || contactAgentEnabled);
  const actingAsBuyer = canActAsBuyer(identity, viewer.hasBuyerId);
  const titleForCopy = listingTitle?.trim() || sellerName;
  const loginHref = `/login?next=${encodeURIComponent(publicPath)}`;

  function switchToBuyer() {
    if (!viewer.hasBuyerId) return;
    writeStoredMemberIdentity("buyer");
    setIdentity("buyer");
    void queryClient.invalidateQueries({ queryKey: ["account"] });
  }

  const messageSeller = useMutation({
    mutationFn: () =>
      startAccountConversation({
        sellerId,
        listingId,
        firstMessage: listingTitle
          ? "Hi, I'm interested in this listing."
          : `Hi, I'm interested in working with ${sellerName}.`,
      }),
    onSuccess: async (conversation) => {
      setError(null);
      await queryClient.invalidateQueries({ queryKey: ["account", "chat", "conversations"] });
      router.push(`/chat/${conversation.id}`);
    },
    onError: (err) => {
      setError(
        err instanceof ApiRequestError || err instanceof Error
          ? err.message
          : "Could not start the conversation.",
      );
    },
  });

  const contactAgent = useMutation({
    mutationFn: () =>
      contactAgentForListing({
        sellerId,
        listingId,
        message: listingTitle
          ? `Buyer interested in listing: ${listingTitle}`
          : `Buyer interested in seller: ${sellerName}`,
      }),
    onSuccess: () => {
      setError(null);
      setAgentDone(true);
    },
    onError: (err) => {
      if (err instanceof ApiRequestError && err.code === "CONTACT_AGENT_ALREADY_REQUESTED") {
        setError(null);
        setAgentDone(true);
        return;
      }
      setError(
        err instanceof ApiRequestError || err instanceof Error
          ? err.message
          : "Could not send the request.",
      );
    },
  });

  const busy = messageSeller.isPending || contactAgent.isPending;

  const primaryAction = (() => {
    if (!viewer.signedIn) {
      return (
        <Link
          href={loginHref}
          className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-brand-mantis px-5 text-sm font-extrabold text-brand-forest transition hover:brightness-95"
        >
          <MessageCircle className="size-4" />
          Sign in to {canChatDirectly ? "message" : "contact"}
        </Link>
      );
    }
    if (!viewer.hasBuyerId) {
      return (
        <Link
          href="/account?view=dashboard"
          className="inline-flex min-h-12 w-full items-center justify-center rounded-2xl bg-brand-mantis px-5 text-sm font-extrabold text-brand-forest transition hover:brightness-95"
        >
          Add buyer to contact
        </Link>
      );
    }
    // Dual-identity: seller mode must not keep buyer chat/contact actions (mobile parity).
    if (!actingAsBuyer) {
      return (
        <div className="space-y-2">
          <Button
            type="button"
            onClick={switchToBuyer}
            className="min-h-12 w-full rounded-2xl bg-brand-mantis text-sm font-extrabold text-brand-forest hover:brightness-95"
          >
            Switch to Buyer to {canChatDirectly ? "message" : "contact"}
          </Button>
          <p
            className={cn(
              "text-center text-[12px] leading-5",
              compact ? "text-brand-forest/60" : "text-white/65",
            )}
          >
            You’re browsing as Seller. Contact actions are buyer-only.
          </p>
        </div>
      );
    }
    if (agentDone && !canChatDirectly) {
      return (
        <div
          className={cn(
            "flex items-start gap-3 rounded-2xl px-4 py-3.5",
            compact ? "border border-brand-emerald/30 bg-brand-emerald/10" : "border border-white/15 bg-white/10",
          )}
        >
          <CheckCircle2
            className={cn("mt-0.5 size-5 shrink-0", compact ? "text-brand-emerald" : "text-brand-mantis")}
          />
          <div>
            <p className={cn("text-sm font-extrabold", compact ? "text-brand-forest" : "text-white")}>
              Request sent
            </p>
            <p
              className={cn(
                "mt-1 text-[13px] leading-5",
                compact ? "text-brand-forest/65" : "text-white/70",
              )}
            >
              Our team will follow up shortly about “{titleForCopy}”.
            </p>
          </div>
        </div>
      );
    }
    if (canChatDirectly) {
      return (
        <Button
          type="button"
          disabled={busy}
          onClick={() => messageSeller.mutate()}
          className="min-h-12 w-full rounded-2xl bg-brand-mantis text-sm font-extrabold text-brand-forest hover:brightness-95"
        >
          {messageSeller.isPending ? <Loader2 className="animate-spin" /> : <MessageCircle className="size-4" />}
          Message seller
        </Button>
      );
    }
    return (
      <Button
        type="button"
        disabled={busy}
        onClick={() => contactAgent.mutate()}
        className="min-h-12 w-full rounded-2xl bg-brand-mantis text-sm font-extrabold text-brand-forest hover:brightness-95"
      >
        {contactAgent.isPending ? <Loader2 className="animate-spin" /> : <Users className="size-4" />}
        Contact Agent
      </Button>
    );
  })();

  if (!showContact) {
    return (
      <div className={cn(compact ? undefined : "space-y-3", className)}>
        <ContinueInApp
          title="Download the app to continue"
          description={`Open Kattegat to view “${titleForCopy}”.`}
          deepLinkPath={deepLinkPath}
          webOrigin={webOrigin}
          appStoreUrl={appStoreUrl}
          playStoreUrl={playStoreUrl}
          mobileAppUrl={mobileAppUrl}
          buttonLabel={compact ? "Open in app" : "Continue in app"}
          variant={compact ? "primary" : "outline"}
          className={compact ? "w-full" : undefined}
        />
      </div>
    );
  }

  if (compact) {
    return (
      <div className={cn("space-y-2", className)}>
        {primaryAction}
        {error ? <p className="text-[12px] text-red-600">{error}</p> : null}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "overflow-hidden rounded-[1.5rem] bg-gradient-to-br from-brand-forest via-[#0a2e1a] to-brand-blue p-5 text-white sm:p-6",
        className,
      )}
    >
      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-brand-mantis">
        Ready to book?
      </p>
      <h3 className="mt-1.5 text-lg font-extrabold tracking-tight">
        {canChatDirectly ? `Message ${sellerName}` : "Contact via Kattegat"}
      </h3>
      <p className="mt-2 text-[13px] leading-6 text-white/70">
        {canChatDirectly
          ? "Send a quick message and start the conversation with this seller on the web."
          : "This seller doesn’t chat directly yet — our team will reach out for you."}
      </p>

      <div className="mt-5 space-y-3">
        {primaryAction}
        {error ? <p className="text-[13px] text-red-200">{error}</p> : null}
        <ContinueInApp
          title="Prefer the mobile app?"
          description="You can also open this in the Kattegat app."
          deepLinkPath={deepLinkPath}
          webOrigin={webOrigin}
          appStoreUrl={appStoreUrl}
          playStoreUrl={playStoreUrl}
          mobileAppUrl={mobileAppUrl}
          buttonLabel="Open in app"
          variant="outline"
          className="w-full border-white/20 bg-white/10 text-white hover:bg-white/15"
        />
      </div>
    </div>
  );
}
