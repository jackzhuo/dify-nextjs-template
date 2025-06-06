# Cloudflare Pages 部署指南

本项目已经优化配置，完全支持部署到 Cloudflare Pages，使用 `@cloudflare/next-on-pages` 实现最佳性能。

## 🚀 快速部署（推荐）

### 方法一：使用优化构建 + CLI 部署

```bash
# 1. 构建项目（Cloudflare 优化）
pnpm run build:cloudflare

# 2. 部署到 Cloudflare Pages
pnpm run deploy:cloudflare-cli
```

**优势**：
- 📦 构建输出仅 3.3MB（vs 原始 50MB+）
- ⚡ API Routes 转换为 Edge Functions
- 🌍 静态资源全球 CDN 分发
- 🔥 保留完整功能（聊天、API 等）

### 方法二：通过 Git 仓库自动部署

1. **推送代码到 Git 仓库**
   ```bash
   git add .
   git commit -m "Ready for Cloudflare Pages deployment"
   git push origin main
   ```

2. **登录 Cloudflare Dashboard**
   - 访问：https://dash.cloudflare.com/
   - 进入 **Pages** 页面

3. **创建新项目**
   - 点击 **"Create a project"**
   - 选择 **"Connect to Git"**
   - 授权并选择您的仓库

4. **配置构建设置**
   ```
   Framework preset: Next.js
   Build command: pnpm run build:cloudflare
   Build output directory: .vercel/output/static
   Root directory: /
   Node.js version: 18 或更高
   ```

5. **设置环境变量（可选）**
   ```
   NEXT_PUBLIC_DIFY_API_KEY=your_dify_api_key
   NEXT_PUBLIC_DIFY_BASE_URL=https://dify.allm.link/v1
   ```

6. **部署**
   - 点击 **"Save and Deploy"**
   - 等待构建完成

## ⚙️ 技术配置说明

### @cloudflare/next-on-pages 适配器

项目使用官方适配器，实现：

```typescript
// 自动转换过程
Next.js App → Vercel Build → Cloudflare Workers
```

**转换结果**：
- **Edge Functions**: `/api/chat` → Cloudflare Workers
- **Static Pages**: `/`, `/chat` → CDN 缓存
- **Assets**: CSS/JS → 全球分发

### 构建输出分析

```bash
⚡️ Build Summary (@cloudflare/next-on-pages v1.13.12)
⚡️ 
⚡️ Edge Function Routes (1)
⚡️   - /api/chat                    # 聊天 API
⚡️ 
⚡️ Prerendered Routes (5)
⚡️   ┌ /                           # 首页
⚡️   ├ /chat                       # 聊天页面
⚡️   ├ /favicon.ico                # 图标
⚡️   └ ...
⚡️ 
⚡️ Other Static Assets (36)        # 优化后的静态资源
```

### 支持的功能

✅ **完全支持的功能：**
- 静态页面渲染（SSG）
- API Routes → Edge Functions
- 流式响应 (Server-Sent Events)
- 客户端路由
- 环境变量
- 图片优化

✅ **API 功能：**
- Dify API 集成
- 流式聊天
- 阻塞式聊天
- 应用信息获取

## 🌍 环境变量配置

### 在 Cloudflare Pages 中设置环境变量

1. 进入项目设置页面
2. 点击 **"Settings"** → **"Environment variables"**
3. 添加以下变量：

| 变量名 | 描述 | 示例值 |
|--------|------|--------|
| `NEXT_PUBLIC_DIFY_API_KEY` | Dify API 密钥 | `app-xxx` |
| `NEXT_PUBLIC_DIFY_BASE_URL` | Dify API 基础地址 | `https://dify.allm.link/v1` |

### 本地预览

```bash
# 本地预览 Cloudflare 环境
pnpm run preview:cloudflare
```

## 🔧 自定义域名

1. 在 Cloudflare Pages 项目中点击 **"Custom domains"**
2. 点击 **"Set up a custom domain"**
3. 输入您的域名
4. 按照提示配置 DNS 记录

## 📊 性能优化

### Cloudflare Pages 优势

- **全球 CDN**: 自动分发到全球边缘节点
- **Edge Functions**: API 在边缘计算节点运行
- **自动缓存**: 静态资源自动缓存
- **HTTP/3 支持**: 更快的网络传输

### 构建优化对比

| 项目 | 原始构建 | 优化构建 |
|------|----------|----------|
| 输出大小 | 50-100MB | 3.3MB |
| API Routes | Node.js Runtime | Edge Functions |
| 静态资源 | 未优化 | 自动压缩 |
| 部署速度 | 慢 | 快 |

## 🐛 常见问题

### Q: 构建失败怎么办？

A: 检查以下几点：
1. Node.js 版本是否为 18 或更高
2. 构建命令是否正确：`pnpm run build:cloudflare`
3. 依赖是否正确安装

### Q: API 路由不工作？

A: 确保：
1. API 路由文件包含 `export const runtime = 'edge'`
2. 没有使用 Node.js 特定的 API
3. 环境变量正确设置

### Q: 流式响应有问题？

A: Cloudflare Pages 完全支持 Server-Sent Events，确保：
1. 使用 Edge Runtime
2. 正确设置响应头
3. 客户端正确处理流式数据

## 📝 部署检查清单

- [ ] 代码推送到 Git 仓库
- [ ] 运行 `pnpm run build:cloudflare` 成功
- [ ] 构建输出目录 `.vercel/output/static` 存在
- [ ] Cloudflare Pages 项目创建
- [ ] 构建设置正确配置
- [ ] 环境变量设置（如需要）
- [ ] 首次部署成功
- [ ] 功能测试通过
- [ ] 自定义域名配置（可选）

## 🎉 部署完成

部署成功后，您的 Dify NextJS Template 将在 Cloudflare Pages 上运行，享受：

- 🚀 极快的加载速度（3.3MB 优化构建）
- 🌍 全球 CDN 分发
- ⚡ Edge Functions API
- 🔒 自动 HTTPS
- 📈 无限扩展性
- 💰 慷慨的免费额度

访问您的应用并开始使用 Dify AI 聊天功能！ 