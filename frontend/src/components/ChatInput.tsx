import { useEffect, useRef, useState } from "react";
import type { KeyboardEvent } from "react";

import Spinner from "./Spinner";

interface Props {
  isBusy: boolean;
  mode: "stream" | "complete";
  onModeChange: (mode: "stream" | "complete") => void;
  onSend: (text: string) => void;
}

export default function ChatInput({
  isBusy,
  mode,
  onModeChange,
  onSend,
}: Props) {
  const [text, setText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
    }
  }, [text]);

  const canSend = text.trim().length > 0 && !isBusy;

  const handleSend = () => {
    if (!canSend) return;
    onSend(text.trim());
    setText("");
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="rounded-xl border border-slate-700 bg-slate-900/60 shadow-lg">
      <div className="flex items-end gap-2 p-2">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask about the image..."
          disabled={isBusy}
          rows={1}
          className="flex-1 resize-none bg-transparent px-2 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none disabled:cursor-not-allowed"
        />
        <button
          onClick={handleSend}
          disabled={!canSend}
          className="rounded-lg bg-teal-500 p-2 text-slate-950 transition-colors hover:bg-teal-400 disabled:bg-slate-800 disabled:text-slate-600"
          aria-label="Send"
        >
          {isBusy ? (
            <Spinner className="h-5 w-5 border-slate-700 border-t-slate-900" />
          ) : (
            <IconSend />
          )}
        </button>
      </div>
      <div className="flex items-center justify-between gap-3 border-t border-slate-800/80 px-3 py-2 text-xs">
        <div
          role="radiogroup"
          aria-label="Response mode"
          className="flex rounded-md border border-slate-700 bg-slate-900/80 p-0.5"
        >
          <button
            role="radio"
            aria-checked={mode === "stream"}
            onClick={() => onModeChange("stream")}
            className={`rounded px-2.5 py-1 font-medium transition-colors ${
              mode === "stream"
                ? "bg-teal-500/15 text-teal-300"
                : "text-slate-500 hover:text-slate-300"
            }`}
          >
            Streaming
          </button>
          <button
            role="radio"
            aria-checked={mode === "complete"}
            onClick={() => onModeChange("complete")}
            className={`rounded px-2.5 py-1 font-medium transition-colors ${
              mode === "complete"
                ? "bg-teal-500/15 text-teal-300"
                : "text-slate-500 hover:text-slate-300"
            }`}
          >
            Complete
          </button>
        </div>
        <span className="hidden text-slate-600 sm:inline">
          Shift+Enter for newline
        </span>
      </div>
    </div>
  );
}

function IconSend() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z" />
      <path d="m21.854 2.147-10.94 10.939" />
    </svg>
  );
}
