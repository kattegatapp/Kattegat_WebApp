import type { Metadata } from "next";
import Link from "next/link";
import { Mail, ShieldCheck, Smartphone, Trash2 } from "lucide-react";

import { LegalPageShell, LegalSection } from "@/components/legal/legal-page-shell";
import { getPublicAppSettings } from "@/lib/api/settings";

export const metadata: Metadata = {
  title: "Delete Your Account | Kattegat",
  description:
    "How to permanently delete your Kattegat account and what happens to your data when you do.",
};

export default async function DeleteAccountPage() {
  const settings = await getPublicAppSettings();
  const supportEmail = settings.brand.supportEmail;

  return (
    <LegalPageShell
      eyebrow="Account deletion"
      title="Delete your Kattegat account"
      description="You can request deletion of your Kattegat account and associated profile data at any time, whether you signed up as a buyer, a seller, or both."
      updatedLabel="Last updated · 10 July 2026"
    >
      <LegalSection title="Option 1 — Delete it in the app">
        <div className="flex items-start gap-3 rounded-2xl border border-brand-forest/10 bg-white/60 p-4">
          <Smartphone className="mt-0.5 h-5 w-5 shrink-0 text-brand-blue" />
          <p>
            Open the Kattegat app and go to <strong className="text-brand-forest">Profile → Settings → Delete Account</strong>.
            Confirm the deletion when prompted. This is the fastest way to remove your account and takes effect
            immediately.
          </p>
        </div>
      </LegalSection>

      <LegalSection title="Option 2 — Request deletion by email">
        <div className="flex items-start gap-3 rounded-2xl border border-brand-forest/10 bg-white/60 p-4">
          <Mail className="mt-0.5 h-5 w-5 shrink-0 text-brand-blue" />
          <div>
            <p>
              If you can&apos;t access the app, email{" "}
              <a href={`mailto:${supportEmail}?subject=Delete%20My%20Account`} className="font-semibold text-brand-forest underline underline-offset-2">
                {supportEmail}
              </a>{" "}
              from the address registered on your account with the subject line{" "}
              <strong className="text-brand-forest">&quot;Delete My Account&quot;</strong>.
            </p>
            <p className="mt-3">
              Please include your registered email address or phone number so we can verify the request. We
              process email deletion requests within 30 days and will confirm once your account has been removed.
            </p>
          </div>
        </div>
      </LegalSection>

      <LegalSection title="What gets deleted">
        <ul className="list-disc space-y-2 pl-5">
          <li>Your profile is deactivated immediately and removed from search, discovery, and listings.</li>
          <li>Your name, username, phone number, and profile photo are permanently removed.</li>
          <li>Your portfolio, listings, and reviews you&apos;ve written are removed from public view.</li>
          <li>Push notification tokens and device sessions tied to your account are revoked.</li>
        </ul>
      </LegalSection>

      <LegalSection title="What we retain, and why">
        <div className="flex items-start gap-3 rounded-2xl border border-brand-forest/10 bg-white/60 p-4">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-brand-blue" />
          <p>
            Some records can&apos;t be erased on request because we&apos;re required to keep them, or because
            deleting them would affect another user&apos;s legitimate record. This includes:
          </p>
        </div>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong className="text-brand-forest">Bookings, invoices, and payment records</strong> — retained as
            required for UAE tax, accounting, and financial reporting obligations, and to resolve disputes.
          </li>
          <li>
            <strong className="text-brand-forest">Active bookings or open disputes</strong> — please complete or
            cancel any active bookings before requesting deletion; we may delay deletion until they&apos;re
            resolved.
          </li>
          <li>
            <strong className="text-brand-forest">Chat messages sent to other users</strong> — the conversation
            may remain visible to the other participant, with your identity anonymized.
          </li>
          <li>
            <strong className="text-brand-forest">Fraud-prevention and safety records</strong> — limited account
            identifiers may be retained for a limited period to prevent abuse of the platform.
          </li>
        </ul>
        <p>
          See our <Link href="/privacy-policy" className="font-semibold text-brand-forest underline underline-offset-2">Privacy Policy</Link>{" "}
          for the full detail on data retention.
        </p>
      </LegalSection>

      <LegalSection title="Questions">
        <div className="flex items-start gap-3 rounded-2xl border border-brand-forest/10 bg-white/60 p-4">
          <Trash2 className="mt-0.5 h-5 w-5 shrink-0 text-brand-blue" />
          <p>
            If you have questions about this process, contact us at{" "}
            <a href={`mailto:${supportEmail}`} className="font-semibold text-brand-forest underline underline-offset-2">
              {supportEmail}
            </a>
            .
          </p>
        </div>
      </LegalSection>
    </LegalPageShell>
  );
}
