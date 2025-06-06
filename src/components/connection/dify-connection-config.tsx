"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Key,
  Settings,
  Info,
  AlertCircle,
} from "lucide-react";
import { DifyClient } from "@/lib/dify-client";
import { useRouter } from "next/navigation";

interface DifyConnectionConfigProps {
  initialApiKey?: string;
  initialBaseURL?: string;
  envValidation?: {
    isValid: boolean;
    missingVars: string[];
    warnings: string[];
  };
}

export function DifyConnectionConfig({
  initialApiKey,
  initialBaseURL,
  envValidation,
}: DifyConnectionConfigProps) {
  const router = useRouter();
  const [apiKey, setApiKey] = useState(initialApiKey || "");
  const [baseURL, setBaseURL] = useState(initialBaseURL || "");
  const [error, setError] = useState<string>("");
  const [isLoadingAppInfo, setIsLoadingAppInfo] = useState(false);

  // 初始化时仅加载环境变量作为默认值，不自动连接
  useEffect(() => {
    console.log("Initial API Key:", initialApiKey);
    console.log("Base URL:", initialBaseURL);
    
    // 将环境变量设置为输入框的默认值（如果用户还没有输入）
    if (initialApiKey && !apiKey) {
      setApiKey(initialApiKey);
    }
    if (initialBaseURL && !baseURL) {
      setBaseURL(initialBaseURL);
    }
  }, [initialApiKey, initialBaseURL, apiKey, baseURL]);

  const handleConnect = async () => {
    const keyToUse = apiKey.trim() || initialApiKey;
    const urlToUse = baseURL.trim() || initialBaseURL;

    if (!keyToUse) {
      setError("请输入API Key");
      return;
    }

    if (!urlToUse) {
      setError("请输入API Base URL");
      return;
    }

    setIsLoadingAppInfo(true);
    setError("");

    try {
      // 创建临时客户端来测试连接和获取应用信息
      const client = new DifyClient({
        apiKey: keyToUse,
        baseURL: urlToUse,
      });

      // 获取应用基本信息来验证连接
      const [info, parameters] = await Promise.all([
        client.getAppInfo(),
        client.getAppParameters().catch(() => null), // 参数可能不存在，忽略错误
      ]);

      console.log("Connection successful, app info:", info);

      // 将连接信息传递到聊天页面
      const chatUrl = new URL('/chat', window.location.origin);
      chatUrl.searchParams.set('apiKey', keyToUse);
      chatUrl.searchParams.set('baseURL', urlToUse);
      chatUrl.searchParams.set('appName', info.name);
      chatUrl.searchParams.set('appDescription', info.description || '');
      chatUrl.searchParams.set('appTags', JSON.stringify(info.tags || []));
      
      if (parameters) {
        chatUrl.searchParams.set('appParameters', JSON.stringify(parameters));
      }

      // 跳转到聊天页面
      router.push(chatUrl.toString());
    } catch (err) {
      console.error("Failed to connect or get app info:", err);
      setError(err instanceof Error ? err.message : "连接失败，请检查 API Key、Base URL 和网络连接");
    } finally {
      setIsLoadingAppInfo(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
          <Key className="w-8 h-8 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">连接到Dify</h2>
          <p className="text-muted-foreground mt-2">
            请配置您的Dify API连接信息以开始使用聊天功能
            {initialApiKey && (
              <span className="block text-xs mt-1 text-green-600">
                💡 已检测到环境变量中的配置，您可以直接点击连接或自定义修改
              </span>
            )}
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
            <label htmlFor="baseurl" className="text-sm font-medium">
              API Base URL
            </label>
            <Input
              id="baseurl"
              type="url"
              value={baseURL}
              onChange={(e) => setBaseURL(e.target.value)}
              placeholder="https://api.dify.ai/v1"
              className="font-mono"
            />
            <p className="text-xs text-muted-foreground">
              Dify API 的基础地址，默认为官方API地址
            </p>
          </div>

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
            disabled={(!apiKey.trim() && !initialApiKey) || (!baseURL.trim() && !initialBaseURL) || isLoadingAppInfo}
          >
            {isLoadingAppInfo ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                正在连接...
              </div>
            ) : (
              "连接到Dify"
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
} 