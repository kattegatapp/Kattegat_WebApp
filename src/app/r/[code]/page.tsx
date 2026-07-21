import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { ReferralLandingClient } from "@/features/auth/referral-landing-client";

type PageProps = {
  params: Promise<{ code: string }>;
};

export const metadata: Metadata = {
  title: "Kattegat invitation",
  description: "Open your Kattegat referral invitation in the app or continue on the web.",
  robots: { index: false, follow: true },
};

/** Public referral share link — opens the app when installed, otherwise web registration. */
export default async function ReferralLandingPage({ params }: PageProps) {
  const { code } = await params;
  const cleaned = code.trim().toUpperCase();
  if (!/^[A-Z0-9_-]{1,40}$/.test(cleaned)) redirect("/register");

  const encodedCode = encodeURIComponent(cleaned);
  const webHref = `/register?ref=${encodedCode}`;
  const userAgent = (await headers()).get("user-agent") ?? "";
  const isMobile = /Android|iPhone|iPad|iPod/i.test(userAgent);

  if (!isMobile) redirect(webHref);

  const appHref = `kattegat://register?ref=${encodedCode}`;
  const handoffScript = `(() => {
    const appHref = ${JSON.stringify(appHref)};
    const webHref = ${JSON.stringify(webHref)};
    let appOpened = false;
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") appOpened = true;
    }, { once: true });
    window.location.href = appHref;
    window.setTimeout(() => {
      if (!appOpened && document.visibilityState === "visible") window.location.replace(webHref);
    }, 1600);
  })();`;

  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: handoffScript }} />
      <ReferralLandingClient code={cleaned} />
    </>
  );
}
