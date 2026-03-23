import { NextRequest, NextResponse } from "next/server";
import { getMessage } from "@/lib/mail-api";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const token = request.nextUrl.searchParams.get("token");
  if (!token) {
    return NextResponse.json({ error: "Token required" }, { status: 400 });
  }

  try {
    const message = await getMessage(id, token);
    return NextResponse.json(message);
  } catch (error) {
    const msg =
      error instanceof Error ? error.message : "Failed to fetch message";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
