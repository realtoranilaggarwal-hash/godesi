"use client";

import { useRef, useState } from "react";
import { writeBrief, type WriteContext, type WriteKind } from "@/lib/writeHelper";

/**
 * "Help me write this" button shown next to a description box. It reads the
 * fields the member has already filled in, builds a prompt they can paste into
 * ChatGPT, and — where our own AI is switched on — drafts the text in place.
 */
export function WriteHelper({
  kind,
  target,
  fields,
  photoTarget = true,
}: {
  kind: WriteKind;
  /** `name` of the textarea to fill. */
  target: string;
  /** Field name → label used in the prompt, e.g. `{ name: "Business name" }`. */
  fields: Record<string, string>;
  /** Also offer a "which photos should I take" prompt. */
  photoTarget?: boolean;
}) {
  const wrapper = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<WriteKind>(kind);
  const [prompt, setPrompt] = useState("");
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");

  const form = () => wrapper.current?.closest("form") ?? null;

  const context = (): WriteContext => {
    const current = form();
    const values: WriteContext = {};
    if (!current) return values;
    for (const [name, label] of Object.entries(fields)) {
      const field = current.elements.namedItem(name);
      if (
        field instanceof HTMLInputElement ||
        field instanceof HTMLTextAreaElement ||
        field instanceof HTMLSelectElement
      ) {
        if (field.value.trim()) values[label] = field.value.trim();
      }
    }
    const picked = Array.from(
      current.querySelectorAll<HTMLInputElement>(
        'input[type="checkbox"]:checked[name="serviceOptions"], input[type="checkbox"]:checked[name="specialties"]',
      ),
    )
      .map((box) => box.value)
      .slice(0, 12);
    if (picked.length) values["Services selected"] = picked.join(", ");
    return values;
  };

  const build = (next: WriteKind) => {
    setMode(next);
    setPrompt(writeBrief(next, context()));
    setNote("");
    setOpen(true);
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(prompt);
      setNote("Prompt copied — paste it into ChatGPT.");
    } catch {
      setNote("Select the text above and copy it.");
    }
  };

  const draft = async () => {
    setBusy(true);
    setNote("");
    try {
      const res = await fetch("/api/ai/write", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind: mode, context: context() }),
      });
      const data = (await res.json()) as { text?: string; error?: string };
      if (!res.ok || !data.text) {
        setNote(data.error ?? "Could not draft that — try the ChatGPT prompt.");
        return;
      }
      if (mode === "photos") {
        setPrompt(data.text);
        setNote("Photo plan ready — copy it or follow it as is.");
        return;
      }
      const current = form();
      const box = current?.elements.namedItem(target);
      if (box instanceof HTMLTextAreaElement || box instanceof HTMLInputElement) {
        box.value = data.text;
        box.dispatchEvent(new Event("input", { bubbles: true }));
        box.scrollIntoView({ behavior: "smooth", block: "center" });
        setNote("Draft added to the box above — edit it so it sounds like you.");
      }
    } catch {
      setNote("Could not draft that — try the ChatGPT prompt.");
    } finally {
      setBusy(false);
    }
  };

  const chipClass =
    "rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-200";

  return (
    <div ref={wrapper} className="mt-1">
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={() => build(kind)} className={chipClass}>
          ✨ Help me write this
        </button>
        {photoTarget ? (
          <button
            type="button"
            onClick={() => build("photos")}
            className={chipClass}
          >
            📷 Which photos should I take?
          </button>
        ) : null}
      </div>

      {open ? (
        <div className="mt-2 rounded-2xl border border-slate-200 bg-slate-50 p-3">
          <p className="text-xs text-slate-600">
            {mode === "photos"
              ? "Paste this into ChatGPT (or any AI) for a photo plan, or let us answer it."
              : "Paste this into ChatGPT and it will write your description, or let us draft it for you."}
          </p>
          <textarea
            readOnly
            rows={6}
            value={prompt}
            className="mt-2 w-full rounded-xl border border-slate-200 bg-white p-2 text-xs text-slate-700"
          />
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <button type="button" onClick={copy} className={chipClass}>
              Copy prompt
            </button>
            <a
              href="https://chat.openai.com/"
              target="_blank"
              rel="noreferrer"
              className={chipClass}
            >
              Open ChatGPT ↗
            </a>
            <button
              type="button"
              onClick={draft}
              disabled={busy}
              className="rounded-full bg-gradient-to-r from-fuchsia-600 to-indigo-600 px-3 py-1 text-xs font-bold text-white disabled:opacity-60"
            >
              {busy ? "Writing…" : "✨ Write it for me"}
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-xs font-semibold text-slate-500 hover:text-slate-700"
            >
              Close
            </button>
          </div>
          {note ? (
            <p className="mt-2 text-xs font-semibold text-indigo-700">{note}</p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
