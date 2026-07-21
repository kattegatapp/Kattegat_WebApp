import { proxyMemberBackend } from "@/lib/auth/session";

export async function POST() {
  return proxyMemberBackend("/notifications/read-all", {
    method: "POST",
    body: JSON.stringify({}),
  });
}
