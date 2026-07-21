import type { Metadata } from "next";
import { Suspense } from "react";

import { MemberAuthShell } from "@/features/auth/member-auth-shell";
import { MemberLoginForm } from "@/features/auth/member-login-form";
import { redirectAuthenticatedMember } from "@/lib/auth/member-gate";

export const metadata: Metadata = {
  title: "Sign in | Kattegat",
  description: "Sign in to your Kattegat account on the web.",
};

type PageProps = {
  searchParams: Promise<{ next?: string }>;
};

export default async function LoginPage({ searchParams }: PageProps) {
  const params = await searchParams;
  await redirectAuthenticatedMember(params.next);

  return (
    <MemberAuthShell
      title="Welcome back"
      description="Sign in with your Kattegat account — buyer, seller, or both on the same login."
    >
      <Suspense fallback={<div className="h-40 animate-pulse rounded-xl bg-brand-forest/5" />}>
        <MemberLoginForm />
      </Suspense>
    </MemberAuthShell>
  );
}
