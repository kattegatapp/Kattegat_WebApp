import { redirect } from "next/navigation";

type PageProps = {
  params: Promise<{ code: string }>;
};

/** Public referral share link — lands on register with the code prefilled. */
export default async function ReferralLandingPage({ params }: PageProps) {
  const { code } = await params;
  const cleaned = code.trim().toUpperCase();
  if (!cleaned) redirect("/register");
  redirect(`/register?ref=${encodeURIComponent(cleaned)}`);
}
