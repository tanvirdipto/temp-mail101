import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getPool, initDatabase } from "@/lib/db";

export async function GET() {
  const session = await getSession();
  if (!session.authenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const pool = getPool();
  await initDatabase();
  const [rows] = await pool.execute("SELECT * FROM site_settings ORDER BY `key`");
  const typedRows = rows as Array<{ id: number; key: string; value: string; updated_at: string }>;

  const settings: Record<string, string> = {};
  for (const row of typedRows) {
    settings[row.key] = row.value;
  }
  return NextResponse.json(settings);
}

export async function PUT(request: NextRequest) {
  const session = await getSession();
  if (!session.authenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { key, value } = await request.json();
    if (!key) {
      return NextResponse.json({ error: "Key is required" }, { status: 400 });
    }

    const pool = getPool();
    await initDatabase();
    await pool.execute(
      "INSERT INTO site_settings (`key`, value, updated_at) VALUES (?, ?, NOW()) ON DUPLICATE KEY UPDATE value = VALUES(value), updated_at = NOW()",
      [key, value || ""]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update settings";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
