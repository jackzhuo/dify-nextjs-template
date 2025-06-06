import { Card, CardContent } from '@/components/ui/card';
import { DifyConnectionConfig } from '@/components/connection/dify-connection-config';
import { getDifyConfig, validateEnvironment } from '@/lib/env';

export default function Home() {
  // 在服务端读取配置
  const difyConfig = getDifyConfig();
  const envValidation = validateEnvironment();

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* 连接配置界面 */}
      <DifyConnectionConfig
        initialApiKey={difyConfig.apiKey}
        initialBaseURL={difyConfig.baseURL}
        envValidation={envValidation}
      />

      {/* 功能特性展示 */}
      <div className="max-w-4xl mx-auto">
        <h3 className="text-xl font-semibold text-center mb-6">功能特性</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-2">🚀 现代化技术栈</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Next.js 15 App Router</li>
                <li>• TypeScript 类型安全</li>
                <li>• Tailwind CSS + shadcn/ui</li>
                <li>• 响应式设计</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-2">💬 完整聊天功能</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• 流式/阻塞式对话</li>
                <li>• 文件上传支持</li>
                <li>• 对话历史管理</li>
                <li>• 消息反馈系统</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-2">🔧 开发者友好</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• 类型安全的API封装</li>
                <li>• React Hooks集成</li>
                <li>• 组件化设计</li>
                <li>• 易于扩展</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-2">🎯 Dify集成</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• 完整API覆盖</li>
                <li>• 错误处理机制</li>
                <li>• 建议问题支持</li>
                <li>• 元数据展示</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
