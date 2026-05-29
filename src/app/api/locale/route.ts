import { NextRequest, NextResponse } from "next/server";

const LOCALES = ["en", "zh", "ja", "ko", "fr"];

export async function POST(req: NextRequest) {
  const { locale } = await req.json();
  if (!LOCALES.includes(locale)) {
    return NextResponse.json({ error: "Invalid locale" }, { status: 400 });
  }
  const res = NextResponse.json({ locale });
  res.cookies.set("locale", locale, { maxAge: 365 * 24 * 60 * 60, path: "/" });
  return res;
}
