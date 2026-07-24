"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Check,
  GripVertical,
  Loader2,
  Save,
  Wallet,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAdminAccess } from "@/features/admin/access/require-capability";
import { goToAdminLogin } from "@/lib/admin/session-client";
import { updateCategoryListingFieldSchema } from "@/lib/api/admin/catalog";
import { getListingFieldSchema } from "@/lib/api/catalog";
import { ApiRequestError } from "@/lib/api/client";
import { getCatalogCategories, type CatalogCategory } from "@/lib/api/marketing";
import {
  PRICING_MODEL_META,
  PRICING_MODEL_TYPES,
  type PricingModelType,
} from "@/lib/pricing-blocks";
import { cn } from "@/lib/utils";

function sameDefaults(a: PricingModelType[], b: PricingModelType[]) {
  return JSON.stringify(a) === JSON.stringify(b);
}

export function AdminCategoryPricingForm() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { can } = useAdminAccess();
  const canWrite = can(["catalog.write"]);

  const categoriesQuery = useQuery({
    queryKey: ["catalog", "categories"],
    queryFn: getCatalogCategories,
    staleTime: 60_000,
  });

  const listingCategories = useMemo(
    () =>
      (categoriesQuery.data ?? []).filter(
        (category) => category.allowsListings !== false && category.slug !== "requirements-jobs",
      ),
    [categoriesQuery.data],
  );

  const [categoryId, setCategoryId] = useState<string>("");
  const [draftDefaults, setDraftDefaults] = useState<PricingModelType[]>([]);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!categoryId && listingCategories[0]?.id) {
      setCategoryId(listingCategories[0].id);
    }
  }, [categoryId, listingCategories]);

  const selectedCategory: CatalogCategory | undefined = listingCategories.find(
    (category) => category.id === categoryId,
  );

  const schemaQuery = useQuery({
    queryKey: ["catalog", "listing-fields", categoryId],
    queryFn: () => getListingFieldSchema(categoryId),
    enabled: Boolean(categoryId),
  });

  useEffect(() => {
    if (!schemaQuery.data) return;
    setDraftDefaults(schemaQuery.data.pricingDefaults ?? []);
    setSavedMessage(null);
  }, [schemaQuery.data]);

  const savedDefaults = schemaQuery.data?.pricingDefaults ?? [];
  const isDirty = !sameDefaults(draftDefaults, savedDefaults);
  const unusedModels = PRICING_MODEL_TYPES.filter((type) => !draftDefaults.includes(type));

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!categoryId || !schemaQuery.data) {
        throw new Error("Select a category first.");
      }
      return updateCategoryListingFieldSchema(categoryId, {
        fields: schemaQuery.data.fields ?? [],
        pricingDefaults: draftDefaults,
      });
    },
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({ queryKey: ["catalog", "listing-fields", categoryId] });
      setDraftDefaults(data.pricingDefaults ?? []);
      setSavedMessage(
        `Saved pre-seeds for ${selectedCategory?.name ?? "category"}. Sellers see these cards when they list.`,
      );
    },
    onError: (error) => {
      if (error instanceof ApiRequestError && error.status === 401) {
        void goToAdminLogin((path) => router.replace(path));
      }
    },
  });

  function addModel(type: PricingModelType) {
    if (draftDefaults.includes(type)) return;
    setDraftDefaults((prev) => [...prev, type]);
    setSavedMessage(null);
  }

  function removeModel(type: PricingModelType) {
    setDraftDefaults((prev) => prev.filter((item) => item !== type));
    setSavedMessage(null);
  }

  function moveModel(type: PricingModelType, direction: -1 | 1) {
    setDraftDefaults((prev) => {
      const index = prev.indexOf(type);
      if (index < 0) return prev;
      const nextIndex = index + direction;
      if (nextIndex < 0 || nextIndex >= prev.length) return prev;
      const copy = [...prev];
      const [item] = copy.splice(index, 1);
      copy.splice(nextIndex, 0, item!);
      return copy;
    });
    setSavedMessage(null);
  }

  if (categoriesQuery.isError) {
    return (
      <Alert className="ios-glass-pane rounded-2xl border-red-200/60 bg-red-50/35 text-red-950">
        <AlertTitle>Could not load categories</AlertTitle>
        <AlertDescription>
          {categoriesQuery.error instanceof Error
            ? categoriesQuery.error.message
            : "Try refreshing the page."}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-5">
      <section className="ios-glass-pane relative overflow-hidden rounded-[1.5rem] px-5 py-5 text-zinc-900 sm:rounded-[2rem] sm:px-8 sm:py-8">
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          <div className="absolute -left-16 -top-20 size-56 rounded-full bg-brand-mantis/18 blur-3xl" />
          <div className="absolute -right-10 top-0 size-44 rounded-full bg-brand-blue/12 blur-3xl" />
        </div>
        <div className="relative">
          <Badge className="ios-glass-chip mb-4 border-0 text-zinc-800">
            <Wallet className="size-3.5" />
            KTG-SPEC-PRICING · Category defaults
          </Badge>
          <h1 className="text-2xl font-extrabold tracking-[-0.02em] text-brand-forest sm:text-3xl">
            Category pricing defaults
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-brand-forest/70">
            Pre-seed which price blocks open when a seller lists in each category. Sellers can still
            delete or add models — this only sets the starting cards.
          </p>
        </div>
      </section>

      {saveMutation.isError ? (
        <Alert className="ios-glass-pane rounded-2xl border-red-200/60 bg-red-50/35 text-red-950">
          <AlertTitle>Could not save defaults</AlertTitle>
          <AlertDescription>
            {saveMutation.error instanceof ApiRequestError
              ? saveMutation.error.message
              : saveMutation.error instanceof Error
                ? saveMutation.error.message
                : "Please try again."}
          </AlertDescription>
        </Alert>
      ) : null}

      {savedMessage ? (
        <Alert className="ios-glass-pane rounded-2xl border-emerald-200/60 bg-emerald-50/35 text-emerald-950">
          <Check className="size-4" />
          <AlertTitle>Saved</AlertTitle>
          <AlertDescription>{savedMessage}</AlertDescription>
        </Alert>
      ) : null}

      <Card className="ios-glass-pane border-white/80 bg-transparent">
        <CardHeader>
          <CardTitle className="text-brand-forest">Choose category</CardTitle>
          <CardDescription>
            Defaults are editable without an app release. Order below is the order cards appear.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-1.5">
            <Label>Category</Label>
            <Select
              value={categoryId || null}
              items={listingCategories.map((category) => ({
                value: category.id,
                label: category.name,
              }))}
              onValueChange={(value) => value && setCategoryId(value)}
              disabled={categoriesQuery.isPending || listingCategories.length === 0}
            >
              <SelectTrigger className="h-11 w-full max-w-lg rounded-xl border-brand-forest/10 bg-white">
                <SelectValue placeholder={categoriesQuery.isPending ? "Loading…" : "Select category"} />
              </SelectTrigger>
              <SelectContent>
                {listingCategories.map((category) => (
                  <SelectItem key={category.id} value={category.id} label={category.name}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {schemaQuery.isPending ? (
            <div className="flex items-center gap-2 py-8 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin text-brand-mantis" />
              Loading pricing defaults…
            </div>
          ) : schemaQuery.isError ? (
            <Alert className="rounded-2xl border-red-200/60 bg-red-50/35 text-red-950">
              <AlertTitle>Schema unavailable</AlertTitle>
              <AlertDescription>
                {schemaQuery.error instanceof Error
                  ? schemaQuery.error.message
                  : "Could not load listing field schema for this category."}
              </AlertDescription>
            </Alert>
          ) : (
            <>
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <Label>Pre-seeded blocks</Label>
                  <span className="text-[11px] font-semibold text-brand-forest/55">
                    {draftDefaults.length} selected
                  </span>
                </div>

                {draftDefaults.length === 0 ? (
                  <p className="rounded-2xl border border-dashed border-brand-forest/15 bg-brand-forest/[0.03] px-3.5 py-4 text-sm text-muted-foreground">
                    No models pre-seeded. Sellers will start with an empty “How do you charge?”
                    section and add chips manually.
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {draftDefaults.map((type, index) => {
                      const meta = PRICING_MODEL_META[type];
                      return (
                        <li
                          key={type}
                          className="flex items-start gap-3 rounded-2xl border border-brand-forest/10 bg-white/90 px-3 py-3"
                        >
                          <span className="mt-1 text-brand-forest/35">
                            <GripVertical className="size-4" />
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-bold text-brand-forest">
                              {index + 1}. {meta.label}
                            </p>
                            <p className="mt-0.5 text-[12px] leading-relaxed text-muted-foreground">
                              {meta.hint}
                            </p>
                          </div>
                          <div className="flex shrink-0 items-center gap-1">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon-sm"
                              disabled={!canWrite || index === 0}
                              onClick={() => moveModel(type, -1)}
                              aria-label={`Move ${meta.label} up`}
                            >
                              ↑
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon-sm"
                              disabled={!canWrite || index === draftDefaults.length - 1}
                              onClick={() => moveModel(type, 1)}
                              aria-label={`Move ${meta.label} down`}
                            >
                              ↓
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon-sm"
                              className="text-red-600 hover:bg-red-50 hover:text-red-700"
                              disabled={!canWrite}
                              onClick={() => removeModel(type)}
                              aria-label={`Remove ${meta.label}`}
                            >
                              <X className="size-3.5" />
                            </Button>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>

              {unusedModels.length > 0 ? (
                <div className="space-y-2">
                  <Label>Add a model</Label>
                  <div className="flex flex-wrap gap-2">
                    {unusedModels.map((type) => (
                      <button
                        key={type}
                        type="button"
                        disabled={!canWrite}
                        onClick={() => addModel(type)}
                        className={cn(
                          "rounded-full border border-brand-mantis/35 bg-brand-mantis/10 px-3 py-1.5 text-[12px] font-semibold text-brand-forest transition hover:border-brand-mantis/55 hover:bg-brand-mantis/16",
                          !canWrite && "cursor-not-allowed opacity-50",
                        )}
                      >
                        + {PRICING_MODEL_META[type].label}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}

              <div className="flex flex-wrap items-center justify-end gap-2 border-t border-brand-forest/8 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-xl"
                  disabled={!canWrite || !isDirty || saveMutation.isPending}
                  onClick={() => {
                    setDraftDefaults(savedDefaults);
                    setSavedMessage(null);
                  }}
                >
                  Reset
                </Button>
                <Button
                  type="button"
                  className="rounded-xl"
                  disabled={!canWrite || !isDirty || saveMutation.isPending || !categoryId}
                  onClick={() => saveMutation.mutate()}
                >
                  {saveMutation.isPending ? <Loader2 className="animate-spin" /> : <Save />}
                  Save defaults
                </Button>
              </div>

              {!canWrite ? (
                <p className="text-[12px] text-muted-foreground">
                  You can view defaults, but saving requires the <code>catalog.write</code> capability.
                </p>
              ) : null}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
