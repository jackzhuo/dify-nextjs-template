# Cloudflare Pages 手动部署指南

由于 Wrangler CLI 可能遇到网络问题，这里提供手动部署的详细步骤。

## 🚀 方法 1：通过 Cloudflare Dashboard 手动上传

### 步骤 1：构建项目

```bash
# 在项目根目录运行
pnpm install
pnpm run build
```

### 步骤 2：准备部署文件

构建完成后，您会看到 `.next` 目录，这就是需要部署的文件。

### 步骤 3：登录 Cloudflare Dashboard

1. 访问：https://dash.cloudflare.com/
2. 登录您的 Cloudflare 账户
3. 进入 **Pages** 页面

### 步骤 4：创建新项目

1. 点击 **"Create a project"**
2. 选择 **"Upload assets"**（直接上传）
3. 项目名称：`dify-nextjs-template`

### 步骤 5：上传构建文件

1. 将 `.next` 目录中的所有文件打包成 zip
2. 或者直接拖拽 `.next` 目录到上传区域
3. 点击 **"Deploy site"**

## 🔧 方法 2：修复 GitHub 连接问题

### 问题排查

如果 GitHub 连接一直加载，可能的原因：

1. **网络问题**：Cloudflare 服务器无法访问 GitHub
2. **权限问题**：GitHub 应用权限不足
3. **仓库问题**：仓库配置有问题

### 解决步骤

#### 1. 清除 GitHub 授权

访问 GitHub Settings：
- https://github.com/settings/applications
- 找到 "Cloudflare Pages" 并撤销授权

#### 2. 重新授权

1. 回到 Cloudflare Pages
2. 点击 "Connect to Git"
3. 重新授权 GitHub
4. 确保授权所有必要的权限

#### 3. 检查仓库状态

确保您的仓库：
- 是公开的（或者 Cloudflare 有访问私有仓库的权限）
- 包含有效的代码
- 有正确的分支（通常是 `main` 或 `master`）

#### 4. 使用不同的浏览器

有时浏览器缓存会导致问题，尝试：
- 清除浏览器缓存
- 使用无痕模式
- 使用不同的浏览器

## 🛠️ 方法 3：使用 API Token

如果 OAuth 登录有问题，可以使用 API Token：

### 获取 API Token

1. 访问：https://dash.cloudflare.com/profile/api-tokens
2. 点击 **"Create Token"**
3. 使用 **"Custom token"** 模板
4. 设置权限：
   ```
   Account - Cloudflare Pages:Edit
   Zone - Zone:Read
   Zone - Page Rules:Edit
   ```
5. 复制生成的 token

### 使用 Token 部署

```bash
# 设置环境变量
export CLOUDFLARE_API_TOKEN=your_token_here

# 运行部署脚本
bash scripts/deploy-cloudflare-token.sh
```

## 📋 构建设置参考

如果通过 Git 连接成功，使用以下构建设置：

```
Framework preset: Next.js
Build command: pnpm run build
Build output directory: .next
Root directory: /
Node.js version: 18 或更高
```

## 🌍 环境变量设置

部署成功后，在 Cloudflare Pages 项目设置中添加环境变量：

```
NEXT_PUBLIC_DIFY_API_KEY=your_dify_api_key
NEXT_PUBLIC_DIFY_BASE_URL=https://api.dify.ai/v1
```

## 🔍 故障排除

### 常见问题

1. **构建失败**
   - 检查 Node.js 版本（需要 18+）
   - 确保 `pnpm run build` 在本地成功

2. **API 路由不工作**
   - 确保使用了 Edge Runtime
   - 检查环境变量设置

3. **静态文件 404**
   - 确保构建输出目录正确（`.next`）
   - 检查文件路径大小写

### 获取帮助

如果仍有问题：
1. 检查 Cloudflare Pages 的构建日志
2. 查看浏览器开发者工具的网络面板
3. 联系 Cloudflare 支持

## ✅ 验证部署

部署成功后：
1. 访问分配的 `.pages.dev` 域名
2. 测试聊天功能
3. 检查 API 路由是否正常工作
4. 配置自定义域名（可选） 