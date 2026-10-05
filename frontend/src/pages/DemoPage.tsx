import { useCallback, useEffect, useState } from "react";

import { type ChatMessage, getHistory, type ImageUploadResponse } from "../api/client";
import ChatPanel from "../components/ChatPanel";
import ImageUploader from "../components/ImageUploader";
import MessageList from "../components/MessageList";

export default function DemoPage() {
  const [upload, setUpload] = useState<ImageUploadResponse | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const refreshHistory = useCallback(async () => {
    if (!upload) return;
    try {
      const response = await getHistory(upload.image_id);
      setMessages(response.messages);
    } catch {
      // non-fatal; keep existing messages
    }
  }, [upload]);

  useEffect(() => {
    refreshHistory();
  }, [refreshHistory]);

  const handleUploaded = (response: ImageUploadResponse) => {
    setUpload(response);
    setMessages([]);
  };

  return (
    <div className="space-y-10">
      <header>
        <h1 className="text-4xl font-semibold tracking-tight">Interactive Demo</h1>
        <p className="mt-2 text-slate-400">
          Upload an image, chat about it, watch the streaming assistant respond live.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.5fr_1fr]">
        <section>
          <ImageUploader onUploaded={handleUploaded} />
          {upload && (
            <div className="mt-4 space-y-2 rounded-lg border border-slate-800 bg-slate-900/40 p-4 text-sm">
              <div className="flex items-center justify-between gap-2 text-xs">
                <span className="text-slate-400">Image ID</span>
                <code className="truncate rounded bg-slate-800 px-2 py-0.5 font-mono text-xs text-teal-300">
                  {upload.image_id}
                </code>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Filename</span>
                <span className="truncate text-slate-300">{upload.filename}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Size</span>
                <span className="text-slate-300">
                  {upload.size_bytes.toLocaleString()} bytes
                </span>
              </div>
              <div className="mt-3 border-t border-slate-800 pt-3">
                <p className="mb-1 text-xs uppercase tracking-wider text-slate-400">
                  Initial analysis
                </p>
                <p className="text-xs leading-relaxed text-slate-300">
                  {upload.analysis.choices[0]?.message.content}
                </p>
              </div>
            </div>
          )}
        </section>

        <section>
          {upload ? (
            <ChatPanel
              key={upload.image_id}
              imageId={upload.image_id}
              onTurnComplete={refreshHistory}
            />
          ) : (
            <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-8 text-center text-sm text-slate-500">
              Upload an image to start chatting.
            </div>
          )}
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-400">
            History
          </h2>
          {upload ? (
            <MessageList messages={messages} />
          ) : (
            <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-6 text-center text-sm text-slate-500">
              History will appear here after you upload.
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
