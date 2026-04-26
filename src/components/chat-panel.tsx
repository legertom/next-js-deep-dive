"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import type { UIMessage } from "ai";
import ReactMarkdown from "react-markdown";

const MIN_WIDTH = 320;
const MIN_HEIGHT = 350;
const MAX_WIDTH = 800;
const MAX_HEIGHT = 900;

interface ChatPanelProps {
  messages: UIMessage[];
  status: "submitted" | "streaming" | "ready" | "error";
  error: Error | undefined;
  lessonTitle: string;
  onSend: (text: string) => void;
  onStop: () => void;
  onClose: () => void;
  onClearChat: () => void;
  quotedText?: string;
  onClearQuote: () => void;
}

export function ChatPanel({
  messages,
  status,
  error,
  lessonTitle,
  onSend,
  onStop,
  onClose,
  onClearChat,
  quotedText,
  onClearQuote,
}: ChatPanelProps) {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [size, setSize] = useState({ width: 384, height: 500 });
  const dragRef = useRef<{ startX: number; startY: number; startW: number; startH: number } | null>(null);

  const isLoading = status === "submitted" || status === "streaming";
  const canSend = !isLoading && (input.trim().length > 0 || !!quotedText);

  // Focus the input whenever a new quote arrives
  useEffect(() => {
    if (quotedText) inputRef.current?.focus();
  }, [quotedText]);

  const handleResizePointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startW: size.width,
      startH: size.height,
    };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, [size]);

  const handleResizePointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragRef.current) return;
    const { startX, startY, startW, startH } = dragRef.current;
    const newWidth = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, startW + (startX - e.clientX)));
    const newHeight = Math.min(MAX_HEIGHT, Math.max(MIN_HEIGHT, startH + (startY - e.clientY)));
    setSize({ width: newWidth, height: newHeight });
  }, []);

  const handleResizePointerUp = useCallback(() => {
    dragRef.current = null;
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSend) return;
    onSend(input.trim());
    setInput("");
  };

  return (
    <div
      className="fixed bottom-24 right-6 z-50 bg-card rounded-2xl shadow-2xl border border-card-border flex flex-col overflow-hidden"
      style={{ width: size.width, height: size.height }}
    >
      {/* Resize handle (top-left corner) */}
      <div
        onPointerDown={handleResizePointerDown}
        onPointerMove={handleResizePointerMove}
        onPointerUp={handleResizePointerUp}
        className="absolute top-0 left-0 w-4 h-4 cursor-nw-resize z-10 group"
        aria-label="Resize chat"
      >
        <svg className="w-3 h-3 m-0.5 text-muted group-hover:text-foreground transition-colors" viewBox="0 0 10 10" fill="currentColor">
          <circle cx="2" cy="2" r="1" />
          <circle cx="2" cy="5.5" r="1" />
          <circle cx="5.5" cy="2" r="1" />
        </svg>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-subtle">
        <div className="min-w-0">
          <div className="text-sm font-semibold text-foreground truncate">
            Ask about this lesson
          </div>
          <div className="text-xs text-muted truncate">{lessonTitle}</div>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          {messages.length > 0 && (
            <button
              onClick={onClearChat}
              className="text-muted hover:text-foreground p-1 rounded-lg hover:bg-border"
              aria-label="Clear chat"
              title="Clear chat"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3" />
              </svg>
            </button>
          )}
          <button
            onClick={onClose}
            className="text-muted hover:text-foreground p-1 rounded-lg hover:bg-border"
            aria-label="Close chat"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.length === 0 && !quotedText && (
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

      {/* Quote chip (above input) */}
      {quotedText && (
        <div className="mx-3 mt-3 flex items-start gap-2 px-3 py-2 rounded-lg border-l-2 border-accent bg-accent/5">
          <svg className="w-3.5 h-3.5 text-accent mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path d="M5 4a3 3 0 00-3 3v6a3 3 0 003 3h.5l1.146-1.854A1 1 0 017.5 14H8a3 3 0 003-3V7a3 3 0 00-3-3H5zm7 0a3 3 0 00-3 3v6a3 3 0 003 3h.5l1.146-1.854A1 1 0 0114.5 14h.5a3 3 0 003-3V7a3 3 0 00-3-3h-3z" />
          </svg>
          <div className="flex-1 min-w-0">
            <div className="text-[0.65rem] font-semibold uppercase tracking-wider text-accent mb-0.5">
              Quoted from lesson
            </div>
            <p className="text-xs text-foreground/80 leading-relaxed line-clamp-4 whitespace-pre-wrap">
              {quotedText}
            </p>
          </div>
          <button
            onClick={onClearQuote}
            className="text-muted hover:text-foreground p-0.5 rounded flex-shrink-0"
            aria-label="Remove quote"
            title="Remove quote"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Input */}
      <form
        onSubmit={handleSubmit}
        className="border-t border-border px-3 py-3 flex gap-2 bg-subtle"
      >
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={quotedText ? "Add a question (optional)..." : "Ask a question..."}
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
            disabled={!canSend}
            className="px-3 py-2 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent/90 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Send
          </button>
        )}
      </form>
    </div>
  );
}
