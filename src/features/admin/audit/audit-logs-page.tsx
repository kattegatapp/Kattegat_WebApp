"use client";

import { useQuery } from "@tanstack/react-query";
import {
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Clock3,
  FileJson,
  Filter,
  MonitorSmartphone,
  RotateCcw,
  Search,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { useState } from "react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { fetchAdminAuditLogs, type AdminAuditLog } from "@/lib/api/admin";
import { ApiRequestError } from "@/lib/api/client";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 25;

const ACTIONS = ["all", "create", "update", "delete", "approve", "reject", "login", "logout"];
const CATEGORIES = [
  "all",
  "user",
  "staff",
  "listing",
  "requirement",
  "identity_verification",
  "moderation_report",
  "founding_member",
  "settings",
  "pricing",
  "communication",
];

function title(value: string | null | undefined) {
  if (!value) return "Unknown";
  return value.replaceAll(/[._-]/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function actionTone(action: string) {
  const value = action.toLowerCase();
  if (/test_email|email_configuration/.test(value)) return "border-sky-200 bg-sky-50 text-sky-800";
  if (/communication|notification|message/.test(value)) return "border-cyan-200 bg-cyan-50 text-cyan-800";
  if (/login|logout|password|session/.test(value)) return "border-brand-blue/20 bg-[rgb(28_71_89/0.08)] text-brand-blue";
  if (/impersonate|view_as/.test(value)) return "border-orange-200 bg-orange-50 text-orange-900";
  if (/delete|remove|reject|ban|suspend|fail|deactivate/.test(value)) return "border-red-200 bg-red-50 text-red-800";
  if (/approve|accept|restore|reactivate|success/.test(value)) return "border-emerald-200 bg-emerald-50 text-emerald-800";
  if (/create|invite|add/.test(value)) return "border-teal-200 bg-teal-50 text-teal-800";
  if (/settings|feature_flag|pricing|plan/.test(value)) return "border-brand-forest/15 bg-brand-forest/5 text-brand-forest";
  if (/resolve|review|moderation/.test(value)) return "border-amber-200 bg-amber-50 text-amber-900";
  if (/update|change|edit|upsert/.test(value)) return "border-blue-200 bg-blue-50 text-blue-800";
  return "border-blue-200 bg-blue-50 text-blue-800";
}

function categoryTone(category: string | null) {
  const value = category?.toLowerCase() ?? "";
  if (/email|communication|notification/.test(value)) return "bg-sky-100 text-sky-800";
  if (/user|seller|staff|profile/.test(value)) return "bg-sky-100 text-sky-800";
  if (/listing|requirement|category/.test(value)) return "bg-amber-100 text-amber-900";
  if (/settings|feature|pricing|plan/.test(value)) return "bg-brand-forest/10 text-brand-forest";
  if (/moderation|verification|report/.test(value)) return "bg-rose-100 text-rose-800";
  return "bg-slate-100 text-slate-700";
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown time";
  return new Intl.DateTimeFormat("en-AE", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function AdminAuditLogsPage() {
  const [draft, setDraft] = useState("");
  const [q, setQ] = useState("");
  const [action, setAction] = useState("all");
  const [category, setCategory] = useState("all");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<AdminAuditLog | null>(null);

  const query = useQuery({
    queryKey: ["admin", "audit-logs", q, action, category, page],
    queryFn: () => fetchAdminAuditLogs({ q, action, category, page, pageSize: PAGE_SIZE }),
    retry: false,
  });

  const filtered = Boolean(q || action !== "all" || category !== "all");
  const totalPages = Math.max(1, Math.ceil((query.data?.total ?? 0) / PAGE_SIZE));
  const unsupported = query.error instanceof ApiRequestError && query.error.status === 404;

  function clearFilters() {
    setDraft("");
    setQ("");
    setAction("all");
    setCategory("all");
    setPage(1);
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-brand-blue">
            <ShieldCheck className="size-4" /> Governance
          </div>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-zinc-900 sm:text-3xl">Audit logs</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Review administrative actions, security events, affected records, and actor details.
          </p>
        </div>
        <Badge variant="outline" className="bg-white">
          {query.data?.total ?? 0} recorded events
        </Badge>
      </div>

      <Card className="ios-glass-pane border-white/80 bg-transparent">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base text-brand-forest"><Filter className="size-4" />Find an event</CardTitle>
          <CardDescription>Search by administrator, action, record ID, or event summary.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <form
            className="flex flex-col gap-2 lg:flex-row"
            onSubmit={(event) => {
              event.preventDefault();
              setQ(draft.trim());
              setPage(1);
            }}
          >
            <div className="relative min-w-0 flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={draft} onChange={(event) => setDraft(event.target.value)} className="h-11 bg-white pl-9" placeholder="Email, action, resource ID, or keyword" />
            </div>
            <Select value={action} onValueChange={(value) => { setAction(value ?? "all"); setPage(1); }}>
              <SelectTrigger className="h-11 w-full bg-white lg:w-44"><SelectValue /></SelectTrigger>
              <SelectContent>{ACTIONS.map((value) => <SelectItem key={value} value={value}>{value === "all" ? "All actions" : title(value)}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={category} onValueChange={(value) => { setCategory(value ?? "all"); setPage(1); }}>
              <SelectTrigger className="h-11 w-full bg-white lg:w-48"><SelectValue /></SelectTrigger>
              <SelectContent>{CATEGORIES.map((value) => <SelectItem key={value} value={value}>{value === "all" ? "All sections" : title(value)}</SelectItem>)}</SelectContent>
            </Select>
            <Button type="submit" className="h-11"><Search />Search</Button>
          </form>
          {filtered ? <Button type="button" variant="ghost" size="sm" onClick={clearFilters}><RotateCcw />Clear search and filters</Button> : null}
        </CardContent>
      </Card>

      {unsupported ? (
        <Alert className="ios-glass-pane rounded-2xl border-amber-200/60 bg-amber-50/35 text-amber-950 backdrop-blur-xl">
          <AlertTriangle />
          <AlertTitle>The audit-log service is not connected yet</AlertTitle>
          <AlertDescription>
            The panel is ready, but the backend must provide GET /api/admin/audit-logs before historical events can appear here.
          </AlertDescription>
        </Alert>
      ) : query.isError ? (
        <Alert className="ios-glass-pane rounded-2xl border-red-200/60 bg-red-50/35 text-red-950 backdrop-blur-xl">
          <AlertTriangle />
          <AlertTitle>Audit logs could not be loaded</AlertTitle>
          <AlertDescription>{query.error instanceof Error ? query.error.message : "Please try again."}</AlertDescription>
        </Alert>
      ) : query.isPending ? (
        <div className="min-h-40" role="status" aria-live="polite" aria-busy="true"><span className="sr-only">Loading</span></div>
      ) : !query.data.items.length ? (
        <Card className="ios-glass-pane border-dashed border-white/70 bg-transparent"><CardContent className="flex min-h-64 flex-col items-center justify-center px-6 text-center"><ShieldCheck className="size-10 text-brand-forest" /><p className="mt-3 font-bold text-brand-forest">{filtered ? "No events match these filters" : "No audit events recorded"}</p><p className="mt-1 max-w-md text-sm text-muted-foreground">{filtered ? "Try a broader search or clear the filters." : "Administrative and security activity will appear here when recorded by the backend."}</p></CardContent></Card>
      ) : (
        <Card className="ios-glass-pane overflow-hidden border-white/80 bg-transparent">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader><TableRow><TableHead>Event</TableHead><TableHead>Administrator</TableHead><TableHead>Resource</TableHead><TableHead>Time</TableHead><TableHead className="text-right">Details</TableHead></TableRow></TableHeader>
              <TableBody>
                {query.data.items.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="min-w-56"><div className="flex flex-wrap items-center gap-2"><Badge className={cn("border", actionTone(log.action))}>{title(log.action)}</Badge>{log.category ? <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide", categoryTone(log.category))}>{title(log.category)}</span> : null}</div><p className="mt-1 max-w-md text-sm text-muted-foreground">{log.summary || "Administrative action recorded"}</p></TableCell>
                    <TableCell className="min-w-52"><div className="flex items-center gap-2"><UserRound className="size-4 text-brand-forest" /><span><span className="block break-all font-medium">{log.actorEmail || "System"}</span>{log.actorRole ? <span className="block text-xs text-muted-foreground">{title(log.actorRole)}</span> : null}</span></div></TableCell>
                    <TableCell className="min-w-44"><span className="block font-medium">{log.resourceName || title(log.resourceType)}</span>{log.resourceName ? <span className="block text-xs text-muted-foreground">{log.resourceRole ? `${title(log.resourceRole)} · ` : ""}{title(log.resourceType)}</span> : null}<span className="block max-w-48 truncate font-mono text-[10px] text-muted-foreground/70">{log.resourceId || "—"}</span></TableCell>
                    <TableCell className="min-w-44 text-sm text-muted-foreground"><Clock3 className="mr-1 inline size-4" />{formatDate(log.createdAt)}</TableCell>
                    <TableCell className="text-right"><Button size="sm" variant="outline" onClick={() => setSelected(log)}><FileJson />Inspect</Button></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 border-t px-4 py-3">
            <span className="text-xs text-muted-foreground">Page {page} of {totalPages}</span>
            <div className="flex gap-2"><Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage((value) => value - 1)}><ChevronLeft />Previous</Button><Button size="sm" variant="outline" disabled={page >= totalPages} onClick={() => setPage((value) => value + 1)}>Next<ChevronRight /></Button></div>
          </div>
        </Card>
      )}

      <AuditDetailDialog log={selected} onClose={() => setSelected(null)} />
    </div>
  );
}

function AuditDetailDialog({ log, onClose }: { log: AdminAuditLog | null; onClose: () => void }) {
  return (
    <Dialog open={Boolean(log)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader><DialogTitle>Audit event details</DialogTitle><DialogDescription>Immutable context recorded for this administrative event.</DialogDescription></DialogHeader>
        {log ? <div className="space-y-4"><div className="grid gap-3 sm:grid-cols-2"><Detail label="Action" value={title(log.action)} /><Detail label="Category" value={title(log.category)} /><Detail label="Administrator" value={log.actorEmail || "System"} /><Detail label="Administrator role" value={log.actorRole ? title(log.actorRole) : log.actorId ? "Role unavailable" : "System event"} /><Detail label="Resource" value={log.resourceName ? `${log.resourceName} · ${title(log.resourceType)}` : title(log.resourceType)} />{log.resourceName ? <Detail label="User role" value={log.resourceRole ? title(log.resourceRole) : "Not assigned"} /> : null}<Detail label="Resource ID" value={log.resourceId || "—"} /><Detail label="Recorded" value={formatDate(log.createdAt)} /></div>{log.summary ? <Detail label="Summary" value={log.summary} /> : null}<div className="grid gap-3 sm:grid-cols-2"><Detail icon={<MonitorSmartphone />} label="IP address" value={log.ipAddress || "Not recorded"} /><Detail label="User agent" value={log.userAgent || "Not recorded"} /></div><div><p className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">Event metadata</p><pre className="max-h-72 overflow-auto rounded-xl bg-slate-950 p-4 text-xs leading-6 text-emerald-200">{JSON.stringify(log.metadata ?? {}, null, 2)}</pre></div><p className="break-all font-mono text-[11px] text-muted-foreground">Event ID: {log.id}</p></div> : null}
      </DialogContent>
    </Dialog>
  );
}

function Detail({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return <div className="rounded-xl border bg-muted/20 p-3"><p className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{icon}{label}</p><p className="mt-1 break-words text-sm font-semibold text-brand-forest">{value}</p></div>;
}
