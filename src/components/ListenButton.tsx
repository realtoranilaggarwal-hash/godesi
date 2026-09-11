"use client";

import { useEffect, useRef, useState } from "react";

const RATES = [0.8, 1, 1.25, 1.5];

/**
 * Reads a story aloud with the browser's own speech engine — no network, no
 * cost, works offline on phones. Hidden entirely where the engine is missing.
 */
export function ListenButton({
  title,
  text,
  lang = "en-IN",
}: {
  title: string;
  text: string;
  lang?: string;
}) {
  const [supported, setSupported] = useState(false);
  const [state, setState] = useState<"idle" | "playing" | "paused">("idle");
  const [rate, setRate] = useState(1);
  const utterance = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    setSupported(
      typeof window !== "undefined" &&
        "speechSynthesis" in window &&
        typeof SpeechSynthesisUtterance !== "undefined",
    );
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  if (!supported) return null;

  const stop = () => {
    window.speechSynthesis.cancel();
    utterance.current = null;
    setState("idle");
  };

  const start = (speed: number) => {
    window.speechSynthesis.cancel();
    const speech = new SpeechSynthesisUtterance(`${title}. ${text}`);
    speech.lang = lang;
    speech.rate = speed;
    const voice = window.speechSynthesis
      .getVoices()
      .find((candidate) => candidate.lang.replace("_", "-") === lang);
    if (voice) speech.voice = voice;
    speech.onend = stop;
    speech.onerror = stop;
    utterance.current = speech;
    window.speechSynthesis.speak(speech);
    setState("playing");
  };

  const toggle = () => {
    if (state === "idle") return start(rate);
    if (state === "playing") {
      window.speechSynthesis.pause();
      setState("paused");
      return;
    }
    window.speechSynthesis.resume();
    setState("playing");
  };

  const changeRate = (next: number) => {
    setRate(next);
    if (state !== "idle") start(next);
  };

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-2xl bg-slate-50 px-3 py-2 text-sm">
      <button
        type="button"
        onClick={toggle}
        className="rounded-xl bg-indigo-600 px-3 py-1.5 font-bold text-white hover:bg-indigo-700"
        aria-label={
          state === "playing" ? "Pause reading" : "Listen to this story"
        }
      >
        {state === "idle"
          ? "🔊 Listen"
          : state === "playing"
            ? "⏸ Pause"
            : "▶ Resume"}
      </button>
      {state !== "idle" ? (
        <button
          type="button"
          onClick={stop}
          className="rounded-xl border border-slate-200 px-3 py-1.5 font-semibold text-slate-700 hover:bg-white"
        >
          ⏹ Stop
        </button>
      ) : null}
      <span className="ml-auto flex items-center gap-1 text-xs text-slate-500">
        Speed
        {RATES.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => changeRate(option)}
            className={`rounded-lg px-2 py-1 font-semibold ${
              option === rate
                ? "bg-indigo-100 text-indigo-700"
                : "hover:bg-white"
            }`}
          >
            {option}×
          </button>
        ))}
      </span>
    </div>
  );
}
