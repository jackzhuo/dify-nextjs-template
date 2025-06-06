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

# 2. 构建项目
echo "🔨 构建项目..."
pnpm run build

# 3. 部署到 Cloudflare Pages
echo "🚀 部署到 Cloudflare Pages..."

# 检查构建输出目录
if [ ! -d ".next" ]; then
    echo "❌ 构建输出目录 .next 不存在，请先运行 pnpm run build"
    exit 1
fi

# 使用正确的 Pages 部署命令
echo "📁 部署构建输出到 Cloudflare Pages..."
wrangler pages deploy .next --project-name=dify-nextjs-template

echo "✅ 部署完成！"
echo ""
echo "🎉 您的应用已成功部署到 Cloudflare Pages！"
echo ""
echo "📝 后续步骤："
echo "1. 访问 Cloudflare Dashboard 查看部署状态"
echo "2. 配置自定义域名（可选）"
echo "3. 设置环境变量（如果需要）" 