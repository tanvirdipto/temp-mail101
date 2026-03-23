import { NextRequest, NextResponse } from "next/server";
import { createAccount } from "@/lib/mail-api";

export async function POST(request: NextRequest) {
  try {
    let domain: string | undefined;
    try {
      const body = await request.json();
      domain = body.domain;
    } catch {
      // No body or invalid JSON — use default domain
    }

    const { address, token } = await createAccount(domain);
    return NextResponse.json({ address, token });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create account";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
