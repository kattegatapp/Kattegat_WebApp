"use client";

import {
  csv,
  SettingsGroup,
  SettingsLoading,
  SettingsPanel,
  SettingsSaveBar,
  SettingsLoadError,
  TextAreaField,
  TextField,
  useAdminSettingsSection,
} from "@/features/admin/settings/form-shared";

export function SettingsMetadataForm({ embedded = false }: { embedded?: boolean }) {
  const { query, sectionData, mutation, updateField, save } = useAdminSettingsSection("metadata");

  if (query.isPending) return <SettingsLoading />;
  if (query.isError || !sectionData) return <SettingsLoadError error={query.error} />;

  const body = (
    <>
      <SettingsPanel
        title="Metadata"
        description="Search and social preview text for the public website."
      >
        <SettingsGroup title="SEO & sharing">
          <TextField
            label="Page title"
            value={sectionData.title}
            onChange={(value) => updateField("title", value)}
            className="sm:col-span-2"
          />
          <TextAreaField
            label="Description"
            value={sectionData.description}
            onChange={(value) => updateField("description", value)}
            hint="Shown in Google and link previews."
          />
          <TextField
            label="Keywords"
            value={sectionData.keywords.join(", ")}
            onChange={(value) => updateField("keywords", csv(value))}
            hint="Separate with commas"
            className="sm:col-span-2"
            placeholder="dubai, events, talent…"
          />
          <TextField
            label="Preview image URL"
            type="url"
            value={sectionData.ogImageUrl ?? ""}
            onChange={(value) => updateField("ogImageUrl", value || null)}
            className="sm:col-span-2"
            placeholder="https://"
          />
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
