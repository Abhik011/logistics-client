import type { NextConfig } from "next";
import withPWAInit from "next-pwa";

const isDev = process.env.NODE_ENV === "development";

const withPWA = withPWAInit({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: isDev, // Disable PWA in development
});

const nextConfig: NextConfig = {
  reactStrictMode: true,
  turbopack: {}, // ✅ prevents turbopack error
};

export default withPWA(nextConfig);