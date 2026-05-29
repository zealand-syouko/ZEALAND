import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import type { SessionData } from "@/server/auth/session";

const sessionOptions = {
  password: process.env.SESSION_SECRET || "fallback-secret-min-32-chars!!",
  cookieName: "token-relay-session",
  cookieOptions: { secure: process.env.NODE_ENV === "production", httpOnly: true, sameSite: "lax" as const },
};

export async function middleware(req: NextRequest) {
  // Only protect /dashboard routes
  if (req.nextUrl.pathname.startsWith("/dashboard")) {
    const res = NextResponse.next();
    const session = await getIronSession<SessionData>(req, res, sessionOptions);
    if (!session.userId) {
      return NextResponse.redirect(new URL("/", req.url));
    }
    return res;
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
