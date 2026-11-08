import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Dev server reachable by IP too (HMR websocket and dev assets are blocked for origins not listed here).
  allowedDevOrigins: ["127.0.0.1", "192.168.68.105", "*.local"],
};

export default nextConfig;
