import { proxyMemberBackend } from "@/lib/auth/session";

export async function POST(request: Request) {
  return proxyMemberBackend("/referral/competition/join", { method: "POST", body: await request.text() });
}
