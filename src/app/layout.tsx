import type { Metadata } from "next";
import { cookies } from "next/headers";
import { NextIntlClientProvider } from "next-intl";
import "./globals.css";

export const metadata: Metadata = {
  title: "Token Relay",
  description: "LLM API Gateway",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const locale = cookieStore.get("locale")?.value || "en";

  let messages;
  try {
    messages = (await import(`@/i18n/messages/${locale}.json`)).default;
  } catch {
    messages = (await import(`@/i18n/messages/en.json`)).default;
  }

  return (
    <html lang={locale}>
      <body className="bg-gray-50 min-h-screen">
        <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
