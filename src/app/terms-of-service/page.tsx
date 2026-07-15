import type { Metadata } from "next";
import Link from "next/link";

import { LegalPageShell, LegalSection } from "@/features/legal";
import { getPublicAppSettings } from "@/lib/api/settings";

export const metadata: Metadata = {
  title: "Terms of Service | Kattegat",
  description:
    "The terms that govern use of the Kattegat marketplace across mobile apps and the website.",
};

export default async function TermsOfServicePage() {
  const settings = await getPublicAppSettings();
  const supportEmail = settings.brand.supportEmail;
  const legalName =
    settings.brand.legalName === "Kattegat"
      ? "Hidden Diversion Recreational Services"
      : settings.brand.legalName;
  const siteName = settings.brand.siteName || "Kattegat";

  return (
    <LegalPageShell
      eyebrow="Legal"
      title="Terms of Service"
      description={`These Terms govern your access to and use of ${siteName} — our mobile apps (iOS and Android) and website. By creating an account or using Kattegat, you agree to these Terms.`}
      updatedLabel="Last updated · 15 July 2026"
    >
      <LegalSection title="1. Agreement to these Terms">
        <p>
          These Terms of Service (&quot;Terms&quot;) form a binding agreement between you and {legalName}{" "}
          (&quot;Kattegat&quot;, &quot;we&quot;, &quot;us&quot;), operating in Dubai, United Arab Emirates.
        </p>
        <p>
          If you do not agree, do not create an account or use the platform. If you use Kattegat on behalf of a
          business, you confirm you have authority to bind that business to these Terms.
        </p>
      </LegalSection>

      <LegalSection title="2. What Kattegat is">
        <p>
          Kattegat is a direct marketplace connecting hospitality and event talent (&quot;sellers&quot;) with
          clients (&quot;buyers&quot;). Core product areas include:
        </p>
        <ul className="list-disc space-y-2 pl-5 marker:text-brand-forest/40">
          <li>Seller profiles, service listings, media, search, and discovery</li>
          <li>Buyer requirements and seller applications (reverse marketplace)</li>
          <li>Inquiries and messaging (including Contact Agent / managed flows where applicable)</li>
          <li>Quotes, invoices, bookings, and related seller tools (tier-dependent)</li>
          <li>Reviews and ratings (when enabled)</li>
          <li>Subscriptions, payments, and plan entitlements (when enabled)</li>
          <li>Referral, Founding Member, Recommend &amp; Earn, and Kattegat Vetted / White Glove programmes</li>
        </ul>
        <p>
          Kattegat is a technology and marketplace platform. Except where we expressly operate a managed service
          (for example White Glove / Vetted engagements), we are not the seller of listed services and are not a
          party to contracts between buyers and sellers.
        </p>
      </LegalSection>

      <LegalSection title="3. Eligibility">
        <ul className="list-disc space-y-2 pl-5 marker:text-brand-forest/40">
          <li>You must be at least 18 years old.</li>
          <li>You must provide accurate registration information and keep it up to date.</li>
          <li>
            You are responsible for safeguarding your login credentials and for activity under your account.
          </li>
          <li>
            One natural person or business entity should not create multiple accounts to evade bans, limits, or
            fraud controls.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="4. Accounts, identities &amp; roles">
        <p>
          Kattegat uses a dual-identity model: one account may hold a buyer identity (BID) and/or a seller
          identity (SID). Switching identity in the app is for workflow convenience only — it is not a security
          boundary. Server-side permissions and entitlements control what you can do.
        </p>
        <p>
          Seller capabilities (listings limits, media, direct chat, reviews, seller tools, priority in discovery,
          and similar) depend on your plan tier — currently Starter, Premium/Pro, and White Glove (managed) —
          and on feature flags we may enable or disable for the platform.
        </p>
      </LegalSection>

      <LegalSection title="5. Seller obligations">
        <ul className="list-disc space-y-2 pl-5 marker:text-brand-forest/40">
          <li>Listings and profile content must be accurate, lawful, and not misleading.</li>
          <li>
            You may only offer services you are legally allowed to provide in the relevant jurisdiction (including
            UAE licensing / visa / commercial rules that apply to you).
          </li>
          <li>
            Media you upload must be owned by you or used with permission. You grant Kattegat a licence to host,
            display, and distribute that media as needed to operate the marketplace.
          </li>
          <li>
            New listings may be subject to moderation before going live. We may reject, unpublish, or remove
            content that violates these Terms or our policies.
          </li>
          <li>
            Starter sellers may not always receive direct client chat; Contact Agent / Vetted flows may apply as
            designed for that tier.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="6. Buyer obligations">
        <ul className="list-disc space-y-2 pl-5 marker:text-brand-forest/40">
          <li>Provide truthful requirement posts and inquiry details.</li>
          <li>Use messaging and Contact Agent channels for legitimate booking purposes only.</li>
          <li>
            Honour legitimate quote / booking commitments you accept through the platform tools, subject to the
            terms you agree with the seller.
          </li>
          <li>Do not harass sellers, spam inquiries, or attempt to circumvent safety or payment protections.</li>
        </ul>
      </LegalSection>

      <LegalSection title="7. Marketplace dealings between users">
        <p>
          Buyers and sellers are responsible for negotiating, performing, and settling their engagements —
          including scope, price, timing, cancellations, and local compliance — except where Kattegat Vetted /
          White Glove expressly manages the engagement under agreed commercial terms.
        </p>
        <p>
          Kattegat does not guarantee the quality, safety, or legality of user-provided services, nor that any
          listing or requirement will result in a booking.
        </p>
      </LegalSection>

      <LegalSection title="8. Subscriptions, payments &amp; fees">
        <p>
          Paid plans and add-ons (when enabled) are billed primarily through web checkout (for example Stripe).
          Mobile apps unlock entitlements from our backend after payment succeeds; they are not intended as an
          App Store / Play Store in-app purchase storefront for subscriptions at launch.
        </p>
        <ul className="list-disc space-y-2 pl-5 marker:text-brand-forest/40">
          <li>Prices, limits, and feature flags are configurable and may change with reasonable notice.</li>
          <li>Amounts related to platform billing are handled in AED fils internally where applicable.</li>
          <li>
            Card data is processed by our payment provider; we do not store full card numbers on Kattegat
            servers.
          </li>
          <li>
            Refunds, chargebacks, and subscription changes follow our payment provider&apos;s process and any
            plan terms shown at checkout.
          </li>
          <li>
            Referral / Recommend rewards, when offered, are subject to separate programme rules, fraud checks, and
            (in early versions) may be paid manually after verification.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="9. Messaging, Contact Agent &amp; Vetted">
        <p>
          Direct messaging may be limited by seller tier and feature settings. Contact Agent routes certain buyer
          inquiries to Kattegat operators. White Glove / Vetted is a managed-service lane; application acceptance
          is discretionary.
        </p>
        <p>
          You must not use chat to share illegal content, malware, or abusive material. We may review reports and
          take enforcement action.
        </p>
      </LegalSection>

      <LegalSection title="10. Reviews &amp; community trust">
        <p>
          When reviews are enabled, buyers may leave ratings and written feedback subject to moderation. Sellers
          may have a limited right of reply where the product allows it. Fake reviews, review manipulation, and
          harassment via reviews are prohibited.
        </p>
      </LegalSection>

      <LegalSection title="11. Prohibited conduct">
        <p>You agree not to:</p>
        <ul className="list-disc space-y-2 pl-5 marker:text-brand-forest/40">
          <li>Violate UAE or applicable law, or facilitate illegal activity</li>
          <li>Scrape, reverse engineer, or overload the platform without permission</li>
          <li>Impersonate others, misrepresent affiliation with Kattegat, or forge identity data</li>
          <li>Circumvent subscription, moderation, or Contact Agent rules dishonestly</li>
          <li>Upload malware or attempt unauthorised access to accounts or systems</li>
          <li>Use Kattegat for spam, phishing, or unlawful solicitation</li>
        </ul>
      </LegalSection>

      <LegalSection title="12. Intellectual property">
        <p>
          Kattegat branding, product design, software, and documentation remain our property (or our licensors).
          You retain ownership of content you upload, while granting us the licence needed to operate and promote
          the marketplace (including displaying listings in search and marketing surfaces where appropriate).
        </p>
      </LegalSection>

      <LegalSection title="13. Suspension &amp; termination">
        <p>
          We may suspend or terminate access for Terms violations, fraud risk, legal requirements, or platform
          integrity. You may delete your account at any time as described on our{" "}
          <Link href="/delete-account" className="font-semibold text-brand-forest underline underline-offset-2">
            Delete Account
          </Link>{" "}
          page. Some records may be retained as explained in our Privacy Policy.
        </p>
      </LegalSection>

      <LegalSection title="14. Disclaimers">
        <p>
          Kattegat is provided on an &quot;as is&quot; and &quot;as available&quot; basis. To the fullest extent
          permitted by UAE law, we disclaim warranties of uninterrupted availability, fitness for a particular
          purpose, and non-infringement. Feature flags (for example payments or reviews) may be off during
          launch phases.
        </p>
      </LegalSection>

      <LegalSection title="15. Limitation of liability">
        <p>
          To the fullest extent permitted by applicable law, Kattegat and {legalName} will not be liable for
          indirect, incidental, special, consequential, or punitive damages, or for lost profits, lost data, or
          business interruption arising from your use of the platform or dealings between users. Our aggregate
          liability for claims relating to the service is limited to the greater of (a) amounts you paid us for
          platform subscriptions in the 12 months before the claim, or (b) AED 500, except where liability cannot
          be limited by law.
        </p>
      </LegalSection>

      <LegalSection title="16. Indemnity">
        <p>
          You agree to indemnify and hold harmless Kattegat and {legalName} from claims arising out of your
          content, your services, your breach of these Terms, or your violation of law or third-party rights.
        </p>
      </LegalSection>

      <LegalSection title="17. Privacy">
        <p>
          Personal data is handled as described in our{" "}
          <Link href="/privacy-policy" className="font-semibold text-brand-forest underline underline-offset-2">
            Privacy Policy
          </Link>
          .
        </p>
      </LegalSection>

      <LegalSection title="18. Changes">
        <p>
          We may update these Terms as the product evolves. We will revise the &quot;Last updated&quot; date and,
          for material changes, provide notice in-app or by email where practical. Continued use after the
          effective date constitutes acceptance.
        </p>
      </LegalSection>

      <LegalSection title="19. Governing law">
        <p>
          These Terms are governed by the laws of the United Arab Emirates as applicable in the Emirate of Dubai.
          Courts of Dubai have exclusive jurisdiction, without prejudice to mandatory consumer protections that
          cannot be waived.
        </p>
      </LegalSection>

      <LegalSection title="20. Contact">
        <p>
          Questions about these Terms:{" "}
          <a
            href={`mailto:${supportEmail}`}
            className="font-semibold text-brand-forest underline underline-offset-2"
          >
            {supportEmail}
          </a>
          .
        </p>
      </LegalSection>
    </LegalPageShell>
  );
}
