import { proxyMemberBackend } from "@/lib/auth/session";

export async function GET() {
  return proxyMemberBackend("/referral/competition/leaderboard");
}
