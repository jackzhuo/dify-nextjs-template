"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  MessageSquare,
  ChevronDown,
} from "lucide-react";
import { Markdown } from "@/components/ui/markdown";

interface SimpleChatInterfaceProps {
  user: string;
  apiKey: string;
  baseURL: string;
}

export function SimpleChatInterface({ 
  user, 
  apiKey, 
  baseURL 
}: SimpleChatInterfaceProps) {
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
            responseMode: 'streaming',
            apiKey,
            baseURL
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
            responseMode: 'blocking',
            apiKey,
            baseURL
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