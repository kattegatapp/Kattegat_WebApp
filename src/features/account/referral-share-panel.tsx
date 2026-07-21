"use client";

import {
  Check,
  Copy,
  Link2,
  Mail,
  MessageCircle,
  Share2,
} from "lucide-react";
import Image from "next/image";
import { useMemo, useState } from "react";

import { AccountGlass } from "@/features/account/account-shared";
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

function SharePlatformButton({
  label,
  href,
  children,
}: {
  label: string;
  href: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Share on ${label}`}
      className="flex flex-col items-center gap-1.5 rounded-xl border border-white/70 bg-white/45 px-2 py-2.5 text-[10px] font-bold text-brand-forest transition hover:bg-white/70"
    >
      {children}
      <span>{label}</span>
    </a>
  );
}

export function ReferralSharePanel({ referral, className }: ReferralSharePanelProps) {
  const [copied, setCopied] = useState<CopyTarget>(null);
  const shareUrl = useMemo(() => resolveReferralShareUrl(referral), [referral]);
  const shareLinks = useMemo(
    () => buildReferralShareLinks(shareUrl, referral.code),
    [shareUrl, referral.code],
  );
  const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(shareUrl)}`;

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
      // user dismissed or share failed — fall back to copy
    }
    await handleCopy("link", shareUrl);
  }

  return (
    <AccountGlass className={cn("rounded-[20px] p-5", className)}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            Your referral code
          </p>
          <p className="mt-1 text-[13px] text-brand-forest/65">Copy your link or share it anywhere.</p>
        </div>
        <Button
          type="button"
          size="sm"
          className="rounded-xl bg-gradient-to-br from-brand-mantis to-brand-emerald text-xs font-bold text-brand-forest"
          onClick={() => void handleNativeShare()}
        >
          <Share2 className="size-3.5" />
          Share
        </Button>
      </div>

      <button
        type="button"
        onClick={() => void handleCopy("code", referral.code)}
        className="mt-4 flex w-full items-center justify-between rounded-xl border border-dashed border-brand-mantis/55 bg-brand-mantis/10 px-4 py-3 text-left transition hover:bg-brand-mantis/15"
      >
        <span className="text-xl font-extrabold tracking-[0.08em] text-brand-forest">{referral.code}</span>
        {copied === "code" ? (
          <Check className="size-4 text-brand-mantis" />
        ) : (
          <Copy className="size-4 text-brand-forest/55" />
        )}
      </button>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="mx-auto shrink-0 rounded-2xl border border-white/80 bg-white p-2.5 shadow-sm sm:mx-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={qrSrc} alt="Referral QR code" width={148} height={148} className="rounded-xl" />
        </div>
        <div className="min-w-0 flex-1 space-y-3">
          <div className="rounded-xl border border-white/70 bg-white/40 px-3 py-2.5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Share link</p>
            <p className="mt-1 break-all text-[13px] font-medium text-brand-forest">{shareUrl}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-xl border-brand-forest/12 bg-white/55 text-xs font-bold"
              onClick={() => void handleCopy("link", shareUrl)}
            >
              {copied === "link" ? <Check className="size-3.5" /> : <Link2 className="size-3.5" />}
              {copied === "link" ? "Copied" : "Copy link"}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-xl border-brand-forest/12 bg-white/55 text-xs font-bold"
              onClick={() => void handleCopy("code", referral.code)}
            >
              {copied === "code" ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
              {copied === "code" ? "Copied" : "Copy code"}
            </Button>
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-4 gap-2 sm:grid-cols-5">
        <SharePlatformButton label="WhatsApp" href={shareLinks.whatsapp}>
          <MessageCircle className="size-4 text-[#25D366]" />
        </SharePlatformButton>
        <SharePlatformButton label="X" href={shareLinks.twitter}>
          <span className="text-sm font-extrabold">𝕏</span>
        </SharePlatformButton>
        <SharePlatformButton label="Facebook" href={shareLinks.facebook}>
          <span className="text-sm font-extrabold text-[#1877F2]">f</span>
        </SharePlatformButton>
        <SharePlatformButton label="LinkedIn" href={shareLinks.linkedin}>
          <span className="text-[11px] font-extrabold text-[#0A66C2]">in</span>
        </SharePlatformButton>
        <SharePlatformButton label="Email" href={shareLinks.email}>
          <Mail className="size-4 text-brand-blue" />
        </SharePlatformButton>
      </div>

      <div className="relative mt-5 overflow-hidden rounded-[18px] border border-white/75 bg-gradient-to-br from-brand-forest via-[#0a2e1a] to-brand-blue p-5 text-white shadow-[0_18px_50px_rgb(0_57_18/0.18)]">
        <div className="pointer-events-none absolute inset-0 opacity-30" aria-hidden>
          <div className="absolute -right-8 -top-8 size-32 rounded-full bg-brand-mantis/40 blur-2xl" />
        </div>
        <div className="relative flex items-start justify-between gap-4">
          <div>
            <Image src="/brand/logo/brandmark-main.svg" alt="" width={28} height={28} className="brightness-0 invert" />
            <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/70">Invite friends</p>
            <p className="mt-1 text-lg font-extrabold leading-tight">Join Kattegat with my code</p>
            <p className="mt-3 text-2xl font-extrabold tracking-[0.1em] text-brand-mantis">{referral.code}</p>
            <p className="mt-2 break-all text-[12px] text-white/75">{shareUrl}</p>
          </div>
        </div>
        <p className="relative mt-4 text-[11px] text-white/55">Screenshot this card to share as a post or story.</p>
      </div>
    </AccountGlass>
  );
}
