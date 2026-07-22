import { NextResponse } from "next/server";

import { getMemberAccessToken, unauthorizedMemberResponse } from "@/lib/auth/session";

/** Returns the member JWT so the browser can open a Supabase Realtime channel with RLS. */
export async function GET() {
  const token = await getMemberAccessToken();
  if (!token) return unauthorizedMemberResponse();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (!url || !anonKey) {
    return NextResponse.json(
      {
        success: false,
        error: {
          message: "Realtime is not configured on web yet.",
          code: "REALTIME_NOT_CONFIGURED",
        },
      },
      { status: 503, headers: { "Cache-Control": "private, no-store" } },
    );
  }

  return NextResponse.json(
    {
      success: true,
      data: {
        accessToken: token,
        supabaseUrl: url,
        supabaseAnonKey: anonKey,
      },
    },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}
