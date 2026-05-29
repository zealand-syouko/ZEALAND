import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import type { SessionData } from "@/server/auth/session";

const sessionOptions = {
  password: process.env.SESSION_SECRET || "fallback-secret-min-32-chars!!",
  cookieName: "token-relay-session",
  cookieOptions: { secure: process.env.NODE_ENV === "production", httpOnly: true, sameSite: "lax" as const },
};

export async function middleware(req: NextRequest) {
  let res = NextResponse.next();

  // Set locale cookie if not present
  const locale = req.cookies.get("locale")?.value;
  if (!locale) {
    // Detect from Accept-Language header or default to en
    const acceptLang = req.headers.get("accept-language") || "";
    let detected = "en";
    if (acceptLang.includes("zh")) detected = "zh";
    else if (acceptLang.includes("ja")) detected = "ja";
    else if (acceptLang.includes("ko")) detected = "ko";
    else if (acceptLang.includes("fr")) detected = "fr";

    res.cookies.set("locale", detected, { maxAge: 365 * 24 * 60 * 60, path: "/" });
  }

  // Protect /dashboard routes
  if (req.nextUrl.pathname.startsWith("/dashboard")) {
    const session = await getIronSession<SessionData>(req, res, sessionOptions);
    if (!session.userId) {
      return NextResponse.redirect(new URL("/", req.url));
    }
    return res;
  }

  return res;
}

export const config = {
  matcher: ["/((?!api|_next|favicon.ico).*)"],
};
