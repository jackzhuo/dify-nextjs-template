"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  MessageSquare,
  CheckCircle,
  Info,
} from "lucide-react";
import { SimpleChatInterface } from "@/components/chat/simple-chat-interface";

interface AppInfo {
  name: string;
  description: string;
  tags: string[];
}

interface AppParameters {
  user_input_form?: Array<{
    variable: string;
    label: string;
    required: boolean;
    max_length?: number;
    default?: string;
  }>;
}

function ChatPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [appInfo, setAppInfo] = useState<AppInfo | null>(null);
  const [appParameters, setAppParameters] = useState<AppParameters | null>(null);
  const [apiKey, setApiKey] = useState<string>("");
  const [baseURL, setBaseURL] = useState<string>("");

  useEffect(() => {
    // 从URL参数中获取连接信息
    const apiKeyParam = searchParams.get('apiKey');
    const baseURLParam = searchParams.get('baseURL');
    const appName = searchParams.get('appName');
    const appDescription = searchParams.get('appDescription');
    const appTags = searchParams.get('appTags');
    const appParametersParam = searchParams.get('appParameters');

    if (!apiKeyParam || !baseURLParam) {
      // 如果没有必需参数，重定向到首页
      router.push('/');
      return;
    }

    setApiKey(apiKeyParam);
    setBaseURL(baseURLParam);

    // 构建应用信息
    if (appName) {
      const info: AppInfo = {
        name: appName,
        description: appDescription || '',
        tags: appTags ? JSON.parse(appTags) : [],
      };
      setAppInfo(info);
    }

    // 构建应用参数
    if (appParametersParam) {
      try {
        const parameters = JSON.parse(appParametersParam);
        setAppParameters(parameters);
      } catch (error) {
        console.warn('Failed to parse app parameters:', error);
      }
    }
  }, [searchParams, router]);

  const handleDisconnect = () => {
    router.push('/');
  };

  // 如果还没有加载完配置信息，显示加载状态
  if (!apiKey || !baseURL) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            正在加载...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Badge variant="default" className="gap-1">
              <CheckCircle className="w-3 h-3" />
              已连接
            </Badge>
            {appInfo && (
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{appInfo.name}</span>
                <TooltipProvider>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                            <Info className="w-4 h-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>查看应用信息</p>
                        </TooltipContent>
                      </Tooltip>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                          <MessageSquare className="w-5 h-5" />
                          {appInfo.name}
                        </DialogTitle>
                        <DialogDescription>
                          应用详细信息
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <h4 className="text-sm font-medium mb-2">描述</h4>
                          <p className="text-sm text-muted-foreground">
                            {appInfo.description || "暂无描述"}
                          </p>
                        </div>
                        
                        {appInfo.tags && appInfo.tags.length > 0 && (
                          <div>
                            <h4 className="text-sm font-medium mb-2">标签</h4>
                            <div className="flex flex-wrap gap-1">
                              {appInfo.tags.map((tag, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {appParameters?.user_input_form && appParameters.user_input_form.length > 0 && (
                          <div>
                            <h4 className="text-sm font-medium mb-2">输入参数</h4>
                            <div className="space-y-2">
                              {appParameters.user_input_form.map((param, index) => (
                                <div key={index} className="border rounded p-3">
                                  <div className="flex items-center gap-2 mb-1">
                                    <code className="text-xs bg-muted px-1 py-0.5 rounded">{param.variable}</code>
                                    {param.required && (
                                      <Badge variant="destructive" className="text-xs">必需</Badge>
                                    )}
                                  </div>
                                  <p className="text-sm text-muted-foreground">{param.label}</p>
                                  {param.default && (
                                    <p className="text-xs text-muted-foreground mt-1">
                                      默认值: {param.default}
                                    </p>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        <div>
                          <h4 className="text-sm font-medium mb-2">连接信息</h4>
                          <div className="space-y-1 text-xs text-muted-foreground">
                            <div>API Key: {apiKey.slice(0, 8)}...</div>
                            <div>Base URL: {baseURL}</div>
                          </div>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </TooltipProvider>
              </div>
            )}
          </div>
          <Button variant="outline" size="sm" onClick={handleDisconnect}>
            断开连接
          </Button>
        </div>

        <div className="h-[calc(100vh-200px)]">
          <SimpleChatInterface
            user={`user-${Math.random().toString(36).substr(2, 9)}`}
            apiKey={apiKey}
            baseURL={baseURL}
          />
        </div>
      </div>
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            正在加载...
          </div>
        </div>
      </div>
    }>
      <ChatPageContent />
    </Suspense>
  );
} 