"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  ImagePlus,
  Loader2,
  Lock,
  ShieldCheck,
} from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";

import {
  AccountGlass,
  AccountListCard,
  AccountViewIntro,
  AccountViewWrap,
} from "@/features/account/account-shared";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  fetchIdentityVerificationStatus,
  submitIdentityVerification,
  uploadIdentityDocument,
  type IdentityVerificationStatus,
} from "@/lib/api/account-verification";
import { ApiRequestError } from "@/lib/api/client";
import { cn } from "@/lib/utils";

const PHOTO_TIPS = [
  "Place the ID on a flat, well-lit surface",
  "Keep all four corners inside the photo",
  "Make sure names and numbers are sharp and readable",
] as const;

function statusMeta(status: IdentityVerificationStatus) {
  switch (status) {
    case "verified":
      return {
        label: "Verified",
        tone: "border-brand-emerald/35 bg-brand-emerald/10 text-brand-emerald",
      };
    case "pending":
      return {
        label: "In review",
        tone: "border-amber-300/50 bg-amber-50 text-amber-800",
      };
    case "rejected":
      return {
        label: "Needs new photos",
        tone: "border-red-300/50 bg-red-50 text-red-700",
      };
    default:
      return {
        label: "Not submitted",
        tone: "border-brand-forest/10 bg-brand-forest/[0.03] text-brand-forest/70",
      };
  }
}

function DocumentSlot({
  title,
  description,
  step,
  previewUrl,
  uploading,
  disabled,
  onPick,
}: {
  title: string;
  description: string;
  step: number;
  previewUrl: string | null;
  uploading: boolean;
  disabled: boolean;
  onPick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onPick}
      className={cn(
        "group relative overflow-hidden rounded-[18px] border text-left transition",
        previewUrl
          ? "border-brand-mantis/40 bg-white shadow-sm"
          : "border-dashed border-brand-forest/20 bg-[#F7F9F8] hover:border-brand-mantis/40 hover:bg-white",
        disabled && "opacity-60",
      )}
    >
      {previewUrl ? (
        <>
          <div className="relative aspect-[16/10] bg-muted">
            <Image
              src={previewUrl}
              alt=""
              fill
              unoptimized
              className="object-cover"
              sizes="(max-width: 640px) 100vw, 50vw"
            />
            <span className="absolute right-2.5 top-2.5 inline-flex items-center gap-1 rounded-full bg-brand-forest/90 px-2.5 py-1 text-[10px] font-bold text-white">
              <CheckCircle2 className="size-3.5" />
              Added
            </span>
          </div>
          <div className="px-3.5 py-3">
            <p className="text-[13px] font-extrabold text-brand-forest">{title}</p>
            <p className="mt-0.5 text-[12px] font-medium text-brand-mantis">
              {uploading ? "Uploading…" : "Tap to replace"}
            </p>
          </div>
        </>
      ) : (
        <div className="flex items-start gap-3.5 p-4 sm:p-5">
          <span className="grid size-12 shrink-0 place-items-center rounded-full bg-brand-mantis/15 text-brand-forest">
            {uploading ? (
              <Loader2 className="size-5 animate-spin" />
            ) : (
              <ImagePlus className="size-5" />
            )}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
              Step {step} of 2
            </p>
            <p className="mt-1 text-[15px] font-extrabold text-brand-forest">{title}</p>
            <p className="mt-1 text-[13px] leading-5 text-brand-forest/60">{description}</p>
          </div>
        </div>
      )}
    </button>
  );
}

