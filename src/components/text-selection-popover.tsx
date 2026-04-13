"use client";

import { useState, useEffect, useCallback, useRef } from "react";

interface TextSelectionPopoverProps {
  /** CSS selector or ref container to scope the selection listener */
  containerRef: React.RefObject<HTMLElement | null>;
  onAskTutor: (selectedText: string) => void;
}

export function TextSelectionPopover({
  containerRef,
  onAskTutor,
}: TextSelectionPopoverProps) {
  const [popover, setPopover] = useState<{
    text: string;
    x: number;
    y: number;
  } | null>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  const handleMouseUp = useCallback(() => {
    // Small delay so the selection finalizes
    requestAnimationFrame(() => {
      const selection = window.getSelection();
      const text = selection?.toString().trim();
      if (!text || text.length < 3) {
        setPopover(null);
        return;
      }

      // Only trigger if the selection is inside our container
      const container = containerRef.current;
      if (!container || !selection?.rangeCount) {
        setPopover(null);
        return;
      }

      const range = selection.getRangeAt(0);
      if (!container.contains(range.commonAncestorContainer)) {
        setPopover(null);
        return;
      }

      const rect = range.getBoundingClientRect();
      setPopover({
        text,
        x: rect.left + rect.width / 2,
        y: rect.top - 8,
      });
    });
  }, [containerRef]);

  const handleMouseDown = useCallback(
    (e: MouseEvent) => {
      // If clicking outside the popover, dismiss it
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setPopover(null);
      }
    },
    []
  );

  useEffect(() => {
    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("mousedown", handleMouseDown);
    return () => {
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("mousedown", handleMouseDown);
    };
  }, [handleMouseUp, handleMouseDown]);

  if (!popover) return null;

  return (
    <div
      ref={popoverRef}
      className="fixed z-[60] animate-in fade-in slide-in-from-bottom-1 duration-150"
      style={{
        left: popover.x,
        top: popover.y,
        transform: "translate(-50%, -100%)",
      }}
    >
      <button
        onClick={() => {
          onAskTutor(popover.text);
          setPopover(null);
          window.getSelection()?.removeAllRanges();
        }}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-foreground text-background text-xs font-medium shadow-lg hover:opacity-90 transition-opacity cursor-pointer whitespace-nowrap"
      >
        <svg
          className="w-3.5 h-3.5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
        Ask tutor about this
      </button>
      {/* Arrow */}
      <div className="flex justify-center">
        <div className="w-2 h-2 bg-foreground rotate-45 -mt-1" />
      </div>
    </div>
  );
}
