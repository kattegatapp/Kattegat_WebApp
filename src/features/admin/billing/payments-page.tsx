"use client";

import { useQuery } from "@tanstack/react-query";
import { CreditCard, Search } from "lucide-react";
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
import { formatFilsAsAed } from "@/lib/admin/money";
import { fetchAdminPayments } from "@/lib/api/admin/billing";
import { cn } from "@/lib/utils";

const STATUS_STYLES = {
  succeeded: "border-brand-mantis/30 bg-brand-mantis/10 text-brand-forest",
  failed: "border-red-200 bg-red-50 text-red-800",
  refunded: "border-amber-200 bg-amber-50 text-amber-900",
  disputed: "border-violet-200 bg-violet-50 text-violet-800",
} as const;

export function AdminPaymentsPage() {
  const [draft, setDraft] = useState("");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);

  const query = useQuery({
    queryKey: ["admin", "payments", q, page],
    queryFn: () => fetchAdminPayments(q, page),
    retry: false,
  });

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <AdminPageHeader
        title="Payment history"
        description="Stripe subscription receipts logged automatically after checkout webhooks."
        count={query.data?.meta?.total ?? 0}
        countLabel="payments"
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
          <Label htmlFor="payments-search" className="sr-only">
            Search payments
          </Label>
          <Input
            id="payments-search"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Search by seller email…"
          />
        </div>
        <Button type="submit" variant="secondary">
          <Search className="size-4" />
          Search
        </Button>
      </form>

      {query.isPending ? <AdminLoadingState label="Loading payments…" /> : null}
      {query.isError ? <AdminQueryError error={query.error} /> : null}

      {query.data && query.data.data.length === 0 ? (
        <AdminEmptyState
          icon={<CreditCard className="size-7" />}
          title="No payments yet"
          description="Successful Stripe checkouts will appear here after webhooks process."
        />
      ) : null}

      {query.data && query.data.data.length > 0 ? (
        <Card className="overflow-hidden border-white/80 bg-white/55 backdrop-blur-xl">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Seller</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {query.data.data.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell>
                    <div className="font-semibold">{payment.businessName ?? "Seller"}</div>
                    <p className="text-xs text-muted-foreground">{payment.userEmail}</p>
                  </TableCell>
                  <TableCell>{payment.description}</TableCell>
                  <TableCell className="font-semibold">{formatFilsAsAed(payment.amount)}</TableCell>
                  <TableCell>
                    <Badge className={cn("border font-bold capitalize", STATUS_STYLES[payment.status])}>
                      {payment.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(payment.createdAt).toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      ) : null}

      {query.data?.meta && query.data.meta.total > 25 ? (
        <div className="flex items-center justify-between gap-3">
          <Button
            type="button"
            variant="outline"
            disabled={page <= 1}
            onClick={() => setPage((current) => Math.max(1, current - 1))}
          >
            Previous
          </Button>
          <p className="text-sm text-muted-foreground">
            Page {page} · {query.data.meta.total} total
          </p>
          <Button
            type="button"
            variant="outline"
            disabled={page * 25 >= query.data.meta.total}
            onClick={() => setPage((current) => current + 1)}
          >
            Next
          </Button>
        </div>
      ) : null}
    </div>
  );
}
