import { useState } from "react";

import { chat as sendChat } from "../api/client";
import { useSSE } from "../hooks/useSSE";
import Spinner from "./Spinner";

interface Props {
  imageId: string;
  onTurnComplete: () => void;
}

type Mode = "stream" | "complete";

export default function ChatPanel({ imageId, onTurnComplete }: Props) {
  const [prompt, setPrompt] = useState("");
  const [mode, setMode] = useState<Mode>("stream");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState("");
  const [error, setError] = useState<string | null>(null);
  const stream = useSSE();

  const isStreaming = mode === "stream" ? stream.streaming : loading;
  const displayText = mode === "stream" ? stream.content : response;
  const displayError = mode === "stream" ? stream.error : error;

  const send = async () => {
    if (!prompt.trim() || isStreaming) return;
    setResponse("");
    setError(null);

    if (mode === "stream") {
      await stream.send(imageId, prompt);
      setPrompt("");
      onTurnComplete();
      return;
    }

    setLoading(true);
    try {
      const result = await sendChat(imageId, prompt);
      setResponse(result.choices[0]?.message?.content ?? "");
      setPrompt("");
      onTurnComplete();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Chat failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
          Chat
        </h2>
        <div className="flex rounded-md border border-slate-700 bg-slate-900 p-0.5 text-xs">
          <button
            onClick={() => setMode("stream")}
            className={`rounded px-3 py-1 transition-colors ${
              mode === "stream"
                ? "bg-slate-700 text-slate-100"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Stream
          </button>
          <button
            onClick={() => setMode("complete")}
            className={`rounded px-3 py-1 transition-colors ${
              mode === "complete"
                ? "bg-slate-700 text-slate-100"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Complete
          </button>
        </div>
      </div>

      <div className="rounded-lg border border-slate-800 bg-slate-900/40">
        <div className="min-h-[160px] whitespace-pre-wrap px-4 py-3 text-sm leading-relaxed text-slate-200">
          {displayText || (
            <span className="text-slate-500">
              {isStreaming ? "..." : "Ask something about the image."}
            </span>
          )}
          {isStreaming && displayText && (
            <span className="ml-0.5 inline-block h-4 w-2 translate-y-1 animate-pulse bg-teal-400" />
          )}
        </div>
        <div className="flex items-center gap-2 border-t border-slate-800 p-3">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") send();
            }}
            placeholder="Ask about the image..."
            className="flex-1 rounded border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-teal-500 focus:outline-none"
            disabled={isStreaming}
          />
          <button
            onClick={send}
            disabled={isStreaming || !prompt.trim()}
            className="rounded bg-teal-500 px-4 py-2 text-sm font-medium text-slate-950 transition-colors hover:bg-teal-400 disabled:bg-slate-700 disabled:text-slate-500"
          >
            {isStreaming ? (
              <Spinner className="border-slate-500 border-t-slate-100" />
            ) : (
              "Send"
            )}
          </button>
        </div>
      </div>

      {displayError && (
        <div className="rounded border border-red-900/50 bg-red-950/30 px-3 py-2 text-sm text-red-300">
          {displayError}
        </div>
      )}
    </div>
  );
}
