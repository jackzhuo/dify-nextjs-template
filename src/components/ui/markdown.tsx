import { memo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '@/lib/utils';

interface MarkdownProps {
  content: string;
  className?: string;
}

export const Markdown = memo(function Markdown({ content, className }: MarkdownProps) {
  return (
    <div className={cn("text-sm leading-relaxed", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // 代码块
          code(props) {
            const { children, className, ...rest } = props;
            const match = /language-(\w+)/.exec(className || '');
            const language = match ? match[1] : '';
            
            if (language) {
              return (
                <pre className="my-4 bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto text-sm">
                  <code className={`language-${language}`} {...rest}>
                    {children}
                  </code>
                </pre>
              );
            }
            
            return (
              <code
                className="relative rounded bg-muted px-1.5 py-0.5 font-mono text-sm"
                {...rest}
              >
                {children}
              </code>
            );
          },
          
          // 链接
          a(props) {
            const { children, href, ...rest } = props;
            return (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 underline"
                {...rest}
              >
                {children}
              </a>
            );
          },
          
          // 段落
          p(props) {
            const { children, ...rest } = props;
            return (
              <p className="mb-3 last:mb-0" {...rest}>
                {children}
              </p>
            );
          },
          
          // 标题
          h1(props) {
            const { children, ...rest } = props;
            return (
              <h1 className="text-lg font-bold mb-3 mt-4 first:mt-0" {...rest}>
                {children}
              </h1>
            );
          },
          
          h2(props) {
            const { children, ...rest } = props;
            return (
              <h2 className="text-base font-semibold mb-2 mt-4 first:mt-0" {...rest}>
                {children}
              </h2>
            );
          },
          
          h3(props) {
            const { children, ...rest } = props;
            return (
              <h3 className="text-sm font-medium mb-2 mt-3 first:mt-0" {...rest}>
                {children}
              </h3>
            );
          },
          
          // 列表
          ul(props) {
            const { children, ...rest } = props;
            return (
              <ul className="list-disc list-inside mb-3 space-y-1 pl-4" {...rest}>
                {children}
              </ul>
            );
          },
          
          ol(props) {
            const { children, ...rest } = props;
            return (
              <ol className="list-decimal list-inside mb-3 space-y-1 pl-4" {...rest}>
                {children}
              </ol>
            );
          },
          
          li(props) {
            const { children, ...rest } = props;
            return (
              <li className="leading-relaxed" {...rest}>
                {children}
              </li>
            );
          },
          
          // 引用块
          blockquote(props) {
            const { children, ...rest } = props;
            return (
              <blockquote
                className="border-l-4 border-muted-foreground/30 pl-4 py-2 my-3 bg-muted/30 rounded-r italic"
                {...rest}
              >
                {children}
              </blockquote>
            );
          },
          
          // 表格
          table(props) {
            const { children, ...rest } = props;
            return (
              <div className="overflow-x-auto my-3">
                <table className="min-w-full border border-border rounded" {...rest}>
                  {children}
                </table>
              </div>
            );
          },
          
          thead(props) {
            const { children, ...rest } = props;
            return (
              <thead className="bg-muted/50" {...rest}>
                {children}
              </thead>
            );
          },
          
          th(props) {
            const { children, ...rest } = props;
            return (
              <th
                className="px-3 py-2 text-left text-xs font-medium border-b border-border"
                {...rest}
              >
                {children}
              </th>
            );
          },
          
          td(props) {
            const { children, ...rest } = props;
            return (
              <td className="px-3 py-2 text-sm border-b border-border" {...rest}>
                {children}
              </td>
            );
          },
          
          // 水平分割线
          hr(props) {
            const { ...rest } = props;
            return <hr className="border-t border-border my-4" {...rest} />;
          },
          
          // 强调
          strong(props) {
            const { children, ...rest } = props;
            return (
              <strong className="font-semibold" {...rest}>
                {children}
              </strong>
            );
          },
          
          em(props) {
            const { children, ...rest } = props;
            return (
              <em className="italic" {...rest}>
                {children}
              </em>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}); 