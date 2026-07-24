"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CalendarRange,
  ClipboardList,
  ImagePlus,
  Images,
  Loader2,
  MapPin,
  AlignLeft,
  Wallet,
  X,
} from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";

import {
  EDITOR_DIALOG_CLASS,
  EditorAlert,
  EditorDialogHeader,
  EditorFormBody,
  EditorFormFooter,
  EditorFormSection,
  EditorMediaDropzone,
} from "@/features/account/editor-form-shell";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DirhamSymbol } from "@/components/currency";
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
      <DialogContent className={EDITOR_DIALOG_CLASS}>
        <EditorDialogHeader
          icon={ClipboardList}
          badge={isEdit ? "Your posts" : "Buyer tools"}
          title={isEdit ? "Edit requirement" : "Post a requirement"}
          description={
            isEdit
              ? "Update the brief sellers will respond to. Saving sends it back for admin review."
              : "Tell sellers what you need. Posts go to admin review — there is no private draft."
          }
        />

        {loadingExisting || (isEdit && !existing.data) ? (
          <div className="flex flex-1 items-center justify-center py-16 text-muted-foreground">
            <Loader2 className="size-6 animate-spin text-brand-mantis" />
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
      <EditorFormBody>
        {notEditable ? (
          <EditorAlert tone="red">
            This requirement is {existing?.status?.replaceAll("_", " ")} and can no longer be
            edited.
          </EditorAlert>
        ) : null}

        {existing?.rejectionReason ? (
          <EditorAlert tone="red">Rejected: {existing.rejectionReason}</EditorAlert>
        ) : null}

        <EditorFormSection
          icon={MapPin}
          title="What you need"
          description="The brief sellers will decide to answer."
        >
          <div className="space-y-1.5">
            <Label htmlFor="requirement-title">Title *</Label>
            <Input
              id="requirement-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              maxLength={120}
              disabled={notEditable}
              placeholder="e.g. Need a photographer for a rooftop launch"
              className="h-11 rounded-xl border-brand-forest/10"
            />
          </div>

          <div className="grid gap-3.5 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Job type *</Label>
              <Select
                value={jobType}
                items={JOB_TYPE_OPTIONS.map((option) => ({
                  value: option.value,
                  label: option.label,
                }))}
                onValueChange={(value) => value && setJobType(value)}
                disabled={notEditable}
              >
                <SelectTrigger className="h-11 w-full rounded-xl border-brand-forest/10 bg-white">
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
                className="h-11 rounded-xl border-brand-forest/10"
              />
            </div>
          </div>
        </EditorFormSection>

        <EditorFormSection
          icon={Wallet}
          title="Budget & timing"
          description="Optional ranges help sellers pitch the right offer."
        >
          <div className="grid gap-3.5 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="requirement-budget-min" className="inline-flex items-center gap-1.5">
                Budget min
                <DirhamSymbol size={12} className="text-brand-mantis" />
              </Label>
              <Input
                id="requirement-budget-min"
                inputMode="decimal"
                value={budgetMinAed}
                onChange={(event) => setBudgetMinAed(event.target.value)}
                disabled={notEditable}
                placeholder="Optional"
                className="h-11 rounded-xl border-brand-forest/10"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="requirement-budget-max" className="inline-flex items-center gap-1.5">
                Budget max
                <DirhamSymbol size={12} className="text-brand-mantis" />
              </Label>
              <Input
                id="requirement-budget-max"
                inputMode="decimal"
                value={budgetMaxAed}
                onChange={(event) => setBudgetMaxAed(event.target.value)}
                disabled={notEditable}
                placeholder="Optional"
                className="h-11 rounded-xl border-brand-forest/10"
              />
            </div>
          </div>

          <div className="grid gap-3.5 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="requirement-starts" className="inline-flex items-center gap-1.5">
                <CalendarRange className="size-3.5 text-brand-forest/45" />
                Starts
              </Label>
              <Input
                id="requirement-starts"
                type="date"
                value={startsAt}
                onChange={(event) => setStartsAt(event.target.value)}
                disabled={notEditable}
                className="h-11 rounded-xl border-brand-forest/10"
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
                className="h-11 rounded-xl border-brand-forest/10"
              />
            </div>
          </div>
        </EditorFormSection>

        <EditorFormSection
          icon={AlignLeft}
          title="Brief"
          description="Timing, vibe, and what sellers should include."
        >
          <div className="space-y-1.5">
            <Label htmlFor="requirement-description">Description *</Label>
            <Textarea
              id="requirement-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={5}
              maxLength={5000}
              disabled={notEditable}
              placeholder="Describe the job, timing, and what sellers should include"
              className="min-h-[7.5rem] rounded-2xl border-brand-forest/10"
            />
          </div>
        </EditorFormSection>

        <EditorFormSection
          icon={Images}
          title="References"
          description="Mood, venue, or look-and-feel photos."
          action={
            <span className="rounded-full bg-brand-forest/5 px-2.5 py-1 text-[11px] font-semibold text-brand-forest/70">
              {attachments.length}/{maxAttachments}
            </span>
          }
        >
          <EditorMediaDropzone>
            <div className="flex flex-wrap gap-2.5">
              {attachments.map((attachment) => {
                const preview = attachment.previewUrl ?? attachment.url;
                if (!preview) return null;
                return (
                  <div
                    key={attachment.id}
                    className="relative size-[4.5rem] overflow-hidden rounded-xl border border-brand-forest/10 shadow-sm"
                  >
                    <Image src={preview} alt="" fill className="object-cover" sizes="72px" />
                    {!notEditable ? (
                      <button
                        type="button"
                        className="absolute right-1 top-1 rounded-full bg-black/60 p-0.5 text-white"
                        onClick={() => removeAttachment(attachment.id)}
                        aria-label="Remove attachment"
                      >
                        <X className="size-3" />
                      </button>
                    ) : null}
                  </div>
                );
              })}
              {!notEditable ? (
                <button
                  type="button"
                  disabled={attachmentSlotsLeft === 0 || !isCloudinaryConfigured()}
                  onClick={() => fileInputRef.current?.click()}
                  className="flex size-[4.5rem] flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-brand-forest/20 bg-white/70 text-brand-forest/70 transition hover:border-brand-mantis/40 hover:text-brand-forest disabled:opacity-50"
                >
                  <ImagePlus className="size-4" />
                  <span className="text-[10px] font-semibold">Add</span>
                </button>
              ) : null}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handlePickAttachments}
            />
            {!isCloudinaryConfigured() && !notEditable ? (
              <p className="mt-2.5 text-[11px] text-muted-foreground">
                Photo uploads require Cloudinary env vars on web.
              </p>
            ) : null}
          </EditorMediaDropzone>
        </EditorFormSection>

        {formError ? <EditorAlert tone="red">{formError}</EditorAlert> : null}
      </EditorFormBody>

      <EditorFormFooter>
        <Button
          type="button"
          className="h-11 rounded-xl"
          disabled={submitMutation.isPending || notEditable}
          onClick={() => submitMutation.mutate()}
        >
          {submitMutation.isPending ? <Loader2 className="animate-spin" /> : null}
          {isEdit ? "Save & submit for review" : "Submit for review"}
        </Button>
      </EditorFormFooter>
    </>
  );
}
