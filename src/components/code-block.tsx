"use client";

import { useState } from "react";

interface CodeBlockProps {
  filename?: string;
  language?: string;
  children: string;
  highlight?: number[];
}

export function CodeBlock({ filename, language, children, highlight = [] }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(children.trim());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lines = children.trim().split("\n");

  return (
    <div className="code-block">
      {(filename || language) && (
        <div className="code-block-header">
          <span>{filename || language}</span>
          <button
            onClick={handleCopy}
            className="hover:text-white transition-colors cursor-pointer"
          >
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
      )}
      <pre>
        <code>
          {lines.map((line, i) => (
            <div
              key={i}
              className={`${highlight.includes(i + 1) ? "bg-blue-500/10 -mx-5 px-5 border-l-2 border-blue-400" : ""}`}
            >
              {line}
            </div>
          ))}
        </code>
      </pre>
    </div>
  );
}
