import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [new URL("https://img.daisyui.com/**")],
  },
  // Cloudflare Pages 兼容配置
  // API Routes 已配置 Edge Runtime
};

export default nextConfig;
