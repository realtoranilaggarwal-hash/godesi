"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useFormState } from "react-dom";
import {
  postChatMessageAction,
  reportChatMessageAction,
} from "@/app/actions/chat";
import { emptyState } from "@/lib/actions";
import { CHAT_MAX_LENGTH, type ChatLine } from "@/lib/chat";

const POLL_MS = 5000;

/**
 * Global chit-chat room. Polling keeps it serverless-friendly: one small read
 * every few seconds, and only while the tab is actually visible.
 */
export function GlobalChat({
  initial,
  signedIn,
  compact = false,
}: {
  initial: ChatLine[];
  signedIn: boolean;
  /** Narrow version for the sidebar rail, sized like the live visitor map. */
  compact?: boolean;
}) {
  const [messages, setMessages] = useState(initial);
  const [state, formAction] = useFormState(postChatMessageAction, emptyState);
  const form = useRef<HTMLFormElement | null>(null);
  const list = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let stopped = false;

    async function load() {
      if (document.visibilityState !== "visible") return;
      try {
        const response = await fetch("/api/chat", { cache: "no-store" });
        if (!response.ok) return;
        const data = (await response.json()) as { messages: ChatLine[] };
        if (!stopped) setMessages(data.messages);
      } catch {
        // A dropped poll is harmless — the next tick catches up.
      }
    }

    const timer = setInterval(load, POLL_MS);
    void load();
    return () => {
      stopped = true;
      clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    if (state.success) form.current?.reset();
  }, [state.success]);

  useEffect(() => {
    const element = list.current;
    if (element) element.scrollTop = element.scrollHeight;
  }, [messages]);

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="flex items-center justify-between gap-2 bg-gradient-to-r from-indigo-600 to-fuchsia-600 px-4 py-3 text-white">
        <div>
          <h2 className="text-sm font-black">💬 Godesi global chat</h2>
          {compact ? null : (
            <p className="text-[11px] opacity-90">
              Say hello to desis online right now — keep it friendly, no links.
            </p>
          )}
        </div>
        <span className="rounded-full bg-white/20 px-2 py-0.5 text-[11px] font-bold">
          {messages.length} recent
        </span>
      </div>

      <div
        ref={list}
        className={`space-y-3 overflow-y-auto px-4 py-3 ${
          compact ? "h-48" : "max-h-80"
        }`}
        aria-live="polite"
      >
        {messages.length ? (
          messages.map((message) => (
            <div key={message.id} className="flex items-start gap-2 text-sm">
              <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-black text-indigo-700">
                {message.name.charAt(0).toUpperCase()}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-bold text-slate-500">
                  {message.username ? (
                    <Link
                      href={`/${message.username}`}
                      className="text-slate-700 hover:underline"
                    >
                      {message.name}
                    </Link>
                  ) : (
                    <span className="text-slate-700">{message.name}</span>
                  )}
                  {message.place ? ` · ${message.place}` : ""}
                  {" · "}
                  {new Date(message.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
                <p className="break-words text-slate-800">{message.body}</p>
              </div>
              {signedIn && !message.mine ? (
                <form action={reportChatMessageAction}>
                  <input type="hidden" name="id" value={message.id} />
                  <button
                    type="submit"
                    title="Report this message"
                    className="text-[11px] text-slate-400 hover:text-rose-600"
                  >
                    🚩
                  </button>
                </form>
              ) : null}
            </div>
          ))
        ) : (
          <p className="py-6 text-center text-sm text-slate-500">
            No messages yet — be the first to say hi 👋
          </p>
        )}
      </div>

      {signedIn ? (
        <form
          ref={form}
          action={formAction}
          className="flex items-center gap-2 border-t border-slate-200 p-2 sm:p-3"
        >
          <input
            name="body"
            maxLength={CHAT_MAX_LENGTH}
            required
            placeholder={
              compact ? "Say hi…" : "Say something to the community…"
            }
            className="min-w-0 flex-1 rounded-xl border border-slate-300 px-3 py-2 text-sm"
          />
          <button
            type="submit"
            className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-bold text-white hover:bg-indigo-700"
          >
            Send
          </button>
        </form>
      ) : (
        <p className="border-t border-slate-200 p-3 text-sm text-slate-600">
          <Link href="/login" className="font-bold text-indigo-600 underline">
            Sign in
          </Link>{" "}
          to join the chat.
          {compact
            ? ""
            : " Every message shows your name, so the room stays civil."}
        </p>
      )}

      {state.error ? (
        <p className="border-t border-rose-100 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700">
          {state.error}
        </p>
      ) : null}
    </section>
  );
}
