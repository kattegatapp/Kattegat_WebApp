"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCheck, EyeOff, Inbox, Loader2, Shield, Trash2, X } from "lucide-react";
import { useState } from "react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  fetchModerationReports,
  resolveModerationReport,
  type ModerationAction,
} from "@/lib/api/admin";
import { cn } from "@/lib/utils";

const date = (value: string) =>
  new Intl.DateTimeFormat("en-AE", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));

const label = (value: string) =>
  value.replaceAll("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());

export function ModerationReportsPage() {
  const client = useQueryClient();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<"pending" | "resolved">("pending");

  const query = useQuery({
    queryKey: ["admin", "moderation", status, page],
    queryFn: () => fetchModerationReports(page, status),
    retry: false,
  });

  const mutation = useMutation({
    mutationFn: ({
      id,
      action,
    }: {
      id: string;
      action: ModerationAction;
    }) => resolveModerationReport(id, action),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: ["admin", "moderation"] });
      void client.invalidateQueries({ queryKey: ["admin", "overview"] });
    },
  });

  if (query.isPending) {
    return <div className="min-h-40" role="status" aria-live="polite" aria-busy="true"><span className="sr-only">Loading</span></div>;
  }

  if (query.error) {
    return (
      <Alert className="ios-glass-pane rounded-2xl border-red-200/60 bg-red-50/35 text-red-950 backdrop-blur-xl">
        <X />
        <AlertTitle>Could not load moderation reports</AlertTitle>
        <AlertDescription>
          {query.error instanceof Error ? query.error.message : "Try again shortly."}
        </AlertDescription>
      </Alert>
    );
  }

  const items = query.data?.items ?? [];
  const total = query.data?.total ?? 0;

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900 sm:text-3xl">
            Moderation reports
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Review member-reported content. Approve, hide, or remove the target — decisions are audited.
          </p>
        </div>
        <Badge variant="outline" className="bg-white">
          {total} records
        </Badge>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          variant={status === "pending" ? "default" : "outline"}
          className="font-bold"
          onClick={() => {
            setStatus("pending");
            setPage(1);
          }}
        >
          Pending
        </Button>
        <Button
          variant={status === "resolved" ? "default" : "outline"}
          className="font-bold"
          onClick={() => {
            setStatus("resolved");
            setPage(1);
          }}
        >
          Resolved
        </Button>
      </div>

      {mutation.isError ? (
        <Alert className="ios-glass-pane rounded-2xl border-red-200/60 bg-red-50/35 text-red-950 backdrop-blur-xl">
          <X />
          <AlertTitle>Report was not updated</AlertTitle>
          <AlertDescription>
            {mutation.error instanceof Error ? mutation.error.message : "Please try again."}
          </AlertDescription>
        </Alert>
      ) : null}

      {!items.length ? (
        <Card className="ios-glass-pane border-dashed border-white/70 bg-transparent">
          <CardContent className="flex min-h-56 flex-col items-center justify-center px-6 py-12 text-center">
            <span className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-brand-forest/5 text-brand-forest">
              <Inbox className="size-7" />
            </span>
            <p className="font-bold text-brand-forest">
              {status === "pending" ? "No open reports" : "No resolved reports yet"}
            </p>
            <p className="mt-1 max-w-md text-sm text-muted-foreground">
              {status === "pending"
                ? "When members flag content, reports appear here for review."
                : "Resolved decisions will show in this tab."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {items.map((item) => {
            const pending = mutation.isPending && mutation.variables?.id === item.id;
            return (
              <Card key={item.id} className="ios-glass-pane border-white/80 bg-transparent">
                <CardHeader>
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
                    <div className="min-w-0">
                      <CardTitle className="flex items-center gap-2 text-base text-brand-forest">
                        <Shield className="size-4 shrink-0" />
                        {label(item.targetType)} report
                      </CardTitle>
                      <CardDescription>
                        Filed {date(item.createdAt)}
                        {item.action ? ` · ${label(item.action)}` : ""}
                      </CardDescription>
                    </div>
                    <Badge
                      className={cn(
                        "w-fit shrink-0 border",
                        item.action
                          ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                          : "border-amber-200 bg-amber-50 text-amber-900",
                      )}
                    >
                      {item.action ? label(item.action) : "Pending"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Reason
                    </p>
                    <p className="mt-1 text-sm leading-6">{item.reason || "No reason provided"}</p>
                  </div>
                  <p className="font-mono text-[11px] text-muted-foreground">
                    Target {item.targetId}
                  </p>
                  {!item.action ? (
                    <div className="flex flex-col gap-2 sm:flex-row">
                      <Button
                        className="font-bold"
                        disabled={mutation.isPending}
                        onClick={() => mutation.mutate({ id: item.id, action: "approved" })}
                      >
                        {pending && mutation.variables?.action === "approved" ? (
                          <Loader2 className="animate-spin" />
                        ) : (
                          <CheckCheck />
                        )}
                        Keep content
                      </Button>
                      <Button
                        variant="outline"
                        className="font-bold"
                        disabled={mutation.isPending}
                        onClick={() => mutation.mutate({ id: item.id, action: "hidden" })}
                      >
                        {pending && mutation.variables?.action === "hidden" ? (
                          <Loader2 className="animate-spin" />
                        ) : (
                          <EyeOff />
                        )}
                        Hide
                      </Button>
                      <Button
                        variant="destructive"
                        className="font-bold"
                        disabled={mutation.isPending}
                        onClick={() => mutation.mutate({ id: item.id, action: "removed" })}
                      >
                        {pending && mutation.variables?.action === "removed" ? (
                          <Loader2 className="animate-spin" />
                        ) : (
                          <Trash2 />
                        )}
                        Remove
                      </Button>
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {total > 20 ? (
        <div className="flex items-center justify-between">
          <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((v) => v - 1)}>
            Previous
          </Button>
          <span className="text-xs text-muted-foreground">Page {page}</span>
          <Button
            variant="outline"
            size="sm"
            disabled={items.length < 20}
            onClick={() => setPage((v) => v + 1)}
          >
            Next
          </Button>
        </div>
      ) : null}
    </div>
  );
}
