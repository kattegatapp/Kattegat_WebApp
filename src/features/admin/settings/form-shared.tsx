"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Save, Settings } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { ADMIN_LOGIN_PATH } from "@/lib/admin/paths";
import {
  fetchAdminSettings,
  type AdminSettings,
  type UpdateAdminSettingsInput,
  updateAdminSettings,
} from "@/lib/api/admin";
import { ApiRequestError } from "@/lib/api/client";
import { cn } from "@/lib/utils";

export function useAdminSettingsSection<K extends keyof UpdateAdminSettingsInput>(section: K) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState<AdminSettings[K & keyof AdminSettings] | null>(null);

  const query = useQuery({
    queryKey: ["admin", "settings"],
    queryFn: fetchAdminSettings,
    retry: false,
  });

  const sectionData =
    draft ??
    (query.data
      ? (query.data[section as keyof AdminSettings] as AdminSettings[K & keyof AdminSettings])
      : null);

  const mutation = useMutation({
    mutationFn: (input: NonNullable<UpdateAdminSettingsInput[K]>) =>
      updateAdminSettings({ [section]: input } as UpdateAdminSettingsInput),
    onSuccess: (value, variables) => {
      queryClient.setQueryData(["admin", "settings"], value);
      setDraft((current) => {
        if (!current) return null;
        // Keep any edits made while the request was in flight.
        return JSON.stringify(current) === JSON.stringify(variables) ? null : current;
      });
    },
  });

  function updateField<F extends keyof NonNullable<typeof sectionData>>(
    key: F,
    value: NonNullable<typeof sectionData>[F],
  ) {
    // Functional update so rapid consecutive toggles compose instead of each
    // call spreading a stale sectionData captured before earlier setStates flush.
    setDraft((previous) => {
      const base =
        previous ??
        (query.data
          ? (query.data[section as keyof AdminSettings] as AdminSettings[K & keyof AdminSettings])
          : null);
      if (!base) return previous;
      return { ...base, [key]: value };
    });
  }

  return {
    router,
    query,
    sectionData,
    mutation,
    updateField,
    save: () => {
      if (!sectionData) return;
      mutation.mutate(sectionData as NonNullable<UpdateAdminSettingsInput[K]>);
    },
  };
}

export function SettingsSessionGate({
  children,
  title = "Could not load settings",
  description = "Check your connection and try again.",
  showLogin = false,
}: {
  children?: ReactNode;
  title?: string;
  description?: string;
  showLogin?: boolean;
}) {
  const router = useRouter();

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <Alert className="border-red-200 bg-red-50 text-red-800">
        <Settings />
        <AlertTitle>{title}</AlertTitle>
        <AlertDescription>{description}</AlertDescription>
      </Alert>
      {showLogin ? (
        <Button onClick={() => router.replace(ADMIN_LOGIN_PATH)}>Back to login</Button>
      ) : null}
      {children}
    </div>
  );
}

export function SettingsLoadError({ error }: { error: unknown }) {
  const unauthorized = error instanceof ApiRequestError && error.status === 401;
  return (
    <SettingsSessionGate
      showLogin={unauthorized}
      title={unauthorized ? "Please sign in again" : "Could not load settings"}
      description={
        error instanceof Error ? error.message : "Check your connection and try again."
      }
    />
  );
}

export function SettingsLoading() {
  return (
    <div className="flex min-h-64 flex-col items-center justify-center gap-3">
      <Loader2 className="h-7 w-7 animate-spin text-brand-forest" />
      <p className="text-sm text-muted-foreground">Loading settings…</p>
    </div>
  );
}

export function SettingsSaveBar({
  isPending,
  isSuccess,
  isError,
  errorMessage,
  onSave,
}: {
  isPending: boolean;
  isSuccess: boolean;
  isError: boolean;
  errorMessage?: string;
  onSave: () => void;
}) {
  return (
    <div className="sticky bottom-3 z-10 mt-6 rounded-2xl border border-border/80 bg-white/90 px-4 py-3 shadow-[0_16px_45px_rgb(0_57_18/0.12)] backdrop-blur-xl mb-[max(0px,env(safe-area-inset-bottom))]">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-h-5 text-sm">
          {isSuccess ? (
            <span className="text-emerald-700">Saved successfully.</span>
          ) : null}
          {isError ? (
            <span className="text-red-600">{errorMessage ?? "Could not save. Try again."}</span>
          ) : null}
          {!isSuccess && !isError ? (
            <span className="text-muted-foreground">Changes apply when you save this tab.</span>
          ) : null}
        </div>
        <Button onClick={onSave} disabled={isPending} className="h-11 w-full rounded-xl px-5 sm:h-10 sm:w-auto sm:min-w-36">
          {isPending ? <Loader2 className="animate-spin" /> : <Save />}
          Save changes
        </Button>
      </div>
    </div>
  );
}

