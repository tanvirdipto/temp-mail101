import { NextResponse } from "next/server";
import { getPool, initDatabase } from "@/lib/db";

export async function GET() {
  try {
    const pool = getPool();
    await initDatabase();
    const [rows] = await pool.execute("SELECT `key`, value FROM site_settings ORDER BY `key`");
    const typedRows = rows as Array<{ key: string; value: string }>;

    const settings: Record<string, string> = {};
    for (const row of typedRows) {
      settings[row.key] = row.value;
    }
    return NextResponse.json(settings);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch settings";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
