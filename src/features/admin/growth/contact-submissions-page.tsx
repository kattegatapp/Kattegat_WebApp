"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Mail, Search } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  contactStatusLabel,
  contactStatusStyle,
  contactTopicLabel,
  contactTopicStyle,
  fetchContactSubmissions,
  updateContactSubmissionStatus,
  type ContactSubmissionStatus,
} from "@/lib/api/admin/contact-submissions";
import { cn } from "@/lib/utils";

export function ContactSubmissionsPage() {
  const [draft, setDraft] = useState("");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["admin", "contact-submissions", q, page],
    queryFn: () => fetchContactSubmissions(q, page),
    retry: false,
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: ContactSubmissionStatus }) =>
      updateContactSubmissionStatus(id, status),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["admin", "contact-submissions"] }),
        queryClient.invalidateQueries({ queryKey: ["admin", "overview"] }),
      ]);
    },
  });

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <AdminPageHeader
        title="Contact inbox"
        description="Messages submitted from the public contact form on kattegat.app."
        count={query.data?.meta?.total ?? 0}
        countLabel="submissions"
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
          <Label htmlFor="contact-search" className="sr-only">
            Search contact submissions
          </Label>
          <Input
            id="contact-search"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Search name, email, company, or message"
            className="h-11 min-w-0 bg-white"
          />
        </div>
        <Button type="submit" variant="outline" className="h-11 shrink-0">
          <Search />
          Search
        </Button>
      </form>

      {query.isPending ? (
        <AdminLoadingState label="Loading contact submissions" />
      ) : query.isError ? (
        <AdminQueryError
          error={query.error}
          title="Could not load contact submissions"
          onRetry={() => void query.refetch()}
        />
      ) : !query.data?.data.length ? (
        <AdminEmptyState
          title={q ? "No submissions match your search" : "No contact submissions yet"}
          description={
            q
              ? "Try a different name, email, company, or message keyword."
              : "Submissions from /contact will appear here once the backend migration is applied."
          }
        />
      ) : (
        <Card className="ios-glass-pane overflow-hidden border-white/80 bg-transparent">
          <div className="admin-table-scroll">
            <Table className="min-w-[56rem]">
              <TableHeader>
                <TableRow>
                  <TableHead>From</TableHead>
                  <TableHead>Topic</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Received</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {query.data.data.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell>
                      <div className="font-semibold text-brand-forest">{entry.fullName}</div>
                      <a
                        href={`mailto:${entry.email}`}
                        className="mt-1 flex items-center gap-1 break-all text-sm text-brand-blue hover:underline"
                      >
                        <Mail className="size-3.5 shrink-0" />
                        {entry.email}
                      </a>
                      <div className="mt-1 text-xs text-muted-foreground">
                        {entry.phone || "No phone"}
                        {entry.company ? ` · ${entry.company}` : ""}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn("font-bold", contactTopicStyle(entry.topic))}
                      >
                        {contactTopicLabel(entry.topic)}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <p className="line-clamp-4 text-sm leading-6 text-brand-forest/75">
                        {entry.message}
                      </p>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={entry.status}
                        disabled={statusMutation.isPending}
                        onValueChange={(value) =>
                          statusMutation.mutate({
                            id: entry.id,
                            status: value as ContactSubmissionStatus,
                          })
                        }
                      >
                        <SelectTrigger
                          className={cn(
                            "h-9 w-[9.5rem] border text-xs font-bold",
                            contactStatusStyle(entry.status),
                          )}
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {(
                            ["new", "in_progress", "resolved", "closed"] as ContactSubmissionStatus[]
                          ).map((status) => (
                            <SelectItem key={status} value={status}>
                              {contactStatusLabel(status)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Intl.DateTimeFormat("en-AE", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      }).format(new Date(entry.createdAt))}
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
