import { NextResponse } from "next/server";
import { getPool, initDatabase } from "@/lib/db";

export async function GET() {
  try {
    const pool = getPool();
    await initDatabase();
    const [posts] = await pool.execute(
      "SELECT id, title, slug, excerpt, date FROM blog_posts WHERE published = 1 ORDER BY date DESC"
    );
    return NextResponse.json(posts);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch posts";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
