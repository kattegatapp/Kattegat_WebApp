import { proxyMemberBackend } from "@/lib/auth/session";

export async function POST() {
  return proxyMemberBackend("/users/me/become-seller", { method: "POST", body: "{}" });
}
