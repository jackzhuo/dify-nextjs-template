'use client';

import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Send, 
  Paperclip, 
  X, 
  StopCircle,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatInputProps {
  onSendMessage: (content: string, files?: File[]) => void;
  onStopGeneration?: () => void;
  isLoading?: boolean;
  isStreaming?: boolean;
  disabled?: boolean;
  placeholder?: string;
  maxFiles?: number;
  maxFileSize?: number; // bytes
  acceptedFileTypes?: string[];
}

export function ChatInput({
  onSendMessage,
  onStopGeneration,
  isLoading = false,
  isStreaming = false,
  disabled = false,
  placeholder = "输入您的问题...",
  maxFiles = 5,
  maxFileSize = 10 * 1024 * 1024, // 10MB
  acceptedFileTypes = ['.txt', '.md', '.pdf', '.doc', '.docx']
}: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const canSend = message.trim() && !disabled && !isLoading && !isStreaming;
  const showStopButton = isStreaming && onStopGeneration;

  // 处理发送消息
  const handleSend = useCallback(() => {
    if (!canSend) return;
    
    onSendMessage(message.trim(), files.length > 0 ? files : undefined);
    setMessage('');
    setFiles([]);
    
    // 重置 textarea 高度
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  }, [message, files, canSend, onSendMessage]);

  // 处理键盘事件
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }, [handleSend]);

  // 自动调整 textarea 高度
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const target = e.target;
    setMessage(target.value);
    
    // 重置高度然后设置为 scrollHeight
    target.style.height = 'auto';
    target.style.height = `${Math.min(target.scrollHeight, 120)}px`;
  }, []);

  // 处理文件选择
  const handleFileSelect = useCallback((selectedFiles: FileList | null) => {
    if (!selectedFiles) return;

    const newFiles = Array.from(selectedFiles);
    const validFiles: File[] = [];
    const errors: string[] = [];

    newFiles.forEach(file => {
      // 检查文件数量限制
      if (files.length + validFiles.length >= maxFiles) {
        errors.push(`最多只能上传 ${maxFiles} 个文件`);
        return;
      }

      // 检查文件大小
      if (file.size > maxFileSize) {
        errors.push(`文件 "${file.name}" 超过 ${Math.round(maxFileSize / 1024 / 1024)}MB 限制`);
        return;
      }

      // 检查文件类型
      const fileExt = '.' + file.name.split('.').pop()?.toLowerCase();
      if (acceptedFileTypes.length > 0 && !acceptedFileTypes.includes(fileExt)) {
        errors.push(`文件类型 "${fileExt}" 不支持`);
        return;
      }

      validFiles.push(file);
    });

    if (validFiles.length > 0) {
      setFiles(prev => [...prev, ...validFiles]);
    }

    if (errors.length > 0) {
      // 这里可以显示错误提示
      console.warn('文件上传错误:', errors);
    }
  }, [files.length, maxFiles, maxFileSize, acceptedFileTypes]);

  // 删除文件
  const removeFile = useCallback((index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  }, []);

  // 拖拽处理
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  }, [handleFileSelect]);

  // 格式化文件大小
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <Card className={cn(
      'p-4 border-2 transition-colors',
      isDragOver && 'border-primary bg-primary/5',
      disabled && 'opacity-50 pointer-events-none'
    )}>
      {/* 文件列表 */}
      {files.length > 0 && (
        <div className="mb-3 space-y-2">
          <div className="text-sm font-medium text-muted-foreground">
            已选择文件 ({files.length}/{maxFiles})
          </div>
          <div className="flex flex-wrap gap-2">
            {files.map((file, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="pr-1 max-w-[200px]"
              >
                <span className="truncate mr-1">
                  {file.name}
                </span>
                <span className="text-xs opacity-70 mr-1">
                  {formatFileSize(file.size)}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                  onClick={() => removeFile(index)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* 输入区域 */}
      <div
        className="space-y-3"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <Textarea
          ref={textareaRef}
          value={message}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className="min-h-[60px] max-h-[120px] resize-none"
          style={{ height: 'auto' }}
        />

        {/* 操作按钮 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* 文件上传按钮 */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled || files.length >= maxFiles}
              className="h-8"
            >
              <Paperclip className="w-4 h-4 mr-1" />
              添加文件
            </Button>
            
            {/* 隐藏的文件选择器 */}
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept={acceptedFileTypes.join(',')}
              onChange={(e) => handleFileSelect(e.target.files)}
              className="hidden"
            />

            {/* 文件提示 */}
            {files.length < maxFiles && (
              <span className="text-xs text-muted-foreground">
                支持 {acceptedFileTypes.join(', ')} 格式，最大 {Math.round(maxFileSize / 1024 / 1024)}MB
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* 停止生成按钮 */}
            {showStopButton && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onStopGeneration}
                className="h-8"
              >
                <StopCircle className="w-4 h-4 mr-1" />
                停止
              </Button>
            )}

            {/* 发送按钮 */}
            <Button
              type="button"
              onClick={handleSend}
              disabled={!canSend}
              size="sm"
              className="h-8"
            >
              {isLoading || isStreaming ? (
                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
              ) : (
                <Send className="w-4 h-4 mr-1" />
              )}
              发送
            </Button>
          </div>
        </div>

        {/* 拖拽提示 */}
        {isDragOver && (
          <div className="absolute inset-0 bg-primary/10 border-2 border-dashed border-primary rounded-lg flex items-center justify-center">
            <div className="text-center">
              <Paperclip className="w-8 h-8 mx-auto mb-2 text-primary" />
              <p className="text-sm font-medium text-primary">
                拖拽文件到这里上传
              </p>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
} 