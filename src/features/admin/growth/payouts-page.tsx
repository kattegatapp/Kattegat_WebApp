"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Banknote, Check, CircleCheck, Loader2, X } from "lucide-react";
import { useState } from "react";

import {
  AdminEmptyState,
  AdminLoadingState,
  AdminPageHeader,
  AdminQueryError,
} from "@/features/admin/shared/query-state";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { formatAdminAccessError } from "@/lib/admin/capabilities";
import { formatFilsAsAed } from "@/lib/admin/money";
import { fetchPayouts, processPayout, rejectPayout, type PayoutStatus } from "@/lib/api/admin";
import { cn } from "@/lib/utils";

const date = (value: string) =>
  new Intl.DateTimeFormat("en-AE", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));

const badgeTone = (status: PayoutStatus) =>
  cn(
    "border",
    status === "processed"
      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
      : status === "failed"
        ? "border-red-200 bg-red-50 text-red-800"
        : "border-amber-200 bg-amber-50 text-amber-900",
  );

const statusLabel: Record<PayoutStatus, string> = {
  pending: "Awaiting review",
  processed: "Paid",
  failed: "Rejected",
};

export function PayoutsPage() {
  const client = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<PayoutStatus | "all">("pending");
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [reason, setReason] = useState("");

  const query = useQuery({
    queryKey: ["admin", "payouts", statusFilter],
    queryFn: () => fetchPayouts(statusFilter),
    retry: false,
  });

  const invalidate = () => client.invalidateQueries({ queryKey: ["admin", "payouts"] });

  const approve = useMutation({
    mutationFn: (id: string) => processPayout(id),
    onSuccess: invalidate,
  });

  const reject = useMutation({
    mutationFn: ({ id, reason: rejectReason }: { id: string; reason: string }) => rejectPayout(id, rejectReason),
    onSuccess: () => {
      setRejectingId(null);
      setReason("");
      invalidate();
    },
  });

  if (query.isPending) return <AdminLoadingState label="Loading withdrawal requests" />;
  if (query.isError) {
    return <AdminQueryError error={query.error} onRetry={() => void query.refetch()} />;
  }

  const requests = query.data ?? [];
  const mutationError = approve.error ?? reject.error;

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <AdminPageHeader
        title="Payouts"
        description="Member withdrawal requests against their referral & recommend earnings. Approving sends money to the bank details below and marks the request paid."
        count={requests.length}
      />
      {mutationError ? (
        <Alert className="ios-glass-pane rounded-2xl border-red-200/60 bg-red-50/35 text-red-950 backdrop-blur-xl">
          <X />
          <AlertTitle>The withdrawal request was not updated</AlertTitle>
          <AlertDescription>{formatAdminAccessError(mutationError, "Please try again.")}</AlertDescription>
        </Alert>
      ) : null}
      <Card className="ios-glass-pane border-white/80 bg-transparent">
        <CardContent className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-bold text-brand-forest">Request status</p>
            <p className="text-xs text-muted-foreground">Filter requests by where they are in the review process.</p>
          </div>
          <Select value={statusFilter} onValueChange={(value) => setStatusFilter((value ?? "all") as PayoutStatus | "all")}>
            <SelectTrigger className="w-full bg-white sm:w-52">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All requests</SelectItem>
              <SelectItem value="pending">Awaiting review</SelectItem>
              <SelectItem value="processed">Paid</SelectItem>
              <SelectItem value="failed">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>
      {!requests.length ? (
        <AdminEmptyState
          title={statusFilter === "all" ? "No withdrawal requests yet" : `No ${statusLabel[statusFilter as PayoutStatus].toLowerCase()} requests`}
          description="When a member submits a withdrawal request from the app, it will appear here."
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {requests.map((request) => {
            const isApproving = approve.isPending && approve.variables === request.id;
            const isRejecting = reject.isPending && reject.variables?.id === request.id;
            return (
              <Card key={request.id} className="ios-glass-pane border-white/80 bg-transparent">
                <CardHeader>
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
                    <div className="min-w-0">
                      <CardTitle className="text-lg font-extrabold text-zinc-900">
                        {formatFilsAsAed(request.amount)}
                      </CardTitle>
                      <CardDescription>
                        {request.memberName || request.memberEmail || "Unknown member"} · Requested {date(request.requestedAt)}
                      </CardDescription>
                    </div>
                    <Badge className={cn("w-fit shrink-0", badgeTone(request.status))}>
                      {statusLabel[request.status]}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="rounded-xl border border-border/70 bg-muted/30 p-3">
                    <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                      Bank details
                    </p>
                    <dl className="space-y-1.5 text-sm">
                      <div className="flex justify-between gap-3">
                        <dt className="text-muted-foreground">Account holder</dt>
                        <dd className="font-semibold text-brand-forest">{request.accountHolderName}</dd>
                      </div>
                      <div className="flex justify-between gap-3">
                        <dt className="text-muted-foreground">IBAN</dt>
                        <dd className="break-all font-mono text-xs font-semibold text-brand-forest">{request.iban}</dd>
                      </div>
                      <div className="flex justify-between gap-3">
                        <dt className="text-muted-foreground">Bank</dt>
                        <dd className="font-semibold text-brand-forest">{request.bankName}</dd>
                      </div>
                    </dl>
                  </div>
                  {request.memberNote ? (
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Note from member
                      </p>
                      <p className="mt-1 rounded-xl bg-muted/50 p-3 text-sm leading-6">{request.memberNote}</p>
                    </div>
                  ) : null}
                  {request.status === "pending" ? (
                    <div className="flex flex-col gap-2 sm:flex-row">
                      <Button
                        className="h-11 flex-1 font-bold"
                        disabled={approve.isPending || reject.isPending}
                        onClick={() => approve.mutate(request.id)}
                      >
                        {isApproving ? <Loader2 className="animate-spin" /> : <Check />}
                        Approve & mark paid
                      </Button>
                      <Button
                        className="h-11"
                        variant="outline"
                        disabled={approve.isPending || reject.isPending}
                        onClick={() => setRejectingId(request.id)}
                      >
                        {isRejecting ? <Loader2 className="animate-spin" /> : <X />}
                        Reject
                      </Button>
                    </div>
                  ) : request.status === "processed" ? (
                    <div className="flex items-center gap-3 rounded-xl bg-emerald-50 p-4 text-sm font-semibold text-emerald-800">
                      <CircleCheck className="size-5 shrink-0" />
                      Paid {request.processedAt ? date(request.processedAt) : ""}
                    </div>
                  ) : (
                    <div className="rounded-xl bg-muted p-4 text-sm text-muted-foreground">
                      <p className="font-semibold text-foreground">Rejected</p>
                      {request.adminNote ? <p className="mt-1">{request.adminNote}</p> : null}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
      <Dialog
        open={Boolean(rejectingId)}
        onOpenChange={(open) => {
          if (!open) {
            setRejectingId(null);
            setReason("");
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Why is this withdrawal rejected?</DialogTitle>
            <DialogDescription>
              The member will see this reason. Their available balance is unaffected — nothing was reserved
              when they submitted the request.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder="Example: The IBAN provided doesn't match the account holder name on file."
            className="min-h-28"
          />
          <DialogFooter showCloseButton>
            <Button
              variant="destructive"
              disabled={!reason.trim() || reject.isPending}
              onClick={() => rejectingId && reject.mutate({ id: rejectingId, reason: reason.trim() })}
            >
              {reject.isPending ? <Loader2 className="animate-spin" /> : <Banknote />}
              Reject and notify member
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
