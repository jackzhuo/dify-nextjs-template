// Dify API Client
// 基于 https://docs.dify.ai/api-reference 的接口封装

export interface DifyConfig {
  apiKey: string;
  baseURL?: string;
}

export interface ChatMessage {
  query: string;
  response_mode?: 'blocking' | 'streaming';
  conversation_id?: string;
  user: string;
  inputs?: Record<string, unknown>;
  files?: File[];
}

export interface ChatResponse {
  event: string;
  task_id: string;
  id: string;
  message_id: string;
  conversation_id: string;
  mode: string;
  answer: string;
  metadata: {
    usage: {
      prompt_tokens: number;
      completion_tokens: number;
      total_tokens: number;
      total_price: string;
      currency: string;
      latency: number;
    };
    retriever_resources?: Array<{
      position: number;
      dataset_id: string;
      dataset_name: string;
      document_id: string;
      document_name: string;
      segment_id: string;
      score: number;
      content: string;
    }>;
  };
  created_at: number;
}

export interface SuggestedQuestion {
  question: string;
}

export interface Conversation {
  id: string;
  name: string;
  inputs: Record<string, unknown>;
  status: string;
  created_at: number;
  updated_at: number;
}

export interface AppInfo {
  name: string;
  description: string;
  tags: string[];
}

export interface AppParameters {
  user_input_form?: Array<{
    variable: string;
    label: string;
    required: boolean;
    max_length?: number;
    default?: string;
  }>;
}

export class DifyClient {
  private apiKey: string;
  private baseURL: string;

  constructor(config: DifyConfig) {
    this.apiKey = config.apiKey;
    this.baseURL = config.baseURL || 'https://api.dify.ai/v1';
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`Dify API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // 发送聊天消息
  async sendChatMessage(message: ChatMessage): Promise<ChatResponse> {
    const body: Record<string, unknown> = {
      query: message.query,
      response_mode: message.response_mode || 'blocking',
      user: message.user,
      inputs: message.inputs || {},
      auto_generate_name: true,
    };
    
    if (message.conversation_id) {
      body.conversation_id = message.conversation_id;
    }

    // 注意：文件上传需要 FormData，这里先不处理文件
    // 如果有文件，需要使用 FormData 格式
    if (message.files && message.files.length > 0) {
      const formData = new FormData();
      formData.append('query', message.query);
      formData.append('response_mode', message.response_mode || 'blocking');
      formData.append('user', message.user);
      
      if (message.conversation_id) {
        formData.append('conversation_id', message.conversation_id);
      }
      
      if (message.inputs) {
        formData.append('inputs', JSON.stringify(message.inputs));
      }

      message.files.forEach((file) => {
        formData.append('files', file);
      });

      return this.makeRequest<ChatResponse>('/chat-messages', {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      });
    }

    // 没有文件时使用 JSON 格式
    return this.makeRequest<ChatResponse>('/chat-messages', {
      method: 'POST',
      body: JSON.stringify(body),
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
    });
  }

  // 流式聊天消息
  async sendChatMessageStream(
    message: ChatMessage,
    onMessage: (data: ChatResponse) => void,
    onError?: (error: Error) => void,
    onComplete?: () => void
  ): Promise<void> {
    const body: Record<string, unknown> = {
      query: message.query,
      response_mode: 'streaming',
      user: message.user,
      inputs: message.inputs || {},
      auto_generate_name: true,
    };
    
    if (message.conversation_id) {
      body.conversation_id = message.conversation_id;
    }

    try {
      const response = await fetch(`${this.baseURL}/chat-messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error(`Dify API Error: ${response.status} ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body');
      }

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          onComplete?.();
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              onMessage(data);
            } catch {
              console.warn('Failed to parse SSE data:', line);
            }
          }
        }
      }
    } catch (error) {
      onError?.(error as Error);
    }
  }

  // 停止聊天消息生成
  async stopChatMessage(taskId: string): Promise<{ result: string }> {
    return this.makeRequest(`/chat-messages/${taskId}/stop`, {
      method: 'POST',
    });
  }

  // 获取建议问题
  async getSuggestedQuestions(
    messageId: string
  ): Promise<{ data: SuggestedQuestion[] }> {
    return this.makeRequest(`/messages/${messageId}/suggested`, {
      method: 'GET',
    });
  }

  // 获取对话列表
  async getConversations(
    user: string,
    lastId?: string,
    limit: number = 20
  ): Promise<{ data: Conversation[]; has_more: boolean; limit: number }> {
    const params = new URLSearchParams({
      user,
      limit: limit.toString(),
    });
    
    if (lastId) {
      params.append('last_id', lastId);
    }

    return this.makeRequest(`/conversations?${params}`, {
      method: 'GET',
    });
  }

  // 重命名对话
  async renameConversation(
    conversationId: string,
    name: string,
    user: string
  ): Promise<{ result: string }> {
    return this.makeRequest(`/conversations/${conversationId}`, {
      method: 'PATCH',
      body: JSON.stringify({ name, user }),
    });
  }

  // 删除对话
  async deleteConversation(
    conversationId: string,
    user: string
  ): Promise<{ result: string }> {
    return this.makeRequest(`/conversations/${conversationId}`, {
      method: 'DELETE',
      body: JSON.stringify({ user }),
    });
  }

  // 获取对话消息历史
  async getConversationMessages(
    conversationId: string,
    user: string,
    firstId?: string,
    limit: number = 20
  ): Promise<{ data: ChatResponse[]; has_more: boolean; limit: number }> {
    const params = new URLSearchParams({
      user,
      limit: limit.toString(),
    });
    
    if (firstId) {
      params.append('first_id', firstId);
    }

    return this.makeRequest(`/conversations/${conversationId}/messages?${params}`, {
      method: 'GET',
    });
  }

  // 消息反馈
  async messageFeedback(
    messageId: string,
    rating: 'like' | 'dislike',
    user: string
  ): Promise<{ result: string }> {
    return this.makeRequest(`/messages/${messageId}/feedbacks`, {
      method: 'POST',
      body: JSON.stringify({ rating, user }),
    });
  }

  // 获取应用基本信息
  async getAppInfo(): Promise<AppInfo> {
    return this.makeRequest<AppInfo>('/info');
  }

  // 获取应用参数
  async getAppParameters(): Promise<AppParameters> {
    return this.makeRequest<AppParameters>('/parameters');
  }
}

// 创建默认客户端实例
let defaultClient: DifyClient | null = null;

export function createDifyClient(config: DifyConfig): DifyClient {
  defaultClient = new DifyClient(config);
  return defaultClient;
}

export function getDifyClient(): DifyClient {
  if (!defaultClient) {
    throw new Error('Dify client not initialized. Call createDifyClient first.');
  }
  return defaultClient;
} 