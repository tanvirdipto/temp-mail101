import { NextRequest, NextResponse } from "next/server";
import { getMessages } from "@/lib/mail-api";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");
  if (!token) {
    return NextResponse.json({ error: "Token required" }, { status: 400 });
  }

  try {
    const messages = await getMessages(token);
    return NextResponse.json(messages);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch messages";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