export function AccountVerificationView() {
  const client = useQueryClient();
  const frontInputRef = useRef<HTMLInputElement>(null);
  const backInputRef = useRef<HTMLInputElement>(null);
  const [frontUrl, setFrontUrl] = useState<string | null>(null);
  const [backUrl, setBackUrl] = useState<string | null>(null);
  const [uploadingSide, setUploadingSide] = useState<"front" | "back" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const statusQuery = useQuery({
    queryKey: ["account", "identity-verification"],
    queryFn: fetchIdentityVerificationStatus,
  });

  const status = statusQuery.data?.status ?? "not_submitted";
  const meta = statusMeta(status);
  const canSubmit = status === "not_submitted" || status === "rejected";
  const readyToSubmit = Boolean(frontUrl && backUrl);

  const submit = useMutation({
    mutationFn: async () => {
      if (!frontUrl || !backUrl) throw new Error("Upload both front and back of your ID.");
      return submitIdentityVerification({ documentUrl: frontUrl, documentBackUrl: backUrl });
    },
    onSuccess: async () => {
      setError(null);
      setFrontUrl(null);
      setBackUrl(null);
      await client.invalidateQueries({ queryKey: ["account", "identity-verification"] });
    },
    onError: (err) => {
      setError(err instanceof ApiRequestError || err instanceof Error ? err.message : "Submit failed.");
    },
  });

  async function handleFile(side: "front" | "back", file: File | undefined) {
    if (!file) return;
    setUploadingSide(side);
    setError(null);
    try {
      const uploaded = await uploadIdentityDocument(file);
      if (side === "front") setFrontUrl(uploaded.secureUrl);
      else setBackUrl(uploaded.secureUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploadingSide(null);
    }
  }

  const busy = uploadingSide !== null || submit.isPending;

  return (
    <AccountViewWrap>
      <AccountViewIntro
        title="Identity verification"
        description="Upload both sides of your Emirates ID or government ID. We review it securely — usually within one business day."
      />

      <AccountGlass className="mb-5 rounded-[20px] p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <span className="grid size-14 shrink-0 place-items-center rounded-full bg-brand-forest text-white">
            <ShieldCheck className="size-7" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-brand-mantis">
                Secure ID check
              </p>
              <span className={cn("rounded-full border px-2.5 py-0.5 text-[10px] font-bold", meta.tone)}>
                {meta.label}
              </span>
            </div>
            <h3 className="mt-1.5 text-xl font-extrabold tracking-tight text-brand-forest">
              Build trust with clients
            </h3>
            <p className="mt-2 max-w-xl text-[13px] leading-6 text-brand-forest/65">
              Required for Pro sellers before premium features unlock fully on web. Your documents
              stay private and never appear on your public profile.
            </p>
            <p className="mt-3 inline-flex items-center gap-2 text-[12px] font-medium text-brand-forest/50">
              <Lock className="size-3.5 shrink-0" />
              Used only for verification
            </p>
          </div>
        </div>
      </AccountGlass>

      {statusQuery.isPending ? (
        <div className="space-y-3">
          <Skeleton className="h-28 w-full rounded-[18px] bg-brand-forest/8" />
          <Skeleton className="h-40 w-full rounded-[18px] bg-brand-forest/6" />
        </div>
      ) : status === "verified" ? (
        <AccountListCard className="border-brand-emerald/25 p-8 text-center sm:p-10">
          <span className="mx-auto grid size-16 place-items-center rounded-full bg-brand-emerald/15 text-brand-emerald">
            <CheckCircle2 className="size-9" />
          </span>
          <h3 className="mt-4 text-lg font-extrabold text-brand-forest">Identity verified</h3>
          <p className="mx-auto mt-2 max-w-md text-[13px] leading-6 text-brand-forest/65">
            Your verified status helps clients know they are working with a trusted seller. Premium
            Pro features stay unlocked on web.
          </p>
        </AccountListCard>
      ) : status === "pending" ? (
        <AccountListCard className="border-amber-300/40 p-5 sm:p-6">
          <div className="flex items-start gap-3.5">
            <span className="grid size-12 shrink-0 place-items-center rounded-full bg-amber-50 text-amber-700">
              <Clock3 className="size-5" />
            </span>
            <div className="min-w-0">
              <h3 className="text-[15px] font-extrabold text-brand-forest">Verification in review</h3>
              <p className="mt-1 text-[13px] leading-6 text-brand-forest/65">
                We received your documents and will notify you when the review is complete.
              </p>
              {statusQuery.data?.submittedAt ? (
                <p className="mt-2 text-[12px] font-medium text-muted-foreground">
                  Submitted — usually within one business day
                </p>
              ) : null}
            </div>
          </div>
        </AccountListCard>
      ) : (
        <div className="space-y-5">
          {status === "rejected" ? (
            <AccountListCard className="border-red-300/40 p-4 sm:p-5">
              <div className="flex items-start gap-3">
                <AlertCircle className="mt-0.5 size-5 shrink-0 text-red-600" />
                <div className="min-w-0">
                  <p className="text-[13px] font-extrabold text-red-700">We need new photos</p>
                  <p className="mt-1 text-[13px] leading-6 text-brand-forest/70">
                    {statusQuery.data?.rejectionReason ??
                      "The previous documents could not be verified clearly."}
                  </p>
                  <p className="mt-1.5 text-[12px] text-muted-foreground">
                    Follow the tips below and submit both sides again.
                  </p>
                </div>
              </div>
            </AccountListCard>
          ) : null}

          <div>
            <h3 className="text-[15px] font-extrabold text-brand-forest">Add your ID photos</h3>
            <p className="mt-1 text-[13px] text-brand-forest/60">JPG, PNG, or WebP — both sides required.</p>
          </div>

          <input
            ref={frontInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(event) => {
              void handleFile("front", event.target.files?.[0]);
              event.target.value = "";
            }}
          />
          <input
            ref={backInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(event) => {
              void handleFile("back", event.target.files?.[0]);
              event.target.value = "";
            }}
          />

          <div className="grid gap-3 sm:grid-cols-2">
            <DocumentSlot
              title="Front of ID"
              description="The side with your photo and full name."
              step={1}
              previewUrl={frontUrl}
              uploading={uploadingSide === "front"}
              disabled={busy}
              onPick={() => frontInputRef.current?.click()}
            />
            <DocumentSlot
              title="Back of ID"
              description="The reverse side with all details visible."
              step={2}
              previewUrl={backUrl}
              uploading={uploadingSide === "back"}
              disabled={busy}
              onPick={() => backInputRef.current?.click()}
            />
          </div>

          <AccountListCard className="p-4 sm:p-5">
            <p className="text-[12px] font-extrabold uppercase tracking-[0.12em] text-muted-foreground">
              For a quick approval
            </p>
            <ul className="mt-3 space-y-2.5">
              {PHOTO_TIPS.map((tip) => (
                <li key={tip} className="flex items-start gap-2.5 text-[13px] leading-5 text-brand-forest/70">
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-brand-emerald" />
                  {tip}
                </li>
              ))}
            </ul>
          </AccountListCard>

          {error ? <p className="text-sm text-red-600">{error}</p> : null}

          {canSubmit ? (
            <div className="space-y-2">
              <Button
                type="button"
                size="lg"
                className="h-12 w-full font-extrabold sm:w-auto sm:min-w-[16rem]"
                disabled={!readyToSubmit || busy}
                onClick={() => submit.mutate()}
              >
                {submit.isPending ? <Loader2 className="animate-spin" /> : null}
                {readyToSubmit ? "Submit for verification" : "Add both sides to continue"}
              </Button>
              <p className="text-center text-[12px] text-muted-foreground sm:text-left">
                By submitting, you confirm these documents belong to you.
              </p>
            </div>
          ) : null}
        </div>
      )}
    </AccountViewWrap>
  );
}
