import { DifyChatPage } from "@/components/dify-chat-page";
import {
  getAppConfig,
  getChatConfig,
  getDifyConfig,
  validateEnvironment,
} from "@/lib/env";

export default function Home() {
  // 在服务端读取配置
  const appConfig = getAppConfig();
  const chatConfig = getChatConfig();
  const difyConfig = getDifyConfig();
  const envValidation = validateEnvironment();

  // 将配置传递给客户端组件
  return (
    <DifyChatPage
      initialApiKey={difyConfig.apiKey}
      baseURL={difyConfig.baseURL}
      appConfig={appConfig}
      chatConfig={chatConfig}
      envValidation={envValidation}
    />
  );
}
