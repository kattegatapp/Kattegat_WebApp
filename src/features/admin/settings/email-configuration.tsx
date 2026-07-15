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
import {
  ADMIN_GLASS_ALERT_ERROR,
  ADMIN_GLASS_ALERT_SUCCESS,
  ADMIN_GLASS_ALERT_WARN,
  ADMIN_GLASS_CARD,
  ADMIN_GLASS_CHIP,
} from "@/features/admin/shared/glass";
import { SettingsLoadError, SettingsLoading } from "@/features/admin/settings/form-shared";
import { fetchEmailConfiguration, sendTestEmail } from "@/lib/api/admin";
import { cn } from "@/lib/utils";

const ENV_TEMPLATE = `EMAIL_HOST=smtp.resend.com
EMAIL_PORT=465
EMAIL_USER=resend
EMAIL_PASS=your-resend-api-key
EMAIL_FROM=no-reply@kattegat.app`;

export function EmailConfiguration() {
  const [recipient, setRecipient] = useState("");
  const [copied, setCopied] = useState(false);
  const query = useQuery({
    queryKey: ["admin", "email-configuration"],
    queryFn: fetchEmailConfiguration,
    retry: false,
  });
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
      <section className="ios-glass-pane relative overflow-hidden rounded-[1.75rem] px-5 py-5 text-zinc-900 sm:px-7 sm:py-7">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="max-w-2xl space-y-1">
            <Badge className={cn(ADMIN_GLASS_CHIP, "mb-3 border-0")}>
              <ServerCog className="size-3.5" />
              SMTP status
            </Badge>
            <h2 className="flex items-center gap-2 text-xl font-extrabold tracking-tight text-zinc-900 sm:text-2xl">
              Email delivery
            </h2>
            <p className="text-sm leading-6 text-zinc-600">
              Check the backend SMTP environment before sending platform email.
            </p>
          </div>
          <Badge
            className={
              config.configured
                ? "border-0 bg-brand-mantis/90 font-bold text-brand-forest"
                : "border-0 bg-amber-200/90 font-bold text-amber-950"
            }
          >
            {config.configured ? "Ready" : "Setup required"}
          </Badge>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <StatusItem
            label="SMTP server"
            value={config.host ? `${config.host}:${config.port}` : "Not configured"}
          />
          <StatusItem label="Sender account" value={config.user ?? "Not configured"} />
          <StatusItem
            label="Authentication"
            value={config.passwordConfigured ? "Password configured" : "Password missing"}
          />
        </div>
      </section>

      {!config.configured ? (
        <Alert className={ADMIN_GLASS_ALERT_WARN}>
          <TriangleAlert />
          <AlertTitle>Email cannot send yet</AlertTitle>
          <AlertDescription>
            Missing: {config.missingVariables.join(", ")}. Add these values to the backend environment
            and restart the backend.
          </AlertDescription>
        </Alert>
      ) : null}

      <Card className={cn(ADMIN_GLASS_CARD, "bg-transparent")}>
        <CardHeader>
          <CardTitle>Configure the backend `.env`</CardTitle>
          <CardDescription>
            Sent via Resend — `EMAIL_PASS` is a Resend API key, and `EMAIL_FROM` must be an address on a
            domain verified in the Resend dashboard. Environment secrets are intentionally not editable
            or displayed in the browser.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="relative rounded-xl bg-slate-950 p-4 pr-14 font-mono text-xs leading-6 text-emerald-200">
            <pre className="overflow-x-auto whitespace-pre-wrap">{ENV_TEMPLATE}</pre>
            <Button
              type="button"
              size="icon-sm"
              variant="ghost"
              className="absolute right-3 top-3 text-white hover:bg-white/10 hover:text-white"
              onClick={copyTemplate}
              aria-label="Copy environment template"
            >
              {copied ? <CheckCircle2 /> : <Copy />}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            After changing `.env`, restart the backend process. Production hosting environments must be
            updated in the hosting provider’s secret settings.
          </p>
        </CardContent>
      </Card>

      <Card className={cn(ADMIN_GLASS_CARD, "bg-transparent")}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MailCheck className="size-5 text-brand-forest" /> Send a test email
          </CardTitle>
          <CardDescription>
            This verifies the SMTP login and sends a real message using the configured sender.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="test-email">Recipient email</Label>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Input
                id="test-email"
                type="email"
                value={recipient}
                onChange={(event) => setRecipient(event.target.value)}
                placeholder="you@kattegat.app"
                disabled={testMutation.isPending}
              />
              <Button
                type="button"
                onClick={() => testMutation.mutate()}
                disabled={!config.configured || !recipient.trim() || testMutation.isPending}
              >
                {testMutation.isPending ? <Loader2 className="animate-spin" /> : <Send />} Send test
              </Button>
            </div>
          </div>
          {testMutation.isSuccess ? (
            <Alert className={ADMIN_GLASS_ALERT_SUCCESS}>
              <CheckCircle2 />
              <AlertTitle>Test email sent</AlertTitle>
              <AlertDescription>
                A message was sent to {testMutation.data.recipient}. Check the inbox and spam folder.
              </AlertDescription>
            </Alert>
          ) : null}
          {testMutation.isError ? (
            <Alert className={ADMIN_GLASS_ALERT_ERROR} variant="destructive">
              <TriangleAlert />
              <AlertTitle>Email test failed</AlertTitle>
              <AlertDescription>
                {testMutation.error instanceof Error
                  ? testMutation.error.message
                  : "The email could not be sent."}
              </AlertDescription>
            </Alert>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}

function StatusItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="ios-glass-chip rounded-2xl px-4 py-3">
      <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">{label}</p>
      <p className="mt-1 break-all text-sm font-semibold text-zinc-900">{value}</p>
    </div>
  );
}
