#!/bin/bash

# Cloudflare Pages 使用 API Token 部署脚本

echo "🚀 使用 API Token 部署到 Cloudflare Pages..."

# 检查环境变量
if [ -z "$CLOUDFLARE_API_TOKEN" ]; then
    echo "❌ 请设置 CLOUDFLARE_API_TOKEN 环境变量"
    echo ""
    echo "📋 获取 API Token 的步骤："
    echo "1. 访问 https://dash.cloudflare.com/profile/api-tokens"
    echo "2. 点击 'Create Token'"
    echo "3. 使用 'Custom token' 模板"
    echo "4. 设置权限："
    echo "   - Zone:Zone:Read"
    echo "   - Zone:Page Rules:Edit"
    echo "   - Account:Cloudflare Pages:Edit"
    echo "5. 复制生成的 token"
    echo ""
    echo "然后运行："
    echo "export CLOUDFLARE_API_TOKEN=your_token_here"
    echo "bash scripts/deploy-cloudflare-token.sh"
    exit 1
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

# 使用 API Token 部署
echo "📁 使用 API Token 部署构建输出..."
CLOUDFLARE_API_TOKEN=$CLOUDFLARE_API_TOKEN wrangler pages deploy .next --project-name=dify-nextjs-template

echo "✅ 部署完成！"
echo ""
echo "🎉 您的应用已成功部署到 Cloudflare Pages！" 