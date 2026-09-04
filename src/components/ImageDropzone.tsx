"use client";

import { useRef, useState } from "react";

const MAX_EDGE = 1600;
const QUALITY = 0.82;

/**
 * Shrinks a picture in the browser before upload: long edge capped at 1600px
 * and re-encoded as JPEG, so a 8 MP phone photo lands well under 1 MB.
 */
async function compress(file: File) {
  if (file.type === "image/gif") return file;
  const bitmap = await createImageBitmap(file).catch(() => null);
  if (!bitmap) return file;

  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const context = canvas.getContext("2d");
  if (!context) return file;
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", QUALITY),
  );
  if (!blob || blob.size >= file.size) return file;
  return new File([blob], file.name.replace(/\.\w+$/, "") + ".jpg", {
    type: "image/jpeg",
  });
}

export type UploadPurpose =
  | "avatar"
  | "gallery"
  | "event"
  | "logo"
  | "listing"
  | "banner"
  | "gig"
  | "website";

export function ImageDropzone({
  purpose,
  multiple = false,
  label = "Drag & drop an image here, or click to choose",
  hint,
  fields,
  onUploaded,
}: {
  purpose: UploadPurpose;
  multiple?: boolean;
  label?: string;
  hint?: string;
  /** Extra form fields the upload route needs, e.g. a project id. */
  fields?: Record<string, string>;
  onUploaded: (url: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(0);

  async function upload(files: FileList | File[]) {
    const list = Array.from(files).filter((file) => file.type.startsWith("image/"));
    if (!list.length) {
      setError("Please choose an image file.");
      return;
    }
    setBusy(true);
    setError(null);
    for (const file of multiple ? list : list.slice(0, 1)) {
      try {
        const body = new FormData();
        body.append("file", await compress(file));
        body.append("purpose", purpose);
        for (const [key, value] of Object.entries(fields ?? {})) body.append(key, value);
        const res = await fetch("/api/upload", { method: "POST", body });
        const data = (await res.json()) as { url?: string; error?: string };
        if (!res.ok || !data.url) {
          setError(data.error ?? "Upload failed — please try again.");
          break;
        }
        onUploaded(data.url);
        setDone((value) => value + 1);
      } catch {
        setError("Upload failed — please check your connection.");
        break;
      }
    }
    setBusy(false);
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          void upload(event.dataTransfer.files);
        }}
        disabled={busy}
        className={`flex w-full flex-col items-center justify-center gap-1 rounded-2xl border-2 border-dashed p-6 text-center text-sm transition ${
          dragging
            ? "border-fuchsia-500 bg-fuchsia-50"
            : "border-slate-300 bg-slate-50 hover:border-indigo-400 hover:bg-indigo-50"
        } ${busy ? "opacity-60" : ""}`}
      >
        <span aria-hidden className="text-2xl">
          {busy ? "⏳" : "🖼️"}
        </span>
        <span className="font-semibold text-slate-700">
          {busy ? "Uploading…" : label}
        </span>
        {hint ? <span className="text-xs text-slate-500">{hint}</span> : null}
        {done ? (
          <span className="text-xs font-semibold text-emerald-600">
            {done} image{done > 1 ? "s" : ""} uploaded
          </span>
        ) : null}
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple={multiple}
        hidden
        onChange={(event) => {
          if (event.target.files?.length) void upload(event.target.files);
          event.target.value = "";
        }}
      />

      {error ? (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">
          {error}
        </p>
      ) : null}
    </div>
  );
}
