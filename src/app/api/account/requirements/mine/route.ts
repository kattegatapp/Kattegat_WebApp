import { NextResponse } from "next/server";

import { proxyMemberBackend } from "@/lib/auth/session";
import { requirementBodySchema } from "@/lib/validations/requirement";

export async function GET() {
  return proxyMemberBackend("/requirements/mine");
}

export async function POST(request: Request) {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: { message: "Invalid JSON body", code: "INVALID_BODY" } },
      { status: 400 },
    );
  }

  const parsed = requirementBodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      {
        success: false,
        error: {
          message: parsed.error.issues[0]?.message ?? "Invalid requirement data",
          code: "VALIDATION_ERROR",
        },
      },
      { status: 400 },
    );
  }

  return proxyMemberBackend("/requirements", {
    method: "POST",
    body: JSON.stringify(parsed.data),
  });
}
