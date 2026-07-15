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
import { goToAdminLogin } from "@/lib/admin/session-client";
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
      <Alert className="ios-glass-pane rounded-2xl border-red-200/60 bg-red-50/35 text-red-950 backdrop-blur-xl">
        <Settings />
        <AlertTitle>{title}</AlertTitle>
        <AlertDescription>{description}</AlertDescription>
      </Alert>
      {showLogin ? (
        <Button onClick={() => void goToAdminLogin((path) => router.replace(path))}>Back to login</Button>
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
    <div className="min-h-40" role="status" aria-live="polite" aria-busy="true">
      <span className="sr-only">Loading settings…</span>
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
    <div className="ios-glass-pane sticky bottom-3 z-20 mt-6 mb-[max(0px,env(safe-area-inset-bottom))] rounded-[1.25rem] border-white/80 px-4 py-3.5 shadow-[0_18px_50px_rgb(0_57_18/0.12)]">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-h-5 text-sm">
          {isSuccess ? (
            <span className="font-semibold text-emerald-700">Saved successfully.</span>
          ) : null}
          {isError ? (
            <span className="font-semibold text-red-700">
              {errorMessage ?? "Could not save. Try again."}
            </span>
          ) : null}
          {!isSuccess && !isError ? (
            <span className="font-medium text-zinc-600">
              Ready when you are — tap{" "}
              <span className="font-extrabold text-zinc-900">Save changes</span> to apply.
            </span>
          ) : null}
        </div>
        <Button
          onClick={onSave}
          disabled={isPending}
          className="h-12 w-full rounded-full border-0 bg-brand-mantis px-6 text-base font-extrabold text-brand-forest shadow-[0_10px_28px_rgb(111_219_66/0.45)] ring-2 ring-brand-mantis/40 ring-offset-2 ring-offset-white/40 transition-[transform,box-shadow,filter] hover:bg-[#7ee34f] hover:shadow-[0_14px_34px_rgb(111_219_66/0.55)] active:scale-[0.98] disabled:opacity-70 sm:h-11 sm:w-auto sm:min-w-44"
        >
          {isPending ? <Loader2 className="size-5 animate-spin" /> : <Save className="size-5" />}
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
      <div className="ios-glass-pane space-y-1 rounded-[1.35rem] px-4 py-4 sm:rounded-[1.5rem] sm:px-5">
        <h2 className="text-lg font-extrabold text-zinc-900">{title}</h2>
        <p className="text-sm leading-6 text-zinc-600">{description}</p>
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
        "ios-glass-pane rounded-[1.35rem] border-white/80 p-4 sm:rounded-[1.5rem] sm:p-5",
        className,
      )}
    >
      <div className="mb-4 space-y-1">
        <h3 className="text-sm font-extrabold text-zinc-900">{title}</h3>
        {description ? (
          <p className="text-xs leading-5 text-zinc-600">{description}</p>
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
      <Label className="text-sm font-semibold text-zinc-800">{label}</Label>
      {children}
      {hint ? <p className="text-xs text-zinc-500">{hint}</p> : null}
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
