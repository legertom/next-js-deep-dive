"use client";

import { useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { ChatPanel } from "./chat-panel";
import { TextSelectionPopover } from "./text-selection-popover";

interface LessonChatProps {
  moduleTitle: string;
  lessonTitle: string;
  lessonDescription: string;
  lessonKey: string;
  articleRef: React.RefObject<HTMLElement | null>;
}

export function LessonChat({
  moduleTitle,
  lessonTitle,
  lessonDescription,
  lessonKey,
  articleRef,
}: LessonChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [quotedText, setQuotedText] = useState<string | undefined>();

  const { messages, sendMessage, setMessages, status, stop, error } = useChat({
    id: lessonKey,
    transport: new DefaultChatTransport({
      api: "/api/chat",
      body: {
        lessonContext: { moduleTitle, lessonTitle, lessonDescription },
      },
    }),
  });

  const handleAskAboutSelection = (selectedText: string) => {
    const truncated =
      selectedText.length > 600
        ? selectedText.slice(0, 600) + "…"
        : selectedText;
    setQuotedText(truncated);
    setIsOpen(true);
  };

  const handleSend = (text: string) => {
    if (quotedText) {
      const question = text || "Can you explain this?";
      sendMessage({
        text: `About this passage from the lesson:\n\n"${quotedText}"\n\n${question}`,
      });
      setQuotedText(undefined);
    } else {
      sendMessage({ text });
    }
  };

  return (
    <>
      {/* Text selection popover */}
      <TextSelectionPopover
        containerRef={articleRef}
        onAskTutor={handleAskAboutSelection}
      />

      {/* Chat panel */}
      {isOpen && (
        <ChatPanel
          messages={messages}
          status={status}
          error={error}
          lessonTitle={lessonTitle}
          onSend={handleSend}
          onStop={stop}
          onClose={() => {
            setIsOpen(false);
            setQuotedText(undefined);
          }}
          onClearChat={() => setMessages([])}
          quotedText={quotedText}
          onClearQuote={() => setQuotedText(undefined)}
        />
      )}

      {/* Toggle button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-accent text-white shadow-lg shadow-accent/25 hover:bg-accent/90 flex items-center justify-center transition-transform hover:scale-105"
        aria-label={isOpen ? "Close chat" : "Ask a question"}
      >
        {isOpen ? (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        )}
      </button>
    </>
  );
}
