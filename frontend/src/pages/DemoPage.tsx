import { useEffect, useRef, useState } from "react";

import {
  chat,
  deleteImage,
  extractText,
  getHistory,
  type ImageSummary,
  imagePreviewUrl,
  uploadImage,
} from "../api/client";
import ChatInput from "../components/ChatInput";
import DropZone from "../components/DropZone";
import ImageSidebar from "../components/ImageSidebar";
import MessageList, { type LocalMessage } from "../components/MessageList";
import Spinner from "../components/Spinner";
import { useSSE } from "../hooks/useSSE";

type Mode = "stream" | "complete";

export default function DemoPage() {
  const [imageId, setImageId] = useState<string | null>(null);
  const [activeImage, setActiveImage] = useState<ImageSummary | null>(null);
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [attachedPreviewUrl, setAttachedPreviewUrl] = useState<string | null>(null);
  const [messages, setMessages] = useState<LocalMessage[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [mode, setMode] = useState<Mode>("complete");
  const [error, setError] = useState<string | null>(null);
  const [sidebarRefresh, setSidebarRefresh] = useState(0);
  const stream = useSSE();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!attachedFile) {
      setAttachedPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(attachedFile);
    setAttachedPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [attachedFile]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, stream.content]);

  const handleAttach = async (file: File) => {
    setError(null);
    setAttachedFile(file);
    setActiveImage(null);
    setIsUploading(true);
    try {
      const response = await uploadImage(file);
      setImageId(response.image_id);
      const initialContent = extractText(response.analysis);
      if (initialContent) {
        setMessages([{ role: "assistant", content: initialContent }]);
      }
      setSidebarRefresh((n) => n + 1);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
      setAttachedFile(null);
      setImageId(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleNewChat = () => {
    setAttachedFile(null);
    setImageId(null);
    setActiveImage(null);
    setMessages([]);
    setError(null);
    stream.reset();
  };

  const handleDelete = async (image: ImageSummary) => {
    setError(null);
    try {
      await deleteImage(image.image_id);
      if (image.image_id === imageId) {
        handleNewChat();
      }
      setSidebarRefresh((n) => n + 1);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Delete failed");
    }
  };

  const handleSelectPastImage = async (image: ImageSummary) => {
    setError(null);
    setAttachedFile(null);
    setActiveImage(image);
    setImageId(image.image_id);
    setMessages([]);
    setIsLoadingHistory(true);
    try {
      const response = await getHistory(image.image_id);
      setMessages(
        response.messages.map((m) => ({
          role: m.role,
          content: m.content,
          partial: m.partial,
        })),
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load history");
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleSend = async (text: string) => {
    if (!imageId) return;
    setError(null);

    const userMessage: LocalMessage = { role: "user", content: text };
    setMessages((prev) => [...prev, userMessage]);

    if (mode === "stream") {
      const final = await stream.send(imageId, text);
      if (final) {
        setMessages((prev) => [...prev, { role: "assistant", content: final }]);
        stream.reset();
      }
      return;
    }

    setIsSending(true);
    try {
      const result = await chat(imageId, text);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: extractText(result),
        },
      ]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Chat failed");
    } finally {
      setIsSending(false);
    }
  };

  const isBusy = isSending || isLoadingHistory || stream.streaming;
  const displayError = error ?? stream.error;
  const currentImageUrl =
    attachedPreviewUrl ?? (activeImage ? imagePreviewUrl(activeImage.image_id) : null);
  const currentImageFilename =
    attachedFile?.name ?? activeImage?.filename ?? null;
  const hasActiveSession = !!imageId && !isUploading;

  return (
    <div className="flex flex-1 overflow-hidden">
      {/* Sidebar */}
      <div className="hidden w-64 flex-shrink-0 lg:block">
        <ImageSidebar
          activeImageId={imageId}
          refreshKey={sidebarRefresh}
          onSelect={handleSelectPastImage}
          onNewChat={handleNewChat}
          onDelete={handleDelete}
        />
      </div>

      {!hasActiveSession ? (
        /* Empty state: drop zone */
        <div className="flex flex-1 items-center justify-center overflow-y-auto p-8">
          <DropZone
            isUploading={isUploading}
            error={error}
            onAttach={handleAttach}
          />
        </div>
      ) : (
        /* Active state: image on left, chat on right */
        <div className="flex flex-1 flex-col overflow-hidden lg:flex-row">
          {/* Image panel */}
          <div className="flex items-center justify-center overflow-y-auto bg-slate-950 p-4 lg:flex-1 lg:p-8">
            <div className="w-full max-w-3xl space-y-3">
              {currentImageUrl && (
                <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/40">
                  <img
                    src={currentImageUrl}
                    alt={currentImageFilename ?? ""}
                    className="block max-h-[75vh] w-full object-contain"
                    onError={(e) => {
                      const container =
                        e.currentTarget.parentElement as HTMLElement | null;
                      if (container) container.style.display = "none";
                    }}
                  />
                </div>
              )}
              {currentImageFilename && (
                <p className="text-center text-xs text-slate-500">
                  {currentImageFilename}
                </p>
              )}
            </div>
          </div>

          {/* Chat column */}
          <div className="flex flex-col overflow-hidden border-t border-slate-800/60 bg-slate-900/30 lg:w-96 lg:flex-shrink-0 lg:border-l lg:border-t-0 xl:w-[28rem]">
            <div className="flex-1 overflow-y-auto px-4 py-5">
              {isLoadingHistory ? (
                <div className="flex h-full items-center justify-center">
                  <Spinner />
                </div>
              ) : messages.length === 0 && !stream.streaming ? (
                <div className="flex h-full items-center justify-center" />
              ) : (
                <>
                  <MessageList
                    messages={messages}
                    streamContent={stream.streaming ? stream.content : null}
                  />
                  <div ref={bottomRef} />
                </>
              )}
            </div>

            <div className="border-t border-slate-800/60 p-3">
              {displayError && (
                <div className="mb-2 rounded border border-red-900/50 bg-red-950/30 px-2 py-1.5 text-xs text-red-300">
                  {displayError}
                </div>
              )}
              <ChatInput
                isBusy={isBusy}
                mode={mode}
                onModeChange={setMode}
                onSend={handleSend}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
