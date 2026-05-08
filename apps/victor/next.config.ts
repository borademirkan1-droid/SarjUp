import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Allow larger audio payloads for Whisper transcription
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
};

// Wrap with PWA in production only
let exportedConfig: NextConfig = nextConfig;

if (process.env.NODE_ENV === "production") {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const withPWA = require("next-pwa")({
    dest: "public",
    register: true,
    skipWaiting: true,
    disable: false,
  });
  exportedConfig = withPWA(nextConfig);
}

export default exportedConfig;
