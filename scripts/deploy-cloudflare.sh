#!/bin/bash

# Cloudflare Pages 部署脚本

echo "🚀 开始部署到 Cloudflare Pages..."

# 1. 安装依赖
echo "📦 安装依赖..."
pnpm install

# 2. 构建项目
echo "🔨 构建项目..."
pnpm run build

# 3. 提示手动部署步骤
echo "✅ 构建完成！"
echo ""
echo "📋 接下来请按照以下步骤部署到 Cloudflare Pages："
echo ""
echo "1. 登录 Cloudflare Dashboard: https://dash.cloudflare.com/"
echo "2. 进入 Pages 页面"
echo "3. 点击 'Create a project'"
echo "4. 连接您的 Git 仓库"
echo "5. 配置构建设置："
echo "   - Framework preset: Next.js"
echo "   - Build command: pnpm run build"
echo "   - Build output directory: .next"
echo "   - Root directory: /"
echo ""
echo "6. 设置环境变量（可选）："
echo "   - NEXT_PUBLIC_DIFY_API_KEY"
echo "   - NEXT_PUBLIC_DIFY_BASE_URL"
echo ""
echo "7. 点击 'Save and Deploy'"
echo ""
echo "🎉 部署完成后，您的应用将在 Cloudflare Pages 上运行！" 