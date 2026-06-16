"use client";
import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Components } from "react-markdown";

interface MarkdownRendererProps {
  content: string;
}

const components: Components = {
  h1: ({ children }) => (
    <h1 className="text-2xl font-extrabold tracking-tight text-zinc-950 dark:text-white border-b border-zinc-200 dark:border-zinc-800 pb-3 mt-8 mb-4 first:mt-0">
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 mt-7 mb-3 flex items-center gap-2">
      <span className="inline-block w-1 h-5 rounded-full bg-indigo-500 shrink-0" />
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="text-base font-semibold text-zinc-800 dark:text-zinc-200 mt-5 mb-2">
      {children}
    </h3>
  ),
  h4: ({ children }) => (
    <h4 className="text-sm font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mt-4 mb-2">
      {children}
    </h4>
  ),
  p: ({ children }) => (
    <p className="text-sm leading-7 text-zinc-700 dark:text-zinc-300 my-3">
      {children}
    </p>
  ),
  ul: ({ children }) => (
    <ul className="my-3 space-y-1.5 pl-0 list-none">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="my-3 space-y-1.5 pl-0 list-none counter-reset-[list]">
      {children}
    </ol>
  ),
  li: ({ children, ...props }) => {
    const isOrdered = (props as any).ordered;
    return (
      <li className="flex items-start gap-2.5 text-sm text-zinc-700 dark:text-zinc-300 leading-6">
        <span
          className={`mt-1.5 shrink-0 rounded-full ${
            isOrdered
              ? "w-4 h-4 bg-indigo-100 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-400 text-[10px] font-bold flex items-center justify-center"
              : "w-1.5 h-1.5 bg-indigo-400 dark:bg-indigo-500"
          }`}
        />
        <span>{children}</span>
      </li>
    );
  },
  strong: ({ children }) => (
    <strong className="font-semibold text-zinc-950 dark:text-white">
      {children}
    </strong>
  ),
  em: ({ children }) => (
    <em className="italic text-zinc-600 dark:text-zinc-400">{children}</em>
  ),
  code: ({ children, className }) => {
    const isBlock = className?.includes("language-");
    if (isBlock) {
      return (
        <code className="block w-full text-xs font-mono text-emerald-400 dark:text-emerald-300 leading-6">
          {children}
        </code>
      );
    }
    return (
      <code className="px-1.5 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 text-xs font-mono">
        {children}
      </code>
    );
  },
  pre: ({ children }) => (
    <pre className="my-4 p-4 rounded-xl bg-zinc-900 dark:bg-zinc-950 border border-zinc-800 overflow-x-auto text-xs leading-6 font-mono">
      {children}
    </pre>
  ),
  blockquote: ({ children }) => (
    <blockquote className="my-4 pl-4 border-l-4 border-indigo-400 dark:border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/20 rounded-r-xl py-3 pr-3 text-sm text-zinc-600 dark:text-zinc-400 italic">
      {children}
    </blockquote>
  ),
  hr: () => (
    <hr className="my-6 border-0 border-t border-zinc-200 dark:border-zinc-800" />
  ),
  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-indigo-600 dark:text-indigo-400 underline underline-offset-2 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
    >
      {children}
    </a>
  ),
  table: ({ children }) => (
    <div className="my-4 w-full overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
      <table className="w-full text-sm border-collapse">{children}</table>
    </div>
  ),
  thead: ({ children }) => (
    <thead className="bg-zinc-50 dark:bg-zinc-900 text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
      {children}
    </thead>
  ),
  tbody: ({ children }) => (
    <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
      {children}
    </tbody>
  ),
  tr: ({ children }) => (
    <tr className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30 transition-colors">
      {children}
    </tr>
  ),
  th: ({ children }) => (
    <th className="px-4 py-2.5 text-left font-semibold">{children}</th>
  ),
  td: ({ children }) => (
    <td className="px-4 py-2.5 text-zinc-700 dark:text-zinc-300">{children}</td>
  ),
};

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  if (!content) return null;

  return (
    <div className="markdown-body w-full">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;
