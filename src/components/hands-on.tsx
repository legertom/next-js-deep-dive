"use client";

import { useState, useCallback } from "react";

interface HandsOnProps {
  title: string;
  steps: string[];
  projectContext?: string;
  projectStep?: string;
}

/** Detect if a code string looks like a runnable command vs a file path / identifier. */
function isCommand(code: string): boolean {
  const commandPrefixes = [
    "npm ", "npx ", "yarn ", "pnpm ", "cd ", "git ", "mkdir ", "touch ",
    "rm ", "cp ", "mv ", "cat ", "echo ", "curl ", "node ", "bun ",
    "next ", "vercel ", "sudo ",
  ];
  const trimmed = code.trimStart();
  return (
    commandPrefixes.some((p) => trimmed.startsWith(p)) ||
    trimmed.includes(" && ") ||
    trimmed.includes(" | ")
  );
}

function CopyableCode({ code, variant }: { code: string; variant: "command" | "inline" }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [code]);

  const className =
    variant === "command"
      ? "relative inline-flex items-center gap-1 bg-code-bg text-code-fg border border-border/50 rounded px-1.5 py-0.5 font-mono text-[0.85em] cursor-pointer hover:bg-code-bg/80 transition-colors group"
      : "relative inline-flex items-center gap-1 font-mono text-[0.85em] text-inline-code-fg !bg-transparent !border-0 !p-0 cursor-pointer hover:opacity-80 transition-opacity group";

  return (
    <code
      onClick={handleCopy}
      className={className}
      title="Click to copy"
    >
      {code}
      <svg
        className="w-3 h-3 opacity-40 group-hover:opacity-80 transition-opacity flex-shrink-0"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        {copied ? (
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        ) : (
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
        )}
      </svg>
      {copied && (
        <span className="absolute -top-7 left-1/2 -translate-x-1/2 text-[0.7rem] bg-foreground text-background px-1.5 py-0.5 rounded whitespace-nowrap">
          Copied!
        </span>
      )}
    </code>
  );
}

/** Parse backtick-delimited segments into text, inline code, or copyable commands. */
function parseStep(step: string) {
  const parts = step.split(/(`[^`]+`)/g);
  return parts.map((part, i) => {
    if (part.startsWith("`") && part.endsWith("`")) {
      const code = part.slice(1, -1);
      const variant = isCommand(code) ? "command" : "inline";
      return <CopyableCode key={i} code={code} variant={variant} />;
    }
    return <span key={i}>{part}</span>;
  });
}

export function HandsOn({ title, steps, projectContext, projectStep }: HandsOnProps) {
  return (
    <div className="my-8 rounded-xl border-2 border-dashed border-accent/30 bg-accent-light/20 overflow-hidden">
      <div className="px-6 py-4 bg-accent/5 border-b border-accent/10">
        <div className="flex items-center gap-2 text-sm font-bold text-accent">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17l-5.71-3.3a1 1 0 01-.5-.87V5.83a1 1 0 01.5-.87l5.71-3.3a1 1 0 011 0l5.71 3.3a1 1 0 01.5.87v5.17a1 1 0 01-.5.87l-5.71 3.3a1 1 0 01-1 0z" />
          </svg>
          Hands-On Exercise
          {projectStep && (
            <span className="ml-auto bg-accent/10 text-accent text-xs font-semibold px-2 py-0.5 rounded-full">
              {projectStep}
            </span>
          )}
        </div>
        <p className="text-foreground font-semibold mt-1">{title}</p>
      </div>
      {projectContext && (
        <div className="px-6 py-3 bg-accent/[0.03] border-b border-accent/10 flex items-start gap-2">
          <svg className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
          <p className="text-sm text-muted italic">{parseStep(projectContext)}</p>
        </div>
      )}
      <div className="p-6">
        <ol className="space-y-3">
          {steps.map((step, i) => (
            <li key={i} className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-accent text-white text-xs font-bold flex items-center justify-center mt-0.5">
                {i + 1}
              </span>
              <span className="text-[0.9375rem] leading-relaxed">{parseStep(step)}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
