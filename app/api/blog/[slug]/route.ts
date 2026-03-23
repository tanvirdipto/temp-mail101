import { NextRequest, NextResponse } from "next/server";
import { getPool, initDatabase } from "@/lib/db";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  try {
    const pool = getPool();
    await initDatabase();
    const [rows] = await pool.execute(
      "SELECT * FROM blog_posts WHERE slug = ? AND published = 1",
      [slug]
    );
    const post = (rows as Array<Record<string, unknown>>)[0];

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }
    return NextResponse.json(post);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch post";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
