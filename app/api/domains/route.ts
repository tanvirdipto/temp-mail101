import { NextResponse } from "next/server";
import { getAllDomains } from "@/lib/mail-api";

export async function GET() {
  try {
    const domains = await getAllDomains();
    return NextResponse.json({ domains });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch domains";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
