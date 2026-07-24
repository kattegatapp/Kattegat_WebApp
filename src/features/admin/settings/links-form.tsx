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

const LINK_GROUPS = [
  {
    title: "Apps & web",
    description: "Where people open Kattegat.",
    keys: [
      { key: "webAppUrl" as const, label: "Website", required: true },
      { key: "mobileAppUrl" as const, label: "Mobile app page", required: false },
      { key: "appStoreUrl" as const, label: "App Store", required: false },
      { key: "playStoreUrl" as const, label: "Google Play", required: false },
    ],
  },
  {
    title: "Legal & support",
    description: "Policies and help channels.",
    keys: [
      { key: "termsUrl" as const, label: "Terms of use", required: false },
      { key: "privacyUrl" as const, label: "Privacy policy", required: false },
      { key: "supportWhatsappUrl" as const, label: "VIP Support WhatsApp", required: false },
    ],
  },
  {
    title: "Social",
    description: "Optional public profiles.",
    keys: [
      { key: "instagramUrl" as const, label: "Instagram", required: false },
      { key: "linkedinUrl" as const, label: "LinkedIn", required: false },
    ],
  },
];

export function SettingsLinksForm({ embedded = false }: { embedded?: boolean }) {
  const { query, sectionData, mutation, updateField, save } = useAdminSettingsSection("links");

  if (query.isPending) return <SettingsLoading />;
  if (query.isError || !sectionData) return <SettingsLoadError error={query.error} />;

  const body = (
    <>
      <SettingsPanel
        title="Links"
        description="Public URLs for the website, stores, legal pages, and social."
      >
        {LINK_GROUPS.map((group) => (
          <SettingsGroup key={group.title} title={group.title} description={group.description}>
            {group.keys.map((item) => (
              <TextField
                key={item.key}
                label={item.label}
                type="url"
                value={sectionData[item.key] ?? ""}
                onChange={(value) =>
                  updateField(item.key, item.required ? value : value || null)
                }
                placeholder="https://"
              />
            ))}
          </SettingsGroup>
        ))}
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
