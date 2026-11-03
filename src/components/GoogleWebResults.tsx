"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

/** GoDesi's Programmable Search Engine (whole web, SafeSearch on). Public by design. */
const CSE_ID = process.env.NEXT_PUBLIC_GOOGLE_CSE_ID || "83d743f7653d64553";
const SCRIPT_ID = "google-cse-js";

type CseElement = {
  render: (component: {
    div: HTMLElement;
    tag: string;
    gname: string;
    attributes?: Record<string, unknown>;
  }) => void;
  getElement: (gname: string) => { execute: (query: string) => void } | undefined;
};

/** Typed view of the globals cse.js reads and sets (window.google is also used by Translate). */
type CseWindow = {
  __gcse?: { parsetags: string; initializationCallback?: () => void };
  google?: { search?: { cse?: { element?: CseElement } } };
};
const cseWindow = () => window as unknown as CseWindow;

/**
 * Google's results for a search GoDesi has (almost) nothing for, shown on the
 * GoDesi page. Display only: Programmable Search results may not be stored.
 */
export function GoogleWebResults({
  query,
  withBox = false,
}: {
  query: string;
  /** Show Google's search box above the results so visitors can search again. */
  withBox?: boolean;
}) {
  const divRef = useRef<HTMLDivElement>(null);
  /** Fresh per mount: a remount gets a new div, so it needs a new Google element. */
  const gnameRef = useRef("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (cseWindow().google?.search?.cse?.element) {
      setReady(true);
      return;
    }
    cseWindow().__gcse = {
      parsetags: "explicit",
      initializationCallback: () => setReady(true),
    };
    if (!document.getElementById(SCRIPT_ID)) {
      const script = document.createElement("script");
      script.id = SCRIPT_ID;
      script.async = true;
      script.src = `https://cse.google.com/cse.js?cx=${CSE_ID}`;
      document.head.appendChild(script);
    }
  }, []);

  useEffect(() => {
    const element = cseWindow().google?.search?.cse?.element;
    if (!ready || !element || !query || !divRef.current) return;
    if (!gnameRef.current) {
      gnameRef.current = `godesi-web-${Math.random().toString(36).slice(2)}`;
      element.render({
        div: divRef.current,
        tag: withBox ? "search" : "searchresults-only",
        gname: gnameRef.current,
        attributes: {
          linkTarget: "_blank",
          enableHistory: false,
          overlayResults: false,
        },
      });
    }
    element.getElement(gnameRef.current)?.execute(query);
  }, [ready, query, withBox]);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-bold text-slate-900">
          🌐 More results from Google
        </h2>
        <Link
          href="/add-business"
          className="rounded-full bg-emerald-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-emerald-700"
        >
          Is your business missing? List it free →
        </Link>
      </div>
      <p className="mt-1 text-xs text-slate-500">
        Web results for “{query}”. These are not GoDesi listings; they open in
        a new tab, so GoDesi stays open here.
      </p>
      <div ref={divRef} className="godesi-gcse mt-2 min-h-[120px]" />
    </section>
  );
}
