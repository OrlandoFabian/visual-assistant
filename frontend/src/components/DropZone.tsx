import { useRef, useState } from "react";
import type { ChangeEvent, DragEvent } from "react";

import Spinner from "./Spinner";

interface Props {
  isUploading: boolean;
  error: string | null;
  onAttach: (file: File) => void;
}

export default function DropZone({ isUploading, error, onAttach }: Props) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) onAttach(file);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onAttach(file);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="w-full max-w-xl">
      <button
        type="button"
        onClick={() => !isUploading && inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          if (!isUploading) setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        disabled={isUploading}
        className={`flex w-full flex-col items-center justify-center gap-6 rounded-2xl border-2 border-dashed p-16 transition-colors ${
          dragging
            ? "border-teal-400 bg-teal-400/5"
            : "border-slate-700 hover:border-slate-600 hover:bg-slate-900/40"
        } ${isUploading ? "cursor-wait" : "cursor-pointer"}`}
      >
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-400/20 to-indigo-500/20 ring-1 ring-slate-700">
          {isUploading ? (
            <Spinner className="h-6 w-6" />
          ) : (
            <IconUpload />
          )}
        </div>
        <div className="space-y-2 text-center">
          <h2 className="text-2xl font-semibold tracking-tight text-slate-100">
            {isUploading ? "Uploading..." : "Attach an image to begin"}
          </h2>
          <p className="text-sm text-slate-400">
            Drop an image here or click to browse &middot; PNG, JPG, JPEG, GIF &middot; up to 16 MB
          </p>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/gif"
          onChange={handleChange}
          className="hidden"
        />
      </button>
      {error && (
        <div className="mt-4 rounded-lg border border-red-900/50 bg-red-950/30 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}
    </div>
  );
}

function IconUpload() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-teal-400"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  );
}
