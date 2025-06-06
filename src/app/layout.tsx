import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  MessageSquare,
  ExternalLink,
  Github,
  CheckCircle,
} from "lucide-react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Dify NextJS Template - AI聊天界面",
  description: "基于Dify API的Next.js聊天界面模板，支持流式对话、文件上传等功能",
  keywords: ["Dify", "Next.js", "AI", "聊天", "ChatBot", "React"],
  authors: [{ name: "Dify Team" }],
  openGraph: {
    title: "Dify NextJS Template",
    description: "基于Dify API的Next.js聊天界面模板",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-background`}
      >
        {/* 系统头部 */}
        <header className="border-b bg-white/50 backdrop-blur-sm sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-xl font-bold">Dify NextJS Template</h1>
                  <p className="text-sm text-muted-foreground">
                    基于Dify API的Next.js聊天界面模板
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <Badge variant="outline" className="gap-1">
                  <CheckCircle className="w-3 h-3" />
                  Next.js 15
                </Badge>
                <Badge variant="outline" className="gap-1">
                  <CheckCircle className="w-3 h-3" />
                  TypeScript
                </Badge>
                <Badge variant="outline" className="gap-1">
                  <CheckCircle className="w-3 h-3" />
                  Tailwind CSS
                </Badge>

                <Button variant="outline" size="sm" asChild>
                  <a
                    href="https://docs.dify.ai/api-reference"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="gap-1"
                  >
                    <ExternalLink className="w-3 h-3" />
                    API文档
                  </a>
                </Button>

                <Button variant="outline" size="sm" asChild>
                  <a
                    href="https://github.com/jackzhuo/dify-nextjs-template"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="gap-1"
                  >
                    <Github className="w-3 h-3" />
                    源码
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* 页面内容 */}
        <main>{children}</main>
      </body>
    </html>
  );
}
