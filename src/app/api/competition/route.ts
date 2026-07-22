import { NextResponse } from "next/server";
import { fetchPublicCompetition } from "@/lib/api/competition";

export async function GET() {
  return NextResponse.json({ success: true, data: await fetchPublicCompetition() }, { headers: { "Cache-Control": "no-store" } });
}
