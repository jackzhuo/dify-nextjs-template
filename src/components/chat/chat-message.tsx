'use client';

import { memo } from 'react';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ThumbsUp, ThumbsDown, Copy, User, Bot } from 'lucide-react';
import { ChatMessageUI } from '@/hooks/use-dify';
import { cn } from '@/lib/utils';

interface ChatMessageProps {
  message: ChatMessageUI;
  onFeedback?: (messageId: string, rating: 'like' | 'dislike') => void;
  onCopy?: (content: string) => void;
}

export const ChatMessage = memo(function ChatMessage({ 
  message, 
  onFeedback, 
  onCopy 
}: ChatMessageProps) {
  const isUser = message.type === 'user';
  const isAssistant = message.type === 'assistant';

  const handleCopy = () => {
    onCopy?.(message.content);
    // 可以添加复制成功的提示
    navigator.clipboard.writeText(message.content);
  };

  const handleFeedback = (rating: 'like' | 'dislike') => {
    if (message.messageId && onFeedback) {
      onFeedback(message.messageId, rating);
    }
  };

  return (
    <div className={cn(
      'flex gap-3 mb-4',
      isUser ? 'justify-end' : 'justify-start'
    )}>
      {/* 助手头像 */}
      {isAssistant && (
        <Avatar className="w-8 h-8 mt-1">
          <AvatarFallback>
            <Bot className="w-4 h-4" />
          </AvatarFallback>
        </Avatar>
      )}

      {/* 消息内容 */}
      <div className={cn(
        'max-w-[80%] space-y-2',
        isUser ? 'order-first' : ''
      )}>
        <Card className={cn(
          'p-3',
          isUser 
            ? 'bg-primary text-primary-foreground ml-auto' 
            : 'bg-muted',
          message.isStreaming && 'animate-pulse'
        )}>
          <div className="whitespace-pre-wrap text-sm leading-relaxed">
            {message.content || (message.isStreaming ? '正在输入...' : '')}
          </div>
          
          {/* 流式输入指示器 */}
          {message.isStreaming && (
            <div className="flex items-center gap-1 mt-2 text-xs opacity-70">
              <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          )}
        </Card>

        {/* 消息操作按钮 */}
        {isAssistant && !message.isStreaming && message.content && (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              className="h-6 px-2 text-xs"
            >
              <Copy className="w-3 h-3 mr-1" />
              复制
            </Button>
            
            {/* 反馈按钮 */}
            {message.messageId && onFeedback && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleFeedback('like')}
                  className="h-6 px-2 text-xs"
                >
                  <ThumbsUp className="w-3 h-3 mr-1" />
                  有用
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleFeedback('dislike')}
                  className="h-6 px-2 text-xs"
                >
                  <ThumbsDown className="w-3 h-3 mr-1" />
                  无用
                </Button>
              </>
            )}
          </div>
        )}

        {/* 消息元数据（仅用于调试或高级用户） */}
        {isAssistant && message.metadata && process.env.NODE_ENV === 'development' && (
          <div className="text-xs text-muted-foreground space-y-1">
            <div className="flex gap-2 flex-wrap">
              <Badge variant="outline" className="text-xs">
                输入: {message.metadata.usage.prompt_tokens} tokens
              </Badge>
              <Badge variant="outline" className="text-xs">
                输出: {message.metadata.usage.completion_tokens} tokens
              </Badge>
              <Badge variant="outline" className="text-xs">
                延迟: {(message.metadata.usage.latency * 1000).toFixed(0)}ms
              </Badge>
              {message.metadata.usage.total_price && (
                <Badge variant="outline" className="text-xs">
                  费用: ${message.metadata.usage.total_price} {message.metadata.usage.currency}
                </Badge>
              )}
            </div>
            
            {/* 检索资源信息 */}
            {message.metadata.retriever_resources && message.metadata.retriever_resources.length > 0 && (
              <div className="text-xs text-muted-foreground">
                <div className="font-medium mb-1">引用来源:</div>
                {message.metadata.retriever_resources.map((resource, index) => (
                  <div key={index} className="pl-2 border-l-2 border-muted mb-1">
                    <div className="font-medium">{resource.document_name}</div>
                    <div className="opacity-70 truncate">
                      {resource.content.substring(0, 100)}...
                    </div>
                    <div className="text-xs opacity-50">
                      相关度: {(resource.score * 100).toFixed(1)}%
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 用户头像 */}
      {isUser && (
        <Avatar className="w-8 h-8 mt-1">
          <AvatarFallback>
            <User className="w-4 h-4" />
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}); 