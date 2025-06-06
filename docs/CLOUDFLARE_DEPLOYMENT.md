# Cloudflare Pages 部署指南

本项目已经优化配置，完全支持部署到 Cloudflare Pages。

## 🚀 快速部署

### 方法一：通过 Git 仓库自动部署（推荐）

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
   Build command: pnpm run build
   Build output directory: .next
   Root directory: /
   Node.js version: 18 或更高
   ```

5. **设置环境变量（可选）**
   ```
   NEXT_PUBLIC_DIFY_API_KEY=your_dify_api_key
   NEXT_PUBLIC_DIFY_BASE_URL=https://api.dify.ai/v1
   ```

6. **部署**
   - 点击 **"Save and Deploy"**
   - 等待构建完成

### 方法二：使用部署脚本

```bash
# 运行部署脚本
pnpm run deploy:cloudflare
```

## ⚙️ 技术配置说明

### Edge Runtime 配置

项目已配置使用 Edge Runtime，确保与 Cloudflare Pages 完全兼容：

```typescript
// src/app/api/chat/route.ts
export const runtime = 'edge';
```

### 支持的功能

✅ **完全支持的功能：**
- 静态页面渲染
- API Routes (Edge Runtime)
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
| `NEXT_PUBLIC_DIFY_BASE_URL` | Dify API 基础地址 | `https://api.dify.ai/v1` |

### 环境变量说明

- **NEXT_PUBLIC_DIFY_API_KEY**: 可选，如果设置会作为默认值
- **NEXT_PUBLIC_DIFY_BASE_URL**: 可选，默认使用官方API地址

## 🔧 自定义域名

1. 在 Cloudflare Pages 项目中点击 **"Custom domains"**
2. 点击 **"Set up a custom domain"**
3. 输入您的域名
4. 按照提示配置 DNS 记录

## 📊 性能优化

### Cloudflare Pages 优势

- **全球 CDN**: 自动分发到全球边缘节点
- **Edge Runtime**: API 在边缘计算节点运行
- **自动缓存**: 静态资源自动缓存
- **HTTP/3 支持**: 更快的网络传输

### 构建优化

项目已进行以下优化：

1. **代码分割**: 自动按路由分割代码
2. **静态生成**: 首页等静态内容预渲染
3. **Edge Runtime**: API 使用边缘运行时
4. **图片优化**: 自动优化图片格式和大小

## 🐛 常见问题

### Q: 构建失败怎么办？

A: 检查以下几点：
1. Node.js 版本是否为 18 或更高
2. 构建命令是否正确：`pnpm run build`
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
- [ ] Cloudflare Pages 项目创建
- [ ] 构建设置正确配置
- [ ] 环境变量设置（如需要）
- [ ] 首次部署成功
- [ ] 功能测试通过
- [ ] 自定义域名配置（可选）

## 🎉 部署完成

部署成功后，您的 Dify NextJS Template 将在 Cloudflare Pages 上运行，享受：

- 🚀 极快的加载速度
- 🌍 全球 CDN 分发
- 🔒 自动 HTTPS
- 📈 无限扩展性
- 💰 慷慨的免费额度

访问您的应用并开始使用 Dify AI 聊天功能！ 