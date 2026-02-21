import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '@/lib/utils';

interface MarkdownTextProps {
  content: string;
  className?: string;
}

const MarkdownText: React.FC<MarkdownTextProps> = ({ content, className }) => {
  return (
    // ✅ className goes on the wrapper div, NOT on ReactMarkdown directly
    <div className={cn(className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // ── Headings ──────────────────────────────────────────────────────
          h1: ({ children }) => (
            <h1 className="text-lg font-bold text-slate-100 mt-4 mb-2 border-b border-slate-700/50 pb-1">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-base font-bold text-slate-200 mt-4 mb-2">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-sm font-semibold text-slate-200 mt-3 mb-1">
              {children}
            </h3>
          ),

          // ── Paragraph ──────────────────────────────────────────────────────
          p: ({ children }) => (
            <p className="text-sm text-slate-200 leading-relaxed mb-3 last:mb-0">
              {children}
            </p>
          ),

          // ── Lists ──────────────────────────────────────────────────────────
          ul: ({ children }) => (
            <ul className="my-2 space-y-1 pl-2">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="my-2 space-y-1 pl-4 list-decimal">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="text-sm text-slate-200 leading-relaxed flex gap-2">
              <span className="text-indigo-400 mt-1.5 shrink-0 text-xs">•</span>
              <span>{children}</span>
            </li>
          ),

          // ── Code ───────────────────────────────────────────────────────────
          code: ({ node, inline, children, ...props }: any) => {
            if (inline) {
              return (
                <code
                  className="px-1.5 py-0.5 rounded bg-slate-800 text-indigo-300 text-xs font-mono"
                  {...props}
                >
                  {children}
                </code>
              );
            }
            return (
              <pre className="my-3 p-4 rounded-xl bg-slate-900 border border-slate-700/50 overflow-x-auto">
                <code className="text-xs font-mono text-slate-300" {...props}>
                  {children}
                </code>
              </pre>
            );
          },

          // ── Bold & italic ──────────────────────────────────────────────────
          strong: ({ children }) => (
            <strong className="font-semibold text-slate-100">{children}</strong>
          ),
          em: ({ children }) => (
            <em className="italic text-slate-300">{children}</em>
          ),

          // ── Blockquote ─────────────────────────────────────────────────────
          blockquote: ({ children }) => (
            <blockquote className="my-2 pl-4 border-l-2 border-indigo-500/50 text-slate-400 italic">
              {children}
            </blockquote>
          ),

          // ── Horizontal rule ────────────────────────────────────────────────
          hr: () => <hr className="my-4 border-slate-700/50" />,

          // ── Tables (remark-gfm) ────────────────────────────────────────────
          table: ({ children }) => (
            <div className="my-3 overflow-x-auto rounded-xl border border-slate-700/50">
              <table className="w-full text-sm text-slate-200 border-collapse">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-slate-800/70 text-xs text-slate-400 uppercase tracking-wider">
              {children}
            </thead>
          ),
          tbody: ({ children }) => (
            <tbody className="divide-y divide-slate-800/60">{children}</tbody>
          ),
          tr: ({ children }) => (
            <tr className="hover:bg-slate-800/30 transition-colors">{children}</tr>
          ),
          th: ({ children }) => (
            <th className="px-4 py-2.5 text-left font-semibold">{children}</th>
          ),
          td: ({ children }) => (
            <td className="px-4 py-2.5">{children}</td>
          ),

          // ── Links ──────────────────────────────────────────────────────────
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-400 hover:text-indigo-300 underline underline-offset-2 transition-colors"
            >
              {children}
            </a>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

MarkdownText.displayName = 'MarkdownText';

export default MarkdownText;