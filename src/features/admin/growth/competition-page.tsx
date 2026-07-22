"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pause, Play, Save, Trophy, UserCheck, UserX } from "lucide-react";

import { AdminLoadingState, AdminPageHeader, AdminQueryError } from "@/features/admin/shared/query-state";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { fetchAdminCompetition, updateAdminCompetition, updateAdminCompetitionParticipant, type AdminCompetitionStatus, type AdminCompetitionUpdate } from "@/lib/api/admin";

function localDateTime(value: string) {
  const date = new Date(value);
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

export function CompetitionAdminPage() {
  const client = useQueryClient();
  const query = useQuery({ queryKey: ["admin", "competition"], queryFn: fetchAdminCompetition, retry: false });
  const [form, setForm] = useState<Record<string, string>>({});
  const [requirePaymentToCount, setRequirePaymentToCount] = useState(false);
  useEffect(() => {
    if (!query.data) return;
    const first = query.data.prizes.find((prize) => prize.place === 1)!;
    const second = query.data.prizes.find((prize) => prize.place === 2)!;
    const third = query.data.prizes.find((prize) => prize.place === 3)!;
    const timer = window.setTimeout(() => { setForm({ title: query.data!.title, status: query.data!.status, startsAt: localDateTime(query.data!.startsAt), endsAt: localDateTime(query.data!.endsAt), documentId: query.data!.documentId, termsVersion: query.data!.termsVersion, firstPrizeAed: String(first.amountAed), secondPrizeAed: String(second.amountAed), thirdPrizeAed: String(third.amountAed), firstThreshold: String(first.minimumActiveReferrals), secondThreshold: String(second.minimumActiveReferrals), thirdThreshold: String(third.minimumActiveReferrals) }); setRequirePaymentToCount(query.data!.requirePaymentToCount); }, 0);
    return () => window.clearTimeout(timer);
  }, [query.data]);
  const save = useMutation({ mutationFn: (input: AdminCompetitionUpdate) => updateAdminCompetition(input), onSuccess: (data) => client.setQueryData(["admin", "competition"], data) });
  const participant = useMutation({ mutationFn: ({ userId, eligible }: { userId: string; eligible: boolean }) => updateAdminCompetitionParticipant(userId, eligible, eligible ? undefined : "Disqualified by administrator"), onSuccess: () => void client.invalidateQueries({ queryKey: ["admin", "competition"] }) });
  if (query.isPending) return <AdminLoadingState label="Loading competition controls" />;
  if (query.isError || !query.data) return <AdminQueryError error={query.error} onRetry={() => void query.refetch()} />;

  function submit() {
    save.mutate({ title: form.title, status: form.status as AdminCompetitionStatus, startsAt: new Date(form.startsAt).toISOString(), endsAt: new Date(form.endsAt).toISOString(), documentId: form.documentId, termsVersion: form.termsVersion, requirePaymentToCount, firstPrizeAed: Number(form.firstPrizeAed), secondPrizeAed: Number(form.secondPrizeAed), thirdPrizeAed: Number(form.thirdPrizeAed), firstThreshold: Number(form.firstThreshold), secondThreshold: Number(form.secondThreshold), thirdThreshold: Number(form.thirdThreshold) });
  }
  const field = (key: string, value: string) => setForm((current) => ({ ...current, [key]: value }));
  return <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
    <AdminPageHeader title="Referral competition" description="Control availability, timing, prizes, qualification thresholds, terms, and participant eligibility." count={query.data.participantCount} />
    {save.isError ? <Alert className="border-red-200 bg-red-50"><AlertDescription>The competition could not be updated. Check dates and descending thresholds.</AlertDescription></Alert> : null}
    <div className="grid gap-5 lg:grid-cols-[1fr_.8fr]">
      <Card><CardHeader><CardTitle>Competition controls</CardTitle></CardHeader><CardContent className="grid gap-4 sm:grid-cols-2">
        <label className="sm:col-span-2 text-sm font-bold">Title<Input className="mt-2" value={form.title ?? ""} onChange={(e) => field("title", e.target.value)} /></label>
        <label className="text-sm font-bold">Status<select className="mt-2 h-10 w-full rounded-lg border border-input bg-white px-3" value={form.status ?? "live"} onChange={(e) => field("status", e.target.value)}>{["upcoming","live","paused","ended","cancelled"].map((value) => <option key={value}>{value}</option>)}</select></label>
        <div className="flex items-end"><Button className="w-full" variant={query.data.status === "live" ? "outline" : "default"} onClick={() => save.mutate({ status: query.data.status === "live" ? "paused" : "live" })}>{query.data.status === "live" ? <Pause /> : <Play />}{query.data.status === "live" ? "Pause competition" : "Set live"}</Button></div>
        <label className="text-sm font-bold">Starts<Input type="datetime-local" className="mt-2" value={form.startsAt ?? ""} onChange={(e) => field("startsAt", e.target.value)} /></label>
        <label className="text-sm font-bold">Closes<Input type="datetime-local" className="mt-2" value={form.endsAt ?? ""} onChange={(e) => field("endsAt", e.target.value)} /></label>
        <label className="text-sm font-bold">Document ID<Input className="mt-2" value={form.documentId ?? ""} onChange={(e) => field("documentId", e.target.value)} /></label>
        <label className="text-sm font-bold">Terms version<Input className="mt-2" value={form.termsVersion ?? ""} onChange={(e) => field("termsVersion", e.target.value)} /></label>
        <div className="flex items-center justify-between gap-4 rounded-xl border p-4 sm:col-span-2"><div><p className="text-sm font-extrabold">Require payment to count</p><p className="mt-1 text-xs text-muted-foreground">Off: verified activated signups count. On: a referral counts after a qualifying payment clears, even when the signup happened before payment.</p></div><Switch aria-label="Require payment to count" checked={requirePaymentToCount} onCheckedChange={setRequirePaymentToCount} /></div>
        {[1,2,3].map((place) => <div key={place} className="rounded-xl border p-4 sm:col-span-2"><p className="font-extrabold">{place === 1 ? "First" : place === 2 ? "Second" : "Third"} place</p><div className="mt-3 grid grid-cols-2 gap-3"><label className="text-xs font-bold">Prize AED<Input type="number" value={form[`${place === 1 ? "first" : place === 2 ? "second" : "third"}PrizeAed`] ?? ""} onChange={(e) => field(`${place === 1 ? "first" : place === 2 ? "second" : "third"}PrizeAed`, e.target.value)} /></label><label className="text-xs font-bold">Successful referrals<Input type="number" value={form[`${place === 1 ? "first" : place === 2 ? "second" : "third"}Threshold`] ?? ""} onChange={(e) => field(`${place === 1 ? "first" : place === 2 ? "second" : "third"}Threshold`, e.target.value)} /></label></div></div>)}
        <Button className="sm:col-span-2" onClick={submit} disabled={save.isPending}><Save />{save.isPending ? "Saving…" : "Save all controls"}</Button>
      </CardContent></Card>
      <Card><CardHeader><CardTitle className="flex items-center gap-2"><Trophy className="text-brand-mantis" />Top referrers</CardTitle></CardHeader><CardContent className="space-y-2">{query.data.participants.length ? query.data.participants.map((item) => <div key={item.userId} className="flex items-center gap-3 rounded-xl border p-3"><span className="w-8 font-extrabold">{item.rank ? `#${item.rank}` : "—"}</span><div className="min-w-0 flex-1"><p className="truncate font-bold">{item.name}</p><p className="truncate text-xs text-muted-foreground">{item.email} · joined {new Date(item.acceptedAt).toLocaleDateString("en-AE")}</p></div><div className="text-right"><p className="font-extrabold text-brand-forest">{item.referralCount}</p><Badge variant="outline">{item.eligible ? "Eligible" : "Disqualified"}</Badge></div><Button size="icon" variant="outline" title={item.eligible ? "Disqualify" : "Restore eligibility"} onClick={() => participant.mutate({ userId: item.userId, eligible: !item.eligible })}>{item.eligible ? <UserX /> : <UserCheck />}</Button></div>) : <p className="py-10 text-center text-sm text-muted-foreground">No members have accepted the competition terms yet.</p>}</CardContent></Card>
    </div>
  </div>;
}
