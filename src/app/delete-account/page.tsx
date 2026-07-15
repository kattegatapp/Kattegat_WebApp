import type { Metadata } from "next";
import Link from "next/link";
import { Mail, Route, ShieldCheck, Smartphone } from "lucide-react";

import { LegalCallout, LegalPageShell, LegalSection } from "@/features/legal";
import { getPublicAppSettings } from "@/lib/api/settings";

export const metadata: Metadata = {
  title: "Delete Your Account | Kattegat",
  description:
    "Exact steps to permanently delete your Kattegat account in the mobile app, plus what is removed and what must be retained.",
};

export default async function DeleteAccountPage() {
  const settings = await getPublicAppSettings();
  const supportEmail = settings.brand.supportEmail;

  return (
    <LegalPageShell
      eyebrow="Account"
      title="Delete your Kattegat account"
      description="You can permanently close your Kattegat account at any time — whether you use it as a buyer, a seller, or both. This page explains the exact in-app path, email alternative, and what happens to your data."
      updatedLabel="Last updated · 15 July 2026"
    >
      <LegalSection title="Exact route in the mobile app">
        <LegalCallout icon={Route}>
          <p>
            Account deletion lives on the <strong className="font-semibold text-brand-forest">Settings</strong>{" "}
            screen. There is no separate deep-link screen; deletion is confirmed with an in-app sheet on that
            page.
          </p>
        </LegalCallout>

        <ol className="list-decimal space-y-3 pl-5 marker:font-semibold marker:text-brand-forest">
          <li>
            Open the Kattegat app and sign in.
          </li>
          <li>
            Go to the <strong className="font-semibold text-brand-forest">Profile</strong> tab (bottom navigation).
          </li>
          <li>
            Tap <strong className="font-semibold text-brand-forest">Settings</strong>.
          </li>
          <li>
            Scroll to the <strong className="font-semibold text-brand-forest">Account</strong> section at the
            bottom of Settings.
          </li>
          <li>
            Tap <strong className="font-semibold text-brand-forest">Delete account</strong>.
          </li>
          <li>
            Confirm in the bottom sheet by tapping{" "}
            <strong className="font-semibold text-brand-forest">Yes, delete my account</strong>.
          </li>
        </ol>

        <LegalCallout icon={Smartphone}>
          <p>
            After confirmation, Kattegat deletes your account, signs you out on this device, clears the local
            session, and returns you to the login screen. Your profile is closed and no longer usable for
            marketplace activity.
          </p>
        </LegalCallout>
      </LegalSection>

      <LegalSection title="Path summary">
        <p className="rounded-xl border border-brand-forest/10 bg-white px-4 py-3 font-medium text-brand-forest">
          Profile → Settings → Account → Delete account → Yes, delete my account
        </p>
        <p>
          Equivalent navigation labels in the product:{" "}
          <strong className="font-semibold text-brand-forest">Profile</strong> tab →{" "}
          <strong className="font-semibold text-brand-forest">Settings</strong> →{" "}
          <strong className="font-semibold text-brand-forest">Delete account</strong>.
        </p>
      </LegalSection>

      <LegalSection title="Request deletion by email">
        <LegalCallout icon={Mail}>
          <p>
            If you cannot access the app, email{" "}
            <a
              href={`mailto:${supportEmail}?subject=Delete%20My%20Account`}
              className="font-semibold text-brand-forest underline underline-offset-2"
            >
              {supportEmail}
            </a>{" "}
            from your registered address with subject{" "}
            <strong className="font-semibold text-brand-forest">&quot;Delete My Account&quot;</strong>.
          </p>
          <p>
            Include your registered email and, if you have them, your BID/SID or phone number so we can verify
            ownership. We process email deletion requests within <strong className="font-semibold text-brand-forest">30 days</strong>{" "}
            and confirm when the account has been closed.
          </p>
        </LegalCallout>
      </LegalSection>

      <LegalSection title="What gets deleted or cleared">
        <ul className="list-disc space-y-2 pl-5 marker:text-brand-forest/40">
          <li>
            Account status is set to <strong className="font-semibold text-brand-forest">deleted</strong> so the
            profile can no longer be used.
          </li>
          <li>Username, phone number, and profile photo URL are cleared from your user record.</li>
          <li>You are signed out; device sessions / push access for that login should no longer work.</li>
          <li>Your presence is removed from active marketplace use (search, discovery, new bookings under that account).</li>
          <li>We send a confirmation email to the address on file when deletion succeeds.</li>
        </ul>
      </LegalSection>

      <LegalSection title="What we may retain, and why">
        <LegalCallout icon={ShieldCheck}>
          <p>
            Some records cannot be erased immediately or entirely because of UAE financial rules, safety, or
            because another user still has a legitimate copy of the interaction.
          </p>
        </LegalCallout>
        <ul className="list-disc space-y-2 pl-5 marker:text-brand-forest/40">
          <li>
            <strong className="font-semibold text-brand-forest">Bookings, invoices, quotes, and payment records</strong>{" "}
            — retained for tax, accounting, dispute resolution, and financial reporting. Money-related tables are
            designed for soft-delete / audit retention, not destructive wipe of settlement history.
          </li>
          <li>
            <strong className="font-semibold text-brand-forest">Active bookings or open disputes</strong> — finish or
            cancel these before deleting when possible; we may delay full closure until they are resolved.
          </li>
          <li>
            <strong className="font-semibold text-brand-forest">Chat history with other users</strong> — messages may
            remain visible to the other participant, with your identity anonymized where practicable.
          </li>
          <li>
            <strong className="font-semibold text-brand-forest">Fraud, ban, and safety signals</strong> — limited
            identifiers may be kept for a period to prevent re-abuse of the platform.
          </li>
          <li>
            <strong className="font-semibold text-brand-forest">Legal holds</strong> — data may be preserved if we
            receive a valid legal request or need to defend claims.
          </li>
        </ul>
        <p>
          Full privacy detail:{" "}
          <Link
            href="/privacy-policy"
            className="font-semibold text-brand-forest underline underline-offset-2"
          >
            Privacy Policy
          </Link>
          .
        </p>
      </LegalSection>

      <LegalSection title="Before you delete">
        <ul className="list-disc space-y-2 pl-5 marker:text-brand-forest/40">
          <li>Download or save any invoices/quotes you need for your records.</li>
          <li>Cancel or complete open bookings and applications.</li>
          <li>If you subscribe to Premium/Pro, manage cancellation via the billing channel you used (usually web/Stripe) so renewals stop.</li>
          <li>Deletion is irreversible for your live marketplace profile.</li>
        </ul>
      </LegalSection>

      <LegalSection title="Questions">
        <p>
          Contact{" "}
          <a
            href={`mailto:${supportEmail}`}
            className="font-semibold text-brand-forest underline underline-offset-2"
          >
            {supportEmail}
          </a>{" "}
          for help with deletion, billing, or retained records. Also review our{" "}
          <Link
            href="/terms-of-service"
            className="font-semibold text-brand-forest underline underline-offset-2"
          >
            Terms of Service
          </Link>
          .
        </p>
      </LegalSection>
    </LegalPageShell>
  );
}
