import { proxyMemberBackend } from "@/lib/auth/session";

export async function GET() {
  return proxyMemberBackend("/payouts");
}

export async function POST(request: Request) {
  return proxyMemberBackend("/payouts", {
    method: "POST",
    body: await request.text(),
  });
}
