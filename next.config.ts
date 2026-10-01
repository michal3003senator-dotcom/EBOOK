import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
];

// Za reverse proxy / tunelem (np. GitHub Codespaces) publiczny host różni się od nagłówka Host.
const publicHosts = [
  process.env.APP_URL && new URL(process.env.APP_URL).host,
  process.env.CODESPACE_NAME &&
    `${process.env.CODESPACE_NAME}-3000.${process.env.GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN ?? "app.github.dev"}`,
].filter((h): h is string => Boolean(h));

const config: NextConfig = {
  poweredByHeader: false,
  serverExternalPackages: ["better-sqlite3"],
  allowedDevOrigins: publicHosts.map((h) => h.split(":")[0]!),
  experimental: {
    serverActions: { allowedOrigins: publicHosts },
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default config;
