"use client";

import { useEffect } from "react";
import { ErrorState } from "@/components/status/error-state";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);
  return <ErrorState code={500} title="Something went wrong" description="We could not complete this request. Try again, and contact Kattegat support if the problem continues." retry={reset} />;
}
