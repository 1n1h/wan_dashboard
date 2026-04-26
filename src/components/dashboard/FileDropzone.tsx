"use client";

import { useCallback, useRef, useState } from "react";
import {
  Loader2,
  X,
  Image as ImageIcon,
  Film,
  Link as LinkIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Mode = "image" | "video";

const ACCEPTED: Record<Mode, string> = {
  image: "image/jpeg,image/png,image/webp,image/gif",
  video: "video/mp4,video/quicktime,video/webm",
};

export function FileDropzone({
  mode = "image",
  value,
  onChange,
  helperText,
  className,
}: {
  mode?: Mode;
  /** Current file URL (either a previously uploaded one or a pasted URL). */
  value: string;
  onChange: (url: string) => void;
  helperText?: string;
  className?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [pasteMode, setPasteMode] = useState(false);

  const upload = useCallback(
    async (file: File) => {
      setError(null);
      setUploading(true);
      setProgress(0);

      try {
        const fd = new FormData();
        fd.append("file", file);

        // Use XMLHttpRequest to get upload progress events (fetch's stream
        // body has spotty browser support for progress).
        const url = await new Promise<string>((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.open("POST", "/api/upload");
          xhr.upload.onprogress = (e) => {
            if (e.lengthComputable) {
              setProgress(Math.round((e.loaded / e.total) * 100));
            }
          };
          xhr.onload = () => {
            try {
              const json = JSON.parse(xhr.responseText);
              if (xhr.status < 200 || xhr.status >= 300) {
                reject(new Error(json.error ?? `Upload failed (${xhr.status})`));
              } else {
                resolve(json.url as string);
              }
            } catch {
              reject(new Error(`Upload failed (${xhr.status})`));
            }
          };
          xhr.onerror = () => reject(new Error("Network error"));
          xhr.send(fd);
        });

        onChange(url);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Upload failed");
      } finally {
        setUploading(false);
        setProgress(0);
      }
    },
    [onChange]
  );

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) upload(file);
  }

  function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) upload(file);
    // Reset so picking the same file again still triggers change
    e.target.value = "";
  }

  // ─── Already has a value: show preview + clear ────────────────────────────
  if (value && !uploading) {
    return (
      <div
        className={cn(
          "relative rounded-lg overflow-hidden border border-white/[0.08] aspect-video bg-black/40",
          className
        )}
      >
        {mode === "video" ? (
          <video
            src={value}
            muted
            loop
            playsInline
            preload="metadata"
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={value}
            alt="upload preview"
            className="absolute inset-0 w-full h-full object-cover"
            onError={(e) => {
              setError("Couldn't load image");
              (e.currentTarget as HTMLImageElement).style.display = "none";
            }}
          />
        )}
        <button
          type="button"
          onClick={() => onChange("")}
          className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 backdrop-blur-sm border border-white/10 flex items-center justify-center hover:bg-black/80 transition-colors"
          aria-label="Clear"
        >
          <X className="w-3.5 h-3.5 text-white" />
        </button>
        {error && (
          <div className="absolute bottom-0 left-0 right-0 bg-red-500/80 text-white text-xs px-3 py-1.5 font-mono">
            {error}
          </div>
        )}
      </div>
    );
  }

  // ─── Paste-URL mode ───────────────────────────────────────────────────────
  if (pasteMode) {
    return (
      <div className={cn("space-y-2", className)}>
        <input
          type="url"
          autoFocus
          placeholder="https://..."
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              const url = (e.target as HTMLInputElement).value.trim();
              if (url) onChange(url);
              setPasteMode(false);
            }
          }}
          onBlur={(e) => {
            const url = e.target.value.trim();
            if (url) onChange(url);
            setPasteMode(false);
          }}
          className="w-full px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.08] text-sm font-mono text-white placeholder:text-white/30 focus:outline-none focus:border-brand/50 focus:bg-white/[0.05] transition-colors"
        />
        <button
          type="button"
          onClick={() => setPasteMode(false)}
          className="text-[10px] font-mono uppercase tracking-wider text-white/40 hover:text-white/70"
        >
          ← Back to upload
        </button>
      </div>
    );
  }

  // ─── Default dropzone ─────────────────────────────────────────────────────
  return (
    <div className={cn("space-y-2", className)}>
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        className={cn(
          "relative rounded-lg border border-dashed aspect-video flex flex-col items-center justify-center cursor-pointer transition-all px-4",
          dragOver
            ? "border-brand/60 bg-brand/[0.04]"
            : "border-white/15 hover:border-white/25 hover:bg-white/[0.02]"
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED[mode]}
          onChange={onPick}
          className="hidden"
        />
        {uploading ? (
          <>
            <Loader2 className="w-6 h-6 text-brand-glow animate-spin mb-2" />
            <div className="font-mono text-xs text-white/70 mb-2">
              Uploading… {progress}%
            </div>
            <div className="w-32 h-1 rounded-full bg-white/[0.06] overflow-hidden">
              <div
                className="h-full bg-brand transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </>
        ) : (
          <>
            {mode === "video" ? (
              <Film className="w-6 h-6 text-white/40 mb-2" />
            ) : (
              <ImageIcon className="w-6 h-6 text-white/40 mb-2" />
            )}
            <div className="text-xs font-mono uppercase tracking-wider text-white/65 mb-1">
              {dragOver ? "Drop to upload" : "Drop or click"}
            </div>
            <div className="text-[10px] text-white/40">
              {mode === "video" ? "MP4, MOV, WEBM · max 25 MB" : "JPG, PNG, WEBP · max 25 MB"}
            </div>
          </>
        )}
      </div>

      {error && (
        <div className="text-xs text-red-300 font-mono">{error}</div>
      )}

      <div className="flex items-center justify-between text-[10px]">
        {helperText && (
          <span className="font-mono text-white/35">{helperText}</span>
        )}
        <button
          type="button"
          onClick={() => setPasteMode(true)}
          className="ml-auto flex items-center gap-1 font-mono uppercase tracking-wider text-white/45 hover:text-white/80 transition-colors"
        >
          <LinkIcon className="w-3 h-3" />
          Paste URL instead
        </button>
      </div>
    </div>
  );
}

