"use client";

import { useMutation } from "@tanstack/react-query";
import { BellRing, CheckCircle2, Loader2, Mail, Megaphone, Send, Smartphone, TriangleAlert, UsersRound } from "lucide-react";
import { useState } from "react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { previewCommunicationAudience, sendAdminCommunication, type CommunicationAudience, type CommunicationChannel, type CommunicationUserStatus } from "@/lib/api/admin";
import { cn } from "@/lib/utils";

const AUDIENCES: Array<{ value: CommunicationAudience; label: string; hint: string }> = [
  { value: "all_users", label: "All registered users", hint: "Every account except deleted users" },
  { value: "buyers", label: "Buyers", hint: "Accounts with a buyer profile" },
  { value: "sellers", label: "Sellers", hint: "Accounts with a seller profile" },
  { value: "pro_sellers", label: "Pro members", hint: "Pro and White Glove sellers" },
  { value: "waitlist", label: "Waitlist applicants", hint: "Email delivery only" },
  { value: "founding_members", label: "Founding Members", hint: "Accepted Founding Members" },
  { value: "vetted_members", label: "Vetted members", hint: "Accepted White Glove / vetted members" },
  { value: "user_status", label: "By account status", hint: "Active, suspended, banned or pending accounts" },
];
const STATUSES: Array<{ value: CommunicationUserStatus; label: string }> = [{ value: "active", label: "Active" }, { value: "pending_verification", label: "Pending verification" }, { value: "suspended", label: "Suspended" }, { value: "banned", label: "Banned" }, { value: "deleted", label: "Deleted" }];

