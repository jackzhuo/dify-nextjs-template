'use client';

import { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  MessageSquare, 
  HelpCircle, 
  Trash2,
  Download,
  Plus
} from 'lucide-react';

import { ChatMessage } from './chat-message';
import { ChatInput } from './chat-input';
import { useDify } from '@/hooks/use-dify';
import { DifyClient } from '@/lib/dify-client';
import { cn } from '@/lib/utils';

interface ChatInterfaceProps {
  client: DifyClient;
  user: string;
  conversationId?: string;
  title?: string;
  className?: string;
  showHeader?: boolean;
  showSuggestedQuestions?: boolean;
  enableFileUpload?: boolean;
  enableStreamMode?: boolean;
  maxFiles?: number;
  maxFileSize?: number;
  onConversationChange?: (conversationId: string | undefined) => void;
}

export function ChatInterface({
  client,
  user,
  conversationId: initialConversationId,
  title = "AI 助手",
  className,
  showHeader = true,
  showSuggestedQuestions = true,
  enableFileUpload = true,
  enableStreamMode = true,
  maxFiles = 5,
  maxFileSize = 10 * 1024 * 1024,
  onConversationChange,
}: ChatInterfaceProps) {
  const {
    messages,
    isLoading,
    isStreaming,
    error,
    conversationId,
    suggestedQuestions,
    sendMessage,
    sendMessageStream,
    stopGeneration,
    clearMessages,
    startNewConversation,
    sendFeedback,
    canSendMessage,
  } = useDify({
    client,
    user,
    conversationId: initialConversationId,
  });

  const [streamMode, setStreamMode] = useState(enableStreamMode);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  // 监听对话ID变化
  useEffect(() => {
    onConversationChange?.(conversationId);
  }, [conversationId, onConversationChange]);

  // 自动滚动到底部
  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isStreaming]);

  // 处理消息发送
  const handleSendMessage = (content: string, files?: File[]) => {
    if (streamMode && enableStreamMode) {
      sendMessageStream(content, undefined, files);
    } else {
      sendMessage(content, undefined, files);
    }
  };

  // 处理建议问题点击
  const handleSuggestedQuestionClick = (question: string) => {
    handleSendMessage(question);
  };

  // 导出对话记录
  const exportConversation = () => {
    const content = messages.map(msg => 
      `[${msg.type === 'user' ? '用户' : 'AI'}] ${msg.content}`
    ).join('\n\n');
    
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `conversation_${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Card className={cn("flex flex-col h-full", className)}>
      {/* 头部 */}
      {showHeader && (
        <CardHeader className="flex-shrink-0 pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              <CardTitle className="text-lg">{title}</CardTitle>
              {conversationId && (
                <Badge variant="outline" className="text-xs">
                  ID: {conversationId.slice(-8)}
                </Badge>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              {/* 流式模式切换 */}
              {enableStreamMode && (
                <Button
                  variant={streamMode ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStreamMode(!streamMode)}
                  className="text-xs"
                >
                  {streamMode ? "流式" : "阻塞"}
                </Button>
              )}

              {/* 导出对话 */}
              {messages.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={exportConversation}
                  className="text-xs"
                >
                  <Download className="w-3 h-3 mr-1" />
                  导出
                </Button>
              )}

              {/* 清空对话 */}
              {messages.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearMessages}
                  className="text-xs"
                >
                  <Trash2 className="w-3 h-3 mr-1" />
                  清空
                </Button>
              )}

              {/* 新对话 */}
              <Button
                variant="outline"
                size="sm"
                onClick={startNewConversation}
                className="text-xs"
              >
                <Plus className="w-3 h-3 mr-1" />
                新对话
              </Button>
            </div>
          </div>
        </CardHeader>
      )}

      <CardContent className="flex-1 flex flex-col gap-4 p-4 min-h-0">
        {/* 消息区域 */}
        <ScrollArea ref={scrollAreaRef} className="flex-1 pr-4">
          <div className="space-y-4">
            {/* 欢迎消息 */}
            {messages.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">开始新的对话</h3>
                <p className="text-sm">
                  您可以向AI助手提问任何问题，支持文本和文件输入。
                </p>
              </div>
            )}

            {/* 消息列表 */}
            {messages.map((message) => (
              <ChatMessage
                key={message.id}
                message={message}
                onFeedback={sendFeedback}
              />
            ))}

            {/* 错误提示 */}
            {error && (
              <Card className="border-destructive bg-destructive/5">
                <CardContent className="p-3">
                  <div className="flex items-start gap-2">
                    <HelpCircle className="w-4 h-4 text-destructive mt-0.5" />
                    <div>
                      <div className="font-medium text-destructive">发生错误</div>
                      <div className="text-sm text-destructive/80 mt-1">{error}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 自动滚动锚点 */}
            <div ref={endOfMessagesRef} />
          </div>
        </ScrollArea>

        {/* 建议问题 */}
        {showSuggestedQuestions && suggestedQuestions.length > 0 && !isStreaming && (
          <div className="space-y-2">
            <Separator />
            <div>
              <div className="text-sm font-medium text-muted-foreground mb-2">
                建议问题:
              </div>
              <div className="flex flex-wrap gap-2">
                {suggestedQuestions.map((sq, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => handleSuggestedQuestionClick(sq.question)}
                    disabled={!canSendMessage}
                    className="text-xs h-auto py-2 px-3 whitespace-normal text-left justify-start"
                  >
                    {sq.question}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 输入区域 */}
        <div className="flex-shrink-0">
          <ChatInput
            onSendMessage={handleSendMessage}
            onStopGeneration={isStreaming ? stopGeneration : undefined}
            isLoading={isLoading}
            isStreaming={isStreaming}
            disabled={!canSendMessage}
            maxFiles={enableFileUpload ? maxFiles : 0}
            maxFileSize={maxFileSize}
            acceptedFileTypes={enableFileUpload ? ['.txt', '.md', '.pdf', '.doc', '.docx'] : []}
          />
        </div>

        {/* 状态指示 */}
        {(isLoading || isStreaming) && (
          <div className="text-xs text-muted-foreground text-center">
            {isStreaming ? 'AI正在回复中...' : '正在处理您的请求...'}
          </div>
        )}
      </CardContent>
    </Card>
  );
} 