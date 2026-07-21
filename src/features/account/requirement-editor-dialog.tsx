"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ImagePlus, Loader2, X } from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { fetchPublicAppSettingsClient } from "@/lib/api/client-settings";
import { ApiRequestError } from "@/lib/api/client";
import { filsToAedInput } from "@/lib/api/account-listings";
import {
  createAccountRequirement,
  fetchMyRequirement,
  requirementEditable,
  updateAccountRequirement,
  type AccountRequirement,
} from "@/lib/api/account-requirements";
import { isCloudinaryConfigured, uploadImage } from "@/lib/cloudinary";
import {
  buildUpdateRequirementPayload,
  JOB_TYPE_OPTIONS,
  requirementFormSchema,
  toRequirementPayload,
} from "@/lib/validations/requirement";

type RequirementEditorMode = "create" | "edit";
type AttachmentItem = { id: string; url: string; file?: File; previewUrl?: string };

export function RequirementEditorDialog({
  open,
  onOpenChange,
  mode,
  requirementId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: RequirementEditorMode;
  requirementId?: string | null;
}) {
  const isEdit = mode === "edit" && Boolean(requirementId);
  const existing = useQuery({
    queryKey: ["account", "requirements", requirementId],
    queryFn: () => fetchMyRequirement(requirementId!),
    enabled: open && isEdit && Boolean(requirementId),
  });

  const loadingExisting = isEdit && existing.isPending;
  const formKey = isEdit
    ? `edit-${requirementId}-${existing.dataUpdatedAt}`
    : `create-${open ? "open" : "closed"}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[min(90dvh,calc(100vh-2rem))] flex-col gap-0 overflow-hidden p-0 sm:max-w-lg">
        <DialogHeader className="shrink-0 border-b border-brand-forest/10 px-4 py-4 pr-12">
          <DialogTitle>{isEdit ? "Edit requirement" : "Post a requirement"}</DialogTitle>
          <DialogDescription>
            Requirements are submitted for admin review (there is no private draft on the server).
            Title, description, location, and job type are required by the backend.
          </DialogDescription>
        </DialogHeader>

        {loadingExisting || (isEdit && !existing.data) ? (
          <div className="flex flex-1 items-center justify-center py-12 text-muted-foreground">
            <Loader2 className="size-6 animate-spin" />
          </div>
        ) : open ? (
          <RequirementEditorForm
            key={formKey}
            isEdit={isEdit}
            requirementId={requirementId}
            existing={existing.data ?? null}
            onClose={() => onOpenChange(false)}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function RequirementEditorForm({
  isEdit,
  requirementId,
  existing,
  onClose,
}: {
  isEdit: boolean;
  requirementId?: string | null;
  existing: AccountRequirement | null;
  onClose: () => void;
}) {
  const client = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState(existing?.title ?? "");
  const [jobType, setJobType] = useState(existing?.jobType || "gig");
  const [description, setDescription] = useState(existing?.description ?? "");
  const [location, setLocation] = useState(existing?.location ?? "");
  const [budgetMinAed, setBudgetMinAed] = useState(filsToAedInput(existing?.budgetMin));
  const [budgetMaxAed, setBudgetMaxAed] = useState(filsToAedInput(existing?.budgetMax));
  const [startsAt, setStartsAt] = useState(existing?.startsAt?.slice(0, 10) ?? "");
  const [endsAt, setEndsAt] = useState(existing?.endsAt?.slice(0, 10) ?? "");
  const [attachments, setAttachments] = useState<AttachmentItem[]>(
    (existing?.attachments ?? []).map((url, index) => ({
      id: `existing-${index}-${url}`,
      url,
    })),
  );
  const [formError, setFormError] = useState<string | null>(null);

  const settings = useQuery({
    queryKey: ["settings", "public"],
    queryFn: fetchPublicAppSettingsClient,
    staleTime: 300_000,
  });

  const maxAttachments = settings.data?.operations.maxRequirementAttachments ?? 10;
  const attachmentSlotsLeft = Math.max(0, maxAttachments - attachments.length);
  const notEditable = Boolean(isEdit && existing && !requirementEditable(existing.status));

  async function resolveAttachmentUrls(): Promise<string[]> {
    return Promise.all(
      attachments.map(async (attachment) => {
        if (attachment.url.startsWith("http")) return attachment.url;
        if (!attachment.file) throw new Error("Attachment file is missing.");
        const uploaded = await uploadImage(attachment.file, "requirements");
        return uploaded.secureUrl;
      }),
    );
  }

  function handlePickAttachments(event: React.ChangeEvent<HTMLInputElement>) {
    const files = event.target.files;
    if (!files?.length) return;

    const next: AttachmentItem[] = [];
    for (const file of Array.from(files)) {
      if (next.length >= attachmentSlotsLeft) break;
      next.push({
        id: `${file.name}-${file.lastModified}`,
        url: "",
        file,
        previewUrl: URL.createObjectURL(file),
      });
    }
    setAttachments((prev) => [...prev, ...next]);
    event.target.value = "";
  }

  function removeAttachment(id: string) {
    setAttachments((prev) => {
      const target = prev.find((item) => item.id === id);
      if (target?.previewUrl) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((item) => item.id !== id);
    });
  }

  const submitMutation = useMutation({
    mutationFn: async () => {
      setFormError(null);

      if (notEditable) {
        throw new Error("This requirement can no longer be edited.");
      }

      const parsed = requirementFormSchema.safeParse({
        title,
        jobType,
        description,
        location,
        budgetMinAed,
        budgetMaxAed,
        startsAt,
        endsAt,
      });
      if (!parsed.success) {
        throw new Error(parsed.error.issues[0]?.message ?? "Check the form and try again.");
      }

      const needsUpload = attachments.some((item) => !item.url.startsWith("http"));
      if (needsUpload && !isCloudinaryConfigured()) {
        throw new Error("Photo uploads are not configured. Remove new attachments or contact support.");
      }

      const attachmentUrls = await resolveAttachmentUrls();

      if (isEdit && requirementId && existing) {
        const updatePayload = buildUpdateRequirementPayload(parsed.data, existing, attachmentUrls);
        if (Object.keys(updatePayload).length === 0) return existing;
        return updateAccountRequirement(requirementId, updatePayload);
      }

      return createAccountRequirement(toRequirementPayload(parsed.data, attachmentUrls));
    },
    onSuccess: async () => {
      attachments.forEach((item) => {
        if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
      });
      await client.invalidateQueries({ queryKey: ["account", "requirements", "mine"] });
      onClose();
    },
    onError: (error) => {
      setFormError(
        error instanceof ApiRequestError
          ? error.message
          : error instanceof Error
            ? error.message
            : "Could not submit requirement.",
      );
    },
  });

  return (
    <>
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4">
        <div className="space-y-4">
        {notEditable ? (
          <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            This requirement is {existing?.status?.replaceAll("_", " ")} and can no longer be edited.
          </p>
        ) : null}

        {existing?.rejectionReason ? (
          <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            Rejected: {existing.rejectionReason}
          </p>
        ) : null}

        <div className="space-y-1.5">
          <Label htmlFor="requirement-title">Title *</Label>
          <Input
            id="requirement-title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            maxLength={120}
            disabled={notEditable}
            placeholder="e.g. Need a photographer for a rooftop launch"
          />
        </div>

        <div className="space-y-1.5">
          <Label>Job type *</Label>
          <Select
            value={jobType}
            items={JOB_TYPE_OPTIONS.map((option) => ({ value: option.value, label: option.label }))}
            onValueChange={(value) => value && setJobType(value)}
            disabled={notEditable}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select job type" />
            </SelectTrigger>
            <SelectContent>
              {JOB_TYPE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value} label={option.label}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="requirement-location">Location *</Label>
          <Input
            id="requirement-location"
            value={location}
            onChange={(event) => setLocation(event.target.value)}
            maxLength={120}
            disabled={notEditable}
            placeholder="Dubai Marina"
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="requirement-budget-min">Budget min (AED)</Label>
            <Input
              id="requirement-budget-min"
              inputMode="decimal"
              value={budgetMinAed}
              onChange={(event) => setBudgetMinAed(event.target.value)}
              disabled={notEditable}
              placeholder="Optional"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="requirement-budget-max">Budget max (AED)</Label>
            <Input
              id="requirement-budget-max"
              inputMode="decimal"
              value={budgetMaxAed}
              onChange={(event) => setBudgetMaxAed(event.target.value)}
              disabled={notEditable}
              placeholder="Optional"
            />
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="requirement-starts">Starts</Label>
            <Input
              id="requirement-starts"
              type="date"
              value={startsAt}
              onChange={(event) => setStartsAt(event.target.value)}
              disabled={notEditable}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="requirement-ends">Ends</Label>
            <Input
              id="requirement-ends"
              type="date"
              value={endsAt}
              onChange={(event) => setEndsAt(event.target.value)}
              disabled={notEditable}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="requirement-description">Description *</Label>
          <Textarea
            id="requirement-description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            rows={4}
            maxLength={5000}
            disabled={notEditable}
            placeholder="Describe the job, timing, and what sellers should include"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <Label>Attachments</Label>
            <span className="text-[11px] text-muted-foreground">
              {attachments.length}/{maxAttachments}
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {attachments.map((attachment) => {
              const preview = attachment.previewUrl ?? attachment.url;
              if (!preview) return null;
              return (
                <div
                  key={attachment.id}
                  className="relative size-16 overflow-hidden rounded-lg border border-brand-forest/10"
                >
                  <Image src={preview} alt="" fill className="object-cover" sizes="64px" />
                  {!notEditable ? (
                    <button
                      type="button"
                      className="absolute right-0.5 top-0.5 rounded-full bg-black/60 p-0.5 text-white"
                      onClick={() => removeAttachment(attachment.id)}
                      aria-label="Remove attachment"
                    >
                      <X className="size-3" />
                    </button>
                  ) : null}
                </div>
              );
            })}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handlePickAttachments}
          />
          {!notEditable ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={attachmentSlotsLeft === 0 || !isCloudinaryConfigured()}
              onClick={() => fileInputRef.current?.click()}
            >
              <ImagePlus className="size-3.5" />
              Add photos
            </Button>
          ) : null}
        </div>

        {formError ? <p className="text-sm text-red-600">{formError}</p> : null}
        </div>
      </div>

      <DialogFooter className="mx-0 mb-0 mt-0 shrink-0 rounded-none border-t bg-white/95 px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur-sm sm:justify-end">
        <Button
          type="button"
          disabled={submitMutation.isPending || notEditable}
          onClick={() => submitMutation.mutate()}
        >
          {submitMutation.isPending ? <Loader2 className="animate-spin" /> : null}
          {isEdit ? "Save & submit for review" : "Submit for review"}
        </Button>
      </DialogFooter>
    </>
  );
}
