// 环境变量管理
// 统一处理所有环境变量的读取和默认值设置

export interface DifyConfig {
  apiKey: string;
  baseURL: string;
}

export interface AppConfig {
  name: string;
  description: string;
  defaultUserId: string;
  siteUrl: string;
}

export interface ChatConfig {
  enableStreaming: boolean;
  enableFileUpload: boolean;
  maxFiles: number;
  maxFileSize: number;
  acceptedFileTypes: string[];
  showDebugInfo: boolean;
  showSuggestedQuestions: boolean;
  apiTimeout: number;
  enableRequestLogging: boolean;
}

export interface UIConfig {
  themeMode: "light" | "dark" | "system";
}

// 获取环境变量的辅助函数
function getEnvVar(key: string, defaultValue?: string): string {
  return process.env[key] || defaultValue || "";
}

// 客户端专用：只能获取 NEXT_PUBLIC_ 开头的环境变量
function getClientEnvVar(key: string, defaultValue?: string): string {
  // 确保在客户端只访问公开的环境变量
  if (typeof window !== "undefined" && !key.startsWith("NEXT_PUBLIC_")) {
    console.warn(`尝试在客户端访问非公开环境变量: ${key}`);
    return defaultValue || "";
  }
  return process.env[key] || defaultValue || "";
}

function getBoolEnvVar(key: string, defaultValue: boolean = false): boolean {
  const value = getEnvVar(key);
  if (!value) return defaultValue;
  return value.toLowerCase() === "true" || value === "1";
}

function getNumberEnvVar(key: string, defaultValue: number = 0): number {
  const value = getEnvVar(key);
  if (!value) return defaultValue;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
}

