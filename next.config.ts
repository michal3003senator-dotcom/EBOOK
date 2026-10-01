import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
];

// Za reverse proxy / tunelem (np. GitHub Codespaces) publiczny host różni się od nagłówka Host.
const publicUrl = process.env.APP_URL ? new URL(process.env.APP_URL) : null;

const config: NextConfig = {
  poweredByHeader: false,
  serverExternalPackages: ["better-sqlite3"],
  allowedDevOrigins: publicUrl ? [publicUrl.hostname] : [],
  experimental: {
    serverActions: { allowedOrigins: publicUrl ? [publicUrl.host] : [] },
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default config;
