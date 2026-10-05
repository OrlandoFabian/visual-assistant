import { useCallback, useRef, useState } from "react";
import type { ChangeEvent, DragEvent } from "react";

import { type ImageUploadResponse, uploadImage } from "../api/client";
import Spinner from "./Spinner";

interface Props {
  onUploaded: (response: ImageUploadResponse) => void;
}

export default function ImageUploader({ onUploaded }: Props) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const upload = useCallback(
    async (file: File) => {
      setError(null);
      setUploading(true);
      try {
        const response = await uploadImage(file);
        onUploaded(response);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Upload failed");
      } finally {
        setUploading(false);
      }
    },
    [onUploaded],
  );

  const onDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) upload(file);
    },
    [upload],
  );

  const onFileChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) upload(file);
    },
    [upload],
  );

  return (
    <div className="space-y-3">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
        Upload
      </h2>
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={`cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
          dragging
            ? "border-teal-400 bg-teal-400/5"
            : "border-slate-700 hover:border-slate-600 hover:bg-slate-900/50"
        }`}
      >
        {uploading ? (
          <div className="flex items-center justify-center gap-3">
            <Spinner />
            <span className="text-sm text-slate-400">Uploading...</span>
          </div>
        ) : (
          <>
            <p className="text-sm text-slate-300">
              Drop an image here or <span className="text-teal-400">browse</span>
            </p>
            <p className="mt-1 text-xs text-slate-500">
              PNG, JPG, JPEG, GIF &middot; up to 16 MB
            </p>
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/gif"
          onChange={onFileChange}
          className="hidden"
        />
      </div>
      {error && (
        <div className="rounded border border-red-900/50 bg-red-950/30 px-3 py-2 text-sm text-red-300">
          {error}
        </div>
      )}
    </div>
  );
}
