'use client';

import { useState, useCallback, useRef } from 'react';
import { DifyClient, ChatMessage, ChatResponse, SuggestedQuestion } from '@/lib/dify-client';

export interface UseDifyProps {
  client: DifyClient;
  user: string;
  conversationId?: string;
}

export interface ChatMessageUI {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: number;
  messageId?: string;
  isStreaming?: boolean;
  metadata?: ChatResponse['metadata'];
}

export function useDify({ client, user, conversationId: initialConversationId }: UseDifyProps) {
  const [messages, setMessages] = useState<ChatMessageUI[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | undefined>(initialConversationId);
  const [suggestedQuestions, setSuggestedQuestions] = useState<SuggestedQuestion[]>([]);
  
  const currentTaskId = useRef<string | null>(null);
  const streamingMessageId = useRef<string | null>(null);

  // 添加用户消息到UI
  const addUserMessage = useCallback((content: string): string => {
    const messageId = Date.now().toString();
    const newMessage: ChatMessageUI = {
      id: messageId,
      type: 'user',
      content,
      timestamp: Date.now(),
    };
    setMessages(prev => [...prev, newMessage]);
    return messageId;
  }, []);

  // 添加助手消息到UI
  const addAssistantMessage = useCallback((content: string, messageId?: string, metadata?: ChatResponse['metadata']): string => {
    const id = Date.now().toString();
    const newMessage: ChatMessageUI = {
      id,
      type: 'assistant',
      content,
      timestamp: Date.now(),
      messageId,
      metadata,
    };
    setMessages(prev => [...prev, newMessage]);
    return id;
  }, []);

  // 更新流式消息内容
  const updateStreamingMessage = useCallback((id: string, content: string, isComplete: boolean = false) => {
    setMessages(prev => prev.map(msg => 
      msg.id === id 
        ? { ...msg, content, isStreaming: !isComplete }
        : msg
    ));
  }, []);

  // 发送聊天消息（阻塞模式）
  const sendMessage = useCallback(async (
    content: string, 
    inputs?: Record<string, unknown>,
    files?: File[]
  ): Promise<void> => {
    if (isLoading || isStreaming) return;

    setIsLoading(true);
    setError(null);
    
    // 添加用户消息
    addUserMessage(content);

    try {
      const message: ChatMessage = {
        query: content,
        response_mode: 'blocking',
        user,
        conversation_id: conversationId,
        inputs,
        files,
      };

      const response = await client.sendChatMessage(message);
      
      // 设置对话ID（如果是新对话）
      if (!conversationId && response.conversation_id) {
        setConversationId(response.conversation_id);
      }

      // 添加助手响应
      addAssistantMessage(response.answer, response.message_id, response.metadata);

      // 获取建议问题
      try {
        const suggestions = await client.getSuggestedQuestions(response.message_id);
        setSuggestedQuestions(suggestions.data);
      } catch (suggestionError) {
        console.warn('Failed to fetch suggested questions:', suggestionError);
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send message';
      setError(errorMessage);
      console.error('Error sending message:', err);
    } finally {
      setIsLoading(false);
    }
  }, [client, user, conversationId, isLoading, isStreaming, addUserMessage, addAssistantMessage]);

  // 发送流式聊天消息
  const sendMessageStream = useCallback(async (
    content: string,
    inputs?: Record<string, unknown>,
    files?: File[]
  ): Promise<void> => {
    if (isLoading || isStreaming) return;

    setIsStreaming(true);
    setError(null);

    // 添加用户消息
    addUserMessage(content);
    
    // 预先添加一个空的助手消息用于流式更新
    const assistantMessageId = addAssistantMessage('', undefined);
    streamingMessageId.current = assistantMessageId;

    try {
      const message: ChatMessage = {
        query: content,
        response_mode: 'streaming',
        user,
        conversation_id: conversationId,
        inputs,
        files,
      };

      let fullResponse = '';
      let lastResponse: ChatResponse | null = null;

      await client.sendChatMessageStream(
        message,
        (data: ChatResponse) => {
          // 保存任务ID用于可能的停止操作
          if (data.task_id) {
            currentTaskId.current = data.task_id;
          }

          // 设置对话ID（如果是新对话）
          if (!conversationId && data.conversation_id) {
            setConversationId(data.conversation_id);
          }

          // 累积响应内容
          if (data.answer) {
            fullResponse += data.answer;
            updateStreamingMessage(assistantMessageId, fullResponse, false);
          }

          lastResponse = data;
        },
        (error: Error) => {
          setError(error.message);
          console.error('Streaming error:', error);
        },
        () => {
          // 流式完成
          updateStreamingMessage(assistantMessageId, fullResponse, true);
          
          // 获取建议问题
          if (lastResponse?.message_id) {
            client.getSuggestedQuestions(lastResponse.message_id)
              .then(suggestions => setSuggestedQuestions(suggestions.data))
              .catch(err => console.warn('Failed to fetch suggested questions:', err));
          }

          setIsStreaming(false);
          currentTaskId.current = null;
          streamingMessageId.current = null;
        }
      );

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send message';
      setError(errorMessage);
      setIsStreaming(false);
      currentTaskId.current = null;
      streamingMessageId.current = null;
    }
  }, [client, user, conversationId, isLoading, isStreaming, addUserMessage, addAssistantMessage, updateStreamingMessage]);

  // 停止当前流式生成
  const stopGeneration = useCallback(async (): Promise<void> => {
    if (!currentTaskId.current || !isStreaming) return;

    try {
      await client.stopChatMessage(currentTaskId.current);
      
      // 完成当前流式消息
      if (streamingMessageId.current) {
        setMessages(prev => prev.map(msg => 
          msg.id === streamingMessageId.current
            ? { ...msg, isStreaming: false }
            : msg
        ));
      }

      setIsStreaming(false);
      currentTaskId.current = null;
      streamingMessageId.current = null;
    } catch (err) {
      console.error('Error stopping generation:', err);
    }
  }, [client, isStreaming]);

  // 清空聊天记录
  const clearMessages = useCallback(() => {
    setMessages([]);
    setSuggestedQuestions([]);
    setError(null);
  }, []);

  // 重新开始对话
  const startNewConversation = useCallback(() => {
    setConversationId(undefined);
    clearMessages();
  }, [clearMessages]);

  // 消息反馈
  const sendFeedback = useCallback(async (
    messageId: string,
    rating: 'like' | 'dislike'
  ): Promise<void> => {
    try {
      await client.messageFeedback(messageId, rating, user);
    } catch (err) {
      console.error('Error sending feedback:', err);
    }
  }, [client, user]);

  return {
    // 状态
    messages,
    isLoading,
    isStreaming,
    error,
    conversationId,
    suggestedQuestions,

    // 操作
    sendMessage,
    sendMessageStream,
    stopGeneration,
    clearMessages,
    startNewConversation,
    sendFeedback,

    // 工具函数
    canSendMessage: !isLoading && !isStreaming,
  };
} 