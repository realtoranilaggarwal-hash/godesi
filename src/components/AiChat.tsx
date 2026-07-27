"use client";

import { useEffect, useRef, useState } from "react";

type Turn = { role: "user" | "assistant"; content: string };
type Source = { name: string; url: string };

const SUGGESTIONS = [
  "Find me an electrician in Pune",
  "Which caterers are listed?",
  "What events are coming up?",
  "How do I list my business?",
];

/** Renders the assistant reply's markdown links as real links, nothing else. */
function RichText({ text }: { text: string }) {
  const parts = text.split(/(\[[^\]]+\]\([^)]+\))/g);
  return (
    <>
      {parts.map((part, index) => {
        const match = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(part);
        if (!match) return <span key={index}>{part}</span>;
        const label = match[1];
        const href = match[2].trim();
        const safe = href.startsWith("/") || href.startsWith("https://");
        return safe ? (
          <a
            key={index}
            href={href}
            className="font-semibold text-indigo-600 underline"
          >
            {label}
          </a>
        ) : (
          <span key={index}>{label}</span>
        );
      })}
    </>
  );
}

export function AiChat() {
  const [open, setOpen] = useState(false);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [sources, setSources] = useState<Source[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [consentPending, setConsentPending] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  // The cookie banner sits at the bottom of the screen; lift the launcher above
  // it on phones so it stays tappable until a choice is made.
  useEffect(() => {
    const read = () => {
      try {
        setConsentPending(!window.localStorage.getItem("godesi_cookie_consent"));
      } catch {
        setConsentPending(false);
      }
    };
    read();
    window.addEventListener("godesi:cookie-consent", read);
    return () => window.removeEventListener("godesi:cookie-consent", read);
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [turns, busy]);

  async function send(question: string) {
    const text = question.trim();
    if (!text || busy) return;
    const next = [...turns, { role: "user" as const, content: text }];
    setTurns(next);
    setInput("");
    setSources([]);
    setError(null);
    setBusy(true);
    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ messages: next.slice(-10) }),
      });
      const data = (await res.json()) as {
        reply?: string;
        sources?: Source[];
        error?: string;
      };
      if (!res.ok || !data.reply) {
        setError(data.error ?? "Something went wrong.");
        return;
      }
      setTurns([...next, { role: "assistant", content: data.reply }]);
      setSources(data.sources ?? []);
    } catch {
      setError("Network error — please try again.");
    } finally {
      setBusy(false);
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Ask Godesi AI"
        className={`fixed right-4 z-40 ${
          consentPending ? "bottom-32 sm:bottom-4" : "bottom-4"
        } flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-600 to-fuchsia-600 px-4 py-3 text-sm font-bold text-white shadow-xl hover:brightness-110`}
      >
        <span aria-hidden>✨</span> Ask Godesi
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-40 flex h-[70vh] max-h-[560px] w-[min(24rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
      <div className="flex items-center justify-between bg-gradient-to-r from-indigo-600 to-fuchsia-600 px-4 py-3 text-white">
        <div>
          <p className="text-sm font-bold">Godesi assistant</p>
          <p className="text-[11px] opacity-90">Finds listings, events and leads</p>
        </div>
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Close assistant"
          className="rounded-lg px-2 py-1 text-lg leading-none hover:bg-white/20"
        >
          ×
        </button>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto p-3 text-sm">
        {turns.length === 0 && (
          <div className="space-y-2">
            <p className="text-slate-600">
              Hi! Ask me anything about Godesi — I only answer from real listings on
              the site.
            </p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => send(s)}
                  className="rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 hover:bg-indigo-100"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {turns.map((turn, index) => (
          <div
            key={index}
            className={
              turn.role === "user"
                ? "ml-auto w-fit max-w-[85%] rounded-2xl bg-indigo-600 px-3 py-2 text-white"
                : "w-fit max-w-[90%] rounded-2xl bg-slate-100 px-3 py-2 text-slate-800"
            }
          >
            {turn.role === "assistant" ? (
              <RichText text={turn.content} />
            ) : (
              turn.content
            )}
          </div>
        ))}

        {sources.length > 0 && !busy && (
          <div className="flex flex-wrap gap-2">
            {sources.map((source) => (
              <a
                key={source.url}
                href={source.url}
                className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                {source.name} →
              </a>
            ))}
          </div>
        )}

        {busy && <p className="text-xs text-slate-500">Thinking…</p>}
        {error && (
          <p className="rounded-xl bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">
            {error}
          </p>
        )}
        <div ref={endRef} />
      </div>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          send(input);
        }}
        className="flex gap-2 border-t border-slate-200 p-3"
      >
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          maxLength={1000}
          placeholder="Find a plumber in Pune…"
          className="min-w-0 flex-1 rounded-xl border border-slate-300 px-3 py-2 text-sm"
        />
        <button
          type="submit"
          disabled={busy || !input.trim()}
          className="rounded-xl bg-indigo-600 px-3 py-2 text-sm font-bold text-white disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </div>
  );
}
