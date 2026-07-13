"use client";

import { useEffect } from "react";
import { ErrorState } from "@/components/status/error-state";
import "./globals.css";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);
  return <html lang="en"><body><ErrorState code={500} title="Kattegat encountered an error" description="The application could not load correctly. Please try again." retry={reset} /></body></html>;
}
