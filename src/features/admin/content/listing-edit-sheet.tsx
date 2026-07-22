"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ImageIcon, Loader2, Trash2 } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import {
  deleteAdminListingMedia,
  fetchAdminListing,
  type AdminListingDetail,
  updateAdminListing,
} from "@/lib/api/admin/content";

function ListingEditForm({ listing }: { listing: AdminListingDetail }) {
  const client = useQueryClient();
  const [title, setTitle] = useState(listing.title);
  const [description, setDescription] = useState(listing.description ?? "");
  const [location, setLocation] = useState(listing.location ?? "");
  const [message, setMessage] = useState<string | null>(null);

  const save = useMutation({
    mutationFn: () =>
      updateAdminListing(listing.id, {
        title: title.trim(),
        description: description.trim() || null,
        location: location.trim() || null,
      }),
    onSuccess: async () => {
      setMessage("Listing changes saved.");
      await Promise.all([
        client.invalidateQueries({ queryKey: ["admin", "listing-edit", listing.id] }),
        client.invalidateQueries({ queryKey: ["admin", "all-listings"] }),
        client.invalidateQueries({ queryKey: ["admin", "approvals", "listings"] }),
      ]);
    },
    onError: (error) => setMessage(error instanceof Error ? error.message : "Could not save listing."),
  });

  const removeMedia = useMutation({
    mutationFn: (mediaId: string) => deleteAdminListingMedia(listing.id, mediaId),
    onSuccess: async () => {
      setMessage("Media deleted from the listing and Cloudinary.");
      await Promise.all([
        client.invalidateQueries({ queryKey: ["admin", "listing-edit", listing.id] }),
        client.invalidateQueries({ queryKey: ["admin", "all-listings"] }),
        client.invalidateQueries({ queryKey: ["admin", "approvals", "listings"] }),
      ]);
    },
    onError: (error) => setMessage(error instanceof Error ? error.message : "Could not delete media."),
  });

  const canSave = title.trim().length >= 3 && title.trim().length <= 120;

  return (
    <div className="space-y-6 p-5">
      <div className="space-y-2">
        <Label htmlFor="admin-listing-title">Title</Label>
        <Input id="admin-listing-title" value={title} maxLength={120} onChange={(event) => setTitle(event.target.value)} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="admin-listing-location">Location</Label>
        <Input id="admin-listing-location" value={location} maxLength={120} onChange={(event) => setLocation(event.target.value)} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="admin-listing-description">Description</Label>
        <Textarea id="admin-listing-description" value={description} maxLength={5000} rows={7} onChange={(event) => setDescription(event.target.value)} />
      </div>
      <Button disabled={!canSave || save.isPending} onClick={() => save.mutate()}>
        {save.isPending ? <Loader2 className="animate-spin" /> : null}
        Save listing changes
      </Button>

      <div className="space-y-3 border-t border-border/70 pt-5">
        <div>
          <h3 className="font-bold text-brand-forest">Listing media</h3>
          <p className="text-xs text-muted-foreground">
            Deleting a photo also removes the owned asset from Cloudinary. Video links are removed from the listing.
          </p>
        </div>
        {listing.media?.length ? (
          <div className="grid grid-cols-2 gap-3">
            {listing.media.map((media) => (
              <div key={media.id} className="overflow-hidden rounded-xl border border-border/70 bg-muted/20">
                {media.type === "photo" ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={media.url} alt="Listing media" className="aspect-square w-full object-cover" />
                ) : (
                  <div className="flex aspect-square items-center justify-center p-3 text-center text-xs text-muted-foreground">
                    {media.url}
                  </div>
                )}
                <Button
                  variant="destructive"
                  size="sm"
                  className="m-2 w-[calc(100%-1rem)]"
                  disabled={removeMedia.isPending}
                  onClick={() => {
                    if (window.confirm("Delete this media permanently?")) removeMedia.mutate(media.id);
                  }}
                >
                  {removeMedia.isPending && removeMedia.variables === media.id ? <Loader2 className="animate-spin" /> : <Trash2 />}
                  Delete
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-2 rounded-xl bg-muted/40 p-4 text-sm text-muted-foreground">
            <ImageIcon className="size-5" /> No media uploaded.
          </div>
        )}
      </div>
      {message ? <p className="rounded-xl bg-muted p-3 text-sm">{message}</p> : null}
    </div>
  );
}

export function ListingEditSheet({
  listingId,
  open,
  onOpenChange,
}: {
  listingId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const query = useQuery({
    queryKey: ["admin", "listing-edit", listingId],
    queryFn: () => fetchAdminListing(listingId as string),
    enabled: open && Boolean(listingId),
    retry: false,
  });

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full overflow-y-auto p-0 sm:max-w-xl">
        <SheetHeader className="border-b border-border/70 p-5 text-left">
          <SheetTitle>Edit listing</SheetTitle>
          <SheetDescription>Correct listing details and remove inappropriate or outdated media.</SheetDescription>
        </SheetHeader>
        {query.isPending ? (
          <div className="flex min-h-48 items-center justify-center"><Loader2 className="animate-spin" /></div>
        ) : query.isError || !query.data ? (
          <div className="p-5 text-sm text-destructive">The listing could not be loaded.</div>
        ) : (
          <ListingEditForm key={`${query.data.id}-${query.data.updatedAt}-${query.data.media?.length ?? 0}`} listing={query.data} />
        )}
      </SheetContent>
    </Sheet>
  );
}
