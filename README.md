# Dify NextJS Template

基于 [Dify API](https://docs.dify.ai/api-reference) 的 Next.js 聊天界面模板，提供完整的AI对话功能实现。

## ✨ 功能特性

### 🚀 现代化技术栈
- **Next.js 15** - 使用最新的App Router
- **TypeScript** - 完整的类型安全支持
- **Tailwind CSS** - 现代化样式框架
- **shadcn/ui** - 精美的UI组件库
- **React 19** - 最新React功能

### 💬 完整聊天功能
- **双模式对话** - 支持流式和阻塞式响应
- **文件上传** - 支持多种文件格式上传
- **对话管理** - 完整的对话历史记录
- **消息反馈** - 点赞/点踩反馈系统
- **建议问题** - 智能推荐相关问题
- **导出功能** - 支持对话记录导出

### 🔧 开发者友好
- **类型安全API** - 完整的TypeScript接口定义
- **React Hooks** - 简单易用的状态管理
- **组件化设计** - 高度可复用的组件架构
- **错误处理** - 完善的错误处理机制

## 🛠 技术架构

### API封装层 (`src/lib/dify-client.ts`)
基于 [Dify API文档](https://docs.dify.ai/api-reference) 实现的完整客户端：

- **DifyClient类** - 核心API客户端
- **类型定义** - 完整的TypeScript接口
- **错误处理** - 统一的错误处理机制
- **流式支持** - Server-Sent Events流式响应

### React Hooks (`src/hooks/use-dify.ts`)
提供简单易用的React状态管理：

- **useDify Hook** - 统一的聊天状态管理
- **消息管理** - 自动的消息状态维护
- **加载状态** - 完整的加载和错误状态
- **操作方法** - 简化的API调用接口

### UI组件库 (`src/components/chat/`)
模块化的聊天界面组件：

- **ChatInterface** - 完整聊天界面
- **ChatMessage** - 消息显示组件
- **ChatInput** - 消息输入组件

## 🚀 快速开始

### 1. 安装依赖

```bash
pnpm install
```

### 2. 配置环境变量

复制环境变量配置文件：

```bash
cp .env.example .env.local
# 或
cp env.example .env.local
```

编辑 `.env.local` 文件，配置您的Dify API Key：

```bash
# 必填：Dify API Key
NEXT_PUBLIC_DIFY_API_KEY=app-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# 可选：其他配置
NEXT_PUBLIC_DIFY_BASE_URL=https://api.dify.ai/v1
NEXT_PUBLIC_APP_NAME=我的AI助手
```

### 3. 获取Dify API Key

1. 登录到 [Dify控制台](https://dify.ai)
2. 创建或选择一个应用
3. 在应用设置中获取API Key
4. 将API Key配置到 `.env.local` 文件中

### 4. 启动开发服务器

```bash
pnpm dev
```

## 🌐 部署

### Cloudflare Pages 部署

项目已完全优化支持 Cloudflare Pages 部署：

```bash
# 快速部署
pnpm run deploy:cloudflare
```

详细部署指南请参考：[Cloudflare 部署文档](./docs/CLOUDFLARE_DEPLOYMENT.md)

### Vercel 部署

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/dify-nextjs-template)

```bash
# 使用 Vercel CLI
npx vercel --prod
```

### 5. 开始使用

打开 [http://localhost:3000](http://localhost:3000)：

- 如果已配置环境变量，系统会自动连接
- 如果未配置，可以在界面中手动输入API Key

## 📖 使用说明

### 基础使用

```tsx
import { ChatInterface } from '@/components/chat/chat-interface';
import { createDifyClient } from '@/lib/dify-client';

export default function ChatPage() {
  const client = createDifyClient({
    apiKey: 'your-api-key',
    baseURL: 'https://api.dify.ai/v1' // 可选
  });

  return (
    <ChatInterface
      client={client}
      user="user-id"
      title="AI助手"
      enableFileUpload={true}
      enableStreamMode={true}
    />
  );
}
```

### 自定义Hook使用

```tsx
import { useDify } from '@/hooks/use-dify';

function CustomChatComponent() {
  const {
    messages,
    isLoading,
    isStreaming,
    sendMessage,
    sendMessageStream,
    stopGeneration,
    clearMessages
  } = useDify({
    client,
    user: 'user-id'
  });

  // 自定义UI实现
}
```

### 直接API调用

```tsx
import { DifyClient } from '@/lib/dify-client';

const client = new DifyClient({
  apiKey: 'your-api-key'
});

// 发送消息
const response = await client.sendChatMessage({
  query: '你好',
  user: 'user-id',
  response_mode: 'blocking'
});

// 流式对话
await client.sendChatMessageStream(
  {
    query: '你好',
    user: 'user-id',
    response_mode: 'streaming'
  },
  (data) => console.log('收到数据:', data),
  (error) => console.error('错误:', error),
  () => console.log('完成')
);
```

## 🎨 自定义配置

### 环境变量配置

项目支持通过环境变量进行全面配置。主要配置分类：

#### Dify API 配置
```bash
NEXT_PUBLIC_DIFY_API_KEY=           # Dify API Key (必填)
NEXT_PUBLIC_DIFY_BASE_URL=          # Dify API URL (可选)
```

#### 应用配置
```bash
NEXT_PUBLIC_APP_NAME=               # 应用名称
NEXT_PUBLIC_APP_DESCRIPTION=        # 应用描述
NEXT_PUBLIC_DEFAULT_USER_ID=        # 默认用户ID
```

#### 功能配置
```bash
NEXT_PUBLIC_ENABLE_STREAMING=       # 启用流式模式
NEXT_PUBLIC_ENABLE_FILE_UPLOAD=     # 启用文件上传
NEXT_PUBLIC_MAX_FILES=              # 最大文件数量
NEXT_PUBLIC_MAX_FILE_SIZE=          # 最大文件大小
NEXT_PUBLIC_ACCEPTED_FILE_TYPES=    # 支持的文件类型
```

#### 服务端配置
```bash
DIFY_API_KEY=                       # 服务端API Key
DIFY_BASE_URL=                      # 服务端API URL
```

详细配置说明请参考 `.env.example` 文件。

### 主题定制

项目使用Tailwind CSS和shadcn/ui，可以通过修改以下文件自定义主题：

- `src/app/globals.css` - 全局样式和CSS变量
- `tailwind.config.js` - Tailwind配置
- `components.json` - shadcn/ui配置

### 组件定制

所有聊天组件都支持props配置：

```tsx
<ChatInterface
  title="自定义标题"
  showHeader={false}
  enableFileUpload={false}
  maxFiles={10}
  maxFileSize={20 * 1024 * 1024}
  acceptedFileTypes={['.txt', '.pdf']}
  onConversationChange={(id) => console.log('对话ID:', id)}
/>
```

## 📁 项目结构

```
src/
├── app/                    # Next.js App Router
│   ├── globals.css        # 全局样式
│   ├── layout.tsx         # 根布局
│   └── page.tsx           # 主页面
├── components/
│   ├── chat/              # 聊天相关组件
│   │   ├── chat-interface.tsx
│   │   ├── chat-message.tsx
│   │   └── chat-input.tsx
│   └── ui/                # shadcn/ui组件
├── hooks/
│   └── use-dify.ts        # Dify React Hook
├── lib/
│   ├── dify-client.ts     # Dify API客户端
│   └── utils.ts           # 工具函数
└── types/                 # TypeScript类型定义
```

## 🔗 相关链接

- [Dify官网](https://dify.ai)
- [Dify API文档](https://docs.dify.ai/api-reference)
- [Next.js文档](https://nextjs.org/docs)
- [shadcn/ui文档](https://ui.shadcn.com)
- [Tailwind CSS文档](https://tailwindcss.com)

## 📄 开源协议

MIT License

## 🤝 贡献

欢迎提交Issue和Pull Request来改进这个项目！

## 📞 支持

如有问题，请通过以下方式寻求帮助：

- 提交 [GitHub Issue](https://github.com/your-repo/issues)
- 查看 [Dify文档](https://docs.dify.ai)
- 加入 Dify 社区讨论
