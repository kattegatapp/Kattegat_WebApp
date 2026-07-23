"use client";

import {
  csv,
  NumberField,
  SettingsGroup,
  SettingsLoadError,
  SettingsLoading,
  SettingsPanel,
  SettingsSaveBar,
  SwitchField,
  TextField,
  useAdminSettingsSection,
} from "@/features/admin/settings/form-shared";

export function SettingsOperationsForm({ embedded = false }: { embedded?: boolean }) {
  const { query, sectionData, mutation, updateField, save } =
    useAdminSettingsSection("operations");

  if (query.isPending) return <SettingsLoading />;
  if (query.isError || !sectionData) return <SettingsLoadError error={query.error} />;

  const body = (
    <>
      <SettingsPanel
        title="Operations"
        description="Defaults, app versions, limits, and commercial baselines."
      >
        <SettingsGroup title="Market defaults" description="Where and how money defaults.">
          <TextField
            label="Currency"
            value={sectionData.defaultCurrency}
            onChange={(value) => updateField("defaultCurrency", value.toUpperCase())}
            placeholder="AED"
          />
          <TextField
            label="Country"
            value={sectionData.defaultCountry}
            onChange={(value) => updateField("defaultCountry", value)}
          />
          <TextField
            label="City"
            value={sectionData.defaultCity}
            onChange={(value) => updateField("defaultCity", value)}
          />
          <TextField
            label="Timezone"
            value={sectionData.timezone}
            onChange={(value) => updateField("timezone", value)}
            placeholder="Asia/Dubai"
          />
        </SettingsGroup>

        <SettingsGroup title="App versions" description="Mobile upgrade rules.">
          <TextField
            label="Minimum version"
            value={sectionData.minimumAppVersion ?? ""}
            onChange={(value) => updateField("minimumAppVersion", value || null)}
          />
          <TextField
            label="Latest version"
            value={sectionData.latestAppVersion ?? ""}
            onChange={(value) => updateField("latestAppVersion", value || null)}
          />
          <NumberField
            label="Minimum build number (iOS)"
            value={sectionData.minimumSupportedBuildNumberIos}
            onChange={(value) => updateField("minimumSupportedBuildNumberIos", value)}
            hint="iOS buildNumber, not the marketing version."
          />
          <NumberField
            label="Minimum build number (Android)"
            value={sectionData.minimumSupportedBuildNumberAndroid}
            onChange={(value) => updateField("minimumSupportedBuildNumberAndroid", value)}
            hint="Android versionCode — increments independently from iOS, set separately."
          />
          <SwitchField
            label="Force upgrade"
            description="Block only users below the minimum version or build number for their platform."
            checked={sectionData.forceUpgrade}
            onChange={(value) => updateField("forceUpgrade", value)}
          />
        </SettingsGroup>

        <SettingsGroup title="Limits & commercial" description="Quotas and fee baselines.">
          <NumberField
            label="Max listing photos"
            value={sectionData.maxListingPhotosDefault}
            onChange={(value) => updateField("maxListingPhotosDefault", value ?? 1)}
          />
          <NumberField
            label="Max video links"
            value={sectionData.maxVideoLinksDefault}
            onChange={(value) => updateField("maxVideoLinksDefault", value ?? 0)}
          />
          <NumberField
            label="Max requirement attachments"
            value={sectionData.maxRequirementAttachments}
            onChange={(value) => updateField("maxRequirementAttachments", value ?? 0)}
          />
          <NumberField
            label="Commission rate (0–1)"
            value={sectionData.commissionRate}
            step="0.01"
            hint="Fraction of deal value. Example: 0.05 = 5%."
            onChange={(value) => updateField("commissionRate", value ?? 0)}
          />
          <NumberField
            label="Platform fee (fils)"
            value={sectionData.platformFee}
            step="1"
            hint="Integer fils (100 fils = 1 AED). Not a percentage."
            onChange={(value) => updateField("platformFee", value ?? 0)}
          />
          <TextField
            label="Allowed countries"
            value={sectionData.allowedCountries.join(", ")}
            onChange={(value) => updateField("allowedCountries", csv(value))}
            hint="Comma-separated"
            className="sm:col-span-2"
          />
          <TextField
            label="Blocked email domains"
            value={sectionData.blockedEmailDomains.join(", ")}
            onChange={(value) => updateField("blockedEmailDomains", csv(value.toLowerCase()))}
            hint="Comma-separated"
            className="sm:col-span-2"
          />
        </SettingsGroup>

        <SettingsGroup
          title="Discovery ranking"
          description="Control how services and sellers appear in search and on Home. Order follows your plans: White Glove, then Premium, then Starter — with reviews, freshness, and a short newcomer boost. Raise a weight to strengthen that signal."
        >
          <NumberField
            label="White Glove curated weight"
            value={sectionData.rankingWeightFeatured ?? 100}
            step="1"
            hint="Home feed only — lifts White Glove (managed) sellers above Premium and Starter."
            onChange={(value) => updateField("rankingWeightFeatured", value ?? 100)}
          />
          <NumberField
            label="Reviews weight"
            value={sectionData.rankingWeightReviews ?? 40}
            step="1"
            hint="Stronger ratings with more reviews surface higher."
            onChange={(value) => updateField("rankingWeightReviews", value ?? 40)}
          />
          <NumberField
            label="Premium priority weight"
            value={sectionData.rankingWeightProPriority ?? 30}
            step="1"
            hint="Uses Pricing → Priority search for Premium/Pro (and Launch access when on)."
            onChange={(value) => updateField("rankingWeightProPriority", value ?? 30)}
          />
          <NumberField
            label="Recency weight"
            value={sectionData.rankingWeightRecency ?? 20}
            step="1"
            hint="Newer live listings surface higher."
            onChange={(value) => updateField("rankingWeightRecency", value ?? 20)}
          />
          <NumberField
            label="Newcomer weight"
            value={sectionData.rankingWeightNewcomer ?? 10}
            step="1"
            hint="Small boost so new sellers can still get a first review."
            onChange={(value) => updateField("rankingWeightNewcomer", value ?? 10)}
          />
          <NumberField
            label="Newcomer window (days)"
            value={sectionData.rankingNewcomerDays ?? 30}
            step="1"
            hint="Sellers created within this window (or with zero reviews) get the newcomer boost."
            onChange={(value) => updateField("rankingNewcomerDays", value ?? 30)}
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
