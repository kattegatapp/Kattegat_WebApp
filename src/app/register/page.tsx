import type { Metadata } from "next";
import { Suspense } from "react";

import { MemberAuthShell } from "@/features/auth/member-auth-shell";
import { MemberRegisterForm } from "@/features/auth/member-register-form";
import { redirectAuthenticatedMember } from "@/lib/auth/member-gate";

export const metadata: Metadata = {
  title: "Create account | Kattegat",
  description: "Create a Kattegat buyer or seller account on the web.",
};

type PageProps = {
  searchParams: Promise<{ next?: string }>;
};

export default async function RegisterPage({ searchParams }: PageProps) {
  const params = await searchParams;
  await redirectAuthenticatedMember(params.next);

  return (
    <MemberAuthShell
      title="Create your account"
      description="Join as a buyer or seller. You can add the other identity later — one account, dual identity."
    >
      <Suspense fallback={<div className="h-40 animate-pulse rounded-xl bg-brand-forest/5" />}>
        <MemberRegisterForm />
      </Suspense>
    </MemberAuthShell>
  );
}
