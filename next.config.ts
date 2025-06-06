import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [new URL("https://img.daisyui.com/**")],
  },
  // Cloudflare Pages 配置 - 选择部署模式
  
  // 方案1：静态导出（无 API Routes）
  // output: 'export',
  // trailingSlash: true,
  // skipTrailingSlashRedirect: true,
  
  // 方案2：支持 API Routes（当前配置）
  // API Routes 使用 Edge Runtime
};

export default nextConfig;
