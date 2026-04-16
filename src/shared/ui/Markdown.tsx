import remarkBreaks from "remark-breaks";
import ReactMarkdown from "react-markdown";
import type { ComponentPropsWithoutRef } from "react";

export function Markdown({ content }: { content: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkBreaks]}
      components={{
        h1: ({ ...props }) => (
          <h1
            className="text-[var(--theme-accent)] font-bold tracking-widest uppercase mt-4 mb-2 text-xl"
            {...props}
          />
        ),
        h2: ({ ...props }) => (
          <h2
            className="text-[var(--theme-accent)] font-bold tracking-widest uppercase mt-3 mb-2 text-lg"
            {...props}
          />
        ),
        h3: ({ ...props }) => (
          <h3
            className="text-[var(--theme-accent)] font-bold tracking-widest uppercase mt-2 mb-1 text-base"
            {...props}
          />
        ),

        p: ({ ...props }) => (
          <p className="my-1 text-[var(--theme-text)] text-sm" {...props} />
        ),
        strong: ({ ...props }) => (
          <strong className="text-[var(--theme-accent)] font-bold" {...props} />
        ),
        em: ({ ...props }) => (
          <em className="text-[var(--theme-text)] italic" {...props} />
        ),

        a: ({ ...props }) => (
          <a
            className="text-[var(--theme-accent)] underline hover:text-white transition-colors"
            {...props}
          />
        ),

        ul: ({ ...props }) => (
          <ul
            className="list-disc ml-6 my-2 marker:text-[var(--theme-accent)] text-[var(--theme-text)] text-sm"
            {...props}
          />
        ),
        ol: ({ ...props }) => (
          <ol
            className="list-decimal ml-6 my-2 marker:text-[var(--theme-accent)] text-[var(--theme-text)] text-sm"
            {...props}
          />
        ),
        li: ({ ...props }) => <li className="my-1" {...props} />,
        hr: ({ ...props }) => (
          <hr className="my-4 border-[var(--theme-accent)]/20" {...props} />
        ),

        blockquote: ({ ...props }) => (
          <blockquote
            className="border-l-2 border-[var(--theme-accent)] bg-[var(--theme-background)]/40 py-2 px-3 text-[var(--theme-text)] not-italic my-3 text-sm"
            {...props}
          />
        ),

        pre: ({ ...props }) => (
          <pre
            className="bg-[var(--theme-background)] border border-[var(--theme-accent)]/20 text-[var(--theme-text)] p-3 my-3 overflow-x-auto font-mono text-xs custom-scrollbar"
            {...props}
          />
        ),

        code: ({
          children,
          className,
          ...props
        }: ComponentPropsWithoutRef<"code">) => {
          const isBlockCode = /language-(\w+)/.exec(className || "");
          if (isBlockCode) {
            return (
              <code className={className} {...props}>
                {children}
              </code>
            );
          }

          return (
            <code
              className="text-[var(--theme-warning)] bg-[var(--theme-background)]/60 px-1.5 py-0.5 rounded-sm font-mono text-xs"
              {...props}
            >
              {children}
            </code>
          );
        },
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
