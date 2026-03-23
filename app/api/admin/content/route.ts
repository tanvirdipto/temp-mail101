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
  const [rows] = await pool.execute("SELECT * FROM site_content ORDER BY section, `key`");
  const typedRows = rows as Array<{ id: number; section: string; key: string; value: string; updated_at: string }>;

  const content: Record<string, Record<string, string>> = {};
  for (const row of typedRows) {
    if (!content[row.section]) content[row.section] = {};
    content[row.section][row.key] = row.value;
  }
  return NextResponse.json(content);
}

export async function PUT(request: NextRequest) {
  const session = await getSession();
  if (!session.authenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { section, key, value } = await request.json();
    if (!section || !key) {
      return NextResponse.json({ error: "Section and key are required" }, { status: 400 });
    }

    const pool = getPool();
    await initDatabase();
    await pool.execute(
      "INSERT INTO site_content (section, `key`, value, updated_at) VALUES (?, ?, ?, NOW()) ON DUPLICATE KEY UPDATE value = VALUES(value), updated_at = NOW()",
      [section, key, value || ""]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update content";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
