"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  MessageSquare,
  Key,
  ExternalLink,
  Github,
  CheckCircle,
  AlertCircle,
  Settings,
  Info,
  ChevronDown,
} from "lucide-react";
import { Markdown } from "@/components/ui/markdown";

interface DifyChatPageProps {
  // 从服务端传递的配置
  initialApiKey?: string;
  baseURL: string;
  appConfig: {
    name: string;
    description: string;
    defaultUserId: string;
    siteUrl: string;
  };
  chatConfig: {
    enableStreaming: boolean;
    enableFileUpload: boolean;
    maxFiles: number;
    maxFileSize: number;
    acceptedFileTypes: string[];
    showDebugInfo: boolean;
    showSuggestedQuestions: boolean;
    apiTimeout: number;
    enableRequestLogging: boolean;
  };
  envValidation?: {
    isValid: boolean;
    missingVars: string[];
    warnings: string[];
  };
}

export function DifyChatPage({
  initialApiKey,
  baseURL,
  appConfig,
  envValidation,
}: DifyChatPageProps) {
  const [apiKey, setApiKey] = useState(initialApiKey || "");
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string>("");
  
  // 避免未使用变量警告
//   console.log('Chat config available:', chatConfig);

  // 自动连接逻辑
  useEffect(() => {
    console.log("Initial API Key:", initialApiKey);
    console.log("Base URL:", baseURL);
    
    // 如果环境变量中已配置API Key，自动连接
          if (initialApiKey && envValidation?.isValid) {
        setIsConnected(true);
        setApiKey(initialApiKey);
      }
  }, [initialApiKey, baseURL, envValidation?.isValid]);

  const handleConnect = () => {
    const keyToUse = apiKey.trim() || initialApiKey;

    if (!keyToUse) {
      setError("请输入API Key");
      return;
    }

    setIsConnected(true);
    setError("");
  };

  const handleDisconnect = () => {
    setIsConnected(false);
    setApiKey("");
    setError("");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* 头部 */}
      <header className="border-b bg-white/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold">{appConfig.name}</h1>
                <p className="text-sm text-muted-foreground">
                  {appConfig.description}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Badge variant="outline" className="gap-1">
                <CheckCircle className="w-3 h-3" />
                Next.js 15
              </Badge>
              <Badge variant="outline" className="gap-1">
                <CheckCircle className="w-3 h-3" />
                TypeScript
              </Badge>
              <Badge variant="outline" className="gap-1">
                <CheckCircle className="w-3 h-3" />
                Tailwind CSS
              </Badge>

              <Button variant="outline" size="sm" asChild>
                <a
                  href="https://docs.dify.ai/api-reference"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="gap-1"
                >
                  <ExternalLink className="w-3 h-3" />
                  API文档
                </a>
              </Button>

              <Button variant="outline" size="sm" asChild>
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="gap-1"
                >
                  <Github className="w-3 h-3" />
                  源码
                </a>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {!isConnected ? (
          // 连接配置界面
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <Key className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">连接到Dify</h2>
                <p className="text-muted-foreground mt-2">
                  {initialApiKey
                    ? "检测到环境变量中的API Key，点击连接即可开始使用"
                    : "请输入您的Dify API Key以开始使用聊天功能"}
                </p>
              </div>
            </div>

            {/* 环境变量验证提示 */}
            {envValidation && !envValidation.isValid && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-1">
                    <div className="font-medium">缺少必需的环境变量:</div>
                    <ul className="list-disc list-inside text-sm">
                      {envValidation.missingVars.map((varName, index) => (
                        <li key={index}>{varName}</li>
                      ))}
                    </ul>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* 环境变量警告 */}
            {envValidation && envValidation.warnings.length > 0 && (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-1">
                    <div className="font-medium">建议配置:</div>
                    <ul className="list-disc list-inside text-sm">
                      {envValidation.warnings.map((warning, index) => (
                        <li key={index}>{warning}</li>
                      ))}
                    </ul>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  API配置
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="apikey" className="text-sm font-medium">
                    Dify API Key
                  </label>
                  <Input
                    id="apikey"
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder={
                      initialApiKey
                        ? "已从环境变量加载 API Key（可覆盖输入）"
                        : "输入您的Dify API Key"
                    }
                    className="font-mono"
                  />
                  <p className="text-xs text-muted-foreground">
                    您可以在Dify控制台的应用设置中获取API Key
                  </p>
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <Button
                  onClick={handleConnect}
                  className="w-full"
                  disabled={!apiKey.trim() && !initialApiKey}
                >
                  {initialApiKey ? "使用环境变量连接" : "连接到Dify"}
                </Button>
              </CardContent>
            </Card>

            {/* 功能特性展示 */}
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
        ) : (
          // 聊天界面
          <div className="max-w-4xl mx-auto">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="default" className="gap-1">
                  <CheckCircle className="w-3 h-3" />
                  已连接
                </Badge>
                <span className="text-sm text-muted-foreground">
                  API Key: {(apiKey || initialApiKey || "").slice(0, 8)}...
                </span>
              </div>
              <Button variant="outline" size="sm" onClick={handleDisconnect}>
                断开连接
              </Button>
            </div>

            <div className="h-[calc(100vh-200px)]">
              <SimpleChatInterface
                user={appConfig.defaultUserId}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// 简单的聊天界面组件
function SimpleChatInterface({ user }: { user: string }) {
  const [messages, setMessages] = useState<Array<{
    id: string;
    type: 'user' | 'assistant';
    content: string;
    isStreaming?: boolean;
  }>>([]);
  const [message, setMessage] = useState("");
  const [streamMode, setStreamMode] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  
  // 滚动相关状态和引用
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const [userInteracting, setUserInteracting] = useState(false);
  const lastScrollTop = useRef(0);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 滚动到底部
  const scrollToBottom = useCallback((force = false) => {
    if ((autoScroll || force) && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'end'
      });
    }
  }, [autoScroll]);

  // 检查是否接近底部
  const isNearBottom = useCallback(() => {
    if (!messagesContainerRef.current) return true;
    
    const container = messagesContainerRef.current;
    const threshold = 100; // 距离底部100px内认为是接近底部
    
    return (
      container.scrollTop + container.clientHeight >= 
      container.scrollHeight - threshold
    );
  }, []);

  // 处理用户滚动
  const handleScroll = useCallback(() => {
    if (!messagesContainerRef.current) return;
    
    const container = messagesContainerRef.current;
    const currentScrollTop = container.scrollTop;
    
    // 检测用户是否主动向上滚动
    if (currentScrollTop < lastScrollTop.current) {
      setUserInteracting(true);
      setAutoScroll(false);
    }
    
    // 如果用户滚动到接近底部，恢复自动滚动
    if (isNearBottom()) {
      setAutoScroll(true);
      setUserInteracting(false);
    }
    
    lastScrollTop.current = currentScrollTop;
    
    // 清除之前的定时器
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    
    // 用户停止滚动1秒后，检查是否在底部
    scrollTimeoutRef.current = setTimeout(() => {
      if (isNearBottom()) {
        setAutoScroll(true);
        setUserInteracting(false);
      }
    }, 1000);
  }, [isNearBottom]);

  // 处理鼠标移动
  const handleMouseMove = useCallback(() => {
    if (!userInteracting) {
      setUserInteracting(true);
    }
  }, [userInteracting]);

  // 监听消息变化，自动滚动
  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // 监听流式消息内容变化
  useEffect(() => {
    if (isStreaming && autoScroll) {
      scrollToBottom();
    }
  }, [messages, isStreaming, autoScroll, scrollToBottom]);

  // 清理定时器
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  const handleSend = async () => {
    if (!message.trim() || isLoading || isStreaming) return;
    
    const userMessage = message.trim();
    setMessage("");
    
    // 添加用户消息
    const userMsgId = Date.now().toString();
    setMessages(prev => [...prev, {
      id: userMsgId,
      type: 'user',
      content: userMessage
    }]);
    
    // 添加助手消息占位符
    const assistantMsgId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, {
      id: assistantMsgId,
      type: 'assistant',
      content: '',
      isStreaming: streamMode
    }]);
    
    try {
      if (streamMode) {
        setIsStreaming(true);
        
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: userMessage,
            user,
            responseMode: 'streaming'
          }),
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        
        if (reader) {
          let content = '';
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            
            const chunk = decoder.decode(value);
            const lines = chunk.split('\n');
            
            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const dataStr = line.slice(6);
                if (dataStr === '[DONE]') {
                  continue;
                }
                try {
                  const data = JSON.parse(dataStr);
                  console.log('Received stream data:', data); // 调试信息
                  
                  // 处理不同类型的事件
                  if (data.event === 'message' && data.answer) {
                    content += data.answer;
                    setMessages(prev => prev.map(msg => 
                      msg.id === assistantMsgId 
                        ? { ...msg, content, isStreaming: true }
                        : msg
                    ));
                  } else if (data.answer) {
                    // 兼容性处理
                    content += data.answer;
                    setMessages(prev => prev.map(msg => 
                      msg.id === assistantMsgId 
                        ? { ...msg, content, isStreaming: true }
                        : msg
                    ));
                  }
                } catch (error) {
                  console.warn('Failed to parse stream data:', dataStr, error);
                }
              }
            }
          }
          
          // 完成流式输出
          setMessages(prev => prev.map(msg => 
            msg.id === assistantMsgId 
              ? { ...msg, isStreaming: false }
              : msg
          ));
        }
      } else {
        setIsLoading(true);
        
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: userMessage,
            user,
            responseMode: 'blocking'
          }),
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Received blocking response:', data); // 调试信息
        
        setMessages(prev => prev.map(msg => 
          msg.id === assistantMsgId 
            ? { ...msg, content: data.answer || data.data?.answer || '抱歉，我无法回答这个问题。' }
            : msg
        ));
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => prev.map(msg => 
        msg.id === assistantMsgId 
          ? { ...msg, content: '抱歉，发生了错误，请稍后再试。', isStreaming: false }
          : msg
      ));
    } finally {
      setIsLoading(false);
      setIsStreaming(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="flex-shrink-0 pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">AI 助手</CardTitle>
          <Button
            variant={streamMode ? "default" : "outline"}
            size="sm"
            onClick={() => setStreamMode(!streamMode)}
            className="text-xs"
          >
            {streamMode ? "流式" : "阻塞"}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col gap-4 p-4 min-h-0 relative">
        {/* 消息区域 */}
        <div 
          ref={messagesContainerRef}
          className="flex-1 overflow-y-auto space-y-4 scroll-smooth"
          onScroll={handleScroll}
          onMouseMove={handleMouseMove}
        >
          {messages.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">开始新的对话</h3>
              <p className="text-sm">您可以向AI助手提问任何问题</p>
            </div>
          )}

          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <Card className={`p-3 max-w-[80%] ${
                msg.type === 'user' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted'
              } ${msg.isStreaming ? 'animate-pulse' : ''}`}>
                {msg.type === 'user' ? (
                  <div className="whitespace-pre-wrap text-sm leading-relaxed">
                    {msg.content}
                  </div>
                ) : (
                  <div className="text-sm">
                    {msg.content ? (
                      <Markdown content={msg.content} />
                    ) : (
                      msg.isStreaming ? (
                        <div className="text-muted-foreground italic">正在输入...</div>
                      ) : (
                        <div className="text-muted-foreground">暂无回复</div>
                      )
                    )}
                  </div>
                )}
              </Card>
            </div>
          ))}

          {isLoading && !isStreaming && (
            <div className="flex items-center justify-center py-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                正在思考...
              </div>
            </div>
          )}
          
          {/* 滚动锚点 */}
          <div ref={messagesEndRef} className="h-1" />
        </div>

        {/* 滚动到底部按钮 */}
        {!autoScroll && userInteracting && (
          <Button
            variant="secondary"
            size="sm"
            className="absolute bottom-20 right-4 shadow-lg z-10 rounded-full w-10 h-10 p-0"
            onClick={() => {
              setAutoScroll(true);
              setUserInteracting(false);
              scrollToBottom(true);
            }}
          >
            <ChevronDown className="w-4 h-4" />
          </Button>
        )}

        {/* 输入区域 */}
        <div className="flex-shrink-0 flex gap-2">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="输入您的问题..."
            disabled={isLoading || isStreaming}
            className="flex-1"
          />
          <Button
            onClick={handleSend}
            disabled={!message.trim() || isLoading || isStreaming}
          >
            发送
          </Button>
        </div>
      </CardContent>
    </Card>
  );
} 