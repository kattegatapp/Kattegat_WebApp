"use client";

import { AlertTriangle, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function AdminError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="mx-auto flex min-h-64 max-w-lg items-center px-4">
      <div className="w-full rounded-2xl border border-red-200 bg-red-50 p-6 text-red-900">
        <AlertTriangle className="size-6" aria-hidden />
        <h2 className="mt-3 text-lg font-bold">This admin page could not be loaded</h2>
        <p className="mt-1 text-sm text-red-800">Your session is safe. Try loading this section again.</p>
        <Button className="mt-5" variant="outline" onClick={reset}>
          <RotateCcw /> Try again
        </Button>
      </div>
    </div>
  );
}
