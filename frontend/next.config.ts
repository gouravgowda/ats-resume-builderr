import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // The site is served through a Cloudflare Tunnel in dev, so the dev server
  // must accept its own assets/HMR from the public origin or hydration fails.
  allowedDevOrigins: ["app.gowdahub.in"],
};

export default nextConfig;
