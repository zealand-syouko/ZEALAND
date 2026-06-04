import { NextRequest, NextResponse } from "next/server";
import { createUser, getUserByEmail } from "@/server/db/users";
import { randomBytes } from "crypto";

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password required" }, { status: 400 });
  }

  if (password.length < 6) {
    return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
  }

  const existing = await getUserByEmail(email);
  if (existing) {
    return NextResponse.json({ error: "Email already registered" }, { status: 409 });
  }

  const recoveryCode = randomBytes(12).toString("hex");
  const user = await createUser(email, password, recoveryCode);
  return NextResponse.json({ email: user.email, recoveryCode }, { status: 201 });
}
