"use client";

import {
  Check,
  Copy,
  Link2,
  Mail,
  MessageCircle,
  Share2,
} from "lucide-react";
import { useMemo, useState } from "react";

import { AccountListCard } from "@/features/account/account-shared";
import { Button } from "@/components/ui/button";
import type { ReferralSummary } from "@/lib/api/account";
import { copyText } from "@/lib/share/copy-text";
import {
  buildReferralShareLinks,
  buildReferralShareMessage,
  resolveReferralShareUrl,
} from "@/lib/share/referral-share";
import { cn } from "@/lib/utils";

type CopyTarget = "link" | "code" | null;

type ReferralSharePanelProps = {
  referral: ReferralSummary;
  className?: string;
};

export function ReferralSharePanel({ referral, className }: ReferralSharePanelProps) {
  const [copied, setCopied] = useState<CopyTarget>(null);
  const shareUrl = useMemo(() => resolveReferralShareUrl(referral), [referral]);
  const shareLinks = useMemo(
    () => buildReferralShareLinks(shareUrl, referral.code),
    [shareUrl, referral.code],
  );
  const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(shareUrl)}`;

  async function handleCopy(target: CopyTarget, value: string) {
    const ok = await copyText(value);
    if (!ok) return;
    setCopied(target);
    window.setTimeout(() => setCopied(null), 1800);
  }

  async function handleNativeShare() {
    const message = buildReferralShareMessage(shareUrl, referral.code);
    try {
      if (navigator.share) {
        await navigator.share({
          title: "Join Kattegat",
          text: message,
          url: shareUrl,
        });
        return;
      }
    } catch {
      // dismissed or failed — fall back to copy
    }
    await handleCopy("link", shareUrl);
  }

  return (
    <AccountListCard className={cn("p-5 sm:p-6", className)}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-[15px] font-extrabold text-brand-forest">Your invite</h3>
          <p className="mt-1 text-[13px] text-brand-forest/60">
            Copy the code or share the link — friends join with your referral.
          </p>
        </div>
        <Button
          type="button"
          size="sm"
          className="rounded-xl font-bold"
          onClick={() => void handleNativeShare()}
        >
          <Share2 className="size-3.5" />
          Share
        </Button>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_auto] lg:items-start">
        <div className="min-w-0 space-y-3">
          <button
            type="button"
            onClick={() => void handleCopy("code", referral.code)}
            className="flex w-full items-center justify-between rounded-2xl border border-dashed border-brand-mantis/50 bg-brand-mantis/10 px-4 py-3.5 text-left transition hover:bg-brand-mantis/15"
          >
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-brand-forest/50">
                Referral code
              </p>
              <p className="mt-1 text-2xl font-extrabold tracking-[0.12em] text-brand-forest">
                {referral.code}
              </p>
            </div>
            {copied === "code" ? (
              <Check className="size-4 text-brand-mantis" />
            ) : (
              <Copy className="size-4 text-brand-forest/45" />
            )}
          </button>

          <div className="rounded-2xl border border-brand-forest/10 bg-[#F7F9F8] px-4 py-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
              Share link
            </p>
            <p className="mt-1 break-all text-[13px] font-medium text-brand-forest/80">{shareUrl}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-xl text-xs font-bold"
                onClick={() => void handleCopy("link", shareUrl)}
              >
                {copied === "link" ? <Check className="size-3.5" /> : <Link2 className="size-3.5" />}
                {copied === "link" ? "Copied" : "Copy link"}
              </Button>
              <a
                href={shareLinks.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-8 items-center gap-1.5 rounded-xl border border-brand-forest/12 bg-white px-3 text-xs font-bold text-brand-forest transition hover:border-brand-mantis/35"
              >
                <MessageCircle className="size-3.5 text-[#25D366]" />
                WhatsApp
              </a>
              <a
                href={shareLinks.email}
                className="inline-flex h-8 items-center gap-1.5 rounded-xl border border-brand-forest/12 bg-white px-3 text-xs font-bold text-brand-forest transition hover:border-brand-mantis/35"
              >
                <Mail className="size-3.5 text-brand-blue" />
                Email
              </a>
            </div>
          </div>
        </div>

        <div className="mx-auto flex w-fit flex-col items-center gap-2 lg:mx-0">
          <div className="rounded-2xl border border-brand-forest/10 bg-white p-2.5 shadow-sm">
            {/* eslint-disable-next-line @next/next/no-img-element -- external QR API */}
            <img src={qrSrc} alt="Referral QR code" width={132} height={132} className="rounded-xl" />
          </div>
          <p className="text-[11px] font-medium text-muted-foreground">Scan to join</p>
        </div>
      </div>
    </AccountListCard>
  );
}
