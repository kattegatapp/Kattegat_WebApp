import { ErrorState } from "@/components/status/error-state";

export default function NotFound() {
  return <ErrorState code={404} title="Page not found" description="The page may have moved, the address may be incorrect, or this content is no longer available." />;
}
