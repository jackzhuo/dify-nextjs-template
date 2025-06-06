import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

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
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
