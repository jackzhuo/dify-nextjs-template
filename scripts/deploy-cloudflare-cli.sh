#!/bin/bash

# Cloudflare Pages CLI 部署脚本

echo "🚀 使用 Wrangler CLI 部署到 Cloudflare Pages..."

# 检查是否已登录
echo "📋 检查 Wrangler 登录状态..."
if ! wrangler whoami > /dev/null 2>&1; then
    echo "🔐 请先登录 Cloudflare..."
    wrangler login
fi

# 1. 安装依赖
echo "📦 安装依赖..."
pnpm install

# 2. 构建项目（使用 Cloudflare 适配器）
echo "🔨 构建项目（Cloudflare 优化）..."
pnpm run build:cloudflare

# 3. 部署到 Cloudflare Pages
echo "🚀 部署到 Cloudflare Pages..."

# 检查构建输出目录
if [ ! -d ".vercel/output/static" ]; then
    echo "❌ 构建输出目录 .vercel/output/static 不存在"
    echo "请确保运行了 pnpm run build:cloudflare"
    exit 1
fi

# 使用正确的 Pages 部署命令
echo "📁 部署优化后的构建输出到 Cloudflare Pages..."
wrangler pages deploy .vercel/output/static --project-name=dify-nextjs-template

echo "✅ 部署完成！"
echo ""
echo "🎉 您的应用已成功部署到 Cloudflare Pages！"
echo ""
echo "📝 后续步骤："
echo "1. 访问 Cloudflare Dashboard 查看部署状态"
echo "2. 配置自定义域名（可选）"
echo "3. 设置环境变量（如果需要）" 