import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
  serverExternalPackages: ["bcrypt"],
  async rewrites() {
    return [
      { source: "/v1/chat/completions", destination: "/api/proxy" },
    ];
  },
};

export default withNextIntl(nextConfig);
