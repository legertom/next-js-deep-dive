"use client";

import { useState, useRef, useEffect } from "react";
import type { UIMessage } from "ai";
import ReactMarkdown from "react-markdown";

interface ChatPanelProps {
  messages: UIMessage[];
  status: "submitted" | "streaming" | "ready" | "error";
  error: Error | undefined;
  lessonTitle: string;
  onSend: (text: string) => void;
  onStop: () => void;
  onClose: () => void;
}

export function ChatPanel({
  messages,
  status,
  error,
  lessonTitle,
  onSend,
  onStop,
  onClose,
}: ChatPanelProps) {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const isLoading = status === "submitted" || status === "streaming";

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    onSend(input.trim());
    setInput("");
  };

  return (
    <div className="fixed bottom-24 right-6 z-50 w-96 h-[500px] bg-card rounded-2xl shadow-2xl border border-card-border flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-subtle">
        <div className="min-w-0">
          <div className="text-sm font-semibold text-foreground truncate">
            Ask about this lesson
          </div>
          <div className="text-xs text-muted truncate">{lessonTitle}</div>
        </div>
        <button
          onClick={onClose}
          className="text-muted hover:text-foreground p-1 rounded-lg hover:bg-border flex-shrink-0"
          aria-label="Close chat"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.length === 0 && (
          <div className="text-center text-muted text-sm py-12">
            <p className="mb-2 text-lg">Ask me anything</p>
            <p className="text-xs">
              I have context about the current lesson and can help you understand
              the concepts.
            </p>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-xl px-3.5 py-2.5 text-sm leading-relaxed ${
                message.role === "user"
                  ? "bg-accent text-white"
                  : "bg-subtle text-foreground"
              }`}
            >
              {message.parts.map((part, i) => {
                if (part.type === "text") {
                  if (message.role === "user") {
                    return (
                      <div key={i} className="whitespace-pre-wrap">
                        {part.text}
                      </div>
                    );
                  }
                  return (
                    <div
                      key={i}
                      className="chat-markdown [&>*:first-child]:mt-0 [&>*:last-child]:mb-0"
                    >
                      <ReactMarkdown>{part.text}</ReactMarkdown>
                    </div>
                  );
                }
                return null;
              })}
            </div>
          </div>
        ))}

        {status === "submitted" && !error && (
          <div className="flex justify-start">
            <div className="bg-subtle rounded-xl px-3.5 py-2.5 text-sm text-muted">
              <span className="inline-flex gap-1">
                <span className="animate-bounce">.</span>
                <span className="animate-bounce [animation-delay:0.1s]">.</span>
                <span className="animate-bounce [animation-delay:0.2s]">.</span>
              </span>
            </div>
          </div>
        )}

        {error && (
          <div className="flex justify-start">
            <div className="bg-error-light border border-error/20 rounded-xl px-3.5 py-2.5 text-sm text-error-text">
              <p className="font-medium">Something went wrong</p>
              <p className="text-xs mt-1 text-error-text">
                {error.message.includes("credit card")
                  ? "The AI Gateway requires a credit card on your Vercel account to unlock free credits."
                  : "Could not reach the AI assistant. Please try again."}
              </p>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={handleSubmit}
        className="border-t border-border px-3 py-3 flex gap-2 bg-subtle"
      >
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question..."
          className="flex-1 px-3 py-2 rounded-lg border border-border bg-card text-sm text-foreground placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
          disabled={isLoading}
        />
        {isLoading ? (
          <button
            type="button"
            onClick={onStop}
            className="px-3 py-2 rounded-lg bg-subtle text-muted text-sm font-medium hover:bg-border"
          >
            Stop
          </button>
        ) : (
          <button
            type="submit"
            disabled={!input.trim()}
            className="px-3 py-2 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent/90 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Send
          </button>
        )}
      </form>
    </div>
  );
}
