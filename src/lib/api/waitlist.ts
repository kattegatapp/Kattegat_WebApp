import { apiFetch } from "@/lib/api/client";
import type { WaitlistFormValues } from "@/lib/validations/waitlist";

export interface WaitlistEntry {
  id: string;
  fullName: string;
  email: string;
  role: "seller" | "buyer";
  createdAt: string;
}

export type JoinWaitlistInput = WaitlistFormValues & { source: string; deviceId: string };

export function joinWaitlist(values: JoinWaitlistInput) {
  return apiFetch<WaitlistEntry>(
    "/api/waitlist",
    {
      method: "POST",
      body: JSON.stringify(values),
    },
    { baseUrl: "" },
  );
}