function getArrayEnvVar(key: string, defaultValue: string[] = []): string[] {
  const value = getEnvVar(key);
  if (!value) return defaultValue;
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

// 客户端版本的辅助函数
function getClientBoolEnvVar(key: string, defaultValue: boolean = false): boolean {
  const value = getClientEnvVar(key);
  if (!value) return defaultValue;
  return value.toLowerCase() === "true" || value === "1";
}

function getClientNumberEnvVar(key: string, defaultValue: number = 0): number {
  const value = getClientEnvVar(key);
  if (!value) return defaultValue;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
}

function getClientArrayEnvVar(key: string, defaultValue: string[] = []): string[] {
  const value = getClientEnvVar(key);
  if (!value) return defaultValue;
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

// 获取 Dify 配置（服务端）
export function getDifyConfig(): DifyConfig {
  return {
    apiKey: getEnvVar("NEXT_PUBLIC_DIFY_API_KEY") || getEnvVar("DIFY_API_KEY"),
    baseURL:
      getEnvVar("NEXT_PUBLIC_DIFY_BASE_URL", "https://dify.allm.link/v1") ||
      getEnvVar("DIFY_BASE_URL", "https://dify.allm.link/v1"),
  };
}

// 获取 Dify 配置（客户端）- 只能访问公开的环境变量
export function getClientDifyConfig(): DifyConfig {
  return {
    apiKey: getClientEnvVar("NEXT_PUBLIC_DIFY_API_KEY", ""),
    baseURL: getClientEnvVar("NEXT_PUBLIC_DIFY_BASE_URL", "https://dify.allm.link/v1"),
  };
}

// 获取应用配置
export function getAppConfig(): AppConfig {
  return {
    name: getEnvVar("NEXT_PUBLIC_APP_NAME", "Dify AI 助手"),
    description: getEnvVar(
      "NEXT_PUBLIC_APP_DESCRIPTION",
      "基于Dify API的智能聊天助手"
    ),
    defaultUserId: getEnvVar("NEXT_PUBLIC_DEFAULT_USER_ID", "default-user"),
    siteUrl: getEnvVar("NEXT_PUBLIC_SITE_URL", "http://localhost:3000"),
  };
}

// 获取应用配置（客户端）
export function getClientAppConfig(): AppConfig {
  return {
    name: getClientEnvVar("NEXT_PUBLIC_APP_NAME", "Dify AI 助手"),
    description: getClientEnvVar(
      "NEXT_PUBLIC_APP_DESCRIPTION",
      "基于Dify API的智能聊天助手"
    ),
    defaultUserId: getClientEnvVar("NEXT_PUBLIC_DEFAULT_USER_ID", "default-user"),
    siteUrl: getClientEnvVar("NEXT_PUBLIC_SITE_URL", "http://localhost:3000"),
  };
}

// 获取聊天功能配置
export function getChatConfig(): ChatConfig {
  return {
    enableStreaming: getBoolEnvVar("NEXT_PUBLIC_ENABLE_STREAMING", true),
    enableFileUpload: getBoolEnvVar("NEXT_PUBLIC_ENABLE_FILE_UPLOAD", true),
    maxFiles: getNumberEnvVar("NEXT_PUBLIC_MAX_FILES", 5),
    maxFileSize: getNumberEnvVar("NEXT_PUBLIC_MAX_FILE_SIZE", 10 * 1024 * 1024), // 10MB
    acceptedFileTypes: getArrayEnvVar("NEXT_PUBLIC_ACCEPTED_FILE_TYPES", [
      ".txt",
      ".md",
      ".pdf",
      ".doc",
      ".docx",
      ".json",
      ".csv",
    ]),
    showDebugInfo: getBoolEnvVar("NEXT_PUBLIC_SHOW_DEBUG_INFO", false),
    showSuggestedQuestions: getBoolEnvVar(
      "NEXT_PUBLIC_SHOW_SUGGESTED_QUESTIONS",
      true
    ),
    apiTimeout: getNumberEnvVar("NEXT_PUBLIC_API_TIMEOUT", 30000),
    enableRequestLogging: getBoolEnvVar(
      "NEXT_PUBLIC_ENABLE_REQUEST_LOGGING",
      false
    ),
  };
}

// 获取聊天功能配置（客户端）
export function getClientChatConfig(): ChatConfig {
  return {
    enableStreaming: getClientBoolEnvVar("NEXT_PUBLIC_ENABLE_STREAMING", true),
    enableFileUpload: getClientBoolEnvVar("NEXT_PUBLIC_ENABLE_FILE_UPLOAD", true),
    maxFiles: getClientNumberEnvVar("NEXT_PUBLIC_MAX_FILES", 5),
    maxFileSize: getClientNumberEnvVar("NEXT_PUBLIC_MAX_FILE_SIZE", 10 * 1024 * 1024), // 10MB
    acceptedFileTypes: getClientArrayEnvVar("NEXT_PUBLIC_ACCEPTED_FILE_TYPES", [
      ".txt",
      ".md",
      ".pdf",
      ".doc",
      ".docx",
      ".json",
      ".csv",
    ]),
    showDebugInfo: getClientBoolEnvVar("NEXT_PUBLIC_SHOW_DEBUG_INFO", false),
    showSuggestedQuestions: getClientBoolEnvVar(
      "NEXT_PUBLIC_SHOW_SUGGESTED_QUESTIONS",
      true
    ),
    apiTimeout: getClientNumberEnvVar("NEXT_PUBLIC_API_TIMEOUT", 30000),
    enableRequestLogging: getClientBoolEnvVar(
      "NEXT_PUBLIC_ENABLE_REQUEST_LOGGING",
      false
    ),
  };
}

// 获取 UI 配置
export function getUIConfig(): UIConfig {
  const themeMode = getEnvVar("NEXT_PUBLIC_THEME_MODE", "system");
  return {
    themeMode: ["light", "dark", "system"].includes(themeMode)
      ? (themeMode as "light" | "dark" | "system")
      : "system",
  };
}

// 检查是否为开发环境
export function isDevelopment(): boolean {
  return getEnvVar("NODE_ENV") === "development";
}

// 检查是否为生产环境
export function isProduction(): boolean {
  return getEnvVar("NODE_ENV") === "production";
}

// 获取部署平台信息
export function getDeploymentPlatform(): "vercel" | "cloudflare" | "other" {
  if (getEnvVar("VERCEL_URL") || getEnvVar("VERCEL_ENV")) {
    return "vercel";
  }
  if (getEnvVar("CF_PAGES_URL") || getEnvVar("CF_PAGES_BRANCH")) {
    return "cloudflare";
  }
  return "other";
}

// 验证必需的环境变量
export function validateEnvironment(): {
  isValid: boolean;
  missingVars: string[];
  warnings: string[];
} {
  const missingVars: string[] = [];
  const warnings: string[] = [];

  // 检查必需的变量
  const difyConfig = getDifyConfig();
  if (!difyConfig.apiKey) {
    missingVars.push("NEXT_PUBLIC_DIFY_API_KEY 或 DIFY_API_KEY");
  }

  // 检查可选但重要的变量
  if (!getEnvVar("NEXT_PUBLIC_SITE_URL") && isProduction()) {
    warnings.push("建议在生产环境中设置 NEXT_PUBLIC_SITE_URL");
  }

  return {
    isValid: missingVars.length === 0,
    missingVars,
    warnings,
  };
}

// 导出所有配置的汇总
export function getAllConfig() {
  return {
    dify: getDifyConfig(),
    app: getAppConfig(),
    chat: getChatConfig(),
    ui: getUIConfig(),
    development: isDevelopment(),
    production: isProduction(),
    platform: getDeploymentPlatform(),
    validation: validateEnvironment(),
  };
}
