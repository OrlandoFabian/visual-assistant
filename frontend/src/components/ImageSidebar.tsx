import { useEffect, useState } from "react";

import { type ImageSummary, listImages } from "../api/client";

interface Props {
  activeImageId: string | null;
  refreshKey: number;
  onSelect: (image: ImageSummary) => void;
  onNewChat: () => void;
  onDelete: (image: ImageSummary) => Promise<void>;
}

export default function ImageSidebar({
  activeImageId,
  refreshKey,
  onSelect,
  onNewChat,
  onDelete,
}: Props) {
  const [images, setImages] = useState<ImageSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    listImages()
      .then((r) => {
        if (!cancelled) {
          setImages(r.images);
          setError(null);
        }
      })
      .catch((e) => {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Failed to load uploads");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  const handleDelete = async (img: ImageSummary) => {
    const confirmed = window.confirm(
      `Delete "${img.filename}"?\n\nThis also removes the conversation history.`,
    );
    if (!confirmed) return;
    setDeletingId(img.image_id);
    try {
      await onDelete(img);
    } catch {
      // Error surfaces in parent via state
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <aside className="flex h-full flex-col border-r border-slate-800/80 bg-slate-900/40">
      <div className="flex items-center justify-between border-b border-slate-800/80 px-4 py-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          History
        </h2>
        <button
          onClick={onNewChat}
          className="flex items-center gap-1 rounded px-2 py-1 text-xs text-teal-400 transition-colors hover:bg-teal-500/10"
          title="Start a new conversation"
        >
          <IconPlus />
          New
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {loading ? (
          <p className="p-6 text-center text-xs text-slate-500">Loading...</p>
        ) : error ? (
          <p className="p-6 text-center text-xs text-red-400">{error}</p>
        ) : images.length === 0 ? (
          <p className="p-6 text-center text-xs text-slate-500">
            No uploads yet. Attach an image to begin.
          </p>
        ) : (
          <ul className="space-y-1">
            {images.map((img) => (
              <li key={img.image_id} className="group relative">
                <button
                  onClick={() => onSelect(img)}
                  disabled={deletingId === img.image_id}
                  className={`flex w-full flex-col gap-0.5 rounded-lg px-3 py-2.5 pr-10 text-left transition-colors ${
                    activeImageId === img.image_id
                      ? "bg-slate-800 text-slate-100"
                      : "text-slate-300 hover:bg-slate-800/60"
                  } ${deletingId === img.image_id ? "opacity-50" : ""}`}
                >
                  <p className="truncate text-sm">{img.filename}</p>
                  <p className="text-xs text-slate-500">
                    {formatRelativeTime(img.uploaded_at)}
                  </p>
                </button>
                <button
                  onClick={() => handleDelete(img)}
                  disabled={deletingId === img.image_id}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1.5 text-slate-500 opacity-0 transition-opacity hover:bg-slate-700/50 hover:text-red-400 focus:opacity-100 group-hover:opacity-100 disabled:cursor-not-allowed"
                  aria-label={`Delete ${img.filename}`}
                  title="Delete"
                >
                  <IconTrash />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </aside>
  );
}

function formatRelativeTime(iso: string): string {
  const now = Date.now();
  const then = new Date(iso).getTime();
  const diffSec = Math.round((now - then) / 1000);
  if (diffSec < 60) return "just now";
  if (diffSec < 3600) return `${Math.round(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.round(diffSec / 3600)}h ago`;
  return `${Math.round(diffSec / 86400)}d ago`;
}

function IconPlus() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  );
}

function IconTrash() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 6h18" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  );
}
