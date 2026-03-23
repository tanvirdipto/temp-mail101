import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getPool, initDatabase } from "@/lib/db";
import type { ResultSetHeader } from "mysql2";

export async function GET() {
  const session = await getSession();
  if (!session.authenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const pool = getPool();
  await initDatabase();
  const [posts] = await pool.execute("SELECT * FROM blog_posts ORDER BY date DESC");
  return NextResponse.json(posts);
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session.authenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { title, slug, content, excerpt, date, published } = await request.json();
    if (!title || !slug || !date) {
      return NextResponse.json({ error: "Title, slug, and date are required" }, { status: 400 });
    }

    const pool = getPool();
    await initDatabase();
    const [result] = await pool.execute(
      "INSERT INTO blog_posts (title, slug, content, excerpt, date, published) VALUES (?, ?, ?, ?, ?, ?)",
      [title, slug, content || "", excerpt || "", date, published ? 1 : 0]
    );

    const insertId = (result as ResultSetHeader).insertId;
    const [rows] = await pool.execute("SELECT * FROM blog_posts WHERE id = ?", [insertId]);
    const post = (rows as Array<Record<string, unknown>>)[0];
    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create post";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
