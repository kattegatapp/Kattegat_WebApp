"use client";

import {
  SettingsGroup,
  SettingsLoading,
  SettingsPanel,
  SettingsSaveBar,
  SettingsLoadError,
  TextField,
  useAdminSettingsSection,
} from "@/features/admin/settings/form-shared";

export function SettingsBrandForm({ embedded = false }: { embedded?: boolean }) {
  const { query, sectionData, mutation, updateField, save } = useAdminSettingsSection("brand");

  if (query.isPending) return <SettingsLoading />;
  if (query.isError || !sectionData) return <SettingsLoadError error={query.error} />;

  const body = (
    <>
      <SettingsPanel
        title="Brand"
        description="How Kattegat is named and contacted across the product."
      >
        <SettingsGroup title="Identity" description="Public labels people see first.">
          <TextField
            label="Site name"
            value={sectionData.siteName}
            onChange={(value) => updateField("siteName", value)}
            placeholder="Kattegat"
          />
          <TextField
            label="Legal name"
            value={sectionData.legalName}
            onChange={(value) => updateField("legalName", value)}
          />
          <TextField
            label="Tagline"
            value={sectionData.tagline}
            onChange={(value) => updateField("tagline", value)}
            className="sm:col-span-2"
          />
          <TextField
            label="Market"
            value={sectionData.market}
            onChange={(value) => updateField("market", value)}
            placeholder="Dubai / UAE"
          />
        </SettingsGroup>

        <SettingsGroup title="Support contacts" description="Where people reach you for help.">
          <TextField
            label="Support email"
            type="email"
            value={sectionData.supportEmail}
            onChange={(value) => updateField("supportEmail", value)}
            placeholder="support@kattegat.app"
          />
          <TextField
            label="Support phone"
            value={sectionData.supportPhone ?? ""}
            onChange={(value) => updateField("supportPhone", value || null)}
            placeholder="+971…"
          />
        </SettingsGroup>

        <SettingsGroup title="Chat identity" description="Branding users see when Kattegat.Vetted messages them.">
          <TextField
            label="Chat logo URL"
            type="url"
            value={sectionData.chatLogoUrl ?? ""}
            onChange={(value) => updateField("chatLogoUrl", value || null)}
            placeholder="https://kattegat.app/brand/vetted-chat-logo.png"
            className="sm:col-span-2"
          />
          <p className="text-xs leading-5 text-muted-foreground sm:col-span-2">Leave this empty to use the bundled official Vetted logo automatically. Use a public HTTPS image URL so the mobile app can display it.</p>
        </SettingsGroup>
      </SettingsPanel>

      <SettingsSaveBar
        isPending={mutation.isPending}
        isSuccess={mutation.isSuccess}
        isError={mutation.isError}
        errorMessage={mutation.error instanceof Error ? mutation.error.message : undefined}
        onSave={save}
      />
    </>
  );

  if (embedded) return body;
  return <div className="mx-auto w-full max-w-4xl">{body}</div>;
}
