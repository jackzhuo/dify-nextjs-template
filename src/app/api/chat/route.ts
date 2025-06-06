import { NextRequest, NextResponse } from 'next/server';
import { createDifyClient } from '@/lib/dify-client';
import { getDifyConfig } from '@/lib/env';

// 配置Edge Runtime用于Cloudflare Pages兼容性
export const runtime = 'edge';

// POST: 聊天API（支持流式和阻塞式）
export async function POST(request: NextRequest) {
  try {
    const { 
      message, 
      user, 
      conversationId, 
      responseMode = 'blocking',
      apiKey: clientApiKey,
      baseURL: clientBaseURL 
    } = await request.json();

    if (!message || !user) {
      return NextResponse.json(
        { error: 'Missing required fields: message, user' },
        { status: 400 }
      );
    }

    // 获取API配置：优先使用客户端传入的参数，否则使用环境变量
    const difyConfig = getDifyConfig();
    const apiKey = clientApiKey || difyConfig.apiKey;
    const baseURL = clientBaseURL || difyConfig.baseURL;
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Dify API key not provided' },
        { status: 400 }
      );
    }

    if (!baseURL) {
      return NextResponse.json(
        { error: 'Dify API base URL not provided' },
        { status: 400 }
      );
    }

    // 创建Dify客户端
    const client = createDifyClient({
      apiKey,
      baseURL,
    });

    // 根据响应模式处理请求
    if (responseMode === 'streaming') {
      // 流式响应
      const stream = new ReadableStream({
        async start(controller) {
          try {
            await client.sendChatMessageStream(
              {
                query: message,
                user,
                conversation_id: conversationId || undefined,
                response_mode: 'streaming'
              },
              (data) => {
                // 发送数据到客户端
                const chunk = `data: ${JSON.stringify(data)}\n\n`;
                controller.enqueue(new TextEncoder().encode(chunk));
              },
              (error) => {
                // 发送错误信息
                const errorChunk = `data: ${JSON.stringify({ error: error.message })}\n\n`;
                controller.enqueue(new TextEncoder().encode(errorChunk));
                controller.close();
              },
              () => {
                // 完成时关闭流
                const endChunk = `data: [DONE]\n\n`;
                controller.enqueue(new TextEncoder().encode(endChunk));
                controller.close();
              }
            );
          } catch (error) {
            const errorChunk = `data: ${JSON.stringify({ 
              error: error instanceof Error ? error.message : 'Unknown error' 
            })}\n\n`;
            controller.enqueue(new TextEncoder().encode(errorChunk));
            controller.close();
          }
        }
      });

      // 返回 Server-Sent Events 响应
      return new Response(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
    } else {
      // 阻塞式响应
      const response = await client.sendChatMessage({
        query: message,
        user,
        conversation_id: conversationId,
        response_mode: 'blocking',
      });

      return NextResponse.json({
        success: true,
        answer: response.answer,
        data: response,
      });
    }

  } catch (error) {
    console.error('Chat API error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to process chat message',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}



// OPTIONS: 处理CORS预检请求
export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
} 