import { NextResponse } from "next/server";
import { getSession } from "@/server/auth/session";

export async function GET() {
  const session = await getSession();
  if (!session.userId) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
  const isAdmin = session.email === process.env.DEFAULT_ADMIN_EMAIL;
  return NextResponse.json({ authenticated: true, email: session.email, isAdmin });
}
