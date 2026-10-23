"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { Button, Field, inputClass } from "@/components/ui";

type Fields = {
  phone?: string;
  whatsapp?: string;
  email?: string;
  website?: string;
  address?: string;
  city?: string;
  state?: string;
};

const FIELD_LIST: { key: keyof Fields; label: string }[] = [
  { key: "phone", label: "Phone" },
  { key: "whatsapp", label: "WhatsApp number" },
  { key: "email", label: "Email" },
  { key: "website", label: "Website" },
  { key: "address", label: "Street address" },
  { key: "city", label: "City" },
  { key: "state", label: "State" },
];

/** Downscale a phone photo to ~1200px JPEG so it fits the request body. */
async function shrink(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 1200 / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", 0.75);
}

export function CardScan() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fields, setFields] = useState<Fields | null>(null);
  const [savedSlug, setSavedSlug] = useState<string | null>(null);

  async function scan(file: File) {
    setBusy("Reading your card…");
    setError(null);
    try {
      const image = await shrink(file);
      const res = await fetch("/api/card-scan", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ mode: "scan", image }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        fields?: Fields;
        error?: string;
      };
      if (!res.ok || !data.fields) {
        setError(data.error ?? "Scan failed — try again");
        return;
      }
      setFields(data.fields);
    } catch {
      setError("Scan failed — check your connection and try again");
    } finally {
      setBusy(null);
    }
  }

  async function save() {
    if (!fields) return;
    setBusy("Saving to your card…");
    setError(null);
    try {
      const res = await fetch("/api/card-scan", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ mode: "save", fields }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        slug?: string;
        error?: string;
      };
      if (!res.ok || !data.slug) {
        setError(data.error ?? "Save failed");
        return;
      }
      setSavedSlug(data.slug);
    } catch {
      setError("Save failed — try again");
    } finally {
      setBusy(null);
    }
  }

  if (savedSlug) {
    return (
      <div className="rounded-2xl bg-emerald-50 p-4 text-center text-sm text-emerald-900">
        <p className="font-semibold">Saved! Your card is updated.</p>
        <Link
          href={`/card/${savedSlug}`}
          className="mt-2 inline-block font-bold underline"
        >
          View my card →
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void scan(file);
          event.target.value = "";
        }}
      />

      {!fields ? (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy !== null}
          className="flex w-full flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-indigo-300 bg-indigo-50/50 px-6 py-10 text-center hover:bg-indigo-50 disabled:opacity-60"
        >
          <span className="text-4xl">📷</span>
          <span className="font-bold text-slate-800">
            {busy ?? "Photograph a paper card"}
          </span>
          <span className="text-xs text-slate-500">
            Flat, well-lit, filling the frame works best
          </span>
        </button>
      ) : (
        <>
          <p className="text-sm font-semibold text-slate-700">
            Check what the scanner found — edit anything before saving.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {FIELD_LIST.map(({ key, label }) => (
              <Field key={key} label={label}>
                <input
                  value={fields[key] ?? ""}
                  onChange={(event) =>
                    setFields({ ...fields, [key]: event.target.value })
                  }
                  className={inputClass}
                />
              </Field>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={save} disabled={busy !== null}>
              {busy ?? "Save to my card"}
            </Button>
            <Button
              variant="secondary"
              onClick={() => setFields(null)}
              disabled={busy !== null}
            >
              Scan again
            </Button>
          </div>
        </>
      )}

      {error ? (
        <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error}
        </p>
      ) : null}
    </div>
  );
}