export function AdminCommunicationsPage() {
  const [audience, setAudience] = useState<CommunicationAudience>("all_users");
  const [userStatus, setUserStatus] = useState<CommunicationUserStatus>("active");
  const [channels, setChannels] = useState<CommunicationChannel[]>(["push"]);
  const [title, setTitle] = useState(""); const [body, setBody] = useState(""); const [deepLink, setDeepLink] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const audienceInput = { audience, ...(audience === "user_status" ? { userStatus } : {}) };
  const preview = useMutation({ mutationFn: () => previewCommunicationAudience(audienceInput) });
  const send = useMutation({ mutationFn: () => sendAdminCommunication({ ...audienceInput, channels, title: title.trim(), body: body.trim(), ...(deepLink.trim() ? { deepLink: deepLink.trim() } : {}) }), onSuccess: () => setConfirmOpen(false) });
  const valid = channels.length > 0 && title.trim().length >= 3 && body.trim().length >= 3 && (!deepLink.trim() || deepLink.trim().startsWith("/"));
  const audienceDetails = AUDIENCES.find((item) => item.value === audience)!;

  function toggleChannel(channel: CommunicationChannel, enabled: boolean) { setChannels((current) => enabled ? [...new Set([...current, channel])] : current.filter((item) => item !== channel)); }
  function changeAudience(value: CommunicationAudience) { setAudience(value); preview.reset(); send.reset(); if (value === "waitlist") setChannels(["email"]); }

  return <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
    <section className="relative overflow-hidden rounded-[2rem] bg-[#062418] p-6 text-white shadow-[0_24px_70px_rgb(0_57_18/0.2)] sm:p-8"><div aria-hidden className="absolute inset-0 bg-[radial-gradient(circle_at_85%_0%,rgb(111_219_66/0.24),transparent_35%)]" /><div className="relative max-w-2xl"><Badge className="mb-4 bg-white/10 text-brand-mantis">Communications centre</Badge><h1 className="text-3xl font-extrabold tracking-tight">Reach the right members clearly.</h1><p className="mt-2 text-sm leading-6 text-white/65">Create one targeted announcement and deliver it by push notification, email, or both.</p></div></section>

    <div className="grid items-start gap-5 lg:grid-cols-[0.9fr_1.1fr]">
      <div className="space-y-5">
        <Card><CardHeader><CardTitle className="flex items-center gap-2"><UsersRound className="size-5 text-brand-forest" /> Audience</CardTitle><CardDescription>Choose exactly who should receive this announcement.</CardDescription></CardHeader><CardContent className="space-y-4"><div className="space-y-2"><Label>Recipient group</Label><Select value={audience} onValueChange={(value) => changeAudience(value as CommunicationAudience)}><SelectTrigger className="h-11 w-full bg-white"><SelectValue /></SelectTrigger><SelectContent>{AUDIENCES.map((item) => <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>)}</SelectContent></Select><p className="text-xs text-muted-foreground">{audienceDetails.hint}</p></div>{audience === "user_status" ? <div className="space-y-2"><Label>Account status</Label><Select value={userStatus} onValueChange={(value) => { setUserStatus(value as CommunicationUserStatus); preview.reset(); }}><SelectTrigger className="h-11 w-full bg-white"><SelectValue /></SelectTrigger><SelectContent>{STATUSES.map((item) => <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>)}</SelectContent></Select></div> : null}<Button variant="outline" className="w-full" onClick={() => preview.mutate()} disabled={preview.isPending}>{preview.isPending ? <Loader2 className="animate-spin" /> : <UsersRound />}Preview audience</Button>{preview.isSuccess ? <div className="grid grid-cols-3 gap-2"><Stat value={preview.data.total} label="Recipients" /><Stat value={preview.data.pushReachable} label="Push ready" /><Stat value={preview.data.emailReachable} label="Email ready" /></div> : null}{preview.isError ? <InlineError error={preview.error} /> : null}</CardContent></Card>

        <Card><CardHeader><CardTitle className="flex items-center gap-2"><BellRing className="size-5 text-brand-forest" /> Delivery channels</CardTitle><CardDescription>Recipients without a registered device cannot receive push.</CardDescription></CardHeader><CardContent className="space-y-3"><ChannelRow icon={Smartphone} label="Push notification" description="Mobile device notification and in-app inbox." checked={channels.includes("push")} disabled={audience === "waitlist"} onChange={(value) => toggleChannel("push", value)} /><ChannelRow icon={Mail} label="Email notification" description="Branded email sent to the account address." checked={channels.includes("email")} onChange={(value) => toggleChannel("email", value)} />{!channels.length ? <p className="text-xs font-semibold text-red-600">Select at least one delivery channel.</p> : null}</CardContent></Card>
      </div>

      <Card><CardHeader><CardTitle className="flex items-center gap-2"><Megaphone className="size-5 text-brand-forest" /> Compose announcement</CardTitle><CardDescription>Write concise copy that makes the requested action obvious.</CardDescription></CardHeader><CardContent className="space-y-5"><div className="space-y-2"><Label htmlFor="communication-title">Title</Label><Input id="communication-title" value={title} onChange={(event) => setTitle(event.target.value)} maxLength={120} placeholder="Your Kattegat update" /><div className="text-right text-[11px] text-muted-foreground">{title.length}/120</div></div><div className="space-y-2"><Label htmlFor="communication-body">Message</Label><Textarea id="communication-body" value={body} onChange={(event) => setBody(event.target.value)} maxLength={2000} placeholder="Tell members what changed and what they need to do next." className="min-h-44 resize-y" /><div className="text-right text-[11px] text-muted-foreground">{body.length}/2000</div></div><div className="space-y-2"><Label htmlFor="communication-link">Mobile deep link <span className="font-normal text-muted-foreground">(optional)</span></Label><Input id="communication-link" value={deepLink} onChange={(event) => setDeepLink(event.target.value)} placeholder="/notifications" />{deepLink && !deepLink.startsWith("/") ? <p className="text-xs text-red-600">Deep links must start with /</p> : <p className="text-xs text-muted-foreground">Example: /referral, /notifications or /requirement/ID</p>}</div><div className="rounded-2xl border border-brand-forest/10 bg-brand-forest/[0.03] p-4"><p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Preview</p><p className="mt-2 font-bold text-brand-forest">{title.trim() || "Notification title"}</p><p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">{body.trim() || "Your message will appear here."}</p></div>{send.isSuccess ? <Alert className="border-emerald-200 bg-emerald-50 text-emerald-900"><CheckCircle2 /><AlertTitle>Announcement sent</AlertTitle><AlertDescription>{send.data.targeted} recipients were targeted successfully.</AlertDescription></Alert> : null}{send.isError ? <InlineError error={send.error} /> : null}<Button size="lg" className="w-full font-bold" disabled={!valid || send.isPending} onClick={() => setConfirmOpen(true)}><Send />Review and send</Button></CardContent></Card>
    </div>

    <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}><DialogContent><DialogHeader><DialogTitle>Send this announcement?</DialogTitle><DialogDescription>This will target {audienceDetails.label.toLowerCase()} using {channels.join(" and ")}. Sending cannot be undone.</DialogDescription></DialogHeader><div className="rounded-xl bg-muted p-4"><p className="font-bold text-brand-forest">{title}</p><p className="mt-1 line-clamp-4 whitespace-pre-wrap text-sm text-muted-foreground">{body}</p></div><DialogFooter><DialogClose render={<Button variant="outline" />}>Cancel</DialogClose><Button onClick={() => send.mutate()} disabled={send.isPending}>{send.isPending ? <Loader2 className="animate-spin" /> : <Send />}Send now</Button></DialogFooter></DialogContent></Dialog>
  </div>;
}

function ChannelRow({ icon: Icon, label, description, checked, disabled, onChange }: { icon: typeof Mail; label: string; description: string; checked: boolean; disabled?: boolean; onChange: (value: boolean) => void }) { return <div className={cn("flex items-center gap-3 rounded-2xl border p-4", checked ? "border-emerald-200 bg-emerald-50/60" : "border-border/70", disabled && "opacity-50")}><span className={cn("flex size-10 items-center justify-center rounded-xl", checked ? "bg-brand-forest text-white" : "bg-muted text-muted-foreground")}><Icon className="size-5" /></span><div className="min-w-0 flex-1"><p className="text-sm font-semibold text-brand-forest">{label}</p><p className="text-xs leading-5 text-muted-foreground">{description}</p></div><Switch checked={checked} disabled={disabled} onCheckedChange={onChange} /></div>; }
function Stat({ value, label }: { value: number; label: string }) { return <div className="rounded-xl bg-muted/60 p-3 text-center"><p className="text-xl font-extrabold text-brand-forest">{value}</p><p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">{label}</p></div>; }
function InlineError({ error }: { error: unknown }) { return <Alert variant="destructive"><TriangleAlert /><AlertTitle>Request could not be completed</AlertTitle><AlertDescription>{error instanceof Error ? error.message : "Please try again."}</AlertDescription></Alert>; }
