import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Token Relay",
  description: "LLM API Gateway",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body className="bg-gray-50 min-h-screen">{children}</body>
    </html>
  );
}
