"use client";

import { useQuery } from "@tanstack/react-query";
import { ExternalLink, Search } from "lucide-react";
import { useState } from "react";

import {
  AdminEmptyState,
  AdminLoadingState,
  AdminPageHeader,
  AdminQueryError,
} from "@/features/admin/shared/query-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { fetchWaitlist } from "@/lib/api/admin";

export function WaitlistPage() {
  const [draft, setDraft] = useState("");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const query = useQuery({
    queryKey: ["admin", "waitlist", q, page],
    queryFn: () => fetchWaitlist(q, page),
    retry: false,
  });

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <AdminPageHeader
        title="Waitlist"
        description="People who have registered their interest in joining Kattegat."
        count={query.data?.meta?.total ?? 0}
        countLabel="people"
      />

      <form
        className="flex w-full max-w-xl flex-col gap-2 sm:flex-row"
        onSubmit={(e) => {
          e.preventDefault();
          setPage(1);
          setQ(draft);
        }}
      >
        <div className="min-w-0 flex-1">
          <Label htmlFor="waitlist-search" className="sr-only">
            Search waitlist
          </Label>
          <Input
            id="waitlist-search"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Search name, email, phone or Instagram"
            className="h-11 min-w-0 bg-white"
          />
        </div>
        <Button type="submit" variant="outline" className="h-11 shrink-0">
          <Search />
          Search
        </Button>
      </form>

      {query.isPending ? (
        <AdminLoadingState label="Loading waitlist" />
      ) : query.isError ? (
        <AdminQueryError
          error={query.error}
          title="Could not load the waitlist"
          onRetry={() => void query.refetch()}
        />
      ) : !query.data?.data.length ? (
        <AdminEmptyState
          title={q ? "No waitlist applicants match your search" : "The waitlist is empty"}
          description={
            q
              ? "Try a different name, email, phone number, or Instagram handle."
              : "People awaiting access will appear here after they join the waitlist."
          }
        />
      ) : (
        <Card className="overflow-hidden border-border/70 bg-white">
          <div className="admin-table-scroll">
            <Table className="min-w-[44rem]">
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Interest</TableHead>
                  <TableHead>Social</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Joined</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {query.data.data.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell className="font-semibold text-brand-forest">{entry.fullName}</TableCell>
                    <TableCell>
                      <div className="break-all">{entry.email}</div>
                      <div className="text-xs text-muted-foreground">{entry.phone || "No phone"}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{entry.role === "buyer" ? "Buyer" : "Seller"}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <span>@{entry.instagramHandle}</span>
                        {entry.linkedinUrl ? (
                          <a
                            href={entry.linkedinUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-brand-blue hover:underline"
                          >
                            LinkedIn <ExternalLink className="size-3" />
                          </a>
                        ) : null}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{entry.source}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Intl.DateTimeFormat("en-AE", { dateStyle: "medium" }).format(
                        new Date(entry.createdAt),
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="flex items-center justify-between gap-2 border-t p-3">
            <Button
              size="sm"
              variant="outline"
              className="h-10 min-w-20 sm:h-8"
              disabled={page === 1}
              onClick={() => setPage((v) => v - 1)}
            >
              Previous
            </Button>
            <span className="text-xs text-muted-foreground">Page {page}</span>
            <Button
              size="sm"
              variant="outline"
              className="h-10 min-w-20 sm:h-8"
              disabled={query.data.data.length < 20}
              onClick={() => setPage((v) => v + 1)}
            >
              Next
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
