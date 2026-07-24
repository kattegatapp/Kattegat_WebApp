"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  FolderTree,
  ImagePlus,
  Images,
  Loader2,
  Sparkles,
  Store,
  AlignLeft,
  Trash2,
  X,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";

import {
  EDITOR_DIALOG_CLASS,
  EditorAlert,
  EditorDialogHeader,
  EditorFormBody,
  EditorFormFooter,
  EditorFormSection,
  EditorMediaDropzone,
} from "@/features/account/editor-form-shell";
import { ListingSchemaFieldInput } from "@/features/account/listing-schema-field-input";
import { PricingBlocksEditor } from "@/features/account/pricing-blocks-editor";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import type { AccountListing } from "@/lib/api/account";
import { getListingFieldSchema } from "@/lib/api/catalog";
import { ApiRequestError } from "@/lib/api/client";
import {
  addAccountListingMedia,
  createAccountListing,
  fetchAccountListing,
  fetchAccountListingMedia,
  listingPriceAmount,
  submitListingForReview,
  updateAccountListing,
  type ListingMediaItem,
} from "@/lib/api/account-listings";
import { getPublicPlanFeatures } from "@/lib/api/plans";
import { isCloudinaryConfigured, uploadImage } from "@/lib/cloudinary";
import { getCatalogCategories, getCatalogSubcategories } from "@/lib/api/marketing";
import {
  blocksFromDefaults,
  toPricingBlocksPayload,
  validatePricingBlocks,
  type PricingBlock,
} from "@/lib/pricing-blocks";
import {
  buildUpdateListingPayload,
  createListingFormSchema,
  toCreateListingPayload,
  updateListingFormSchema,
  validateListingSchemaFields,
} from "@/lib/validations/listing";
import { isSupportedDemoVideoUrl } from "@/lib/utils/video-link";

const BUSINESS_SALES_SLUG = "business-sales-transfers";

type ListingEditorMode = "create" | "edit";
type StagedPhoto = { id: string; file: File; previewUrl: string };

function initialPricingBlocks(existing: AccountListing | null): PricingBlock[] {
  if (existing?.pricingBlocks?.length) {
    return existing.pricingBlocks.map((block, index) => ({
      ...block,
      sortOrder: block.sortOrder ?? index,
    }));
  }
  const amountFils = listingPriceAmount(existing?.pricing);
  if (amountFils != null && amountFils > 0) {
    return [
      {
        modelType: "per_gig",
        amountAed: Math.max(1, Math.round(amountFils / 100)),
        unitLabel: null,
        isFromPrice: false,
        sellerSharePct: null,
        sortOrder: 0,
      },
    ];
  }
  return [];
}

