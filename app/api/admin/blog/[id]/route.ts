import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getPool, initDatabase } from "@/lib/db";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session.authenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const pool = getPool();
  await initDatabase();
  const [rows] = await pool.execute("SELECT * FROM blog_posts WHERE id = ?", [id]);
  const post = (rows as Array<Record<string, unknown>>)[0];
  if (!post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }
  return NextResponse.json(post);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session.authenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  try {
    const { title, slug, content, excerpt, date, published } = await request.json();
    const pool = getPool();
    await initDatabase();
    await pool.execute(
      "UPDATE blog_posts SET title = ?, slug = ?, content = ?, excerpt = ?, date = ?, published = ?, updated_at = NOW() WHERE id = ?",
      [title, slug, content || "", excerpt || "", date, published ? 1 : 0, id]
    );

    const [rows] = await pool.execute("SELECT * FROM blog_posts WHERE id = ?", [id]);
    const post = (rows as Array<Record<string, unknown>>)[0];
    return NextResponse.json(post);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update post";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session.authenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const pool = getPool();
  await initDatabase();
  await pool.execute("DELETE FROM blog_posts WHERE id = ?", [id]);
  return NextResponse.json({ success: true });
}
