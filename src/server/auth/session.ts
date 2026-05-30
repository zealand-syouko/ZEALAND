import { getIronSession, SessionOptions } from "iron-session";
import { cookies } from "next/headers";

export interface SessionData {
  userId?: string;
  email?: string;
}

const sessionOptions: SessionOptions = {
  password: process.env.SESSION_SECRET || "fallback-secret-min-32-chars-ok-now",
  cookieName: "token-relay-session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax" as const,
  },
};

export async function getSession() {
  const cookieStore = await cookies();
  return getIronSession<SessionData>(cookieStore, sessionOptions);
}

export async function requireAdmin() {
  const session = await getSession();
  if (!session.userId) {
    throw new Error("Unauthorized");
  }
  return session;
}