export function ListingEditorDialog({
  open,
  onOpenChange,
  mode,
  listingId,
  sellerTier,
  listingCount,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: ListingEditorMode;
  listingId?: string | null;
  sellerTier?: string | null;
  listingCount?: number;
}) {
  const isEdit = mode === "edit" && Boolean(listingId);
  const existing = useQuery({
    queryKey: ["account", "listings", listingId],
    queryFn: () => fetchAccountListing(listingId!),
    enabled: open && isEdit && Boolean(listingId),
  });

  const existingMedia = useQuery({
    queryKey: ["account", "listings", listingId, "media"],
    queryFn: () => fetchAccountListingMedia(listingId!),
    enabled: open && isEdit && Boolean(listingId),
  });

  const loadingExisting = isEdit && (existing.isPending || existingMedia.isPending);
  const formKey = isEdit
    ? `edit-${listingId}-${existing.dataUpdatedAt}-${existingMedia.dataUpdatedAt}`
    : `create-${open ? "open" : "closed"}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={EDITOR_DIALOG_CLASS}>
        <EditorDialogHeader
          icon={Store}
          badge={isEdit ? "Your catalog" : "Seller tools"}
          title={isEdit ? "Edit listing" : "New listing"}
          description={
            isEdit
              ? "Update what buyers see. Changing title or description on a live listing sends it back for review."
              : "Draft anytime, then submit when ready. Category fields come from the catalog schema."
          }
        />

        {loadingExisting || (isEdit && (!existing.data || !existingMedia.data)) ? (
          <div className="flex flex-1 items-center justify-center py-16 text-muted-foreground">
            <Loader2 className="size-6 animate-spin text-brand-mantis" />
          </div>
        ) : open ? (
          <ListingEditorForm
            key={formKey}
            isEdit={isEdit}
            listingId={listingId}
            existing={existing.data ?? null}
            existingMedia={existingMedia.data ?? []}
            sellerTier={sellerTier}
            listingCount={listingCount}
            onClose={() => onOpenChange(false)}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function ListingEditorForm({
  isEdit,
  listingId,
  existing,
  existingMedia,
  sellerTier,
  listingCount,
  onClose,
}: {
  isEdit: boolean;
  listingId?: string | null;
  existing: AccountListing | null;
  existingMedia: ListingMediaItem[];
  sellerTier?: string | null;
  listingCount?: number;
  onClose: () => void;
}) {
  const client = useQueryClient();
  const photoInputRef = useRef<HTMLInputElement>(null);
  const [categoryId, setCategoryId] = useState(existing?.categoryId ?? "");
  const [subcategoryId, setSubcategoryId] = useState(existing?.subcategoryId ?? "");
  const [title, setTitle] = useState(existing?.title ?? "");
  const [description, setDescription] = useState(existing?.description ?? "");
  const [location, setLocation] = useState(existing?.location ?? "");
  const [pricingBlocks, setPricingBlocks] = useState<PricingBlock[]>(() =>
    initialPricingBlocks(existing),
  );
  const [pricingSeededForCategory, setPricingSeededForCategory] = useState(
    isEdit ? (existing?.categoryId ?? "") : "",
  );
  const [isConfidential, setIsConfidential] = useState(Boolean(existing?.isConfidential));
  const [schemaFields, setSchemaFields] = useState<Record<string, unknown>>(
    existing?.schemaFields ?? {},
  );
  const [stagedPhotos, setStagedPhotos] = useState<StagedPhoto[]>([]);
  const [videoLinks, setVideoLinks] = useState<string[]>(
    existingMedia.filter((item) => item.type === "video_link").map((item) => item.url),
  );
  const [videoLinkDraft, setVideoLinkDraft] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const categories = useQuery({
    queryKey: ["catalog", "categories"],
    queryFn: getCatalogCategories,
    staleTime: 300_000,
  });

  const subcategories = useQuery({
    queryKey: ["catalog", "subcategories", categoryId],
    queryFn: () => getCatalogSubcategories(categoryId),
    enabled: Boolean(categoryId),
    staleTime: 300_000,
  });

  const listingSchema = useQuery({
    queryKey: ["catalog", "listing-fields", categoryId],
    queryFn: () => getListingFieldSchema(categoryId),
    enabled: Boolean(categoryId),
    staleTime: 300_000,
  });

  const planFeatures = useQuery({
    queryKey: ["catalog", "plan-features"],
    queryFn: getPublicPlanFeatures,
    staleTime: 300_000,
  });

  const categorySlug = useMemo(
    () => categories.data?.find((category) => category.id === categoryId)?.slug,
    [categories.data, categoryId],
  );
  const categoryItems = useMemo(
    () => (categories.data ?? []).map((category) => ({ value: category.id, label: category.name })),
    [categories.data],
  );
  const subcategoryItems = useMemo(
    () =>
      (subcategories.data ?? []).map((subcategory) => ({
        value: subcategory.id,
        label: subcategory.name,
      })),
    [subcategories.data],
  );
  const showConfidentialToggle = categorySlug === BUSINESS_SALES_SLUG;
  const schemaFieldDefs = (listingSchema.data?.fields ?? []).filter(
    (field) => field.key !== "rate_structure",
  );

  useEffect(() => {
    if (isEdit || !categoryId || !listingSchema.data) return;
    if (pricingSeededForCategory === categoryId) return;
    setPricingBlocks(blocksFromDefaults(listingSchema.data.pricingDefaults ?? []));
    setPricingSeededForCategory(categoryId);
  }, [categoryId, isEdit, listingSchema.data, pricingSeededForCategory]);

  const tierFeatures = planFeatures.data?.find((plan) => plan.tier === sellerTier);
  const existingPhotoCount = existingMedia.filter((item) => item.type === "photo").length;
  const maxPhotos = tierFeatures?.maxPhotosPerListing ?? undefined;
  const maxVideoLinks = tierFeatures?.maxVideoLinksPerListing ?? undefined;
  const remainingPhotoSlots =
    maxPhotos != null ? Math.max(0, maxPhotos - existingPhotoCount - stagedPhotos.length) : undefined;
  const remainingVideoSlots =
    maxVideoLinks != null ? Math.max(0, maxVideoLinks - videoLinks.length) : undefined;
  const maxListings = tierFeatures?.maxListings ?? undefined;
  const listingQuotaReached =
    !isEdit && maxListings != null && (listingCount ?? 0) >= maxListings;

  const videoLinkError =
    videoLinkDraft.length > 0 && !isSupportedDemoVideoUrl(videoLinkDraft)
      ? "Paste a YouTube, Instagram, or Facebook HTTPS link"
      : null;

  const existingPhotos = existingMedia.filter((item) => item.type === "photo");

  function updateSchemaField(key: string, value: unknown) {
    setSchemaFields((prev) => ({ ...prev, [key]: value }));
  }

  function handlePickPhotos(event: React.ChangeEvent<HTMLInputElement>) {
    const files = event.target.files;
    if (!files?.length) return;

    const next: StagedPhoto[] = [];
    for (const file of Array.from(files)) {
      if (remainingPhotoSlots != null && next.length >= remainingPhotoSlots) break;
      next.push({
        id: `${file.name}-${file.lastModified}`,
        file,
        previewUrl: URL.createObjectURL(file),
      });
    }
    setStagedPhotos((prev) => [...prev, ...next]);
    event.target.value = "";
  }

  function removeStagedPhoto(id: string) {
    setStagedPhotos((prev) => {
      const target = prev.find((photo) => photo.id === id);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((photo) => photo.id !== id);
    });
  }

  function addVideoLink() {
    const url = videoLinkDraft.trim();
    if (!isSupportedDemoVideoUrl(url) || remainingVideoSlots === 0) return;
    setVideoLinks((prev) => (prev.includes(url) ? prev : [...prev, url]));
    setVideoLinkDraft("");
  }

  const saveMutation = useMutation({
    mutationFn: async (action: "draft" | "submit") => {
      setFormError(null);

      const schemaError = validateListingSchemaFields(listingSchema.data?.fields ?? [], schemaFields);
      if (schemaError) throw new Error(schemaError);

      const pricingError = validatePricingBlocks(pricingBlocks, action === "submit");
      if (pricingError) throw new Error(pricingError);
      const pricingPayload = toPricingBlocksPayload(pricingBlocks);

      const trimmedVideoDraft = videoLinkDraft.trim();
      if (trimmedVideoDraft && !isSupportedDemoVideoUrl(trimmedVideoDraft)) {
        throw new Error("Fix or remove the video link before saving.");
      }

      const linksToSave = [
        ...videoLinks,
        ...(trimmedVideoDraft && !videoLinks.includes(trimmedVideoDraft) ? [trimmedVideoDraft] : []),
      ];

      let listing: AccountListing;

      if (isEdit && listingId && existing) {
        const parsed = updateListingFormSchema.safeParse({
          title,
          description,
          location,
          isConfidential: showConfidentialToggle ? isConfidential : undefined,
        });
        if (!parsed.success) {
          throw new Error(parsed.error.issues[0]?.message ?? "Check the form and try again.");
        }

        const updatePayload = buildUpdateListingPayload(
          parsed.data,
          existing,
          schemaFields,
          pricingPayload,
        );
        listing =
          Object.keys(updatePayload).length > 0
            ? await updateAccountListing(listingId, updatePayload)
            : existing;
      } else {
        if (listingQuotaReached) {
          throw new Error(
            `Your plan allows up to ${maxListings} listing${maxListings === 1 ? "" : "s"}. Unpublish one to add another.`,
          );
        }

        const parsed = createListingFormSchema.safeParse({
          categoryId,
          subcategoryId,
          title,
          description,
          location,
          isConfidential: showConfidentialToggle ? isConfidential : undefined,
        });
        if (!parsed.success) {
          throw new Error(parsed.error.issues[0]?.message ?? "Check the form and try again.");
        }

        listing = await createAccountListing(
          toCreateListingPayload(parsed.data, schemaFields, pricingPayload),
        );
      }

      if (!isCloudinaryConfigured() && stagedPhotos.length > 0) {
        throw new Error("Photo uploads are not configured. Save without new photos or contact support.");
      }

      const uploadedPhotos = await Promise.all(
        stagedPhotos.map((photo) => uploadImage(photo.file, "listings")),
      );

      const existingVideoUrls = existingMedia
        .filter((item) => item.type === "video_link")
        .map((item) => item.url);
      const newVideoLinks = linksToSave.filter((url) => !existingVideoUrls.includes(url));

      await Promise.all([
        ...uploadedPhotos.map((media) =>
          addAccountListingMedia(listing.id, { type: "photo", url: media.secureUrl }),
        ),
        ...newVideoLinks.map((url) =>
          addAccountListingMedia(listing.id, { type: "video_link", url }),
        ),
      ]);

      if (
        action === "submit" &&
        (listing.status === "draft" ||
          listing.status === "rejected" ||
          listing.status === "unpublished")
      ) {
        return submitListingForReview(listing.id);
      }
      return listing;
    },
    onSuccess: async () => {
      stagedPhotos.forEach((photo) => URL.revokeObjectURL(photo.previewUrl));
      await client.invalidateQueries({ queryKey: ["account", "listings"] });
      onClose();
    },
    onError: (error) => {
      setFormError(
        error instanceof ApiRequestError
          ? error.message
          : error instanceof Error
            ? error.message
            : "Could not save listing.",
      );
    },
  });

  const status = existing?.status;
  const canSubmitForReview =
    !isEdit || status === "draft" || status === "rejected" || status === "unpublished";

  return (
    <>
      <EditorFormBody>
        {listingQuotaReached ? (
          <EditorAlert tone="amber">
            You&apos;ve reached your listing limit ({maxListings}). Unpublish a listing to create
            another.
          </EditorAlert>
        ) : null}

        {existing?.rejectionReason ? (
          <EditorAlert tone="red">Rejected: {existing.rejectionReason}</EditorAlert>
        ) : null}

        {status === "pending_review" ? (
          <EditorAlert tone="amber">This listing is awaiting admin review.</EditorAlert>
        ) : null}

        <EditorFormSection
          icon={FolderTree}
          title="Placement"
          description="Where this listing sits in the marketplace."
        >
          <div className="grid gap-3.5 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Category *</Label>
              <Select
                value={categoryId || null}
                items={categoryItems}
                onValueChange={(value) => {
                  if (!value) return;
                  setCategoryId(value);
                  setSubcategoryId("");
                  setSchemaFields({});
                  setPricingSeededForCategory("");
                }}
                disabled={isEdit}
              >
                <SelectTrigger className="h-11 w-full rounded-xl border-brand-forest/10 bg-white">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categoryItems.map((category) => (
                    <SelectItem key={category.value} value={category.value} label={category.label}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {isEdit ? (
                <p className="text-[11px] text-muted-foreground">Category is locked after create.</p>
              ) : null}
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <Label>Subcategory *</Label>
              <Select
                value={subcategoryId || null}
                items={subcategoryItems}
                onValueChange={(value) => value && setSubcategoryId(value)}
                disabled={isEdit || !categoryId}
              >
                <SelectTrigger className="h-11 w-full rounded-xl border-brand-forest/10 bg-white">
                  <SelectValue placeholder="Select subcategory" />
                </SelectTrigger>
                <SelectContent>
                  {subcategoryItems.map((subcategory) => (
                    <SelectItem
                      key={subcategory.value}
                      value={subcategory.value}
                      label={subcategory.label}
                    >
                      {subcategory.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </EditorFormSection>

        <EditorFormSection
          icon={Sparkles}
          title="Basics"
          description="The headline buyers scan first."
        >
          <div className="space-y-1.5">
            <Label htmlFor="listing-title">Title *</Label>
            <Input
              id="listing-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              maxLength={120}
              placeholder="e.g. Wedding DJ for Dubai venues"
              className="h-11 rounded-xl border-brand-forest/10"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="listing-location">Location</Label>
            <Input
              id="listing-location"
              value={location}
              onChange={(event) => setLocation(event.target.value)}
              maxLength={120}
              placeholder="Dubai, UAE"
              className="h-11 rounded-xl border-brand-forest/10"
            />
          </div>
        </EditorFormSection>

        <PricingBlocksEditor blocks={pricingBlocks} onChange={setPricingBlocks} />

        {schemaFieldDefs.length > 0 || showConfidentialToggle ? (
          <EditorFormSection
            icon={Store}
            title="Category details"
            description="Fields specific to this catalog category."
          >
            {schemaFieldDefs.map((field) => (
              <ListingSchemaFieldInput
                key={field.key}
                field={field}
                value={schemaFields[field.key]}
                onChange={(value) => updateSchemaField(field.key, value)}
              />
            ))}

            {showConfidentialToggle ? (
              <div className="flex items-center justify-between gap-3 rounded-2xl border border-brand-forest/10 bg-brand-forest/[0.03] px-3.5 py-3">
                <div>
                  <Label htmlFor="listing-confidential">Confidential enquiry</Label>
                  <p className="text-[11px] text-muted-foreground">
                    Route interest through private enquiry instead of public chat.
                  </p>
                </div>
                <Switch
                  id="listing-confidential"
                  checked={isConfidential}
                  onCheckedChange={setIsConfidential}
                />
              </div>
            ) : null}
          </EditorFormSection>
        ) : null}

        <EditorFormSection
          icon={AlignLeft}
          title="Story"
          description="What you offer and what buyers should expect."
        >
          <div className="space-y-1.5">
            <Label htmlFor="listing-description">Description</Label>
            <Textarea
              id="listing-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={5}
              maxLength={5000}
              placeholder="What you offer, experience, and what buyers can expect"
              className="min-h-[7.5rem] rounded-2xl border-brand-forest/10"
            />
          </div>
        </EditorFormSection>

        <EditorFormSection
          icon={Images}
          title="Media"
          description="Photos and demo links that sell the booking."
          action={
            maxPhotos != null ? (
              <span className="rounded-full bg-brand-forest/5 px-2.5 py-1 text-[11px] font-semibold text-brand-forest/70">
                {existingPhotoCount + stagedPhotos.length}/{maxPhotos} photos
              </span>
            ) : null
          }
        >
          <EditorMediaDropzone>
            <div className="flex flex-wrap gap-2.5">
              {existingPhotos.map((photo) => (
                <div
                  key={photo.id}
                  className="relative size-[4.5rem] overflow-hidden rounded-xl border border-brand-forest/10 shadow-sm"
                >
                  <Image src={photo.url} alt="" fill className="object-cover" sizes="72px" />
                </div>
              ))}
              {stagedPhotos.map((photo) => (
                <div
                  key={photo.id}
                  className="relative size-[4.5rem] overflow-hidden rounded-xl border border-brand-mantis/40 shadow-sm"
                >
                  <Image src={photo.previewUrl} alt="" fill className="object-cover" sizes="72px" />
                  <button
                    type="button"
                    className="absolute right-1 top-1 rounded-full bg-black/60 p-0.5 text-white"
                    onClick={() => removeStagedPhoto(photo.id)}
                    aria-label="Remove photo"
                  >
                    <X className="size-3" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                disabled={remainingPhotoSlots === 0 || !isCloudinaryConfigured()}
                onClick={() => photoInputRef.current?.click()}
                className="flex size-[4.5rem] flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-brand-forest/20 bg-white/70 text-brand-forest/70 transition hover:border-brand-mantis/40 hover:text-brand-forest disabled:opacity-50"
              >
                <ImagePlus className="size-4" />
                <span className="text-[10px] font-semibold">Add</span>
              </button>
            </div>
            <input
              ref={photoInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handlePickPhotos}
            />
            {!isCloudinaryConfigured() ? (
              <p className="mt-2.5 text-[11px] text-muted-foreground">
                Photo uploads require Cloudinary env vars on web.
              </p>
            ) : null}
          </EditorMediaDropzone>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <Label htmlFor="listing-video">Video links</Label>
              {maxVideoLinks != null ? (
                <span className="text-[11px] text-muted-foreground">
                  {videoLinks.length}/{maxVideoLinks}
                </span>
              ) : null}
            </div>
            <div className="flex gap-2">
              <Input
                id="listing-video"
                value={videoLinkDraft}
                onChange={(event) => setVideoLinkDraft(event.target.value)}
                placeholder="YouTube, Instagram, or Facebook URL"
                className="h-11 rounded-xl border-brand-forest/10"
              />
              <Button
                type="button"
                variant="outline"
                className="h-11 rounded-xl"
                disabled={!isSupportedDemoVideoUrl(videoLinkDraft) || remainingVideoSlots === 0}
                onClick={addVideoLink}
              >
                Add
              </Button>
            </div>
            {videoLinkError ? <p className="text-[11px] text-red-600">{videoLinkError}</p> : null}
            {videoLinks.length ? (
              <ul className="space-y-1.5">
                {videoLinks.map((url) => (
                  <li
                    key={url}
                    className="flex items-center justify-between gap-2 rounded-xl border border-brand-forest/10 bg-white px-3 py-2 text-[12px]"
                  >
                    <span className="truncate text-brand-forest/80">{url}</span>
                    <button
                      type="button"
                      className="shrink-0 text-red-600"
                      onClick={() => setVideoLinks((prev) => prev.filter((link) => link !== url))}
                      aria-label="Remove video link"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </EditorFormSection>

        {formError ? <EditorAlert tone="red">{formError}</EditorAlert> : null}
      </EditorFormBody>

      <EditorFormFooter>
        <Button
          type="button"
          variant="outline"
          className="h-11 rounded-xl"
          disabled={saveMutation.isPending || listingQuotaReached}
          onClick={() => saveMutation.mutate("draft")}
        >
          {saveMutation.isPending && saveMutation.variables === "draft" ? (
            <Loader2 className="animate-spin" />
          ) : null}
          {isEdit ? "Save changes" : "Save as draft"}
        </Button>
        {canSubmitForReview ? (
          <Button
            type="button"
            className="h-11 rounded-xl"
            disabled={saveMutation.isPending || listingQuotaReached}
            onClick={() => saveMutation.mutate("submit")}
          >
            {saveMutation.isPending && saveMutation.variables === "submit" ? (
              <Loader2 className="animate-spin" />
            ) : null}
            {status === "unpublished" ? "Republish for review" : "Submit for review"}
          </Button>
        ) : null}
      </EditorFormFooter>
    </>
  );
}
