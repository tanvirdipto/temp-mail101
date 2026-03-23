import { NextResponse } from "next/server";
import { getPool, initDatabase } from "@/lib/db";

export async function GET() {
  try {
    const pool = getPool();
    await initDatabase();
    const [rows] = await pool.execute("SELECT section, `key`, value FROM site_content ORDER BY section, `key`");
    const typedRows = rows as Array<{ section: string; key: string; value: string }>;

    const content: Record<string, Record<string, string>> = {};
    for (const row of typedRows) {
      if (!content[row.section]) content[row.section] = {};
      content[row.section][row.key] = row.value;
    }
    return NextResponse.json(content);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch content";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
