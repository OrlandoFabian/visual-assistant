import { useCallback, useState } from "react";

import { streamChat } from "../api/client";

interface StreamChunk {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    delta: { role?: string; content?: string };
    finish_reason: string | null;
  }>;
}

export interface UseSSE {
  content: string;
  streaming: boolean;
  error: string | null;
  send: (imageId: string, prompt: string) => Promise<string>;
  reset: () => void;
}

export function useSSE(): UseSSE {
  const [content, setContent] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = useCallback(() => {
    setContent("");
    setError(null);
  }, []);

  const send = useCallback(
    async (imageId: string, prompt: string): Promise<string> => {
      reset();
      setStreaming(true);
      let fullContent = "";
      try {
        const response = await streamChat(imageId, prompt);
        if (!response.ok) {
          const body = await response.json().catch(() => null);
          throw new Error(body?.error?.message ?? "Stream failed");
        }

        const reader = response.body?.getReader();
        if (!reader) throw new Error("No readable stream");

        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const data = line.slice(6);
            if (data === "[DONE]") continue;

            try {
              const chunk = JSON.parse(data) as StreamChunk;
              const delta = chunk.choices[0]?.delta?.content ?? "";
              if (delta) {
                fullContent += delta;
                setContent((prev) => prev + delta);
              }
            } catch {
              // ignore malformed chunk
            }
          }
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Stream failed");
      } finally {
        setStreaming(false);
      }
      return fullContent;
    },
    [reset],
  );

  return { content, streaming, error, send, reset };
}
