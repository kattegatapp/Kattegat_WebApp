import { NextRequest } from "next/server";

import { proxyMemberBackend } from "@/lib/auth/session";

export async function POST(request: NextRequest) {
  const body = await request.text();
  return proxyMemberBackend("/reviews", {
    method: "POST",
    body,
  });
}
