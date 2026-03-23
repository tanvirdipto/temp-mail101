import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getPool, initDatabase } from "@/lib/db";
import { signToken, getSessionCookieOptions } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();
    if (!username || !password) {
      return NextResponse.json({ error: "Username and password required" }, { status: 400 });
    }

    const pool = getPool();
    await initDatabase();
    const [rows] = await pool.execute("SELECT * FROM admins WHERE username = ?", [username]);
    const admin = (rows as Array<{ id: number; username: string; password_hash: string }>)[0];

    if (!admin || !bcrypt.compareSync(password, admin.password_hash)) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const token = signToken({ username: admin.username });
    const cookieOptions = getSessionCookieOptions(token);

    const response = NextResponse.json({ success: true, username: admin.username });
    response.cookies.set(cookieOptions);
    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Login failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
