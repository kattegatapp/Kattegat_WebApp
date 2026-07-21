import { NextResponse } from "next/server";

import { proxyMemberBackend } from "@/lib/auth/session";
import { updateRequirementBodySchema } from "@/lib/validations/requirement";

type RouteContext = { params: Promise<{ requirementId: string }> };

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export async function GET(_request: Request, context: RouteContext) {
  const { requirementId } = await context.params;
  if (!isUuid(requirementId)) {
    return NextResponse.json(
      { success: false, error: { message: "Invalid requirement id", code: "INVALID_ID" } },
      { status: 400 },
    );
  }
  return proxyMemberBackend(`/requirements/${requirementId}`);
}

export async function PATCH(request: Request, context: RouteContext) {
  const { requirementId } = await context.params;
  if (!isUuid(requirementId)) {
    return NextResponse.json(
      { success: false, error: { message: "Invalid requirement id", code: "INVALID_ID" } },
      { status: 400 },
    );
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: { message: "Invalid JSON body", code: "INVALID_BODY" } },
      { status: 400 },
    );
  }

  const parsed = updateRequirementBodySchema.safeParse(json);
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

  return proxyMemberBackend(`/requirements/${requirementId}`, {
    method: "PATCH",
    body: JSON.stringify(parsed.data),
  });
}
