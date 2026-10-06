import { useCallback, useState } from "react";

import { streamChat } from "../api/client";

interface ResponseOutputTextDelta {
  type: "response.output_text.delta";
  item_id: string;
  output_index: number;
  content_index: number;
  delta: string;
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
          const chunks = buffer.split("\n\n");
          buffer = chunks.pop() ?? "";

          for (const chunk of chunks) {
            let eventName: string | null = null;
            let dataLine: string | null = null;
            for (const line of chunk.split("\n")) {
              if (line.startsWith("event: ")) eventName = line.slice(7);
              else if (line.startsWith("data: ")) dataLine = line.slice(6);
            }
            if (dataLine === null) continue;
            if (dataLine === "[DONE]") continue;

            if (eventName === "error") {
              try {
                const errPayload = JSON.parse(dataLine);
                throw new Error(errPayload?.error?.message ?? "Stream failed");
              } catch (parseErr) {
                if (parseErr instanceof Error) throw parseErr;
                throw new Error("Stream failed");
              }
            }

            if (eventName !== "response.output_text.delta") continue;

            try {
              const payload = JSON.parse(dataLine) as ResponseOutputTextDelta;
              const delta = payload.delta ?? "";
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
