"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { CheckCircle2, Copy, Loader2, MailCheck, Send, ServerCog, TriangleAlert } from "lucide-react";
import { useState } from "react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SettingsLoadError, SettingsLoading } from "@/features/admin/settings/form-shared";
import { fetchEmailConfiguration, sendTestEmail } from "@/lib/api/admin";

const ENV_TEMPLATE = `EMAIL_HOST=smtp.resend.com
EMAIL_PORT=465
EMAIL_USER=resend
EMAIL_PASS=your-resend-api-key
EMAIL_FROM=no-reply@kattegat.app`;

export function EmailConfiguration() {
  const [recipient, setRecipient] = useState("");
  const [copied, setCopied] = useState(false);
  const query = useQuery({ queryKey: ["admin", "email-configuration"], queryFn: fetchEmailConfiguration, retry: false });
  const testMutation = useMutation({ mutationFn: () => sendTestEmail(recipient.trim()) });

  if (query.isPending) return <SettingsLoading />;
  if (query.isError || !query.data) return <SettingsLoadError error={query.error} />;

  const config = query.data;
  async function copyTemplate() {
    await navigator.clipboard.writeText(ENV_TEMPLATE);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-5">
      <Card className="border-0 bg-gradient-to-br from-brand-forest to-emerald-900 text-white shadow-xl ring-0">
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-1"><CardTitle className="flex items-center gap-2 text-lg"><ServerCog className="size-5" /> Email delivery</CardTitle><CardDescription className="text-white/70">Check the backend SMTP environment before sending platform email.</CardDescription></div>
            <Badge className={config.configured ? "bg-brand-mantis text-brand-forest" : "bg-amber-300 text-amber-950"}>{config.configured ? "Ready" : "Setup required"}</Badge>
          </div>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-3">
          <StatusItem label="SMTP server" value={config.host ? `${config.host}:${config.port}` : "Not configured"} />
          <StatusItem label="Sender account" value={config.user ?? "Not configured"} />
          <StatusItem label="Authentication" value={config.passwordConfigured ? "Password configured" : "Password missing"} />
        </CardContent>
      </Card>

      {!config.configured ? <Alert className="border-amber-200 bg-amber-50 text-amber-950"><TriangleAlert /><AlertTitle>Email cannot send yet</AlertTitle><AlertDescription>Missing: {config.missingVariables.join(", ")}. Add these values to the backend environment and restart the backend.</AlertDescription></Alert> : null}

      <Card>
        <CardHeader><CardTitle>Configure the backend `.env`</CardTitle><CardDescription>Sent via Resend — `EMAIL_PASS` is a Resend API key, and `EMAIL_FROM` must be an address on a domain verified in the Resend dashboard. Environment secrets are intentionally not editable or displayed in the browser.</CardDescription></CardHeader>
        <CardContent className="space-y-3">
          <div className="relative rounded-xl bg-slate-950 p-4 pr-14 font-mono text-xs leading-6 text-emerald-200"><pre className="overflow-x-auto whitespace-pre-wrap">{ENV_TEMPLATE}</pre><Button type="button" size="icon-sm" variant="ghost" className="absolute right-3 top-3 text-white hover:bg-white/10 hover:text-white" onClick={copyTemplate} aria-label="Copy environment template">{copied ? <CheckCircle2 /> : <Copy />}</Button></div>
          <p className="text-xs text-muted-foreground">After changing `.env`, restart the backend process. Production hosting environments must be updated in the hosting provider’s secret settings.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><MailCheck className="size-5 text-brand-forest" /> Send a test email</CardTitle><CardDescription>This verifies the SMTP login and sends a real message using the configured sender.</CardDescription></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2"><Label htmlFor="test-email">Recipient email</Label><div className="flex flex-col gap-2 sm:flex-row"><Input id="test-email" type="email" value={recipient} onChange={(event) => setRecipient(event.target.value)} placeholder="you@kattegat.app" disabled={testMutation.isPending} /><Button type="button" onClick={() => testMutation.mutate()} disabled={!config.configured || !recipient.trim() || testMutation.isPending}>{testMutation.isPending ? <Loader2 className="animate-spin" /> : <Send />} Send test</Button></div></div>
          {testMutation.isSuccess ? <Alert className="border-emerald-200 bg-emerald-50 text-emerald-900"><CheckCircle2 /><AlertTitle>Test email sent</AlertTitle><AlertDescription>A message was sent to {testMutation.data.recipient}. Check the inbox and spam folder.</AlertDescription></Alert> : null}
          {testMutation.isError ? <Alert variant="destructive"><TriangleAlert /><AlertTitle>Email test failed</AlertTitle><AlertDescription>{testMutation.error instanceof Error ? testMutation.error.message : "The email could not be sent."}</AlertDescription></Alert> : null}
        </CardContent>
      </Card>
    </div>
  );
}

function StatusItem({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl bg-white/10 p-3"><p className="text-[11px] font-bold uppercase tracking-wider text-white/55">{label}</p><p className="mt-1 break-all font-semibold text-white">{value}</p></div>;
}
