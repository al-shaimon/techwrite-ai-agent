import React from "react";

interface MarkdownRendererProps {
  content: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  if (!content) return null;

  // Split content by double newline blocks to process paragraphs/sections independently
  const blocks = content.split(/\n\n+/);

  // Reusable inline formatter targeting bold tags: **text**
  const parseInline = (text: string): React.ReactNode[] => {
    const parts = text.split(/\*\*([^*]+)\*\*/g);
    return parts.map((part, index) => {
      if (index % 2 === 1) {
        return (
          <strong
            key={index}
            className="font-bold text-zinc-950 dark:text-white"
          >
            {part}
          </strong>
        );
      }
      return part;
    });
  };

  return (
    <div className="space-y-4 text-zinc-800 dark:text-zinc-200 leading-relaxed font-sans">
      {blocks.map((block, blockIdx) => {
        const trimmed = block.trim();
        if (!trimmed) return null;

        // Level 1 Heading
        if (trimmed.startsWith("# ")) {
          return (
            <h1
              key={blockIdx}
              className="text-3xl font-extrabold tracking-tight text-zinc-950 dark:text-white border-b border-zinc-100 dark:border-zinc-800 pb-3 mt-8 first:mt-2"
            >
              {parseInline(trimmed.substring(2))}
            </h1>
          );
        }

        // Level 2 Heading
        if (trimmed.startsWith("## ")) {
          return (
            <h2
              key={blockIdx}
              className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 mt-6 pb-1"
            >
              {parseInline(trimmed.substring(3))}
            </h2>
          );
        }

        // Level 3 Heading
        if (trimmed.startsWith("### ")) {
          return (
            <h3
              key={blockIdx}
              className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 mt-5"
            >
              {parseInline(trimmed.substring(4))}
            </h3>
          );
        }

        // Bullet lists
        if (
          trimmed.startsWith("- ") ||
          trimmed.startsWith("* ") ||
          trimmed.includes("\n- ") ||
          trimmed.includes("\n* ")
        ) {
          const lines = trimmed.split("\n");
          return (
            <ul
              key={blockIdx}
              className="list-disc pl-6 space-y-2 my-4 text-zinc-700 dark:text-zinc-300"
            >
              {lines.map((line, lineIdx) => {
                const cleanLine = line.replace(/^[-*]\s+/, "").trim();
                if (!cleanLine) return null;
                return <li key={lineIdx}>{parseInline(cleanLine)}</li>;
              })}
            </ul>
          );
        }

        // Standard Paragraph Blocks
        const paragraphs = trimmed.split("\n");
        return paragraphs.map((para, paraIdx) => {
          const cleanPara = para.trim();
          if (!cleanPara) return null;
          return (
            <p key={`${blockIdx}-${paraIdx}`} className="text-base leading-7">
              {parseInline(cleanPara)}
            </p>
          );
        });
      })}
    </div>
  );
};

export default MarkdownRenderer;