export function SettingsPanel({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-5">
      <div className="space-y-1">
        <h2 className="text-lg font-bold text-brand-forest">{title}</h2>
        <p className="text-sm leading-6 text-muted-foreground">{description}</p>
      </div>
      {children}
    </div>
  );
}

export function SettingsGroup({
  title,
  description,
  children,
  className,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "rounded-2xl border border-border/70 bg-white p-4 shadow-[0_8px_30px_rgb(0_57_18/0.045)] sm:p-5",
        className,
      )}
    >
      <div className="mb-4 space-y-1">
        <h3 className="text-sm font-semibold text-brand-forest">{title}</h3>
        {description ? (
          <p className="text-xs leading-5 text-muted-foreground">{description}</p>
        ) : null}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">{children}</div>
    </section>
  );
}

export function FieldBlock({
  label,
  hint,
  children,
  className,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label className="text-sm font-medium text-brand-forest">{label}</Label>
      {children}
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

export function TextField({
  label,
  value,
  onChange,
  type = "text",
  hint,
  placeholder,
  className,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: "text" | "email" | "url";
  hint?: string;
  placeholder?: string;
  className?: string;
}) {
  return (
    <FieldBlock label={label} hint={hint} className={className}>
      <Input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 rounded-xl bg-muted/25 transition-shadow focus-visible:bg-white focus-visible:ring-brand-mantis/25"
      />
    </FieldBlock>
  );
}

export function TextAreaField({
  label,
  value,
  onChange,
  hint,
  placeholder,
  className,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  hint?: string;
  placeholder?: string;
  className?: string;
}) {
  return (
    <FieldBlock label={label} hint={hint} className={cn("sm:col-span-2", className)}>
      <Textarea
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-24 rounded-xl bg-muted/25 transition-shadow focus-visible:bg-white focus-visible:ring-brand-mantis/25"
      />
    </FieldBlock>
  );
}

export function NumberField({
  label,
  value,
  step = "1",
  onChange,
  hint,
}: {
  label: string;
  value: number | null;
  step?: string;
  onChange: (value: number | null) => void;
  hint?: string;
}) {
  return (
    <FieldBlock label={label} hint={hint}>
      <Input
        type="number"
        step={step}
        value={value ?? ""}
        onChange={(event) => {
          const raw = event.target.value;
          if (raw === "") {
            onChange(null);
            return;
          }
          const next = Number(raw);
          onChange(Number.isFinite(next) ? next : null);
        }}
        className="h-11 rounded-xl bg-muted/25 transition-shadow focus-visible:bg-white focus-visible:ring-brand-mantis/25"
      />
    </FieldBlock>
  );
}

export function SwitchField({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-border/80 bg-muted/30 px-3 py-3 sm:col-span-2">
      <div className="min-w-0 space-y-0.5">
        <div className="flex flex-wrap items-center gap-2"><p className="text-sm font-medium text-brand-forest">{label}</p><span className={cn("rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider", checked ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-600")}>{checked ? "On" : "Off"}</span></div>
        {description ? (
          <p className="text-xs leading-5 text-muted-foreground">{description}</p>
        ) : null}
      </div>
      <Switch aria-label={label} checked={checked} onCheckedChange={onChange} />
    </div>
  );
}

/** @deprecated Prefer SwitchField — kept for older imports. */
export function CheckboxField({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return <SwitchField label={label} checked={checked} onChange={onChange} />;
}

export function csv(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function labelize(value: string) {
  return value.replace(/([A-Z])/g, " $1").replace(/^./, (char) => char.toUpperCase());
}

/** Legacy shell used by old section routes — redirects should make this unused. */
export function SettingsSectionShell({
  title,
  description,
  isPending,
  isSuccess,
  isError,
  errorMessage,
  onSave,
  children,
}: {
  title: string;
  description: string;
  isPending: boolean;
  isSuccess: boolean;
  isError: boolean;
  errorMessage?: string;
  onSave: () => void;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
      <SettingsPanel title={title} description={description}>
        {children}
      </SettingsPanel>
      <SettingsSaveBar
        isPending={isPending}
        isSuccess={isSuccess}
        isError={isError}
        errorMessage={errorMessage}
        onSave={onSave}
      />
    </div>
  );
}

export function SettingsCard({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <SettingsGroup title={title} description={description}>
      {children}
    </SettingsGroup>
  );
}
