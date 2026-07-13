import { notFound } from "next/navigation";
import { ErrorState } from "@/components/status/error-state";

const states = {
  "401": { code: 401 as const, title: "Sign in required", description: "Your session is missing or has expired. Sign in again to continue." },
  "403": { code: 403 as const, title: "Access denied", description: "Your account does not have permission to open this area." },
  "404": { code: 404 as const, title: "Page not found", description: "The requested page does not exist or is no longer available." },
  "500": { code: 500 as const, title: "Server error", description: "Kattegat could not complete the request. Please try again shortly." },
  "503": { code: 503 as const, title: "Service unavailable", description: "Kattegat is temporarily unavailable while the team completes an update." },
};

export default async function StatusPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const state = states[code as keyof typeof states];
  if (!state) notFound();
  return <ErrorState {...state} />;
}
